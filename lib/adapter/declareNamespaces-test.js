import test from 'ava'

import declareNamespaces from './declareNamespaces'

// Tests

test('should declare namespace on first occurence of prefix', (t) => {
  const element = {
    'soap:Envelope': {
      'soap:Body': {
        CardNew: {
          customerkey: { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' },
          rfid: { _text: '04793182CB4884' },
          installationid: { _text: '138' }
        }
      }
    }
  }
  const namespaces = {
    '*': 'http://example.com/webservices/',
    soap: 'http://www.w3.org/2003/05/soap-envelope'
  }
  const expected = {
    'soap:Envelope': {
      _attributes: { 'xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope' },
      'soap:Body': {
        CardNew: {
          _attributes: { xmlns: 'http://example.com/webservices/' },
          customerkey: { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' },
          rfid: { _text: '04793182CB4884' },
          installationid: { _text: '138' }
        }
      }
    }
  }

  const ret = declareNamespaces(element, namespaces)

  t.deepEqual(ret, expected)
})

test('should declare namespace on leaf', (t) => {
  const element = {
    'soap:Envelope': {
      'soap:Body': {
        CardNew: {}
      }
    }
  }
  const namespaces = {
    '*': 'http://example.com/webservices/',
    soap: 'http://www.w3.org/2003/05/soap-envelope'
  }
  const expected = {
    'soap:Envelope': {
      _attributes: { 'xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope' },
      'soap:Body': {
        CardNew: {
          _attributes: { xmlns: 'http://example.com/webservices/' }
        }
      }
    }
  }

  const ret = declareNamespaces(element, namespaces)

  t.deepEqual(ret, expected)
})

test('should declare namespace on first parent of several occurences of prefix', (t) => {
  const element = {
    'soap:Envelope': {
      'soap:Body': {
        CardNew: {
          'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' },
          'a:rfid': { _text: '04793182CB4884' },
          installationid: { _text: '138' }
        }
      }
    }
  }
  const namespaces = {
    '*': 'http://example.com/webservices/',
    soap: 'http://www.w3.org/2003/05/soap-envelope',
    a: 'http://schemas.datacontract.org/2004/07/Common'
  }
  const expected = {
    'soap:Envelope': {
      _attributes: { 'xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope' },
      'soap:Body': {
        CardNew: {
          _attributes: {
            xmlns: 'http://example.com/webservices/',
            'xmlns:a': 'http://schemas.datacontract.org/2004/07/Common'
          },
          'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' },
          'a:rfid': { _text: '04793182CB4884' },
          installationid: { _text: '138' }
        }
      }
    }
  }

  const ret = declareNamespaces(element, namespaces)

  t.deepEqual(ret, expected)
})

test('should declare namespace on first parent of occurences of prefix on different levels', (t) => {
  const element = {
    'soap:Envelope': {
      'soap:Body': {
        CardNew: {
          Customer: {
            'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' },
            'a:customername': { _text: 'Rolf' }
          },
          'a:rfid': { _text: '04793182CB4884' },
          installationid: { _text: '138' }
        }
      }
    }
  }
  const namespaces = {
    '*': 'http://example.com/webservices/',
    soap: 'http://www.w3.org/2003/05/soap-envelope',
    a: 'http://schemas.datacontract.org/2004/07/Common'
  }
  const expected = {
    'soap:Envelope': {
      _attributes: { 'xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope' },
      'soap:Body': {
        CardNew: {
          _attributes: {
            xmlns: 'http://example.com/webservices/',
            'xmlns:a': 'http://schemas.datacontract.org/2004/07/Common'
          },
          Customer: {
            'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' },
            'a:customername': { _text: 'Rolf' }
          },
          'a:rfid': { _text: '04793182CB4884' },
          installationid: { _text: '138' }
        }
      }
    }
  }

  const ret = declareNamespaces(element, namespaces)

  t.deepEqual(ret, expected)
})

test('should declare namespace on first parent of occurences including attributes', (t) => {
  const element = {
    'soap:Envelope': {
      'soap:Body': {
        CardNew: {
          _attributes: {
            'a:rfid': '04793182CB4884'
          },
          Customer: {
            'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' },
            'a:customername': { _text: 'Rolf' }
          },
          installationid: { _text: '138' }
        }
      }
    }
  }
  const namespaces = {
    '*': 'http://example.com/webservices/',
    soap: 'http://www.w3.org/2003/05/soap-envelope',
    a: 'http://schemas.datacontract.org/2004/07/Common'
  }
  const expected = {
    'soap:Envelope': {
      _attributes: { 'xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope' },
      'soap:Body': {
        CardNew: {
          _attributes: {
            xmlns: 'http://example.com/webservices/',
            'xmlns:a': 'http://schemas.datacontract.org/2004/07/Common',
            'a:rfid': '04793182CB4884'
          },
          Customer: {
            'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' },
            'a:customername': { _text: 'Rolf' }
          },
          installationid: { _text: '138' }
        }
      }
    }
  }

  const ret = declareNamespaces(element, namespaces)

  t.deepEqual(ret, expected)
})

