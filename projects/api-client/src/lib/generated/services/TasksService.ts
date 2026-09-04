/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { GenerateSoapRequest } from '../models/GenerateSoapRequest';
import type { SoapNoteResponse } from '../models/SoapNoteResponse';
import type { TaskResponse } from '../models/TaskResponse';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
@Injectable({
    providedIn: 'root',
})
export class TasksService {
    constructor(public readonly http: HttpClient) {}
    /**
     * Trigger SOAP note generation
     * Creates a task that reads all records for this session,
     * sends the accumulated transcript to Gemini 3.7 Flash,
     * and persists the structured SOAP note.
     *
     * @param sessionId
     * @param requestBody
     * @returns TaskResponse SOAP generation task created
     * @throws ApiError
     */
    public generateSoap(
        sessionId: string,
        requestBody?: GenerateSoapRequest,
    ): Observable<TaskResponse> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/scribe/sessions/{sessionId}/tasks/generate-soap',
            path: {
                'sessionId': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get task status and result
     * @param sessionId
     * @param taskId
     * @returns TaskResponse Task details
     * @throws ApiError
     */
    public getTask(
        sessionId: string,
        taskId: string,
    ): Observable<TaskResponse> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/scribe/sessions/{sessionId}/tasks/{taskId}',
            path: {
                'sessionId': sessionId,
                'taskId': taskId,
            },
        });
    }
    /**
     * Get the latest generated SOAP note
     * @param sessionId
     * @returns SoapNoteResponse SOAP note
     * @throws ApiError
     */
    public getSoapNote(
        sessionId: string,
    ): Observable<SoapNoteResponse> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/scribe/sessions/{sessionId}/soap',
            path: {
                'sessionId': sessionId,
            },
            errors: {
                404: `Resource not found`,
            },
        });
    }
}
