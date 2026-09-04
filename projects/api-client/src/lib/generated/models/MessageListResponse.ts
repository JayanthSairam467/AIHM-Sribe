/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MessageListResponse = {
    sessionId?: string;
    messages?: Array<{
        id?: string;
        speaker?: string;
        content?: string;
        sequenceNumber?: number;
        category?: string;
        createdAt?: string;
    }>;
    total?: number;
};

