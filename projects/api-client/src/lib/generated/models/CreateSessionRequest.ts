/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateSessionRequest = {
    /**
     * Patient MRN or internal ID
     */
    patientId: string;
    /**
     * Doctor/practitioner ID
     */
    practitionerId: string;
    specialty?: string;
    patientContext?: {
        name?: string;
        age?: number;
        sex?: CreateSessionRequest.sex;
        mrn?: string;
        allergies?: Array<string>;
        currentMedications?: Array<string>;
    };
};
export namespace CreateSessionRequest {
    export enum sex {
        MALE = 'Male',
        FEMALE = 'Female',
        OTHER = 'Other',
    }
}

