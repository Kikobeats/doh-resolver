'use strict'

const debug = require('debug-logfmt')('doh-resolver')
const { DOHClient } = require('dns2')

const timestamp = (start = process.hrtime()) => () => {
  const hrtime = process.hrtime(start)
  const nanoseconds = hrtime[0] * 1e9 + hrtime[1]
  return nanoseconds / 1e6
}

const createLogger = transport => (...args) => {
  const end = timestamp()
  return () => transport(...args, { duration: `${Math.round(end())}ms` })
}

const logger = {
  debug: createLogger(debug),
  info: createLogger(debug.info)
}

const measure = async (fn, props, logger) => {
  const time = logger(props)
  const result = await fn()
  time()
  return result
}

class DoHResolver {
  constructor ({ servers, get, onError = (cb, error) => cb(error.errors[0]) }) {
    this.servers = [].concat(servers)
    this.resolve4 = this.createTypeResolver('A')
    this.resolve6 = this.createTypeResolver('AAAA')
    this.get = get
    this.onError = onError
  }

  getServers = () => this.servers

  setServers = servers => (this.servers = [...servers])

  createTypeResolver = type => {
    return async function (domain, options, cb) {
      const clients = this.servers.map(dns => DOHClient({ dns, get: this.get }))
      try {
        cb(
          null,
          await measure(
            () =>
              Promise.any(
                clients.map((client, index) =>
                  measure(
                    () => client(domain, type).then(({ answers }) => answers),
                    {
                      server: this.servers[index],
                      type,
                      domain
                    },
                    logger.debug
                  )
                )
              ),
            { type, domain },
            logger.info
          )
        )
      } catch (error) {
        error.errors.forEach(({ name, code, message }) =>
          debug.error({ name, code, message })
        )
        this.onError(cb, error)
      }
    }
  }
}

module.exports = DoHResolver
