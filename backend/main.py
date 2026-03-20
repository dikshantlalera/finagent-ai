"""FinAgent AI — FastAPI Backend."""
import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List

from pdf_extractor import extract_texts_from_pdfs
from ai_service import analyze_with_ai
from excel_generator import generate_excel
from word_generator import generate_word_memo

# Temp directory for generated files
OUTPUT_DIR = os.path.join(tempfile.gettempdir(), "finagent_output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

app = FastAPI(title="FinAgent AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


@app.post("/analyze")
async def analyze(
    files: List[UploadFile] = File(...),
    prompt: str = Form(...),
    api_key: str = Form(...),
):
    """Analyze uploaded PDF documents using Gemini AI."""
    
    if not api_key or not api_key.strip():
        raise HTTPException(status_code=400, detail="API key is required")
    
    if not files:
        raise HTTPException(status_code=400, detail="At least one PDF file is required")
    
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 PDF files allowed")
    
    # Read and validate PDFs
    pdf_data = []
    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' is not a PDF")
        
        content = await file.read()
        
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File '{file.filename}' exceeds 20MB limit"
            )
        
        pdf_data.append((file.filename, content))
    
    # Extract text from PDFs
    try:
        document_text = extract_texts_from_pdfs(pdf_data)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    # Analyze with Gemini
    try:
        analysis = await analyze_with_ai(api_key, document_text, prompt)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"AI Analysis Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API Error: {str(e)}")
    
    # Generate downloadable files
    download_files = {}
    analysis_type = analysis.get("analysis_type", "custom_qa")
    
    try:
        # Generate Excel for DCF, comparison, ratio_analysis
        if analysis_type in ("dcf", "comparison", "ratio_analysis"):
            excel_filename = generate_excel(analysis, OUTPUT_DIR)
            download_files["excel"] = excel_filename
        
        # Generate Word memo
        if analysis_type == "memo":
            word_filename = generate_word_memo(analysis, OUTPUT_DIR)
            download_files["word"] = word_filename
        
        # For DCF, also generate memo if memo data exists
        if analysis_type == "dcf" and analysis.get("memo"):
            word_filename = generate_word_memo(analysis, OUTPUT_DIR)
            download_files["word"] = word_filename
            
    except Exception as e:
        # Non-fatal: analysis still returned even if file generation fails
        download_files["error"] = str(e)
    
    return {
        "analysis": analysis,
        "downloads": download_files,
    }


@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download a generated Excel or DOCX file."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine media type
    if filename.endswith(".xlsx"):
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif filename.endswith(".docx"):
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        media_type = "application/octet-stream"
    
    return FileResponse(
        filepath,
        media_type=media_type,
        filename=filename,
    )


from fastapi.staticfiles import StaticFiles

@app.get("/health")
async def health():
    return {"status": "ok", "service": "FinAgent AI"}

# Mount the React frontend (this MUST be the very last route added)
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.isdir(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
