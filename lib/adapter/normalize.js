const convert = require('xml-js')
const dotProp = require('dot-prop')

const shouldSkip = (key) => /^@xmlns:?/.test(key)

const normalizeElement = (element) => {
  const keys = Object.keys(element)
  if (keys.length === 0) {
    // An empty element - return null
    return null
  } else if (keys.length === 1 && keys[0] === '_text') {
    // Return _text if it is the only prop
    return element._text
  } else {
    // Normalize an element with props
    return normalizeObject(element)
  }
}

const setProp = (props, key, value) => (key === '_attributes')
  ? { ...props, ...normalizeObject(value, '@') }
  : (shouldSkip(key)) ? props : { ...props, [key]: normalizeElement(value) }

const normalizeObject = (obj, prefix = '') => {
  if (Array.isArray(obj)) {
    return obj.map((o) => normalizeObject(o, prefix))
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  return Object.keys(obj).reduce(
    (props, key) => setProp(props, prefix + key, obj[key]),
    {}
  )
}

// Find the body element and return that object or the object at the `path` from
// it. Does a pretty coarse handling of namespaces – will simply trust that any
// `Envelope` element on the top level has the right namespace, and will use the
// same namespace prefix for the `Body` element.
const getDataAtPath = (data, path) => {
  const envKey = Object.keys(data).find((key) => /^(\w+:)?Envelope$/.test(key))
  const env = data[envKey]
  const body = env[envKey.replace('Envelope', 'Body')]

  return dotProp.get(body, path)
}

/**
 * Normalize data from the source.
 * Returns an object starting from the path set on the request endpoint.
 * @param {Object} response - The response with data to normalize
 * @param {Object} request - The request
 * @returns {Object} Normalized data
 */
async function normalize ({ data }, { endpoint }) {
  const { path } = endpoint
  const rawObj = convert.xml2js(data, { compact: true })
  const dataObj = getDataAtPath(rawObj, path)

  return normalizeObject(dataObj)
}

module.exports = normalize
