import test from 'ava'
import soapResponse from '../../tests/helpers/soap1'
import soapResponseWithAttrs from '../../tests/helpers/soap2'
import soapResponseFlightWithoutHead from '../../tests/helpers/soap5'

import serialize from './serialize'

// Setup

const vendorSoap = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <CardNew xmlns="http://example.com/webservices/">
      <customerkey>AD0B2E69-4640-FBF4-9CC7-0C713FDF3B12</customerkey>
      <rfid>04793182CB4884</rfid>
      <installationid/>
    </CardNew>
  </soap:Body>
</soap:Envelope>`

const emptySoap = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body/>
</soap:Envelope>`

const soapNamespaceOnParent = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <NaeringBrikkeListeResponse xmlns="'http://internal.ws.no/webservices/">
      <NaeringBrikkeListeResult xmlns:a="http://schemas.datacontract.org/2004/07/Common">
        <a:Melding>Message</a:Melding>
        <a:ReturKode>0</a:ReturKode>
        <a:ReturVerdi>Value</a:ReturVerdi>
      </NaeringBrikkeListeResult>
    </NaeringBrikkeListeResponse>
  </soap:Body>
</soap:Envelope>`

const soapWithHeader = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header>
    <addr:Action soap:mustUnderstand="1" xmlns:addr="http://schemas.microsoft.com/ws/2005/05/addressing/none">http://tempuri.org/IBossNetService/ContainerFull</addr:Action>
  </soap:Header>
  <soap:Body>
    <CardNew xmlns="http://example.com/webservices/">
      <customerkey>AD0B2E69-4640-FBF4-9CC7-0C713FDF3B12</customerkey>
      <rfid>04793182CB4884</rfid>
      <installationid>158</installationid>
    </CardNew>
  </soap:Body>
</soap:Envelope>`

// Tests

test('should return soap string from object', async (t) => {
  const data = {
    GetPaymentMethodsResponse: {
      GetPaymentMethodsResult: {
        PaymentMethod: [
          { Id: '1', Name: 'Cash' },
          { Id: '2', Name: 'Invoice' }
        ],
        DontInclude: undefined
      }
    }
  }
  const endpoint = {
    uri: 'http://api2.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
    namespace: 'http://example.com/webservices'
  }
  const request = {
    method: 'GET',
    data,
    endpoint
  }
  const expected = {
    method: 'GET',
    data: soapResponse,
    endpoint,
    params: {
      soapAction: 'http://example.com/webservices/GetPaymentMethodsResponse'
    }
  }

  const ret = await serialize(request)

  t.deepEqual(ret, expected)
})

test('should treat as element when root element is an array of one', async (t) => {
  const data = [{
    CardNew: {
      customerkey: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B12',
      rfid: '04793182CB4884',
      installationid: ''
    }
  }]
  const endpoint = {
    uri: 'http://api2.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
    namespace: 'http://example.com/webservices/',
    soap: { version: '1.2' }
  }
  const request = {
    method: 'GET',
    data,
    endpoint
  }
  const expectedData = vendorSoap

  const ret = await serialize(request)

  t.deepEqual(ret.data, expectedData)
})

test('should set object at path', async (t) => {
  const data = {
    PaymentMethod: [
      { Id: '1', Name: 'Cash' },
      { Id: '2', Name: 'Invoice' }
    ]
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      requestPath: 'GetPaymentMethodsResponse.GetPaymentMethodsResult',
      namespace: 'http://example.com/webservices'
    },
    params: {}
  }
  const expected = soapResponse
  const expectedAction = 'http://example.com/webservices/GetPaymentMethodsResponse'

  const ret = await serialize(request)

  t.is(ret.data, expected)
  t.is(ret.params.soapAction, expectedAction)
})

test('should override soapAction namespace', async (t) => {
  const data = {
    PaymentMethod: [
      { Id: '1', Name: 'Cash' },
      { Id: '2', Name: 'Invoice' }
    ]
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      requestPath: 'GetPaymentMethodsResponse.GetPaymentMethodsResult',
      namespace: 'http://example.com/webservices',
      soapActionNamespace: 'http://example.com/stupidOtherNamespace'
    },
    params: {}
  }
  const expectedAction = 'http://example.com/stupidOtherNamespace/GetPaymentMethodsResponse'

  const ret = await serialize(request)

  t.is(ret.params.soapAction, expectedAction)
})

test('should not use response path', async (t) => {
  const data = {
    GetPaymentMethodsResponse: {
      GetPaymentMethodsResult: {
        PaymentMethod: [
          { Id: '1', Name: 'Cash' },
          { Id: '2', Name: 'Invoice' }
        ]
      }
    }
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      path: 'Not.To.Be.Used',
      namespace: 'http://example.com/webservices'
    }
  }
  const expected = soapResponse

  const ret = await serialize(request)

  t.is(ret.data, expected)
})

test('should convert Date to iso date string', async (t) => {
  const data = {
    PaymentDate: new Date('2019-01-18T10:09:11.000Z')
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      namespace: 'http://example.com/webservices'
    }
  }
  const expected = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <PaymentDate xmlns="http://example.com/webservices">2019-01-18T10:09:11.000Z</PaymentDate>
  </soap:Body>
</soap:Envelope>`

  const ret = await serialize(request)

  t.is(ret.data, expected)
})

test('should encode chars', async (t) => {
  const data = {
    Text: '<p>Text æøå; 💩λ @\n\'•\' & ÆØÅ "123"</p>'
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Encoding.asmx',
      namespace: 'http://example.com/webservices'
    }
  }
  const expected = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Text xmlns="http://example.com/webservices">&lt;p&gt;Text &#230;&#248;&#229;; &#128169;λ @\n&#39;•&#39; &amp; &#198;&#216;&#197; &quot;123&quot;&lt;/p&gt;</Text>
  </soap:Body>
</soap:Envelope>`

  const ret = await serialize(request)

  t.is(ret.data, expected)
})

