import assert from 'node:assert/strict';
import test from 'node:test';

import { api } from '../src/api/client.ts';

test('reviewSubmission sends backend-compatible review action payload', async () => {
  let captured: { url?: string; options?: RequestInit } = {};

  globalThis.fetch = async (url, options) => {
    captured = { url: String(url), options };

    return new Response(
      JSON.stringify({
        id: 42,
        source: 'email',
        raw_content: 'raw lead content',
        status: 'needs_review',
        extracted_data: {
          company_name: 'Acme Corp',
          contact_name: 'Alex Lee',
          email: 'alex@example.com',
          requested_service: 'CRM cleanup',
          missing_fields: [],
        },
        confidence_score: 0.84,
        duplicate_risk: 0.12,
        crm_sync_status: 'not_synced',
        created_at: '2026-06-15T00:00:00Z',
        updated_at: null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  };

  await api.reviewSubmission('42', {
    action: 'save_corrections',
    corrected_data: {
      company_name: 'Acme Corp',
      contact_name: 'Alex Lee',
      email: 'alex@example.com',
      requested_service: 'CRM cleanup',
      missing_fields: [],
    },
  });

  assert.equal(captured.url, 'http://127.0.0.1:8000/api/submissions/42/review');
  assert.equal(captured.options?.method, 'PATCH');
  assert.deepEqual(JSON.parse(String(captured.options?.body)), {
    action: 'save_corrections',
    corrected_data: {
      company_name: 'Acme Corp',
      contact_name: 'Alex Lee',
      email: 'alex@example.com',
      requested_service: 'CRM cleanup',
      missing_fields: [],
    },
  });
});
