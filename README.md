# Medical Diagnostic Test Recommendation System

## Overview
A production-ready Python-based system that analyzes medical report PDFs, extracts clinical entities, and recommends diagnostic tests using validated clinical logic. It provides explanations, confidence scores, and urgency classification for each recommendation.

## Features
- Upload and analyze medical report PDFs (text or scanned)
- Extract text using pdfplumber and Tesseract OCR
- NLP pipeline with Bio_ClinicalBERT, SpaCy, and regex
- Rule-based clinical logic for test recommendations
- Explanations, contraindications, confidence, urgency
- REST API and HTML frontend
- Config management, logging, audit compliance
- Sample data and test scripts

## Directory Structure
```
pdf_extraction/      # PDF extraction logic
nlp_processing/      # NLP pipeline
clinical_logic/      # Clinical rule engine
recommendation/      # Test recommendation orchestration
server/              # FastAPI server
frontend/            # HTML/CSS/JS frontend
config/              # App settings
logging/             # Logging setup
audit/               # Audit compliance
sample_data/         # Example medical PDFs
tests/               # Test scripts
```

## Installation
1. Clone the repo and navigate to the project folder.
2. Install Python 3.8+ and [Tesseract OCR](https://github.com/tesseract-ocr/tesseract).
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

## Usage
- **Run the server:**
  ```sh
  python launcher.py
  ```
- **Access frontend:** Open [http://localhost:8000](http://localhost:8000)
- **API Endpoints:**
  - `POST /analyze_report` (PDF upload)
  - `GET /summary` (system info)
  - `GET /health` (health check)
  - `GET /info` (app config)

## Configuration
- Edit `config/settings.py` and `.env` for model names, allowed file types, and rules.

## Testing
- Place sample PDFs in `sample_data/`.
- Run test scripts in `tests/`.

## Disclaimer
- This system is for informational purposes only and not a substitute for professional medical advice.

## Architecture Diagram
See `architecture_diagram.png` for system flowchart.

---
© 2025 Bolt. All rights reserved.
