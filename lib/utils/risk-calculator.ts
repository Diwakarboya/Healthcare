import type { Patient, RiskScores } from '@/lib/types/patient';
import { parseBloodPressure, parseTemperature, parseAge } from './data-validator';

export function calculateBloodPressureRisk(patient: Patient): number {
  const bp = patient.blood_pressure;
  const { systolic, diastolic } = parseBloodPressure(bp);

  if (systolic === null || diastolic === null) {
    return 0;
  }

  if (systolic >= 140 || diastolic >= 90) {
    return 3;
  }

  if (systolic >= 130 || diastolic >= 80) {
    return 2;
  }

  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return 1;
  }

  return 0;
}

export function calculateTemperatureRisk(patient: Patient): number {
  const temp = parseTemperature(patient.temperature);

  if (temp === null) {
    return 0;
  }

  if (temp >= 101.0) {
    return 2;
  }

  if (temp >= 99.6) {
    return 1;
  }

  return 0;
}

export function calculateAgeRisk(patient: Patient): number {
  const age = parseAge(patient.age);

  if (age === null) {
    return 0;
  }

  if (age > 65) {
    return 2;
  }

  if (age >= 40) {
    return 1;
  }

  return 0;
}

export function calculateRiskScores(patient: Patient): RiskScores {
  const bloodPressure = calculateBloodPressureRisk(patient);
  const temperature = calculateTemperatureRisk(patient);
  const age = calculateAgeRisk(patient);

  return {
    bloodPressure,
    temperature,
    age,
    total: bloodPressure + temperature + age,
  };
}

export function hasFever(patient: Patient): boolean {
  const temp = parseTemperature(patient.temperature);
  return temp !== null && temp >= 99.6;
}

export function isHighRisk(patient: Patient): boolean {
  const scores = calculateRiskScores(patient);
  return scores.total >= 4;
}

