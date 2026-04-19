import re
from typing import Dict, Any, List, Optional

class GuardRailService:
    # Comprehensive patterns for Indian PII and high-risk data
    PATTERNS = {
        "PAN": r"[A-Z]{5}[0-9]{4}[A-Z]{1}",
        "AADHAAR": r"[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}|[2-9]{1}[0-9]{11}",
        "VOTER_ID": r"[A-Z]{3}[0-9]{7}",
        "PASSPORT": r"[A-Z]{1}[0-9]{7}",
        "BANK_ACCOUNT": r"(?:\b|[^0-9])[0-9]{9,18}(?:\b|[^0-9])",
        "IFSC": r"[A-Z]{4}0[A-Z0-9]{6}",
        "GSTIN": r"[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}",
        "PHONE": r"(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}",
        "EMAIL": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    }

    @staticmethod
    def redact(text: str) -> str:
        """
        Scans and redacts sensitive identifiers from user input.
        """
        if not text:
            return text
            
        redacted_text = text
        for label, pattern in GuardRailService.PATTERNS.items():
            # Use flags=re.IGNORECASE where appropriate if needed
            redacted_text = re.sub(pattern, f"[REDACTED {label}]", redacted_text)
        return redacted_text

    @staticmethod
    def contains_sensitive_data(text: str) -> bool:
        """
        Boolean check if any sensitive pattern matches.
        """
        for pattern in GuardRailService.PATTERNS.values():
            if re.search(pattern, text):
                return True
        return False

    @staticmethod
    def validate_llm_output(output: str) -> str:
        """
        Post-processing for LLM outputs to prevent hallucinations 
        or leakage of internal prompt logic.
        """
        # Example: Prevent repeating system prompt instructions
        blacklisted_phrases = [
            "As an AI language model",
            "Under my system instructions",
            "I cannot fulfill this request"
        ]
        
        cleaned_output = output
        for phrase in blacklisted_phrases:
            cleaned_output = cleaned_output.replace(phrase, "")
            
        return cleaned_output.strip()

guard_rail_service = GuardRailService()
