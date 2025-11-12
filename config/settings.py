"""
Configuration management for app settings
"""
import os
from dotenv import load_dotenv
load_dotenv()

def get_app_settings():
    return {
        "allowed_file_types": [".pdf"],
        "nlp_model_name": os.getenv("NLP_MODEL_NAME", "emilyalsentzer/Bio_ClinicalBERT"),
        "fallback_nlp_model": "en_core_web_sm",
        "diagnostic_tests": [
            "MRI", "CT scan", "X-ray", "ECG", "blood tests", "ultrasound", "EMG/NCS", "physical therapy", "bone density test", "endoscopy"
        ],
        "clinical_rules_file": "clinical_rules.json"
    }
