# doh-resolver

> DNS-over-HTTPS resolver for Node.js.

![Last version](https://img.shields.io/github/tag/Kikobeats/doh-resolver.svg?style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/Kikobeats/doh-resolver.svg?style=flat-square)](https://coveralls.io/github/Kikobeats/doh-resolver)
[![NPM Status](https://img.shields.io/npm/dm/doh-resolver.svg?style=flat-square)](https://www.npmjs.org/package/doh-resolver)

## Install

```bash
$ npm install doh-resolver --save
```

## Usage

```js
const CacheableLookup = require('cacheable-lookup')
const DoHResolver = require('doh-resolver')
const https = require('http')

const resolver = new DoHResolver(['1.1.1.1', 'dns.google'])

const cacheableLookup = new CacheableLookup({ resolver })

https.get('https://example.com', { lookup: cacheable.lookup }, response => {
  // Handle the response here
})
```

## License

**doh-resolver** © [Kiko Beats](https://kikobeats.com), released under the [MIT](https://github.com/Kikobeats/doh-resolver/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/Kikobeats/doh-resolver/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [Kiko Beats](https://github.com/Kikobeats) · Twitter [@Kikobeats](https://twitter.com/Kikobeats)
