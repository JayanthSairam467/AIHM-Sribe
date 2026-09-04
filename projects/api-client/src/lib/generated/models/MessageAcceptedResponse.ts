/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MessageAcceptedResponse = {
    messageId?: string;
    /**
     * BullMQ job ID for tracking
     */
    jobId?: string;
    sequenceNumber?: number;
    status?: MessageAcceptedResponse.status;
};
export namespace MessageAcceptedResponse {
    export enum status {
        QUEUED = 'queued',
    }
}

