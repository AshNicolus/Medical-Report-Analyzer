"""
Orchestrator for test recommendation logic
"""
from clinical_logic.engine import apply_clinical_rules

def recommend_tests(entities):
    recommendations = apply_clinical_rules(entities)
    urgency_map = {"routine": "Routine", "urgent": "Urgent", "emergent": "Emergent", "not recommended": "Not Recommended"}
    filtered = []
    for rec in recommendations:
        if rec["confidence"] < 0.5:
            continue  # Suppress low-confidence recs
        urgency = urgency_map.get(rec["urgency"], rec["urgency"])
        contraindications = ', '.join(rec["contraindications"]) if rec["contraindications"] else 'None'
        rec["explanation"] = (
            f"Recommended {rec['test']} because: {rec['reason']}. "
            f"Contraindications: {contraindications}. "
            f"Confidence: {rec['confidence']}. Urgency: {urgency}."
        )
        filtered.append(rec)
    return filtered
