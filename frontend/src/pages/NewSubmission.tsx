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

  const samples = [
    {
      label: 'Messy email lead',
      source: 'email' as SubmissionSource,
      text: 'From: Sarah Jenkins <s.jenkins@globex.inc>\nDate: Oct 12\n\nHey folks, we need to upgrade our intake. Currently using spreadsheets and it\'s a disaster. Looking for 20 seats on the pro plan. Budget is maybe $5k/yr. Call me at 555-0199.'
    },
    {
      label: 'Partner referral (missing phone)',
      source: 'partner_referral' as SubmissionSource,
      text: 'Partner: Acme Consultants\nReferred Lead: Marcus Chen, CTO at TechCorp.\nNotes: Marcus is very interested in the enterprise tier. They have 500 employees. He didn\'t leave a phone number, but his email is m.chen@techcorp.com.'
    },
    {
      label: 'Conflicting budget note',
      source: 'form' as SubmissionSource,
      text: 'Name: Jane Doe\nCompany: StartupX\nEmail: jane@startupx.co\nPhone: 555-0200\nSelected Tier: Enterprise ($20k+)\nNotes: "We are a pre-seed startup so we have zero budget right now, looking for a free trial or huge discount."'
    }
  ];

  const fillSample = (sample: typeof samples[0]) => {
    setFormData({
      source: sample.source,
      raw_content: sample.text
    });
  };

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Submission</h1>
        <p className="mt-1 text-sm text-slate-500">
          Paste messy lead content here to begin the mock AI extraction and review process. Not for file uploads.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {samples.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => fillSample(sample)}
            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-colors"
          >
            {sample.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 space-y-6">
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
            className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm sm:leading-6"
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
            Pasted Messy Lead Text
          </label>
          <div className="mt-2">
            <textarea
              id="raw_content"
              name="raw_content"
              rows={12}
              required
              value={formData.raw_content}
              onChange={(e) => setFormData({ ...formData, raw_content: e.target.value })}
              className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6 font-mono text-sm"
              placeholder="Paste email thread, form JSON, or notes here..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || !formData.raw_content.trim()}
            className="inline-flex justify-center rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-cyan-900/10 hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Submitting...' : 'Process Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}
