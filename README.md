# doh-resolver

> A [DNS-over-HTTPS]([DNS-over-HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS)) resolver for Node.js.

![Last version](https://img.shields.io/github/tag/Kikobeats/doh-resolver.svg?style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/Kikobeats/doh-resolver.svg?style=flat-square)](https://coveralls.io/github/Kikobeats/doh-resolver)
[![NPM Status](https://img.shields.io/npm/dm/doh-resolver.svg?style=flat-square)](https://www.npmjs.org/package/doh-resolver)

## Install

```bash
$ npm install doh-resolver --save
```

## Usage

It can be used as [dns.resolve4](https://nodejs.org/api/dns.html#dnsresolve4hostname-options-callback) and/or [dns.resolve6](https://nodejs.org/api/dns.html#dnsresolve6hostname-options-callback) drop-in replacement:

```js
const DoHResolver = require('doh-resolver')
const resolver = new DoHResolver({ servers: ['1.1.1.1', '8.8.8.8'] })

resolver.resolve4('example.com', (error, addresses) => {
  if (error) throw error
  // Handle the result
})
```

When you specify more than one server, the result will be the fastest HTTP request into resolve.

Customize the request using your favorite HTTP client:

```js
const DoHResolver = require('doh-resolver')
const { promisify } = require('util')

const resolver = new DoHResolver({
  servers: ['1.1.1.1', '8.8.8.8'],
  get: promisify(require('simple-get'))
})
```

Combine it with **cacheable-lookup** for caching lookups respecting TTL:

```js
const CacheableLookup = require('cacheable-lookup')
const DoHResolver = require('doh-resolver')
const https = require('https')

const resolver = new DoHResolver({ servers: ['1.1.1.1', '8.8.8.8'] })

const cacheableLookup = new CacheableLookup({ resolver })

https.get('https://example.com', { lookup: cacheable.lookup }, response => {
  // Handle the response here
})
```

You can store the result via [keyv](https://keyv.js.org) to maximize cache HIT:

```js
const CacheableLookup = require('cacheable-lookup')
const DoHResolver = require('doh-resolver')
const KeyvMulti = require('@keyvhq/multi')
const KeyvRedis = require('@keyvhq/redis')
const Keyv = require('@keyvhq/core')
const https = require('https')

const cache = new Keyv({
  store: new KeyvMulti({
    local: new Map(),
    remote: new KeyvRedis()
  })
})

const resolver = new DoHResolver({ servers: ['1.1.1.1', '8.8.8.8'] })

const cacheableLookup = new CacheableLookup({ resolver, cache })

https.get('https://example.com', { lookup: cacheable.lookup }, response => {
  // Handle the response here
})
```

If you want to debug timings, pass `DEBUG=doh-resolver*` as environment variable.

## License

**doh-resolver** © [Kiko Beats](https://kikobeats.com), released under the [MIT](https://github.com/Kikobeats/doh-resolver/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/Kikobeats/doh-resolver/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [Kiko Beats](https://github.com/Kikobeats) · Twitter [@Kikobeats](https://twitter.com/Kikobeats)
