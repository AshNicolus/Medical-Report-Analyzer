"""
Test script for NLP pipeline and recommendation system
"""
from pdf_extraction.extractor import extract_text_from_pdf
from nlp_processing.pipeline import process_text
from recommendation.orchestrator import recommend_tests
import os

def test_sample_pdf():
    sample_pdf = os.path.join("sample_data", "sample_report.pdf")
    with open(sample_pdf, "rb") as f:
        text = extract_text_from_pdf(f)
    entities = process_text(text)
    recommendations = recommend_tests(entities)
    assert isinstance(recommendations, list)
    print("Entities:", entities)
    print("Recommendations:", recommendations)

if __name__ == "__main__":
    test_sample_pdf()
