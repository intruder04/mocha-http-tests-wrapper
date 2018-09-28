# mocha-http-wrapper

**Module to make mocha tests in declarative way.**

*In case of using mocha **allure-reporter** you will recieve response and request in report as attachments*

## Usage example:  

```javascript
describe('Test suite', () => {

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
});
```

## Custom data operations:

- It is possible to use custom assertions in makeRequest() method:
```javascript
customAssert: res => {
      res.body.data.message = "check this text";
    }
```

- Save data to Tests class instance storage to use it in following tests:

```javascript

Tests.makeRequest({
    descr: 'descr',
    saveStorage: (res, storage) => {
      storage.blabla = 'blabla';
      storage.token = res.body.data.equal;
    }
  })

```

- Prepare request using data from class storage:

```javascript

Tests.makeRequest({
    descr: 'descr',
    prepareRequest: storage => ({
      setHeader: { 'token': storage.token },
      setBody: 'Hello World 22222!'
    })
});

```


## Enable console output while using reporters like 'allure-reporter':
- Install **mocha-multi** to use multiple reporters
```bash
npm i mocha-multi
```
- Fire a test
``` bash
multi='progress=- mocha-allure-reporter=-' mocha -R mocha-multi --exit ./tests/test.js
```