'use strict'

const { DOHClient, Packet } = require('dns2')
const pAny = require('p-any')

class DoHResolver {
  constructor ({ servers, get }) {
    this.servers = [].concat(servers)
    this.resolve4 = this.createTypeResolver('A')
    this.resolve6 = this.createTypeResolver('AAAA')
    this.get = get
  }

  getServers = () => this.servers

  setServers = servers => (this.servers = [...servers])

  createTypeResolver = type => {
    return async function (domain, options, cb) {
      const clients = this.servers.map(dns => DOHClient({ dns, get: this.get }))
      try {
        cb(
          null,
          await pAny(
            clients.map(client =>
              client(domain, type).then(({ answers }) =>
                answers.filter(r => r.type === Packet.TYPE[type])
              )
            )
          )
        )
      } catch (err) {
        cb(err)
      }
    }
  }
}

module.exports = DoHResolver
