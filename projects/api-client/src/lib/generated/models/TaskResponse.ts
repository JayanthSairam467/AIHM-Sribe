/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TaskResponse = {
    id?: string;
    sessionId?: string;
    taskType?: TaskResponse.taskType;
    status?: TaskResponse.status;
    /**
     * Task output (SOAP note or FHIR bundle)
     */
    result?: Record<string, any>;
    error?: string | null;
    createdAt?: string;
    completedAt?: string | null;
};
export namespace TaskResponse {
    export enum taskType {
        GENERATE_SOAP = 'generate_soap',
        EXPORT_FHIR = 'export_fhir',
    }
    export enum status {
        PENDING = 'pending',
        PROCESSING = 'processing',
        COMPLETED = 'completed',
        FAILED = 'failed',
    }
}

