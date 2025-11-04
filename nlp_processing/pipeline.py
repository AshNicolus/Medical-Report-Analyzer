"""
NLP pipeline for clinical entity extraction using Bio_ClinicalBERT, SpaCy, and regex
"""
import re
import spacy
from transformers import AutoTokenizer, AutoModelForTokenClassification
import torch
import pandas as pd

SYMPTOM_PATTERN = r"\b(headache|fever|pain|cough|nausea|dizziness|fatigue|weakness|swelling|shortness of breath)\b"
DIAGNOSIS_PATTERN = r"\b(diabetes|hypertension|stroke|fracture|infection|cancer|asthma|arthritis|anemia|pneumonia)\b"
TEST_PATTERN = r"\b(MRI|CT scan|X-ray|ECG|blood test|ultrasound|EMG|NCS|bone density|endoscopy)\b"

try:
    # Use a pre-fine-tuned clinical NER model for reliable entity extraction
    nlp_bert = AutoTokenizer.from_pretrained("d4data/biobert_ner")
    model_bert = AutoModelForTokenClassification.from_pretrained("d4data/biobert_ner")
except Exception:
    nlp_bert = None
    model_bert = None

# Guidance: To fine-tune "emilyalsentzer/Bio_ClinicalBERT" for NER, use a labeled clinical NER dataset and Hugging Face Trainer API. This will train the classification head and improve entity extraction reliability.

nlp_spacy = spacy.load("en_core_web_sm")

def process_text(text):
    entities = {
        "symptoms": set(),
        "diagnoses": set(),
        "tests": set(),
        "medications": set(),
        "vitals": set(),
        "severity": set(),
        "urgency": set(),
        "functional_impact": set()
    }
    # Case normalization helper
    def normalize(val):
        return val.strip().lower()

    # Improved regex extraction and deduplication (case-insensitive)
    entities["symptoms"].update([normalize(s) for s in re.findall(SYMPTOM_PATTERN, text, re.I)])
    # Expanded diagnosis regex
    diag_pattern = r"\b(diabetes|hypertension|stroke|fracture|infection|cancer|asthma|arthritis|anemia|pneumonia|COPD|CHF|CAD|MI|CKD|HIV|TB|RA|OA|IBD|GERD|SLE|MS|ALS|ADHD|PTSD|COVID-19|covid)\b"
    entities["diagnoses"].update([normalize(d) for d in re.findall(diag_pattern, text, re.I)])
    entities["tests"].update([normalize(t) for t in re.findall(TEST_PATTERN, text, re.I)])
    # Expanded medication regex
    med_pattern = r"\b(aspirin|metformin|lisinopril|atorvastatin|amoxicillin|ibuprofen|paracetamol|insulin|warfarin|prednisone|statin|beta blocker|ace inhibitor|antibiotic|antiviral|antifungal|antidepressant|antipsychotic|NSAID|PPI|SSRI|SGLT2|GLP-1|NOAC|DOAC|opioid|morphine|hydrocodone|tramadol|acetaminophen)\b"
    entities["medications"].update([normalize(m) for m in re.findall(med_pattern, text, re.I)])
    # SpaCy entity extraction
    doc = nlp_spacy(text)
    for ent in doc.ents:
        if ent.label_ in ["SYMPTOM", "DIAGNOSIS", "TEST"]:
            entities[ent.label_.lower() + "s"].add(normalize(ent.text))
        elif ent.label_ == "DRUG":
            entities["medications"].add(normalize(ent.text))
        elif ent.label_ == "QUANTITY":
            entities["vitals"].add(normalize(ent.text))
    # Contextual phrase extraction for severity, urgency, functional impact
    severity_phrases = re.findall(r"\b(severe|moderate|mild)\s+(pain|symptom|disease|injury)\b", text, re.I)
    for sev, ctx in severity_phrases:
        entities["severity"].add(f"{sev.lower()} {ctx.lower()}")
    urgency_phrases = re.findall(r"\b(urgent|emergent|routine|immediate|stat)\b", text, re.I)
    for urg in urgency_phrases:
        entities["urgency"].add(normalize(urg))
    impact_phrases = re.findall(r"\b(limited mobility|unable to walk|bedridden|wheelchair|loss of function|functional impairment)\b", text, re.I)
    for imp in impact_phrases:
        entities["functional_impact"].add(normalize(imp))
    # Convert sets to sorted lists and omit empty arrays
    output = {}
    for k in entities:
        vals = sorted(list(entities[k]))
        if vals:
            output[k] = vals
    return output
