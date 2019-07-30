import test from 'ava'

import soap from '.'
const adapter = soap()

test('should be an Integreat adapter', (t) => {
  t.truthy(adapter)
  t.is(typeof adapter.prepareEndpoint, 'function')
  t.is(typeof adapter.send, 'function')
  t.is(typeof adapter.normalize, 'function')
  t.is(typeof adapter.serialize, 'function')
  t.is(typeof adapter.connect, 'function')
  t.is(typeof adapter.disconnect, 'function')
})

test('connect should return connection', async (t) => {
  const connection = {}

  const ret = await adapter.connect(null, null, connection)

  t.is(ret, connection)
})

test('disconnect should do nothing', async (t) => {
  await t.notThrows(() => adapter.disconnect())
})
