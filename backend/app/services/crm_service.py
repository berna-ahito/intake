def simulate_crm_sync(submission_id: int, data: dict) -> dict:
    """
    Simulates syncing an approved lead to an external CRM pipeline.
    """
    # Here you would typically format the payload for Salesforce/HubSpot
    # and make an HTTP request.

    return {
        "success": True,
        "crm_id": f"CRM-LEAD-{submission_id}",
        "message": "Successfully synced to CRM pipeline."
    }
