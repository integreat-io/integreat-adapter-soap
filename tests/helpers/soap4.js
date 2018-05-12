module.exports = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetInvoicesResponse xmlns="http://api1.test/webservices">
      <GetInvoicesResult>
        <InvoiceOrder>
          <InvoiceId>341101</InvoiceId>
          <CustomerId>18003</CustomerId>
          <CustomerName>Client Inc</CustomerName>
          <OrderStatus>Invoiced</OrderStatus>
        </InvoiceOrder>
        <InvoiceOrder>
          <InvoiceId>341102</InvoiceId>
          <CustomerId>18003</CustomerId>
          <CustomerName>Client Inc</CustomerName>
          <OrderStatus>ForInvoicing</OrderStatus>
        </InvoiceOrder>
      </GetInvoicesResult>
    </GetInvoicesResponse>
  </soap:Body>
</soap:Envelope>`
