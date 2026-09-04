/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HealthResponse = {
    status?: HealthResponse.status;
    version?: string;
    dependencies?: {
        supabase?: HealthResponse.supabase;
        redis?: HealthResponse.redis;
        gemini?: HealthResponse.gemini;
    };
    timestamp?: string;
};
export namespace HealthResponse {
    export enum status {
        HEALTHY = 'healthy',
        DEGRADED = 'degraded',
        UNHEALTHY = 'unhealthy',
    }
    export enum supabase {
        CONNECTED = 'connected',
        DISCONNECTED = 'disconnected',
    }
    export enum redis {
        CONNECTED = 'connected',
        DISCONNECTED = 'disconnected',
    }
    export enum gemini {
        CONFIGURED = 'configured',
        UNCONFIGURED = 'unconfigured',
    }
}

