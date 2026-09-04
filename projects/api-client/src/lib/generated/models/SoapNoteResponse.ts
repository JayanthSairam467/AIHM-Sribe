/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SoapNoteResponse = {
    id?: string;
    sessionId?: string;
    subjective?: {
        chiefComplaint?: string;
        historyOfPresentIllness?: string;
        reviewOfSystems?: Array<string>;
        currentMedications?: Array<string>;
        allergies?: Array<string>;
    };
    objective?: {
        vitalSigns?: {
            bloodPressure?: string;
            heartRate?: string;
            respiratoryRate?: string;
            temperature?: string;
            spO2?: string;
            bmi?: string;
        };
        physicalExam?: Array<string>;
        labDiagnosticResults?: Array<string>;
    };
    assessment?: {
        primaryDiagnosis?: string;
        icd10Code?: string;
        differentialDiagnoses?: Array<string>;
        clinicalRiskTier?: SoapNoteResponse.clinicalRiskTier;
        clinicalRationale?: string;
    };
    plan?: {
        medicationsPrescribed?: Array<{
            name?: string;
            dosage?: string;
            frequency?: string;
            duration?: string;
            instructions?: string;
        }>;
        diagnosticOrders?: Array<string>;
        patientEducation?: Array<string>;
        followUp?: string;
        redFlagWarnings?: Array<string>;
    };
    source?: string;
    version?: number;
    createdAt?: string;
};
export namespace SoapNoteResponse {
    export enum clinicalRiskTier {
        LOW = 'Low',
        MODERATE = 'Moderate',
        HIGH = 'High',
        CRITICAL = 'Critical',
    }
}

