"""
Unit test for recommendation explanation and consistency
"""
from recommendation.orchestrator import recommend_tests

def test_recommendation_explanation():
    entities = {
        "symptoms": ["pain", "swelling"],
        "diagnoses": [],
        "tests": [],
        "medications": [],
    }
    recommendations = recommend_tests(entities)
    for rec in recommendations:
        assert "Recommended" in rec["explanation"], f"Explanation missing for {rec['test']}"
        for sym in rec["reason"].replace("Matched symptoms: ","").split(", "):
            if sym:
                assert sym in entities["symptoms"], f"Explanation does not match extracted symptoms: {sym}"
        assert rec["confidence"] >= 0.5, f"Low-confidence recommendation should be suppressed: {rec['test']}"
    print("Recommendation explanation and confidence test passed.")

if __name__ == "__main__":
    test_recommendation_explanation()
