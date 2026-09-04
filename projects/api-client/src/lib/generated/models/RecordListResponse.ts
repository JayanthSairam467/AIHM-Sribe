/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RecordListResponse = {
    sessionId?: string;
    records?: Array<{
        id?: string;
        recordType?: 'transcript' | 'clinical_entity' | 'vital_sign';
        content?: Record<string, any>;
        sourceMessageIds?: Array<string>;
        createdAt?: string;
    }>;
    total?: number;
};