test('should declare namespace on text element', (t) => {
  const element = {
    'soap:Envelope': {
      'soap:Body': {
        CardNew: {
          'a:installationid': { _text: '138' }
        }
      }
    }
  }
  const namespaces = {
    '*': 'http://example.com/webservices/',
    soap: 'http://www.w3.org/2003/05/soap-envelope',
    a: 'http://schemas.datacontract.org/2004/07/Common'
  }
  const expected = {
    'soap:Envelope': {
      _attributes: { 'xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope' },
      'soap:Body': {
        CardNew: {
          _attributes: {
            xmlns: 'http://example.com/webservices/'
          },
          'a:installationid': {
            _attributes: {
              'xmlns:a': 'http://schemas.datacontract.org/2004/07/Common'
            },
            _text: '138'
          }
        }
      }
    }
  }

  const ret = declareNamespaces(element, namespaces)

  t.deepEqual(ret, expected)
})

test('should declare namespace on first parent of attribute', (t) => {
  const element = {
    'soap:Envelope': {
      'soap:Body': {
        CardNew: {
          _attributes: {
            'a:rfid': '04793182CB4884'
          },
          installationid: { _text: '138' }
        }
      }
    }
  }
  const namespaces = {
    '*': 'http://example.com/webservices/',
    soap: 'http://www.w3.org/2003/05/soap-envelope',
    a: 'http://schemas.datacontract.org/2004/07/Common'
  }
  const expected = {
    'soap:Envelope': {
      _attributes: { 'xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope' },
      'soap:Body': {
        CardNew: {
          _attributes: {
            xmlns: 'http://example.com/webservices/',
            'xmlns:a': 'http://schemas.datacontract.org/2004/07/Common',
            'a:rfid': '04793182CB4884'
          },
          installationid: { _text: '138' }
        }
      }
    }
  }

  const ret = declareNamespaces(element, namespaces)

  t.deepEqual(ret, expected)
})

test('should declare namespace on first parent of occurences of prefix in array', (t) => {
  const element = {
    'soap:Envelope': {
      'soap:Body': {
        CardNew: {
          Customer: [
            {
              'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' },
              'a:customername': { _text: 'Rolf' }
            },
            {
              'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B12' },
              'a:customername': { _text: 'Inger' }
            }
          ]
        }
      }
    }
  }
  const namespaces = {
    '*': 'http://example.com/webservices/',
    soap: 'http://www.w3.org/2003/05/soap-envelope',
    a: 'http://schemas.datacontract.org/2004/07/Common'
  }
  const expected = {
    'soap:Envelope': {
      _attributes: { 'xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope' },
      'soap:Body': {
        CardNew: {
          _attributes: {
            xmlns: 'http://example.com/webservices/',
            'xmlns:a': 'http://schemas.datacontract.org/2004/07/Common'
          },
          Customer: [
            {
              'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' },
              'a:customername': { _text: 'Rolf' }
            },
            {
              'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B12' },
              'a:customername': { _text: 'Inger' }
            }
          ]
        }
      }
    }
  }

  const ret = declareNamespaces(element, namespaces)

  t.deepEqual(ret, expected)
})

test('should not include _text when looking for namespaces', (t) => {
  const element = {
    'soap:Envelope': {
      'soap:Body': {
        'a:CardNew': {
          Customer: {
            'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' }
          },
          'a:rfid': { _text: '04793182CB4884' }
        }
      }
    }
  }
  const namespaces = {
    '*': 'http://example.com/webservices/',
    soap: 'http://www.w3.org/2003/05/soap-envelope',
    a: 'http://schemas.datacontract.org/2004/07/Common'
  }
  const expected = {
    'soap:Envelope': {
      _attributes: { 'xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope' },
      'soap:Body': {
        'a:CardNew': {
          _attributes: {
            'xmlns:a': 'http://schemas.datacontract.org/2004/07/Common'
          },
          Customer: {
            _attributes: {
              xmlns: 'http://example.com/webservices/'
            },
            'a:customerkey': { _text: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B11' }
          },
          'a:rfid': { _text: '04793182CB4884' }
        }
      }
    }
  }

  const ret = declareNamespaces(element, namespaces)

  t.deepEqual(ret, expected)
})
