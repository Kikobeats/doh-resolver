'use strict'

const { isIPv4, isIPv6 } = require('net')
const { promisify } = require('util')
const test = require('ava')

const DoHResolver = require('..')

const ttl = { ttl: true }

test('create a `A` DoH for google', async t => {
  const resolver = new DoHResolver(['dns.google'])
  const resolve4 = promisify(resolver.resolve4.bind(resolver))
  const results = await resolve4('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 1)
    t.true(isIPv4(address))
    t.is(typeof ttl, 'number')
  })
})

test('create a `AAAA` DoH for google', async t => {
  const resolver = new DoHResolver(['dns.google'])
  const resolve6 = promisify(resolver.resolve6.bind(resolver))
  const results = await resolve6('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 28)
    t.true(isIPv6(address.replace('::::', '::')))
    t.is(typeof ttl, 'number')
  })
})

test('create a `A` DoH for cloudflare', async t => {
  const resolver = new DoHResolver(['1.1.1.1'])
  const resolve4 = promisify(resolver.resolve4.bind(resolver))
  const results = await resolve4('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 1)
    t.true(isIPv4(address))
    t.is(typeof ttl, 'number')
  })
})

test('create a `AAAA` DoH for cloudflare', async t => {
  const resolver = new DoHResolver(['1.1.1.1'])
  const resolve6 = promisify(resolver.resolve6.bind(resolver))
  const results = await resolve6('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 28)
    t.true(isIPv6(address.replace('::::', '::')))
    t.is(typeof ttl, 'number')
  })
})

test('create `A` resolver that use more than one server', async t => {
  const resolver = new DoHResolver(['1.1.1.1', 'dns.google'])
  const resolve4 = promisify(resolver.resolve4.bind(resolver))
  const results = await resolve4('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 1)
    t.true(isIPv4(address))
    t.is(typeof ttl, 'number')
  })
})

test('create `AAAA` resolver that use more than one server', async t => {
  const resolver = new DoHResolver(['1.1.1.1', 'dns.google'])
  const resolve6 = promisify(resolver.resolve6.bind(resolver))
  const results = await resolve6('google.com', ttl)

  results.forEach(({ type, ttl, address }) => {
    t.is(type, 28)
    t.true(isIPv6(address.replace('::::', '::')))
    t.is(typeof ttl, 'number')
  })
})