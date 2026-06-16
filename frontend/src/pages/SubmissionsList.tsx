import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { Submission, SubmissionSource, SubmissionStatus } from '../api/types';
import { Link } from 'react-router-dom';

export default function SubmissionsList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<SubmissionSource | ''>('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await api.getSubmissions();
        setSubmissions(data);
      } catch (error) {
        console.error('Failed to load submissions', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesStatus = statusFilter ? sub.status === statusFilter : true;
      const matchesSource = sourceFilter ? sub.source === sourceFilter : true;
      return matchesStatus && matchesSource;
    });
  }, [submissions, statusFilter, sourceFilter]);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
        <div className="mt-4 sm:mt-0 flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | '')}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm sm:leading-6"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="needs_review">Needs Review</option>
            <option value="approved">Approved</option>
            <option value="crm_ready">CRM Ready</option>
            <option value="synced">Synced</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as SubmissionSource | '')}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm sm:leading-6"
          >
            <option value="">All Sources</option>
            <option value="email">Email</option>
            <option value="form">Form</option>
            <option value="partner_referral">Partner Referral</option>
            <option value="csv_import">CSV Import</option>
            <option value="webhook">Webhook</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading submissions...</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Contact / Company</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Source</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Confidence</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Dup Risk</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Created</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-slate-900">{sub.extracted_data?.contact_name || 'Unknown'}</div>
                    <div className="text-slate-500">{sub.extracted_data?.company_name || 'Unknown'}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 capitalize">{sub.source.replace('_', ' ')}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      sub.status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                      sub.status === 'needs_review' ? 'bg-amber-50 text-amber-800 ring-amber-600/20' :
                      'bg-slate-50 text-slate-600 ring-slate-500/10'
                    }`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {typeof sub.confidence_score === 'number' ? `${(sub.confidence_score * 100).toFixed(0)}%` : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {sub.duplicate_risk !== undefined && sub.duplicate_risk !== null ? (
                      <span className={sub.duplicate_risk > 0.7 ? 'text-amber-700 font-medium' : ''}>
                        {(sub.duplicate_risk * 100).toFixed(0)}%
                      </span>
                    ) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link to={`/submissions/${sub.id}`} className="text-cyan-700 hover:text-cyan-900">
                      Review<span className="sr-only">, {sub.id}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && submissions.length === 0 ? (
          <div className="p-16 text-center text-sm text-slate-500">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">No submissions</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new demo submission.</p>
            <div className="mt-6">
              <Link to="/submissions/new" className="inline-flex items-center rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-cyan-900/10 hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-colors">
                New Submission
              </Link>
            </div>
          </div>
        ) : !loading && filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No submissions found matching filters.</div>
        ) : null}
      </div>
    </div>
  );
}
