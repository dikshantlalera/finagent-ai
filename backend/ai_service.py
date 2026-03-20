"""Groq API integration for financial analysis."""
import json
import re
from groq import Groq

SYSTEM_PROMPT = """You are a senior financial analyst. Analyze the provided financial document text based on the user request. Return ONLY valid JSON with the following structure:

{
  "analysis_type": "dcf" | "memo" | "comparison" | "ratio_analysis" | "custom_qa",
  "company_name": "string",
  "companies": ["string"],
  "years_covered": [2020, 2021, 2022, 2023, 2024],
  "extracted_data": {
    "revenue": [{"year": 2023, "value": 394328}],
    "net_income": [{"year": 2023, "value": 96995}],
    "ebitda": [{"year": 2023, "value": 130000}],
    "gross_margin_pct": [{"year": 2023, "value": 44.1}],
    "free_cash_flow": [{"year": 2023, "value": 111443}],
    "total_debt": [{"year": 2023, "value": 111088}],
    "cash": [{"year": 2023, "value": 29965}],
    "shares_outstanding": [{"year": 2023, "value": 15550}]
  },
  "projections": {
    "years": [2024, 2025, 2026, 2027, 2028],
    "revenue": [410000, 430000, 452000, 475000, 500000],
    "ebitda": [135000, 142000, 150000, 158000, 166000],
    "fcf": [115000, 121000, 128000, 135000, 142000]
  },
  "dcf": {
    "wacc": 9.5,
    "terminal_growth_rate": 2.5,
    "implied_price": 210.50,
    "upside_downside_pct": 15.3,
    "enterprise_value": 3200000,
    "equity_value": 3100000
  },
  "memo": {
    "executive_summary": "string",
    "investment_thesis": "string",
    "valuation_summary": "string",
    "risk_factors": ["string"],
    "recommendation": "Buy" | "Hold" | "Sell"
  },
  "comparison": {
    "metrics": ["Revenue", "Net Income", "EBITDA"],
    "companies": [
      {
        "name": "Apple",
        "values": {"Revenue": 394328, "Net Income": 96995, "EBITDA": 130000}
      }
    ]
  },
  "ratios": {
    "profitability": [{"name": "Gross Margin", "value": 44.1, "unit": "%"}],
    "liquidity": [{"name": "Current Ratio", "value": 1.07, "unit": "x"}],
    "leverage": [{"name": "Debt/Equity", "value": 1.8, "unit": "x"}],
    "efficiency": [{"name": "Asset Turnover", "value": 1.15, "unit": "x"}]
  },
  "custom_answer": "string"
}

Rules:
- Never hallucinate numbers. Use null for missing values.
- All monetary values in millions USD unless specified otherwise.
- Include only the fields relevant to the analysis_type requested.
- For "comparison" type, populate the comparison field with all companies.
- For "ratio_analysis", populate the ratios field.
- For "custom_qa", populate the custom_answer field.
- For "dcf", populate extracted_data, projections, and dcf fields.
- For "memo", populate extracted_data and memo fields.
- Return ONLY valid JSON, no markdown formatting, no code blocks."""


async def analyze_with_ai(api_key: str, document_text: str, user_prompt: str) -> dict:
    """Send document text and user prompt to Groq API for analysis.
    
    Args:
        api_key: Groq API key
        document_text: Extracted text from PDF documents
        user_prompt: User's analysis request
    
    Returns:
        Parsed JSON response from Groq
    """
    
    # Groq's Free Tier has a strict limit of 12,000 Tokens Per Minute (TPM)
    # 1 token is approx 4 characters. We need to reserve ~2000 tokens for the prompt/output.
    # Therefore, we must strictly truncate the document to ~40,000 characters.
    max_chars = 40000
    if len(document_text) > max_chars:
        document_text = document_text[:max_chars] + "\n\n...[DOCUMENT TRUNCATED TO FIT GROQ FREE TIER 12K TOKEN LIMITS]..."

    full_prompt = f"""--- FINANCIAL DOCUMENTS ---
{document_text}

--- USER REQUEST ---
{user_prompt}

You must return valid JSON. Do not return anything except JSON."""

    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": full_prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        response_text = chat_completion.choices[0].message.content
    except Exception as e:
        error_msg = str(e)
        if "rate limit" in error_msg.lower() or "429" in error_msg:
             raise ValueError(
                "Your Groq API key has exceeded its rate limit. "
                "Please wait a moment or check your Groq console."
            )
        raise ValueError(error_msg)
        
    response_text = response_text.strip()
    
    # Clean up response - remove markdown code blocks if present
    if response_text.startswith("```"):
        response_text = re.sub(r'^```(?:json)?\s*\n?', '', response_text)
        response_text = re.sub(r'\n?```\s*$', '', response_text)
    
    try:
        result = json.loads(response_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI returned invalid JSON: {str(e)}\nResponse: {response_text[:500]}")
    
    return result
