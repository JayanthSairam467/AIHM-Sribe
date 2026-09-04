/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { HealthResponse } from '../models/HealthResponse';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
@Injectable({
    providedIn: 'root',
})
export class HealthService {
    constructor(public readonly http: HttpClient) {}
    /**
     * System health check
     * @returns HealthResponse All systems operational
     * @throws ApiError
     */
    public getHealth(): Observable<HealthResponse> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/health',
        });
    }
}
