import { ApiError } from './patients'
import type { SubmissionPayload } from '../lib/scoring'

const BASE_URL = import.meta.env.VITE_BASE_URL as string
const API_KEY = import.meta.env.VITE_API_KEY as string

interface BreakdownCategory {
  score: number;
  max: number;
  correct: number;
  submitted: number;
  matches: number;
};

export interface SubmissionResponse {
  success: boolean;
  message: string;
  results: {
    score: number;
    percentage: number;
    status: string;
    breakdown: {
      high_risk: BreakdownCategory
      fever: BreakdownCategory
      data_quality: BreakdownCategory
    };
    feedback: {
      strengths: string[];
      issues: string[];
    };
    attempt_number: number;
    remaining_attempts: number;
    is_personal_best: boolean;
    can_resubmit: boolean;
  };
};

export const submitAssessment = async (
  payload: SubmissionPayload
): Promise<SubmissionResponse> => {
  const res = await fetch(`${BASE_URL}/api/submit-assessment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok)
    throw new ApiError(res.status, `Submission failed: ${res.status} ${res.statusText}`)
  return res.json() as Promise<SubmissionResponse>
};
