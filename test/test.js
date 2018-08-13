const express = require('express');
const app = express();
const TestWrapper = require('../build/index.js');

app.get('/hello', (req, res) => res.send( {'data' : { 'message': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.pF3q46_CLIyP_1QZPpeccbs-hC4n9YW2VMBjKrSO6Wg'} }));

app.listen(3004, () => console.log('Example app listening on port 3000!'))


describe('Test', () => {

  const Tests = new TestWrapper(app);
    Tests.makeRequest({
      descr: 'Testing wrapper 2',
      status: 200,
      url: '/hello',
      method: 'get',
      json: false,
      body: 'Hello World!',
      shouldBeJwt: 'body.data.message',
      jwtShouldBeSignedWith: { 'body.data.message': '123' }
    });

});