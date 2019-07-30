// Definitions file for integreat-adapter-soap

interface Adapter {
  authentication: string,
  prepareEndpoint: (endpointOptions: object, serviceOptions: object) => object,
  send: (request: object) => Promise<object>,
  normalize: (data: object, request: object) => Promise<object>,
  serialize: (data: object, request: object) => Promise<object>
}

interface Logger {
  info: (...args: any[]) => void
  error: (...args: any[]) => void
}

declare const _default: (logger?: Logger) => Adapter

export = _default
