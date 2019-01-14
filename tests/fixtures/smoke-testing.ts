#!/usr/bin/env node

import { WechatyAdapter } from 'botbuilder-wechaty-adapter'

const adapter = new WechatyAdapter()

const version = adapter.version()

if (version === '0.0.0') {
  throw new Error('Version number is not set.')
}

console.log(`botbuilder-wechaty-adapter v${adapter.version()} pack testing passed.`)
