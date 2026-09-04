/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { MessageAcceptedResponse } from '../models/MessageAcceptedResponse';
import type { MessageListResponse } from '../models/MessageListResponse';
import type { SubmitMessageRequest } from '../models/SubmitMessageRequest';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
@Injectable({
    providedIn: 'root',
})
export class MessagesService {
    constructor(public readonly http: HttpClient) {}
    /**
     * Submit a transcript message to the queue
     * Enqueues a single doctor/patient/nurse utterance into the
     * Redis-backed FIFO queue. The worker will dequeue and persist
     * it to the records table sequentially.
     *
     * @param sessionId
     * @param requestBody
     * @returns MessageAcceptedResponse Message accepted and enqueued
     * @throws ApiError
     */
    public submitMessage(
        sessionId: string,
        requestBody: SubmitMessageRequest,
    ): Observable<MessageAcceptedResponse> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/scribe/sessions/{sessionId}/messages',
            path: {
                'sessionId': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * List all messages in a session
     * @param sessionId
     * @returns MessageListResponse List of messages
     * @throws ApiError
     */
    public listMessages(
        sessionId: string,
    ): Observable<MessageListResponse> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/scribe/sessions/{sessionId}/messages',
            path: {
                'sessionId': sessionId,
            },
        });
    }
}
