/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { RecordListResponse } from '../models/RecordListResponse';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
@Injectable({
    providedIn: 'root',
})
export class RecordsService {
    constructor(public readonly http: HttpClient) {}
    /**
     * Get accumulated clinical records for a session
     * @param sessionId
     * @returns RecordListResponse Accumulated records
     * @throws ApiError
     */
    public getRecords(
        sessionId: string,
    ): Observable<RecordListResponse> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/scribe/sessions/{sessionId}/records',
            path: {
                'sessionId': sessionId,
            },
        });
    }
}
