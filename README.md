# mocha-http-wrapper

Module is used to make mocha tests in declarative way

Example:  

```javascript
const Tests = new TestWrapper(server);

Tests.makeRequest({
    descr: 'test!',
    status: 200,
    url: '/api/create/',
    body: {thisIsBody: 'test'},
    shouldBeSchema: { 'body': schema },
    shouldBeUuid: ['body.data.message'], // string or array of strings
    shouldBeEqual: { 'body.status': 'DECLINE' },
    shouldBeJwt: 'body.data.message', // string or array of strings
    jwtShouldBeSignedWith: { 'body.data.message': '123' }
  });
```

Also it is possible to use custom assertions in makeRequest() method:
```javascript
customAssert: res => {
      res.body.data.message = "check this text";
    }
```

Save data to Tests class instance storage to use it in following tests:
```javascript

Tests.makeRequest({
    descr: 'descr',
    }, { saveResponse: true, constructCustomUrl: false });

Tests.makeRequest({
    descr: 'descr 2',
    }, { saveResponse: false, constructCustomUrl: { url: '/api/status/?uuid=', params: 'body.data.message' } });
```

Custom URL is constructed based on class storage data (previous saved response)