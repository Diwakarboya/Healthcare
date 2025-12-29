import { NextRequest, NextResponse } from 'next/server';
import { processAndSubmitAssessment } from '@/lib/services/patient-service';

export async function POST(request: NextRequest) {
  try {
    const result = await processAndSubmitAssessment();

    return NextResponse.json({
      success: true,
      submission: {
        high_risk_patients: result.categories.highRiskPatients,
        fever_patients: result.categories.feverPatients,
        data_quality_issues: result.categories.dataQualityIssues,
      },
      assessment_result: result.assessmentResult,
      stats: result.stats,
    });
  } catch (error) {
    console.error('Error processing submission:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
