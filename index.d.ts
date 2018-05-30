// Definitions file for integreat-adapter-soap

export const authentication: string
export function prepareEndpoint(endpointOptions: object, serviceOptions: object): object
export function send(request: object): Promise<object>
export function normalize(data: object, request: object): Promise<object>
export function serialize(data: object, request: object): Promise<object>
