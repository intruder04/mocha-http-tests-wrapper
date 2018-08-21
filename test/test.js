const express = require('express');
const parallel = require('mocha.parallel');
const bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
const TestWrapper = require('../build/index.js');

app.post('/hello', (req, res) => {
    console.log('header', req.headers);
    console.log('body', req.body);
    
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
    // res.send('hello');

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
    setMethod: 'post',
    // setAuth: { 'login': '', 'pass': '' },
    setBody: 'Hello World!',
    setMaxRedirects: 33,
    shouldBeStatus: 200,
    shouldBeFormat: 'plain',
    // shouldBeJwt: 'body.data.message',
    // shouldBeEmpty: ['body.data.empty'],
    // shouldBeEqual: { 'body.data.equal': 777, 'body.data.equal2': 'to be equal' },
    // jwtShouldBeSignedWith: { 'body.data.message': '123' },
    saveStorage: (res, storage) => {
      // storage.token = 'blabla';
      // storage.token = res.body.data.equal;
    },
  });

  // Tests.makeRequest({
  //   setDescr: 'Testing wrapper 2',
  //   // setHeader: { 'token': '123', 'ETag': '123442' },
  //   setUrl: '/hello',
  //   setMethod: 'post',
  //   // setAuth: { 'login': '', 'pass': '' },
  //   // setBody: 'Hello World 2!',
  //   shouldBeStatus: 200,
  //   shouldBeJson: false,
  //   shouldBeJwt: 'body.data.message',
  //   shouldBeEmpty: ['body.data.empty'],
  //   shouldBeEqual: { 'body.data.equal': 777, 'body.data.equal2': 'to be equal' },
  //   jwtShouldBeSignedWith: { 'body.data.message': '123' },
  //   prepareRequest: storage => ({
  //     setHeader: { 'token': storage.token },
  //     setBody: 'Hello World 22222!'
  //   })
  // });

  // Tests.makeRequest({
  //   setDescr: 'Testing wrapper 3',
  //   setHeader: { 'token': '123', 'ETag': '123442' },
  //   setUrl: '/hello',
  //   setMethod: 'post',
  //   // setAuth: { 'login': '', 'pass': '' },
  //   setBody: 'Hello World 3!',
  //   shouldBeStatus: 200,
  //   shouldBeJson: false,
  //   shouldBeJwt: 'body.data.message',
  //   shouldBeEmpty: ['body.data.empty'],
  //   shouldBeEqual: { 'body.data.equal': 777, 'body.data.equal2': 'to be equal' },
  //   jwtShouldBeSignedWith: { 'body.data.message': '123' }
  // });

});