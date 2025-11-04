"""
Unit test for improved entity extraction and deduplication
"""
from nlp_processing.pipeline import process_text

def test_deduplication():
    text = "Patient reports Pain, pain, swelling, and fever. Diagnosed with diabetes and Diabetes. Prescribed Aspirin and aspirin."
    entities = process_text(text)
    assert entities["symptoms"] == ["fever", "pain", "swelling"], f"Symptoms deduplication failed: {entities['symptoms']}"
    assert entities["diagnoses"] == ["diabetes"], f"Diagnoses deduplication failed: {entities['diagnoses']}"
    assert entities["medications"] == ["aspirin"], f"Medications deduplication failed: {entities['medications']}"
    # Ensure empty arrays are omitted
    for k in ["vitals", "severity", "urgency", "functional_impact"]:
        assert k not in entities, f"Empty entity {k} should be omitted."
    print("Deduplication and normalization test passed.")

if __name__ == "__main__":
    test_deduplication()
