#!/usr/bin/env node

import { WechatyConnector } from 'botbuilder-wechaty-connector'

const c = new WechatyConnector()
console.log(`botbuilder-wechaty-connector v${c.version()} pack testing passed.`)
