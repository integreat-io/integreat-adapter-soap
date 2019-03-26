module.exports = `<?xml version="1.0" encoding="utf-8"?>
<env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope">
 <env:Body>
  <p:itinerary xmlns:p="http://travelcompany.example.org/reservation/travel/">
   <p:departure>
    <p:departing>New York</p:departing>
    <p:arriving>Los Angeles</p:arriving>
    <p:departureDate>2001-12-14</p:departureDate>
    <p:seatPreference>aisle</p:seatPreference>
   </p:departure>
   <p:return>
    <p:departing>Los Angeles</p:departing>
    <p:arriving>New York</p:arriving>
    <p:departureDate>2001-12-20</p:departureDate>
    <p:seatPreference xsi:nil="true" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
   </p:return>
  </p:itinerary>
  <q:lodging xmlns:q="http://travelcompany.example.org/reservation/hotels/">
   <q:preference>none</q:preference>
  </q:lodging>
 </env:Body>
</env:Envelope>`
