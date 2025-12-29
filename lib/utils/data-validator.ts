import type { Patient, BloodPressureReading } from '@/lib/types/patient';

export function parseBloodPressure(
  bp: string | null | undefined
): BloodPressureReading {
  if (!bp || typeof bp !== 'string') {
    return { systolic: null, diastolic: null };
  }

  const trimmed = bp.trim();
  if (!trimmed || trimmed === 'N/A' || trimmed === 'INVALID' || trimmed === '') {
    return { systolic: null, diastolic: null };
  }

  const parts = trimmed.split('/');
  if (parts.length !== 2) {
    return { systolic: null, diastolic: null };
  }

  const systolic = parts[0].trim();
  const diastolic = parts[1].trim();

  const sysNum = systolic === '' ? null : parseFloat(systolic);
  const diaNum = diastolic === '' ? null : parseFloat(diastolic);

  return {
    systolic: sysNum !== null && !isNaN(sysNum) ? sysNum : null,
    diastolic: diaNum !== null && !isNaN(diaNum) ? diaNum : null,
  };
}

export function parseTemperature(
  temp: number | string | null | undefined
): number | null {
  if (temp === null || temp === undefined || temp === '') {
    return null;
  }

  const tempNum = typeof temp === 'string' ? parseFloat(temp) : temp;

  if (isNaN(tempNum) || typeof tempNum !== 'number') {
    return null;
  }

  return tempNum;
}

export function parseAge(age: number | string | null | undefined): number | null {
  if (age === null || age === undefined || age === '') {
    return null;
  }

  const ageNum = typeof age === 'string' ? parseFloat(age) : age;

  if (isNaN(ageNum) || typeof ageNum !== 'number') {
    return null;
  }

  return ageNum;
}

export function hasDataQualityIssue(patient: Patient): boolean {
  const bp = patient.blood_pressure;
  const { systolic, diastolic } = parseBloodPressure(bp);
  if (systolic === null || diastolic === null) {
    return true;
  }

  const temp = parseTemperature(patient.temperature);
  if (temp === null) {
    return true;
  }

  const age = parseAge(patient.age);
  if (age === null) {
    return true;
  }

  return false;
}

