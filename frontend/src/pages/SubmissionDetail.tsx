import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Submission, AuditEvent, ExtractedData } from '../api/types';
import { Bot, CheckCircle, Database, AlertTriangle, Save, RefreshCw } from 'lucide-react';

interface ReviewForm {
  company_name: string;
  contact_name: string;
  email: string;
  requested_service: string;
}

const emptyReviewForm: ReviewForm = {
  company_name: '',
  contact_name: '',
  email: '',
  requested_service: '',
};

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState<ReviewForm>(emptyReviewForm);

  const loadData = async () => {
    if (!id) return;
    try {
      const sub = await api.getSubmission(id);
      setSubmission(sub);
      setEditForm({
        company_name: sub.extracted_data?.company_name || '',
        contact_name: sub.extracted_data?.contact_name || '',
        email: sub.extracted_data?.email || '',
        requested_service: sub.extracted_data?.requested_service || '',
      });
      const logs = await api.getAuditLog(id);
      setAuditLogs(logs);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load submission'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      if (!id) return;
      try {
        const sub = await api.getSubmission(id);
        setSubmission(sub);
        setEditForm({
          company_name: sub.extracted_data?.company_name || '',
          contact_name: sub.extracted_data?.contact_name || '',
          email: sub.extracted_data?.email || '',
          requested_service: sub.extracted_data?.requested_service || '',
        });
        const logs = await api.getAuditLog(id);
        setAuditLogs(logs);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load submission'));
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [id]);

  if (loading) return <div className="p-8">Loading submission details...</div>;
  if (!submission) return <div className="p-8 text-red-500">Submission not found</div>;

  const handleAction = async (actionFn: () => Promise<unknown>) => {
    setActionLoading(true);
    setError('');
    try {
      await actionFn();
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Action failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtract = () => handleAction(() => api.extractSubmission(id!));
  const handleApprove = () => handleAction(() => api.approveSubmission(id!));
  const handleSyncCrm = () => handleAction(() => api.syncCrm(id!));
  const handleMarkReview = () => handleAction(() => api.reviewSubmission(id!, { action: 'needs_review' }));
  const handleSaveCorrections = () => {
    const correctedData: ExtractedData = {
      ...(submission.extracted_data || {}),
      company_name: editForm.company_name,
      contact_name: editForm.contact_name,
      email: editForm.email,
      requested_service: editForm.requested_service,
      missing_fields: submission.extracted_data?.missing_fields || [],
    };

    return handleAction(() => api.reviewSubmission(id!, {
      action: 'save_corrections',
      corrected_data: correctedData,
    }));
  };

  const hasExtraction = Boolean(submission.extracted_data);
  const isSynced = submission.status === 'synced';
  const isApproved = submission.status === 'approved' || submission.status === 'crm_ready';
  const canExtract = !['approved', 'crm_ready', 'synced'].includes(submission.status);
  const canReview = hasExtraction && !isSynced;
  const canSaveCorrections = hasExtraction && !isApproved && !isSynced;
  const canApprove = hasExtraction && !isApproved && !isSynced;
  const canSync = hasExtraction && ['approved', 'crm_ready'].includes(submission.status);
  const missingFields = submission.extracted_data?.missing_fields || [];
  const duplicateRisk = submission.duplicate_risk;
  const duplicateRiskPercent = typeof duplicateRisk === 'number' ? (duplicateRisk * 100).toFixed(0) : null;
  const duplicateRiskTone = typeof duplicateRisk === 'number' && duplicateRisk > 0.7
    ? 'bg-red-50 text-red-800 border-red-200'
    : 'bg-slate-50 text-slate-700 border-slate-200';
  const duplicateRiskLabel = typeof duplicateRisk === 'number' && duplicateRisk > 0.7
    ? 'High duplicate risk'
    : 'Duplicate risk signal';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Review Submission: {submission.extracted_data?.contact_name || 'Unknown Contact'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">ID: {submission.id} • Created: {new Date(submission.created_at).toLocaleString()}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 uppercase">
            Status: {submission.status.replace('_', ' ')}
          </span>
          {submission.crm_sync_status && (
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 uppercase">
              Simulated CRM: {submission.crm_sync_status.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-3 items-center">
        <button
          onClick={handleExtract}
          disabled={actionLoading || !canExtract}
          title={!canExtract ? 'Mock extraction is only available before approval or sync.' : undefined}
          className="inline-flex items-center px-3 py-2 text-sm font-semibold rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 border border-indigo-200"
        >
          <Bot className="h-4 w-4 mr-2" />
          Run mock AI extraction
        </button>
        <button
          onClick={handleMarkReview}
          disabled={actionLoading || !canReview || submission.status === 'needs_review'}
          title={!hasExtraction ? 'Run mock AI extraction before marking for review.' : undefined}
          className="inline-flex items-center px-3 py-2 text-sm font-semibold rounded-md bg-yellow-50 text-yellow-800 hover:bg-yellow-100 disabled:opacity-50 border border-yellow-200"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Mark needs review
        </button>
        <button
          onClick={handleApprove}
          disabled={actionLoading || !canApprove}
          title={!hasExtraction ? 'Run mock AI extraction before approval.' : undefined}
          className="inline-flex items-center px-3 py-2 text-sm font-semibold rounded-md bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 border border-green-200"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve for CRM
        </button>
        <button
          onClick={handleSyncCrm}
          disabled={actionLoading || !canSync}
          title={!canSync ? 'Approve the record before simulated CRM sync.' : undefined}
          className="inline-flex items-center px-3 py-2 text-sm font-semibold rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 border border-purple-200"
        >
          <Database className="h-4 w-4 mr-2" />
          Simulated CRM sync
        </button>
      </div>

      {!hasExtraction && (
        <div className="rounded-md bg-blue-50 p-4 border border-blue-200 text-sm text-blue-800">
          Run mock AI extraction before saving reviewer corrections, approving for CRM, or syncing to the simulated CRM.
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Raw Content */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg flex flex-col">
          <div className="border-b border-slate-200 px-4 py-3 bg-slate-50 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Messy Submission (Source: {submission.source})</h3>
          </div>
          <div className="p-4 flex-1">
            <pre className="text-sm bg-slate-50 p-4 rounded-md border border-slate-200 whitespace-pre-wrap font-mono h-[400px] overflow-y-auto">
              {submission.raw_content}
            </pre>
          </div>
        </div>

        {/* Right: Extracted Fields & Review */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg flex flex-col">
          <div className="border-b border-slate-200 px-4 py-3 bg-slate-50 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Extracted Fields</h3>
            {typeof submission.confidence_score === 'number' && (
              <span className="text-sm font-medium text-slate-500">
                Confidence: {(submission.confidence_score * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <div className="p-4 flex-1 overflow-y-auto h-[400px]">
            {missingFields.length > 0 && (
              <div className="mb-4 bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200 text-sm">
                <p className="font-semibold mb-1">Missing Information:</p>
                <ul className="list-disc pl-5">
                  {missingFields.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
            )}
            {typeof duplicateRisk === 'number' && (
              <div className={`mb-4 p-3 rounded border text-sm font-medium flex items-center ${duplicateRiskTone}`}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                {duplicateRiskLabel} ({duplicateRiskPercent}%)
              </div>
            )}

            <form className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Key reviewer fields</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Edit the core CRM fields before explicit approval.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={editForm.company_name}
                  onChange={e => setEditForm({ ...editForm, company_name: e.target.value })}
                  disabled={!canSaveCorrections}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Contact Name</label>
                <input
                  type="text"
                  value={editForm.contact_name}
                  onChange={e => setEditForm({ ...editForm, contact_name: e.target.value })}
                  disabled={!canSaveCorrections}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Contact Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  disabled={!canSaveCorrections}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Identified Needs</label>
                <textarea
                  rows={4}
                  value={editForm.requested_service}
                  onChange={e => setEditForm({ ...editForm, requested_service: e.target.value })}
                  disabled={!canSaveCorrections}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-50"
                />
              </div>
              {!isSynced && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveCorrections}
                    disabled={actionLoading || !canSaveCorrections}
                    title={!hasExtraction ? 'Run mock AI extraction before saving corrections.' : undefined}
                    className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save reviewer corrections
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {(submission.crm_id || submission.crm_synced_at || submission.crm_sync_error) && (
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg">
          <div className="border-b border-slate-200 px-4 py-3 bg-slate-50 rounded-t-lg">
            <h3 className="font-semibold text-slate-800">Simulated CRM sync details</h3>
          </div>
          <div className="p-4 grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <div className="font-medium text-slate-700">CRM ID</div>
              <div className="text-slate-500">{submission.crm_id || '-'}</div>
            </div>
            <div>
              <div className="font-medium text-slate-700">Synced At</div>
              <div className="text-slate-500">
                {submission.crm_synced_at ? new Date(submission.crm_synced_at).toLocaleString() : '-'}
              </div>
            </div>
            <div>
              <div className="font-medium text-slate-700">Sync Error</div>
              <div className="text-slate-500">{submission.crm_sync_error || '-'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-lg">
        <div className="border-b border-slate-200 px-4 py-3 bg-slate-50 rounded-t-lg">
          <h3 className="font-semibold text-slate-800">Audit trail</h3>
        </div>
        <div className="p-4">
          {auditLogs.length === 0 ? (
            <p className="text-sm text-slate-500">No audit events found.</p>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {auditLogs.map((log, idx) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {idx !== auditLogs.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-8 ring-white border border-slate-200">
                            <RefreshCw className="h-4 w-4 text-slate-500" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-slate-500">
                              <span className="font-medium text-slate-900">{log.action.replace('_', ' ')}</span>
                            </p>
                            {log.details && (
                              <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                {log.details}
                              </p>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-slate-500">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
