'use strict'

const { isIPv4, isIPv6 } = require('net')
const { promisify } = require('util')
const test = require('ava')

const DoHResolver = require('..')

const ttl = { ttl: true }

test('create a `A` DoH for google', async t => {
  const resolver = new DoHResolver({ servers: ['8.8.8.8'] })
  const resolve4 = promisify(resolver.resolve4.bind(resolver))
  const results = await resolve4('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 1)
    t.true(isIPv4(address))
    t.is(typeof ttl, 'number')
  })
})

test('create a `AAAA` DoH for google', async t => {
  const resolver = new DoHResolver({ servers: ['8.8.8.8'] })
  const resolve6 = promisify(resolver.resolve6.bind(resolver))
  const results = await resolve6('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 28)
    t.true(isIPv6(address))
    t.is(typeof ttl, 'number')
  })
})

test('create a `A` DoH for cloudflare', async t => {
  const resolver = new DoHResolver({ servers: ['1.1.1.1'] })
  const resolve4 = promisify(resolver.resolve4.bind(resolver))
  const results = await resolve4('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 1)
    t.true(isIPv4(address))
    t.is(typeof ttl, 'number')
  })
})

test('create a `AAAA` DoH for cloudflare', async t => {
  const resolver = new DoHResolver({ servers: ['1.1.1.1'] })
  const resolve6 = promisify(resolver.resolve6.bind(resolver))
  const results = await resolve6('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 28)
    t.true(isIPv6(address))
    t.is(typeof ttl, 'number')
  })
})

test('create `A` resolver that use more than one server', async t => {
  const resolver = new DoHResolver({ servers: ['1.1.1.1', '8.8.8.8'] })
  const resolve4 = promisify(resolver.resolve4.bind(resolver))
  const results = await resolve4('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 1)
    t.true(isIPv4(address))
    t.is(typeof ttl, 'number')
  })
})

test('create `AAAA` resolver that use more than one server', async t => {
  const resolver = new DoHResolver({ servers: ['1.1.1.1', '8.8.8.8'] })
  const resolve6 = promisify(resolver.resolve6.bind(resolver))
  const results = await resolve6('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 28)
    t.true(isIPv6(address))
    t.is(typeof ttl, 'number')
  })
})

test('use `simple-get` as http/https client', async t => {
  const resolver = new DoHResolver({
    servers: ['1.1.1.1', '8.8.8.8'],
    get: promisify(require('simple-get'))
  })

  const resolve4 = promisify(resolver.resolve4.bind(resolver))
  const results = await resolve4('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 1)
    t.true(isIPv4(address))
    t.is(typeof ttl, 'number')
  })
})

test('use `got` as http/https client', async t => {
  const resolver = new DoHResolver({
    servers: ['1.1.1.1', '8.8.8.8'],
    get: require('got').stream
  })

  const resolve4 = promisify(resolver.resolve4.bind(resolver))
  const results = await resolve4('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 1)
    t.true(isIPv4(address))
    t.is(typeof ttl, 'number')
  })
})

test('throw an error under any underlayer problem', async t => {
  const resolver = new DoHResolver({
    servers: ['127.0.0.1']
  })

  const resolve4 = promisify(resolver.resolve4.bind(resolver))

  await t.throwsAsync(
    async () => {
      await resolve4('google.com', ttl)
    },
    { instanceOf: Error, message: 'connect ECONNREFUSED 127.0.0.1:443' }
  )
})

test('custom error handling', async t => {
  const CacheableLookup = require('cacheable-lookup')
  const https = require('https')

  const resolver = new DoHResolver({
    servers: ['1.1.1.1', '8.8.8.8'],
    get: () => new Promise((resolve, reject) => reject(new Error('oh no'))),
    onError: cb => cb(null, [])
  })

  const cacheable = new CacheableLookup({ resolver })

  const get = url =>
    new Promise((resolve, reject) =>
      https.get(url, { lookup: cacheable.lookup }, resolve)
    )

  const response = await get('https://example.com', {
    lookup: cacheable.lookup
  })
  t.true(response instanceof require('http').IncomingMessage)
})
