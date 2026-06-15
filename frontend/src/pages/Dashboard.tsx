import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Submission } from '../api/types';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Database, AlertCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getSubmissions();
        setSubmissions(data);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  const total = submissions.length;
  const pendingReview = submissions.filter(s => s.status === 'needs_review').length;
  const approved = submissions.filter(s => s.status === 'approved').length;
  const crmReady = submissions.filter(s => s.status === 'crm_ready').length;
  const synced = submissions.filter(s => s.status === 'synced').length;
  const extracted = submissions.filter(s => Boolean(s.extracted_data)).length;
  const highRisk = submissions.filter(s => (s.duplicate_risk || 0) > 0.7).length;

  const confidences = submissions
    .map(s => s.confidence_score)
    .filter((s): s is number => typeof s === 'number');
  const avgConfidence = confidences.length
    ? (confidences.reduce((a, b) => a + b, 0) / confidences.length * 100).toFixed(0)
    : 0;

  const stats = [
    { name: 'Total Submissions', value: total, icon: FileText, color: 'text-blue-500' },
    { name: 'Pending Review', value: pendingReview, icon: Clock, color: 'text-orange-500' },
    { name: 'Approved', value: approved, icon: CheckCircle, color: 'text-green-500' },
    { name: 'CRM Ready', value: crmReady, icon: CheckCircle, color: 'text-emerald-500' },
    { name: 'CRM Synced', value: synced, icon: Database, color: 'text-purple-500' },
    { name: 'Mock AI Extracted', value: extracted, icon: FileText, color: 'text-indigo-500' },
    { name: 'High Dup Risk', value: highRisk, icon: AlertCircle, color: 'text-red-500' },
  ];

  const recent = [...submissions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
          Avg Confidence: {avgConfidence}%
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-slate-500">{stat.name}</dt>
                    <dd className="text-2xl font-semibold text-slate-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Recent Submissions</h2>
        <div className="overflow-hidden bg-white shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Contact</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Company</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Created</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {recent.map((sub) => (
                <tr key={sub.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                    {sub.extracted_data?.contact_name || 'Unknown'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{sub.extracted_data?.company_name || '-'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      sub.status === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                      sub.status === 'needs_review' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                      'bg-slate-50 text-slate-600 ring-slate-500/10'
                    }`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link to={`/submissions/${sub.id}`} className="text-blue-600 hover:text-blue-900">
                      View<span className="sr-only">, {sub.id}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-500">No submissions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
