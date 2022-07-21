'use strict'

const { DOHClient, Packet } = require('dns2')

const loggerNoop = (() => {
  const debug = () => {}
  debug.info = debug
  debug.error = debug
  return debug
})()

const timestamp = (start = process.hrtime()) => () => {
  const hrtime = process.hrtime(start)
  const nanoseconds = hrtime[0] * 1e9 + hrtime[1]
  return nanoseconds / 1e6
}

const createLogWithDuration = transport => (...args) => {
  const end = timestamp()
  return result =>
    transport(...args, JSON.stringify(result), {
      duration: `${Math.round(end())}ms`
    })
}

const logTime = async (fn, props, logWithDuration) => {
  const time = logWithDuration(props)
  const result = await fn()
  time(result)
  return result
}

class DoHResolver {
  constructor ({
    logger = loggerNoop,
    servers,
    get,
    onError = (cb, error) => cb(error.errors[0])
  }) {
    this.servers = [].concat(servers)
    this.resolve4 = this.createTypeResolver('A')
    this.resolve6 = this.createTypeResolver('AAAA')
    this.get = get
    this.onError = onError
    this.log = {
      debug: createLogWithDuration(logger),
      info: createLogWithDuration(logger.info),
      error: logger.error
    }
  }

  getServers = () => this.servers

  setServers = servers => (this.servers = [...servers])

  createTypeResolver = type => {
    return async function (domain, options, cb) {
      const clients = this.servers.map(dns => DOHClient({ dns, get: this.get }))
      try {
        cb(
          null,
          await logTime(
            () =>
              Promise.any(
                clients.map((client, index) =>
                  logTime(
                    () =>
                      client(domain, type).then(({ answers }) =>
                        answers.filter(r => r.type === Packet.TYPE[type])
                      ),
                    {
                      server: this.servers[index],
                      type,
                      domain
                    },
                    this.log.debug
                  )
                )
              ),
            { type, domain },
            this.log.info
          )
        )
      } catch (error) {
        error.errors.forEach(({ name, code, message }) =>
          this.log.error({ name, code, message })
        )
        this.onError(cb, error)
      }
    }
  }
}

module.exports = DoHResolver
