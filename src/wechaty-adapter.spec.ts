#!/usr/bin/env ts-node

// tslint:disable:no-shadowed-variable
import test  from 'blue-tape'

import { WechatyAdapter } from './wechaty-adapter'

test('version()', async t => {
  const adapter = new WechatyAdapter()

  t.equal(adapter.version(), '0.0.0', 'version in source code should keep 0.0.0')
})