test('should convert attributes', async (t) => {
  const data = {
    PaymentMethod: [
      { '@Id': '1', '@Name': 'Cash' },
      { '@Id': '2', '@Name': 'Invoice' }
    ]
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      requestPath: 'GetPaymentMethodsResponse.GetPaymentMethodsResult',
      namespace: 'http://example.com/webservices'
    }
  }
  const expected = soapResponseWithAttrs

  const ret = await serialize(request)

  t.is(ret.data, expected)
})

test('should treat existing _attributes prop as xml attributes', async (t) => {
  const data = {
    PaymentMethod: [
      { _attributes: { Id: '1' }, '@Name': 'Cash' },
      { '@Id': '2', '@Name': 'Invoice' }
    ]
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      requestPath: 'GetPaymentMethodsResponse.GetPaymentMethodsResult',
      namespace: 'http://example.com/webservices'
    }
  }
  const expected = soapResponseWithAttrs

  const ret = await serialize(request)

  t.is(ret.data, expected)
})

test('should not include unused namespaces', async (t) => {
  const data = {
    PaymentMethod: [
      { 'Id': '1', 'Name': 'Cash' },
      { 'Id': '2', 'Name': 'Invoice' }
    ]
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api1.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
      requestPath: 'GetPaymentMethodsResponse.GetPaymentMethodsResult',
      namespace: {
        '*': 'http://example.com/webservices',
        xsi: 'http://www.w3.org/2001/XMLSchema-instance',
        xsd: 'http://www.w3.org/2001/XMLSchema'
      }
    }
  }
  const expected = soapResponse

  const ret = await serialize(request)

  t.is(ret.data, expected)
})

test('should handle different namespaces and soap versions', async (t) => {
  const data = {
    'p:itinerary': {
      'p:departure': {
        'p:departing': 'New York',
        'p:arriving': 'Los Angeles',
        'p:departureDate': '2001-12-14',
        'p:seatPreference': 'aisle'
      },
      'p:return': {
        'p:departing': 'Los Angeles',
        'p:arriving': 'New York',
        'p:departureDate': '2001-12-20',
        'p:seatPreference': null
      }
    },
    'q:lodging': {
      'q:preference': 'none'
    }
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api2.test/FlightItinerary.asmx',
      namespace: {
        p: 'http://travelcompany.example.org/reservation/travel/',
        q: 'http://travelcompany.example.org/reservation/hotels/'
      },
      soap: {
        prefix: 'env',
        version: '1.2',
        spaces: 1
      }
    }
  }
  const expected = soapResponseFlightWithoutHead
  const expectedAction = 'http://travelcompany.example.org/reservation/travel/itinerary'

  const ret = await serialize(request)

  t.deepEqual(ret.data, expected)
  t.is(ret.params.soapAction, expectedAction)
})

test('should include Header element', async (t) => {
  const data = [{
    'soap:Header': {
      'addr:Action': {
        '@soap:mustUnderstand': '1',
        _text: 'http://tempuri.org/IBossNetService/ContainerFull'
      }
    },
    CardNew: {
      customerkey: 'AD0B2E69-4640-FBF4-9CC7-0C713FDF3B12',
      rfid: '04793182CB4884',
      installationid: '158'
    }
  }]
  const endpoint = {
    uri: 'http://api2.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
    namespace: {
      '*': 'http://example.com/webservices/',
      'addr': 'http://schemas.microsoft.com/ws/2005/05/addressing/none'
    },
    soap: { version: '1.2' }
  }
  const request = {
    method: 'GET',
    data,
    endpoint
  }
  const expectedData = soapWithHeader

  const ret = await serialize(request)

  t.deepEqual(ret.data, expectedData)
})

test.skip('should set namespace on parent', async (t) => {
  const data = {
    NaeringBrikkeListeResponse: {
      NaeringBrikkeListeResult: {
        'a:Melding': 'Message',
        'a:ReturKode': '0',
        'a:ReturVerdi': 'Value'
      }
    }
  }
  const request = {
    action: 'GET',
    data,
    endpoint: {
      uri: 'http://api.test/WebService.asmx',
      namespace: {
        '*': 'http://internal.ws.no/webservices/',
        a: 'http://schemas.datacontract.org/2004/07/Common'
      },
      soap: {
        version: '1.1'
      }
    }
  }
  const expected = soapNamespaceOnParent

  const ret = await serialize(request)

  t.deepEqual(ret.data, expected)
})

test('should not fail on undefined data', async (t) => {
  const data = undefined
  const endpoint = {
    uri: 'http://api2.test/Economy/InvoiceOrder/V001/InvoiceService.asmx',
    namespace: 'http://example.com/webservices'
  }
  const request = {
    method: 'GET',
    data,
    endpoint
  }
  const expected = {
    method: 'GET',
    data: emptySoap,
    endpoint,
    params: {}
  }

  const ret = await serialize(request)

  t.deepEqual(ret, expected)
})
