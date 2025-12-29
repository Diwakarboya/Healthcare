import type { Patient, PatientCategories } from '@/lib/types/patient';
import { fetchAllPatients, submitAssessment } from '@/lib/utils/api-client';
import { hasDataQualityIssue } from '@/lib/utils/data-validator';
import { hasFever, isHighRisk } from '@/lib/utils/risk-calculator';
import type { AssessmentResult } from '@/lib/types/patient';

export function categorizePatients(patients: Patient[]): PatientCategories {
  const highRiskPatients: string[] = [];
  const feverPatients: string[] = [];
  const dataQualityIssues: string[] = [];
  for (const patient of patients) {
    console.log('Processing patient:', patient);
    const patientId = patient.patient_id || patient.id; 
    if (!patientId || typeof patientId !== 'string') {
      console.log('Skipping patient with no ID:', patient);
      continue;
    }

    if (hasDataQualityIssue(patient)) {
      dataQualityIssues.push(patientId);
      console.log('Data quality issue found for patient:', patientId);
    }

    if (isHighRisk(patient)) {
      highRiskPatients.push(patientId);
      console.log('High risk patient found for patient:', patientId);
    }

    if (hasFever(patient)) {
      feverPatients.push(patientId);
      console.log('Fever patient found for patient:', patientId);
    }
  }

  return {
    highRiskPatients,
    feverPatients,
    dataQualityIssues,
  };
}

export async function processAndSubmitAssessment(): Promise<{
  categories: PatientCategories;
  assessmentResult: AssessmentResult;
  stats: {
    totalPatients: number;
    highRiskCount: number;
    feverCount: number;
    dataQualityIssuesCount: number;
  };
}> {
  const patients = await fetchAllPatients();

  const categories = categorizePatients(patients);

  const assessmentResult = await submitAssessment({
    high_risk_patients: categories.highRiskPatients,
    fever_patients: categories.feverPatients,
    data_quality_issues: categories.dataQualityIssues,
  }) as AssessmentResult;

  return {
    categories,
    assessmentResult,
    stats: {
      totalPatients: patients.length,
      highRiskCount: categories.highRiskPatients.length,
      feverCount: categories.feverPatients.length,
      dataQualityIssuesCount: categories.dataQualityIssues.length,
    },
  };
}



