/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FhirBundleResponse = {
    id?: string;
    sessionId?: string;
    fhirVersion?: string;
    resourceCount?: number;
    /**
     * Full HL7 FHIR R4 Document Bundle JSON
     */
    bundle?: Record<string, any>;
    createdAt?: string;
};

