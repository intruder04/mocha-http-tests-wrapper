const express = require('express');

const app = express();
const TestWrapper = require('../build/index.js');

app.get('/hello', (req, res) => {
    // console.log('header', req.headers);
    
    res.header({
      'ETag': '12345',
      'token': '111'
    });

    res.send( {'data' : { 
      'message': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.pF3q46_CLIyP_1QZPpeccbs-hC4n9YW2VMBjKrSO6Wg',
      'empty': '',
      'equal': 777,
      'equal2': 'to be equal'
      } });

    // console.log('header resp', res);
  }
);

app.listen(3004, () => console.log('Example app listening on port 3000!'))


describe('Test suite', () => {

  const Tests = new TestWrapper(app);
    Tests.makeRequest({
      setDescr: 'Testing wrapper',
      setHeader: { 'token': '123', 'ETag': '123442' },
      setUrl: '/hello',
      setMethod: 'get',
      setAuth: { 'login': '', 'pass': '' },
      setBody: 'Hello World!',
      shouldBeStatus: 200,
      shouldBeJson: false,
      shouldBeJwt: 'body.data.message',
      shouldBeEmpty: ['body.data.empty'],
      shouldBeEqual: { 'body.data.equal': 777, 'body.data.equal2': 'to be equal' },
      jwtShouldBeSignedWith: { 'body.data.message': '123' }
    });

});