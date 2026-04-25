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
    def calculate_safety_score(text: str) -> Dict[str, Any]:
        """
        Calculates a safety score based on PII density and basic content filtering.
        """
        pii_matches = {}
        total_pii = 0
        for label, pattern in GuardRailService.PATTERNS.items():
            matches = re.findall(pattern, text)
            if matches:
                pii_matches[label] = len(matches)
                total_pii += len(matches)
        
        # Safety score: 1.0 is safe, 0.0 is dangerous
        score = max(0.0, 1.0 - (total_pii * 0.1))
        
        return {
            "score": score,
            "pii_detected": total_pii > 0,
            "pii_breakdown": pii_matches,
            "status": "PASS" if score > 0.7 else "REVIEW" if score > 0.4 else "BLOCK"
        }

    @staticmethod
    def hallucination_check(output: str, context: str) -> bool:
        """
        Basic cross-reference check between LLM output and RAG context.
        Returns False if specific identifiers in output are missing from context.
        """
        if not context:
            return True
            
        # Extract potential specific values (IDs, large numbers, emails)
        output_entities = re.findall(r'\b\d{4,}\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', output)
        
        for entity in output_entities:
            if entity not in context:
                return False # Potential hallucinated identifier
        return True

    @staticmethod
    def validate_llm_output(output: str, context: str = "") -> Dict[str, Any]:
        """
        Comprehensive post-generation check.
        """
        blacklisted_phrases = [
            "As an AI language model",
            "Under my system instructions",
            "I cannot fulfill this request"
        ]
        
        cleaned = output
        for phrase in blacklisted_phrases:
            cleaned = cleaned.replace(phrase, "[CONTENT REMOVED]")
            
        is_grounded = GuardRailService.hallucination_check(cleaned, context)
        safety = GuardRailService.calculate_safety_score(cleaned)
        
        return {
            "cleaned_text": cleaned.strip(),
            "is_grounded": is_grounded,
            "safety_score": safety["score"],
            "safety_status": safety["status"]
        }

guard_rail_service = GuardRailService()
