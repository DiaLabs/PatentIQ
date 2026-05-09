/**
 * Centralized API client for the dia-eval backend.
 * Automatically attaches the Firebase ID token to every mentor (authenticated) request.
 * Public endpoints (submit flow) use publicFetch — no auth header.
 */

import { auth } from './firebase';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

// ── Core Fetchers ─────────────────────────────────────────────────────────────

/** Authenticated fetch — requires user to be signed in */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated — user must be signed in.');

  const idToken = await user.getIdToken(false);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let msg = `API error: ${response.status} ${response.statusText}`;
    try {
      const e = await response.json() as { error?: string };
      if (e.error) msg = e.error;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  return response.json() as Promise<T>;
}

/** Public fetch — no auth header (student-facing endpoints) */
export async function publicFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let msg = `API error: ${response.status} ${response.statusText}`;
    try {
      const e = await response.json() as { error?: string };
      if (e.error) msg = e.error;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  return response.json() as Promise<T>;
}

// ── Type Definitions ──────────────────────────────────────────────────────────

export interface DashboardOverview {
  total_groups: number;
  total_submissions: number;
  total_evaluated: number;
  total_rejected: number;
  avg_overall_score: number | null;
  avg_plag_similarity: number | null;
}

export interface ActiveGroup {
  group_id: string;
  name: string;
  completed: number;
  pending: number;
  avg_score: number | null;
}

export interface DashboardData {
  overview: DashboardOverview;
  verdict_distribution: Record<string, number>;
  active_groups: ActiveGroup[];
}

export interface Group {
  group_id: string;
  name: string;
  plag_threshold: number;
  expires_at: string;
  is_expired: boolean;
  created_at: string;
  stats: {
    total_submissions: number;
    completed: number;
    rejected: number;
    avg_score: number | null;
  };
}

export interface Submission {
  submission_id: string;
  submitter_name: string;
  team_member_names: string[];
  status: SubmissionStatus;
  current_stage: number | null;
  rejection_reason: string | null;
  overall_score: number | null;
  verdict: string | null;
  submitted_at: string;
}

export type SubmissionStatus =
  | 'QUEUED'
  | 'EXTRACTING_IDS'
  | 'VALIDATING_IDS'
  | 'CHECKING_PLAGIARISM'
  | 'EVALUATING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'FAILED';

export interface GroupDetails {
  group: {
    group_id: string;
    name: string;
    access_token: string;
    student_link: string;
    plag_threshold: number;
    expires_at: string;
    is_expired: boolean;
  };
  submissions: Submission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CreatedGroup {
  group_id: string;
  name: string;
  student_link: string;
  expires_at: string;
  plag_threshold: number;
}

export interface SubmissionStatusResponse {
  submission_id: string;
  status: SubmissionStatus;
  stage_label: string;
  progress_percent: number;
  rejection_reason: string | null;
  score: number | null;
  verdict: string | null;
}

// ── Mentor API Helpers ────────────────────────────────────────────────────────

/** GET /mentor/dashboard */
export async function fetchDashboard(days = 30): Promise<DashboardData> {
  return apiFetch<DashboardData>(`/mentor/dashboard?days=${days}`);
}

/** GET /mentor/groups */
export async function fetchGroups(): Promise<{ groups: Group[] }> {
  return apiFetch<{ groups: Group[] }>('/mentor/groups');
}

/** POST /mentor/groups */
export async function createGroup(body: {
  name: string;
  plag_threshold: number;
  link_expiry_days: number;
}): Promise<CreatedGroup> {
  return apiFetch<CreatedGroup>('/mentor/groups', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** GET /mentor/groups/:id */
export async function fetchGroupDetails(
  groupId: string,
  params?: { page?: number; limit?: number; status?: string }
): Promise<GroupDetails> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.status) qs.set('status', params.status);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<GroupDetails>(`/mentor/groups/${groupId}${query}`);
}

/** DELETE /mentor/groups/:id */
export async function deleteGroup(groupId: string): Promise<void> {
  await apiFetch(`/mentor/groups/${groupId}`, { method: 'DELETE' });
}

/** GET /mentor/groups/:groupId/submissions/:submissionId/pipeline */
export interface PipelinePhase {
  phase_name: string;
  stage_number: number;
  status: 'COMPLETED' | 'FAILED' | 'REJECTED';
  duration_ms: number | null;
  timestamp: number;
  cost_usd: number | null;
  tokens_used: number | null;
  api_provider: string | null;
  error_message: string | null;
}

export interface PipelineDetails {
  submission_id: string;
  phases: PipelinePhase[];
  total_duration_ms: number;
  total_cost_usd: number;
}

export async function fetchSubmissionPipeline(
  groupId: string,
  submissionId: string
): Promise<PipelineDetails> {
  return apiFetch<PipelineDetails>(
    `/mentor/groups/${groupId}/submissions/${submissionId}/pipeline`
  );
}

// ── Public (Student) API Helpers ──────────────────────────────────────────────

/** POST /submit/prepare */
export async function prepareUpload(body: {
  access_token: string;
  submitter_name: string;
  team_member_names: string[];
  group_name: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  file_hash: string;
  idempotency_key: string;
}): Promise<{
  submission_id: string;
  upload_url: string;
  upload_key: string;
  content_type: string;
  expires_in: number;
}> {
  return publicFetch('/submit/prepare', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** PUT upload to R2 (direct to the backend upload proxy in dev) */
export async function uploadFile(
  uploadUrl: string,
  file: File,
  contentType: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${uploadUrl}`, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
}

/** POST /submit/confirm */
export async function confirmUpload(body: {
  submission_id: string;
  access_token: string;
}): Promise<{ queued: boolean; submission_id: string; message: string }> {
  return publicFetch('/submit/confirm', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** GET /submit/:id/status */
export async function checkSubmissionStatus(
  submissionId: string
): Promise<SubmissionStatusResponse> {
  return publicFetch<SubmissionStatusResponse>(`/submit/${submissionId}/status`);
}
