// Definitions file for integreat-adapter-soap

export const adapter: {
  authentication: string,
  prepareEndpoint: (endpointOptions: object, serviceOptions: object) => object,
  send: (request: object) => Promise<object>,
  normalize: (data: object, request: object) => Promise<object>,
  serialize: (data: object, request: object) => Promise<object>
}
