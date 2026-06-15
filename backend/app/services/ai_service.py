import random
import json
from app.schemas.submission import ExtractedData

class MockProvider:
    def extract_fields(self, raw_content: str) -> dict:
        """
        Simulates an AI extracting fields from raw text.
        In reality, this would call OpenAI, Claude, etc.
        """
        raw_lower = raw_content.lower()

        extracted = ExtractedData()

        # Simple heuristics for mocking
        if "acme" in raw_lower or "corp" in raw_lower:
            extracted.company_name = "Acme Corp"
        if "john" in raw_lower or "jane" in raw_lower:
            extracted.contact_name = "Jane Doe"
        if "@" in raw_lower:
            extracted.email = "jane@example.com"
        if "555" in raw_lower:
            extracted.phone = "555-0199"
        else:
            extracted.missing_fields.append("phone")

        if "budget" in raw_lower or "$" in raw_lower:
            extracted.estimated_budget = "$50,000"

        if "urgent" in raw_lower or "asap" in raw_lower:
            extracted.urgency = "High"

        # Mock confidence and risk
        confidence_score = round(random.uniform(0.6, 0.95), 2)
        duplicate_risk = round(random.uniform(0.01, 0.3), 2)

        # High risk for duplicate if "duplicate" is in text
        if "duplicate" in raw_lower:
            duplicate_risk = 0.95

        return {
            "extracted_data": extracted.model_dump(),
            "confidence_score": confidence_score,
            "duplicate_risk": duplicate_risk
        }

ai_service = MockProvider()
