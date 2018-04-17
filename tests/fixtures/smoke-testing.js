#!/usr/bin/env node

const { WechatyConnector } = require('botbuilder-wechaty-connector')

const c = new WechatyConnector()
console.log(`botbuilder-wechaty-connector v${c.version()} pack testing passed.`)
