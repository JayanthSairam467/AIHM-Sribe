/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { FhirBundleResponse } from '../models/FhirBundleResponse';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
@Injectable({
    providedIn: 'root',
})
export class FhirService {
    constructor(public readonly http: HttpClient) {}
    /**
     * Export session as FHIR R4 Bundle
     * Converts the SOAP note and patient context into a full
     * HL7 FHIR R4 Document Bundle containing Composition, Patient,
     * Practitioner, Encounter, Condition, MedicationRequest, and
     * Observation resources.
     *
     * @param sessionId
     * @returns FhirBundleResponse FHIR bundle created
     * @throws ApiError
     */
    public exportFhir(
        sessionId: string,
    ): Observable<FhirBundleResponse> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/scribe/sessions/{sessionId}/fhir/export',
            path: {
                'sessionId': sessionId,
            },
        });
    }
    /**
     * Get the FHIR R4 Bundle
     * @param sessionId
     * @returns FhirBundleResponse FHIR R4 Document Bundle
     * @throws ApiError
     */
    public getFhirBundle(
        sessionId: string,
    ): Observable<FhirBundleResponse> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/scribe/sessions/{sessionId}/fhir',
            path: {
                'sessionId': sessionId,
            },
        });
    }
}
