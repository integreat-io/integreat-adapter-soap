import test from 'ava'

import encodeText from './encodeText'

test('should encode chars not encoded by xml-js', (t) => {
  const text = '&lt;p&gt;Text ç®© æøå; λ @\n\'•\' &amp; ÆØÅ "123"&lt;/p&gt;'
  const expected = '&lt;p&gt;Text &#231;&#174;&#169; &#230;&#248;&#229;; λ @\n&#39;•&#39; &amp; &#198;&#216;&#197; &quot;123&quot;&lt;/p&gt;'

  const ret = encodeText(text)

  t.is(ret, expected)
})

test('should handle higher unicode chars', (t) => {
  const text = '&lt;p&gt;Bæsj: 💩&lt;/p&gt;'
  const expected = '&lt;p&gt;B&#230;sj: &#128169;&lt;/p&gt;'

  const ret = encodeText(text)

  t.is(ret, expected)
})

test('should handle empty string', (t) => {
  const ret = encodeText('')

  t.is(ret, '')
})

test('should skip not string', (t) => {
  const ret = encodeText(null)

  t.is(ret, null)
})
