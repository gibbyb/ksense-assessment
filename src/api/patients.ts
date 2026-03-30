const BASE_URL = import.meta.env.VITE_BASE_URL as string;
const API_KEY = import.meta.env.VITE_API_KEY as string;

export interface Patient {
  patient_id: string,
  name: string,
  age: number | null,
  gender: string,
  blood_pressure: string
  temperature: number | null,
  visit_date: string
  diagnosis: string
  medications: string
};

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
};

export interface PatientsResponse {
  data: Patient[]
  pagination: Pagination
};

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  };
};

const normalizePatient = (raw: Record<string, unknown>): Patient => {
  return {
    patient_id: String(raw.patient_id ?? raw.id ?? ''),
    name: String(raw.name ?? raw.patient_name ?? 'Unknown'),
    age: raw.age != null ? Number(raw.age): null,
    gender: String(raw.gender ?? raw.sex ?? ''),
    blood_pressure: String(raw.blood_pressure ?? raw.bp ?? ''),
    temperature: raw.temperature != null ? Number(raw.temperature) : null,
    visit_date: String(raw.visit_date ?? raw.date ?? ''),
    diagnosis: String(raw.diagnosis ?? raw.condition ?? ''),
    medications: String(raw.medications ?? raw.meds ?? ''),
  };
};

const normalizePagination = (
  raw: Record<string, unknown>,
  page: number,
  limit: number,
): Pagination => {
  return {
    page: Number(raw.page ?? page),
    limit: Number(raw.limit ?? raw.per_page ?? limit),
    total: Number(raw.total ?? raw.totalCount ?? raw.total_count ?? 0),
    totalPages: Number(raw.totalPages ?? raw.total_pages ?? raw.pages ?? 1),
    hasNext: Boolean(raw.hasNext ?? raw.has_next ?? false),
    hasPrevious: Boolean(raw.hasPrevious ?? raw.has_previous ?? false),
  };
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const fetchPageWithRetry = async (
  page: number,
  limit: number,
  attempt= 0,
): Promise<PatientsResponse> => {
  try {
    return await fetchPatients(page, limit);
  } catch (error) {
    if (error instanceof ApiError && error.status === 429 && attempt < 5) {
      await delay(Math.min(1500 * 2 ** attempt, 20_000));
      return fetchPageWithRetry(page, limit, attempt + 1);
    }
    throw error;
  }
};

export const fetchAllPatients = async (): Promise<Patient[]> => {
  const all: Patient[] = [];
  let page = 1;
  while (true) {
    const result = await fetchPageWithRetry(page, 10);
    all.push(...result.data);
    if (!result.pagination.hasNext) break
    page++;
    await delay(500);
  }
  return all;
};

export const fetchPatients = async (
  page = 1,
  limit = 10,
): Promise<PatientsResponse> => {
  const url = `${BASE_URL}/api/patients?page=${page}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { 'x-api-key': API_KEY }
  });
  if (!res.ok)
    throw new ApiError(res.status, `API error ${res.status}: ${res.statusText}`)
  const json = await res.json();
  const rawData = json.data ?? json.patients ?? json.results ?? [];
  const rawPagination = json.pagination ?? json.meta ?? json.paging ?? {};
  return {
    data: Array.isArray(rawData) ? rawData.map(normalizePatient) : [],
    pagination: normalizePagination(rawPagination, page, limit),
  };
};
