/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SessionResponse = {
    id?: string;
    patientId?: string;
    practitionerId?: string;
    specialty?: string;
    status?: SessionResponse.status;
    messageCount?: number;
    createdAt?: string;
    updatedAt?: string;
};
export namespace SessionResponse {
    export enum status {
        ACTIVE = 'active',
        PROCESSING = 'processing',
        COMPLETED = 'completed',
        CANCELLED = 'cancelled',
    }
}

