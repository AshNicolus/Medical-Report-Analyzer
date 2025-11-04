"""
Main FastAPI server for Medical Diagnostic Test Recommendation System
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from pdf_extraction.extractor import extract_text_from_pdf
from nlp_processing.pipeline import process_text
from clinical_logic.engine import apply_clinical_rules
from recommendation.orchestrator import recommend_tests
from config.settings import get_app_settings
from app_logging.logger import setup_logging as setup_custom_logging
from audit.audit import log_audit
import os
import traceback


app = FastAPI(title="Medical Diagnostic Test Recommendation System")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory="frontend"), name="static")
setup_custom_logging()
settings = get_app_settings()

@app.get("/", response_class=HTMLResponse)
def index():
    with open(os.path.join("frontend", "index.html"), "r", encoding="utf-8") as f:
        html = f.read()
    # Update static file references to use /static/
    html = html.replace('href="style.css"', 'href="/static/style.css"')
    html = html.replace('src="main.js"', 'src="/static/main.js"')
    return html

@app.post("/analyze_report")
def analyze_report(file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith(tuple(settings["allowed_file_types"])):
            raise HTTPException(status_code=400, detail="Invalid file type.")
        text = extract_text_from_pdf(file.file)
        entities = process_text(text)
        recommendations = recommend_tests(entities)
        log_audit(file.filename, entities, recommendations)
        return JSONResponse(content={"entities": entities, "recommendations": recommendations})
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/summary")
def summary():
    return JSONResponse(content={"info": "Medical Diagnostic Test Recommendation System", "modules": list(settings.keys())})

@app.get("/health")
def health():
    return JSONResponse(content={"status": "ok"})

@app.get("/info")
def info():
    return JSONResponse(content=settings)

if __name__ == "__main__":
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
