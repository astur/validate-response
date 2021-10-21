# validate-response

Validate http response (for example from [request](https://github.com/request/request), [got](https://github.com/sindresorhus/got), [scra](https://github.com/astur/scra) or [needle](https://github.com/tomas/needle)).

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]

## Install

```bash
npm i validate-response
```

## Usage

```js
const validateResponse = require('validate-response');

const validator = validateResponse(options);
// //or//
// const validator = validateResponse(...codes);

validator(response);

// validator throws ValidateResponceError if response is invalid, otherwise do nothing.
// also validator throws TypeError if response is not instance of http.IncomingMessage (now disabled).

// validator created without any params will treat every response as valid.
```

### options:

- `codes` - valid values for response.statusCode. May be number between 100 and 599, comma-separated string with such numbers or array of all above. Even like this:
    ```js
    const validator = validateResponse({codes: [200, '300, 400', '500']});
    ```
    On invalid codes error will be thrown.

- `checkJSON` - boolean, if `true` error will throws on response that has `content-type` set to `application/json`, but has string in `body` field (not object). Defaults to false.

- `contentLength` - positive number or array of two numbers, means value of response `content-length` must be equal to number or in range of two numbers. If not (or if response has no `content-length` header) error will be thrown.

- `bodyMatch` - regexp for testing response `body` string. If `body` does not match regexp, error will be thrown.

- `validator` - custom validator function, that takes response and return truthy value for valid response. If throws or return falsy - error will be thrown. It makes no sense to use this function if other options are not specified.

If response is invalid by many reasons error will be thrown only once and all reasons will be listed in `reasons` field.

### codes:

If first parameter of `validateResponse` is not object all parameters are `codes`. Each parameter has same schema as `codes` option`. It may looks even like this:

```js
const validator = validateResponse(200, '300, 301 , 302 ,307', ['400', '401, 403', 451], '500']});
```

But usually it looks like this:

```js
const validator = validateResponse(200);
```

### ValidateResponceError:

On bad responce `validator` throws `ValidateResponceError`, that has some useful additional fields:

* `reasons` - array of human readable text messages describing the reasons why `ValidateResponceError` was thrown. If there is only one reason, that will no `reasons` field and that reason message will placed in `message` field of error object.
* `codes` - array of sort text codes for corresponding `reasons`. Every code is one of  'E_INVALID_STATUS', 'E_INVALID_JSON', 'E_INVALID_LENGTH', 'E_INVALID_MATCH' or 'E_INVALID_RESPONCE'.
* `url` - same field of responce.
* `statusCode` - same field of responce.
* `bodyLength` - length of `responce.body`.
* `headers` - key-value object with responce headers.

## License

MIT

[npm-url]: https://npmjs.org/package/validate-response
[npm-image]: https://badge.fury.io/js/validate-response.svg
[travis-url]: https://travis-ci.org/astur/validate-response
[travis-image]: https://travis-ci.org/astur/validate-response.svg?branch=master