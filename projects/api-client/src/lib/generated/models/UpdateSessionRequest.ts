/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateSessionRequest = {
    status?: UpdateSessionRequest.status;
};
export namespace UpdateSessionRequest {
    export enum status {
        ACTIVE = 'active',
        COMPLETED = 'completed',
        CANCELLED = 'cancelled',
    }
}

