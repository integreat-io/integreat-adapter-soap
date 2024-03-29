# SOAP adapter for Integreat

> This package is no longer relevant. It has been replace by
> [integreat-transporter-http](https://github.com/integreat-io/integreat-transporter-http)
> and [integreat-adapter-xml](https://github.com/integreat-io/integreat-adapter-xml).

Adapter that lets
[Integreat](https://github.com/integreat-io/integreat) use a SOAP service.

[![Build Status](https://travis-ci.org/integreat-io/integreat-adapter-soap.svg?branch=master)](https://travis-ci.org/integreat-io/integreat-adapter-soap)
[![Coverage Status](https://coveralls.io/repos/github/integreat-io/integreat-adapter-soap/badge.svg?branch=master)](https://coveralls.io/github/integreat-io/integreat-adapter-soap?branch=master)
[![Dependencies Status](https://tidelift.com/badges/github/integreat-io/integreat-adapter-soap?style=flat)](https://tidelift.com/repo/github/integreat-io/integreat-adapter-soap)

## Getting started

### Prerequisits

Requires node v8.6 and Integreat v0.7.

### Installing and using

Install from npm:

```
npm install integreat-adapter-soap
```

Example of use:

```javascript
const integreat = require('integreat')
const soapAdapter = require('integreat-adapter-soap')
const defs = require('./config')

const resources = integreat.mergeResources(integreat.resources(), {
  adapters: { soap: soapAdapter() },
})
const great = integreat(defs, resources)

// ... and then dispatch actions as usual
```

Example source configuration:

```javascript
{
  id: 'store',
  adapter: 'soap',
  auth: 'soapAuth',
  options: {
    baseUri: 'https://api.soapheaven.com',
    soap: { version: '1.1', xsiPrefix: 'i' }
  },
  endpoints: [
    { options: { uri: '/getDocuments' } }
  ]
}
```

The `soapAuth` referenced here should be a valid auth object, relevant for this
SOAP service.

An optional logger may be provided to the `soapAdapter()` function, to log out
the request sent to the service, and its response. The logger must be an object
with an `info()` and an `error()` function. Both should accept a string message
as first argument, and a meta object as the second.

You may also override the `SOAPAction` by setting another namespace for it with
`soapActionNamespace` or by replacing it entirely with `soapAction`. Both should
be set on the `options` object.

Set `xsiPrefix` on `options.soap` to override the default xsi namespace (the
default is `xsi`).

Available endpoint options:

- `uri`: The uri to send requests to for this endpoint.
- `baseUri`: An option base uri prepended to `uri`.
- `soap.version`: The SOAP version of the service. Default is `1.1`.
- `retries`: Number of times to retry a request. Default is `0`.
- `timeout`: Milliseconds to wait until a request is timed out. Default is
  `120000`.

### Running the tests

The tests can be run with `npm test`.

## Contributing

Please read
[CONTRIBUTING](https://github.com/integreat-io/integreat-adapter-soap/blob/master/CONTRIBUTING.md)
for details on our code of conduct, and the process for submitting pull
requests.

## License

This project is licensed under the ISC License - see the
[LICENSE](https://github.com/integreat-io/integreat-adapter-soap/blob/master/LICENSE)
file for details.
