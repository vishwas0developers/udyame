import re
from typing import List

class PIIGuardrail:
    # Basic patterns for Indian PII
    PATTERNS = {
        "PAN": r"[A-Z]{5}[0-9]{4}[A-Z]{1}",
        "AADHAAR": r"[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}",
        "BANK_ACCOUNT": r"[0-9]{9,18}",
        "IFSC": r"[A-Z]{4}0[A-Z0-9]{6}"
    }

    @classmethod
    def redact(cls, text: str) -> str:
        """
        Scans and redacts sensitive Indian identifiers from user input.
        """
        redacted_text = text
        for label, pattern in cls.PATTERNS.items():
            redacted_text = re.sub(pattern, f"[REDACTED {label}]", redacted_text)
        return redacted_text

    @classmethod
    def contains_pii(cls, text: str) -> bool:
        """
        Quick check if any PII pattern matches.
        """
        for pattern in cls.PATTERNS.values():
            if re.search(pattern, text):
                return True
        return False

guardrail = PIIGuardrail()
