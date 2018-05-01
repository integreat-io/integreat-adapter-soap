module.exports = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetPaymentMethodsResponse xmlns="http://example.com/webservices">
      <GetPaymentMethodsResult>
        <PaymentMethod>
          <Id>1</Id>
          <Name>Cash</Name>
        </PaymentMethod>
        <PaymentMethod>
          <Id>2</Id>
          <Name>Invoice</Name>
        </PaymentMethod>
      </GetPaymentMethodsResult>
    </GetPaymentMethodsResponse>
  </soap:Body>
</soap:Envelope>`
