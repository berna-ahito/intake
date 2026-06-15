export interface Submission {
  id: number;
  source: SubmissionSource;
  raw_content: string;
  status: SubmissionStatus;
  extracted_data?: ExtractedData | null;
  confidence_score?: number | null;
  duplicate_risk?: number | null;
  crm_id?: string | null;
  crm_sync_status: CrmSyncStatus;
  crm_synced_at?: string | null;
  crm_sync_error?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export type SubmissionSource = 'email' | 'form' | 'partner_referral' | 'csv_import' | 'webhook' | 'other';

export type SubmissionStatus = 'pending' | 'needs_review' | 'approved' | 'crm_ready' | 'synced';

export type CrmSyncStatus = 'not_synced' | 'synced' | 'failed';

export interface ExtractedData {
  company_name?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  industry?: string | null;
  location?: string | null;
  lead_source?: string | null;
  requested_service?: string | null;
  estimated_budget?: string | null;
  urgency?: string | null;
  notes?: string | null;
  missing_fields?: string[];
}

export interface SubmissionCreate {
  source: SubmissionSource;
  raw_content: string;
}

export interface SubmissionReview {
  action: 'save_corrections' | 'needs_review';
  corrected_data?: ExtractedData;
}

export interface AuditEvent {
  id: number;
  submission_id: number;
  action: string;
  details?: string | null;
  created_at: string;
}

export interface HealthCheck {
  status: string;
}
