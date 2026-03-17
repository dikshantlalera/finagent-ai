"""PDF text extraction using PyMuPDF (fitz)."""
import fitz
from typing import List, Dict


def extract_text_from_pdf(pdf_bytes: bytes, filename: str, char_limit: int = 35000) -> Dict[str, str]:
    """Extract text from a PDF file's bytes, prioritizing financial tables."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        all_pages = []
        for page_num in range(len(doc)):
            text = doc[page_num].get_text()
            all_pages.append((page_num, text))
        doc.close()
        
        if not all_pages:
            raise ValueError(f"No readable text found in {filename}")
            
        full_text = "\n".join(p[1] for p in all_pages)
        
        # If the document is small enough, return everything
        if len(full_text) < char_limit:
            return {"filename": filename, "text": full_text}
            
        # Otherwise, prioritize pages with financial keywords
        keywords = [
            "consolidated statement", "balance sheet", "cash flow", 
            "income statement", "financial results", "statement of operations",
            "comprehensive income", "financial position"
        ]
        
        prioritized_text = ""
        
        # Always include the first ~3 pages for context (company name, year, etc)
        for i in range(min(3, len(all_pages))):
            prioritized_text += f"\n--- Page {i+1} ---\n{all_pages[i][1]}"
            
        # Scan for high-value financial pages
        for page_num, text in all_pages[3:]:
            text_lower = text.lower()
            if any(kw in text_lower for kw in keywords):
                # Count numbers/digits to guess if it's a data table
                digit_ratio = sum(c.isdigit() for c in text) / max(1, len(text))
                if digit_ratio > 0.05:  # At least 5% numbers (likely a financial table)
                    page_text = f"\n--- Page {page_num+1} (Financials) ---\n{text}"
                    if len(prioritized_text) + len(page_text) < char_limit:
                        prioritized_text += page_text

        # If we didn't find enough, pad with pages from the middle
        if len(prioritized_text) < (char_limit // 2):
            mid = len(all_pages) // 2
            for page_num, text in all_pages[mid:mid+10]:
                page_text = f"\n--- Page {page_num+1} ---\n{text}"
                if len(prioritized_text) + len(page_text) < char_limit:
                    prioritized_text += page_text

        if not prioritized_text.strip():
             prioritized_text = full_text[:char_limit]

        return {"filename": filename, "text": prioritized_text}
    except Exception as e:
        raise ValueError(f"Could not read PDF '{filename}': {str(e)}")


def extract_texts_from_pdfs(pdf_files: List[tuple]) -> str:
    """Extract text from multiple PDF files.
    
    Args:
        pdf_files: List of (filename, bytes) tuples
    
    Returns:
        Combined text from all PDFs with document separators
    """
    all_texts = []
    # Groq free tier limit is 12k TPM (~38k chars). Distribute equally among files.
    char_limit_per_doc = max(5000, 36000 // max(1, len(pdf_files)))
    
    for filename, pdf_bytes in pdf_files:
        result = extract_text_from_pdf(pdf_bytes, filename, char_limit=char_limit_per_doc)
        all_texts.append(f"=== DOCUMENT: {result['filename']} ===\n{result['text']}\n")
    
    return "\n".join(all_texts)
