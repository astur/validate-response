# validate-response

Validate http response (for example from scra).

_very unstable and 'Under construction' yet._

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]

## Install

```bash
npm i validate-response
```

## Usage

```js
const validateResponse = require('validate-response');
const scra = require('scra');

scra('example.com').then(validateResponse(200)); // ValidateResponceError if response.statusCode !== 200
```

## License

MIT

[npm-url]: https://npmjs.org/package/validate-response
[npm-image]: https://badge.fury.io/js/validate-response.svg
[travis-url]: https://travis-ci.org/astur/validate-response
[travis-image]: https://travis-ci.org/astur/validate-response.svg?branch=master