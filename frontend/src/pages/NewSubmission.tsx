import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { SubmissionCreate, SubmissionSource } from '../api/types';

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Failed to create submission';
}

export default function NewSubmission() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<SubmissionCreate>({
    source: 'email',
    raw_content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.createSubmission(formData);
      navigate(`/submissions/${result.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Submission</h1>
        <p className="mt-1 text-sm text-slate-500">
          Paste messy lead content here to begin the intake and extraction process.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg p-6 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="source" className="block text-sm font-medium leading-6 text-slate-900">
            Source
          </label>
          <select
            id="source"
            name="source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value as SubmissionSource })}
            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
          >
            <option value="email">Email</option>
            <option value="form">Form</option>
            <option value="partner_referral">Partner Referral</option>
            <option value="csv_import">CSV Import</option>
            <option value="webhook">Webhook</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="raw_content" className="block text-sm font-medium leading-6 text-slate-900">
            Raw Content
          </label>
          <div className="mt-2">
            <textarea
              id="raw_content"
              name="raw_content"
              rows={12}
              required
              value={formData.raw_content}
              onChange={(e) => setFormData({ ...formData, raw_content: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 font-mono text-xs"
              placeholder="Paste email thread, form JSON, or notes here..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !formData.raw_content.trim()}
            className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Messy Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}
