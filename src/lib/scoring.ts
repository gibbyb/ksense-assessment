import type { Patient } from '../api/patients';

export interface PatientRiskScore {
  patient_id: string;
  bpScore: number;
  tempScore: number;
  ageScore: number;
  totalScore: number;
  bpValid: boolean;
  tempValid: boolean;
  ageValid: boolean;
  hasDataIssue: boolean;
};

export interface SubmissionPayload {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
};

const scoreSystolic = (value: number): number => {
  if (value < 120) return 0;
  if (value < 130) return 1;
  if (value < 140) return 2;
  return 3;
};

const scoreDiastolic = (value: number): number => {
  if (value < 80) return 0;
  if (value < 90) return 2;
  return 3;
};

export const scoreBP = (bp: string | null | undefined): { score: number; valid: boolean } => {
  if (!bp) return { score: 0, valid: false };
  const parts = bp.split('/');
  if (parts.length !== 2) return { score: 0, valid: false };
  const [sysStr, diaStr] = parts;
  if (!sysStr.trim() || !diaStr.trim()) return { score: 0, valid: false };
  const sys = Number(sysStr.trim()), dia = Number(diaStr.trim());
  if (!Number.isFinite(sys) || !Number.isFinite(dia)) return { score: 0, valid: false };
  return { score: Math.max(scoreSystolic(sys), scoreDiastolic(dia)), valid: true };
};

export const scoreTemp = (temp: number | null | undefined): { score: number; valid: boolean } => {
  if (temp == null || !Number.isFinite(temp)) return { score: 0, valid: false };
  if (temp <= 99.5) return { score: 0, valid: true };
  if (temp <= 100.9) return { score: 1, valid: true };
  return { score: 2, valid: true };
};

export const scoreAge = (age: number | null | undefined): { score: number; valid: boolean } => {
  if (age == null || !Number.isFinite(age)) return { score: 0, valid: false };
  if (age < 40) return { score: 0, valid: true };
  if (age <= 65) return { score: 1, valid: true };
  return { score: 2, valid: true };
};

export const scorePatient = (patient: Patient): PatientRiskScore => {
  const patient_id = patient.patient_id;
  const { score: bpScore, valid: bpValid } = scoreBP(patient.blood_pressure);
  const { score: tempScore, valid: tempValid } = scoreTemp(patient.temperature);
  const { score: ageScore, valid: ageValid } = scoreAge(patient.age);
  const totalScore = bpScore + tempScore + ageScore;
  const hasDataIssue = !bpValid || !tempValid || !ageValid;
  return {
    patient_id,
    bpScore,
    tempScore,
    ageScore,
    totalScore,
    bpValid,
    tempValid,
    ageValid,
    hasDataIssue
  };
};

export const computeSubmissionPayload = (patients: Patient[]): SubmissionPayload => {
  const high_risk_patients: string[] = [];
  const fever_patients: string[] = [];
  const data_quality_issues: string[] = [];

  for (const patient of patients) {
    const score = scorePatient(patient);
    if (score.totalScore >= 4)
      high_risk_patients.push(patient.patient_id)
    if (score.tempValid && patient.temperature != null && patient.temperature >= 99.6)
      fever_patients.push(patient.patient_id)
    if (score.hasDataIssue)
      data_quality_issues.push(patient.patient_id);
  }
  return { high_risk_patients, fever_patients, data_quality_issues };
};
