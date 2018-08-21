# mocha-http-wrapper

Module to make mocha tests in declarative way

Example:  

```javascript
const Tests = new TestWrapper(server);

Tests.makeRequest({
    setDescr: 'Testing wrapper',
    setHeader: { 'token': '123', 'ETag': '123442' },
    setUrl: '/hello',
    setMethod: 'get',
    setAuth: { 'login': '', 'pass': '' },
    setBody: 'Hello World!',
    setMaxRedirects: 0,
    shouldBeStatus: 200,
    shouldBeFormat: 'json', // json or html or plain
    shouldBeJwt: 'body.data.message',
    shouldBeEmpty: ['body.data.empty'],
    shouldBeEqual: { 'body.data.equal': 777, 'body.data.equal2': 'to be equal' },
    jwtShouldBeSignedWith: { 'body.data.message': '123' }
    shouldBeSchema: { 'body': schema },
    shouldBeUuid: ['body.data.message'], // string or array of strings
    saveStorage: (res, storage) => {
      storage.blabla = 'blabla';
      storage.token = res.body.data.equal;
    },
    prepareRequest: storage => ({
      setHeader: { 'token': storage.token },
      setBody: 'Hello World 22222!'
    })
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