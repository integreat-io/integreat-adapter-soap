# SOAP adapter for Integreat

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
const greatSoap = require('integreat-adapter-soap')
const defs = require('./config')

const resources = greatSoap(integreat.resources())
const great = integreat(defs, resources)

// ... and then dispatch actions as usual
```

The `greatSoap()` function adds the adapter `soap` to the resources object, but
you still need to configure your source to use it.

Example source configuration:

```javascript
{
  id: 'store',
  adapter: 'soap',
  auth: 'soapAuth',
  options: {
    baseUri: 'https://api.soapheaven.com'
  },
  endpoints: [
    {options: {uri: '/getDocuments'}}
  ]
}
```

The `soapAuth` referenced here should be a valid auth object, relevant for this
SOAP service.

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
