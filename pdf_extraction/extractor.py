"""
PDF extraction module using pdfplumber and Tesseract OCR
"""
import pdfplumber
import pytesseract
from PIL import Image
import io
import fitz  # PyMuPDF

def extract_text_from_pdf(file_stream):
    # Try text extraction with pdfplumber
    try:
        with pdfplumber.open(file_stream) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            if text.strip():
                return text
    except Exception:
        pass
    # Fallback: OCR for scanned PDFs
    file_stream.seek(0)
    doc = fitz.open(stream=file_stream.read(), filetype="pdf")
    ocr_text = ""
    for page in doc:
        pix = page.get_pixmap()
        img = Image.open(io.BytesIO(pix.tobytes()))
        ocr_text += pytesseract.image_to_string(img) + "\n"
    return ocr_text
