/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SubmitMessageRequest = {
    speaker: SubmitMessageRequest.speaker;
    content: string;
    category?: SubmitMessageRequest.category;
};
export namespace SubmitMessageRequest {
    export enum speaker {
        DOCTOR = 'doctor',
        PATIENT = 'patient',
        NURSE = 'nurse',
        SYSTEM = 'system',
    }
    export enum category {
        SYMPTOM = 'symptom',
        MEDICATION = 'medication',
        VITAL = 'vital',
        DIAGNOSIS = 'diagnosis',
        GENERAL = 'general',
    }
}

