import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Submission } from '../api/types';
import { Link } from 'react-router-dom';
import { Database, CheckCircle, AlertTriangle, type LucideIcon } from 'lucide-react';

interface PipelineColumnProps {
  title: string;
  items: Submission[];
  icon: LucideIcon;
  color: string;
}

function PipelineColumn({ title, items, icon: Icon, color }: PipelineColumnProps) {
  return (
    <div className="bg-slate-100 rounded-lg p-4 h-full">
      <div className="flex items-center mb-4">
        <Icon className={`h-5 w-5 mr-2 ${color}`} />
        <h2 className="font-semibold text-slate-800">{title} ({items.length})</h2>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-white p-3 rounded-md shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <Link to={`/submissions/${item.id}`} className="font-medium text-blue-600 hover:underline text-sm">
                {item.extracted_data?.contact_name || 'Unknown'}
              </Link>
              {typeof item.confidence_score === 'number' && (
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  {(item.confidence_score * 100).toFixed(0)}%
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mb-2">
              {item.extracted_data?.company_name || 'No Company'}
            </div>
            {item.crm_sync_status && (
              <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded inline-block mt-2 border border-purple-100">
                Simulated CRM: {item.crm_sync_status.replace('_', ' ')}
              </div>
            )}
            {item.crm_id && (
              <div className="text-xs text-slate-400 mt-1">
                Simulated CRM ID: {item.crm_id}
              </div>
            )}
            {item.crm_synced_at && (
              <div className="text-xs text-slate-400 mt-1">
                Synced: {new Date(item.crm_synced_at).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center p-4 text-sm text-slate-400 italic">
            No items
          </div>
        )}
      </div>
    </div>
  );
}

export default function CrmPipeline() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getSubmissions();
        setSubmissions(data.filter(s => ['needs_review', 'approved', 'crm_ready', 'synced'].includes(s.status)));
      } catch (error) {
        console.error('Failed to load CRM pipeline', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const needsReview = submissions.filter(s => s.status === 'needs_review');
  const approved = submissions.filter(s => ['approved', 'crm_ready'].includes(s.status));
  const synced = submissions.filter(s => s.status === 'synced');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CRM Pipeline</h1>
        <p className="mt-1 text-sm text-slate-500">
          View records under review, approved for simulated CRM sync, or already synced.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading pipeline...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PipelineColumn title="Needs Review" items={needsReview} icon={AlertTriangle} color="text-yellow-600" />
          <PipelineColumn title="Approved for Simulated CRM" items={approved} icon={CheckCircle} color="text-green-600" />
          <PipelineColumn title="Synced to Simulated CRM" items={synced} icon={Database} color="text-purple-600" />
        </div>
      )}
    </div>
  );
}
