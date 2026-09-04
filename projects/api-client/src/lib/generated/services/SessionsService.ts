/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { CreateSessionRequest } from '../models/CreateSessionRequest';
import type { SessionResponse } from '../models/SessionResponse';
import type { UpdateSessionRequest } from '../models/UpdateSessionRequest';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
@Injectable({
    providedIn: 'root',
})
export class SessionsService {
    constructor(public readonly http: HttpClient) {}
    /**
     * Create a new consultation session
     * @param requestBody
     * @returns SessionResponse Session created
     * @throws ApiError
     */
    public createSession(
        requestBody: CreateSessionRequest,
    ): Observable<SessionResponse> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/scribe/sessions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
            },
        });
    }
    /**
     * Get session details and status
     * @param sessionId
     * @returns SessionResponse Session details
     * @throws ApiError
     */
    public getSession(
        sessionId: string,
    ): Observable<SessionResponse> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/scribe/sessions/{sessionId}',
            path: {
                'sessionId': sessionId,
            },
            errors: {
                404: `Resource not found`,
            },
        });
    }
    /**
     * Update session status (e.g., complete or cancel)
     * @param sessionId
     * @param requestBody
     * @returns SessionResponse Session updated
     * @throws ApiError
     */
    public updateSession(
        sessionId: string,
        requestBody: UpdateSessionRequest,
    ): Observable<SessionResponse> {
        return __request(OpenAPI, this.http, {
            method: 'PATCH',
            url: '/scribe/sessions/{sessionId}',
            path: {
                'sessionId': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
