"""
Clinical logic rule engine for diagnostic test recommendations
"""
import json
import os
from config.settings import get_app_settings

# Example rules (should be loaded from clinical_rules.json)
DEFAULT_RULES = {
    "MRI": {"symptoms": ["pain", "swelling"], "contraindications": ["pacemaker"], "urgency": "urgent"},
    "CT scan": {"symptoms": ["headache", "stroke"], "contraindications": ["pregnancy"], "urgency": "routine"},
    "X-ray": {"symptoms": ["fracture", "swelling"], "contraindications": [], "urgency": "routine"}
}

def load_rules():
    settings = get_app_settings()
    rules_path = os.path.join(os.getcwd(), settings["clinical_rules_file"])
    if os.path.exists(rules_path):
        with open(rules_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return DEFAULT_RULES


def apply_clinical_rules(entities):
    rules = load_rules()
    recommendations = []
    for test, rule in rules.items():
        # Normalize rule symptoms and contraindications for matching
        rule_symptoms = [s.lower() for s in rule.get("symptoms", [])]
        rule_contras = [c.lower() for c in rule.get("contraindications", [])]
        extracted_symptoms = [s.lower() for s in entities.get("symptoms", [])]
        extracted_diagnoses = [d.lower() for d in entities.get("diagnoses", [])]
        matched_symptoms = [s for s in rule_symptoms if s in extracted_symptoms]
        contraindicated = [cond for cond in rule_contras if cond in extracted_diagnoses]
        confidence = 0.95 if matched_symptoms else 0.1
        # Standardize urgency
        urgency_map = {"routine": "routine", "urgent": "urgent", "emergent": "emergent", "not recommended": "not recommended"}
        urgency = urgency_map.get(rule.get("urgency", "routine"), "routine")
        if matched_symptoms and not contraindicated and confidence >= 0.5:
            recommendations.append({
                "test": test,
                "reason": f"Matched symptoms: {', '.join(matched_symptoms)}",
                "contraindications": contraindicated,
                "confidence": confidence,
                "urgency": urgency
            })
        elif contraindicated:
            recommendations.append({
                "test": test,
                "reason": f"Contraindication present: {', '.join(contraindicated)}",
                "contraindications": contraindicated,
                "confidence": 0.1,
                "urgency": "not recommended"
            })
    return recommendations
