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

  const createSample = async () => {
    setLoading(true);
    try {
      await api.createSubmission({
        source: 'email',
        raw_content: 'Hi, this is John Doe from Acme Corp. I need 50 licenses of your enterprise tier. Budget is around $20k. Call me at 555-0199.'
      });
      const data = await api.getSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to create sample', error);
    } finally {
      setLoading(false);
    }
  };

  if (submissions.length === 0 && !loading) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-6">
          <Database className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">No demo data yet</h2>
        <p className="text-slate-500 mb-8 text-lg">
          Intake turns messy leads into CRM-ready records. Create a sample lead to see mock AI extraction and review workflows in action.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={createSample}
            className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-cyan-900/10 hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-colors"
          >
            Create sample lead
          </button>
          <Link
            to="/submissions/new"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
          >
            Go to New Submission
          </Link>
        </div>
      </div>
    );
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
    { name: 'Total Submissions', value: total, icon: FileText, color: 'text-cyan-600' },
    { name: 'Pending Review', value: pendingReview, icon: Clock, color: 'text-amber-500' },
    { name: 'Approved', value: approved, icon: CheckCircle, color: 'text-emerald-500' },
    { name: 'CRM Ready', value: crmReady, icon: CheckCircle, color: 'text-emerald-500' },
    { name: 'CRM Synced', value: synced, icon: Database, color: 'text-cyan-600' },
    { name: 'Mock AI Extracted', value: extracted, icon: FileText, color: 'text-slate-600' },
    { name: 'High Dup Risk', value: highRisk, icon: AlertCircle, color: 'text-amber-600' },
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
          <div key={stat.name} className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-lg p-2.5 bg-slate-50 border border-slate-100">
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
        <div className="overflow-hidden bg-white shadow-sm ring-1 ring-black/5 sm:rounded-xl">
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
                      sub.status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                      sub.status === 'needs_review' ? 'bg-amber-50 text-amber-800 ring-amber-600/20' :
                      'bg-slate-50 text-slate-600 ring-slate-500/10'
                    }`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link to={`/submissions/${sub.id}`} className="text-cyan-700 hover:text-cyan-900">
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
