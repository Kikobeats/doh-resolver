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
    t.true(isIPv6(address.replace('::::', '::')))
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
    t.true(isIPv6(address.replace('::::', '::')))
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
    t.true(isIPv6(address.replace('::::', '::')))
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

test('catch error', async t => {
  const resolver = new DoHResolver({
    servers: ['1.1.1.1', '8.8.8.8'],
    get: url =>
      new Promise((resolve, reject) => {
        const req = require('http').get(
          'http://127.0.0.1',
          { headers: { accept: 'application/dns-message' } },
          resolve
        )
        req.on('error', reject)
      })
  })

  const resolve4 = promisify(resolver.resolve4.bind(resolver))

  await t.throwsAsync(
    async () => {
      await resolve4('google.com', ttl)
    },
    { instanceOf: AggregateError, message: 'All promises were rejected' }
  )
})
