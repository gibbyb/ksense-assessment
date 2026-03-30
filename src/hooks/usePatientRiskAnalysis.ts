import { useAllPatients } from './useAllPatients'
import { scorePatient, computeSubmissionPayload } from '../lib/scoring'

export const usePatientRiskAnalysis = () => {
  const { data, isLoading, isError, error } = useAllPatients();
  const patients = data ?? [];
  const submissionPayload = computeSubmissionPayload(patients);
  return {
    isLoading,
    isError,
    error,
    scores: patients.map(scorePatient),
    submissionPayload,
  };
};
