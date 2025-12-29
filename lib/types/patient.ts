export interface Patient {
  id?: string;
  patient_id?: string;
  age?: number | string | null;
  blood_pressure?: string | null;
  temperature?: number | string | null;
  [key: string]: unknown;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse {
  data: Patient[];
  pagination: PaginationInfo;
  metadata?: {
    timestamp?: string;
    version?: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

export interface BloodPressureReading {
  systolic: number | null;
  diastolic: number | null;
}

export interface RiskScores {
  bloodPressure: number;
  temperature: number;
  age: number;
  total: number;
}

export interface PatientCategories {
  highRiskPatients: string[];
  feverPatients: string[];
  dataQualityIssues: string[];
}

export interface SubmissionPayload {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}

export interface AssessmentResult {
  success: boolean;
  message?: string;
  results?: {
    score: number;
    percentage: number;
    status: string;
    breakdown: {
      high_risk?: {
        score: number;
        max: number;
        correct: number;
        submitted: number;
        matches: number;
      };
      fever?: {
        score: number;
        min: number;
      };
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

