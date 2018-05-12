import test from 'ava'

import adapter from '.'

test('should be an Integreat adapter', (t) => {
  t.truthy(adapter)
  t.is(typeof adapter.prepareEndpoint, 'function')
  t.is(typeof adapter.send, 'function')
  t.is(typeof adapter.normalize, 'function')
  t.is(typeof adapter.serialize, 'function')
})

test('should have minimal prepareEndpoint implementation', (t) => {
  const endpointOptions = {uri: 'https://somewhere.com'}

  const ret = adapter.prepareEndpoint(endpointOptions)

  t.truthy(ret)
  t.is(ret.uri, 'https://somewhere.com')
})

test('should have minimal serialize implementation', async (t) => {
  const data = {id: 'ent1', type: 'entry'}

  const ret = await adapter.serialize(data)

  t.truthy(ret)
  t.is(ret.id, 'ent1')
  t.is(ret.type, 'entry')
})
