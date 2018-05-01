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
    return normalize(element)
  }
}

// Normalize if object or array of object - and it should not be skipped
const normalizeProp = (key, value) => {
  if (shouldSkip(key)) {
    return {}
  }

  if (Array.isArray(value)) {
    value = value.map(normalizeElement)
  } else if (typeof value === 'object' && value !== null) {
    value = normalizeElement(value)
  }

  return {[key]: value}
}

const normalize = (obj, prefix = '') => Object.keys(obj).reduce(
  (normal, key) => (key === '_attributes')
    ? {...normal, ...normalize(obj[key], '@')}
    : {...normal, ...normalizeProp(prefix + key, obj[key])},
  {}
)

// Find the body element and return that object or the object at the `path` from
// it. Does a pretty coarse handling of namespaces – will simply trust that any
// `Envelope` element on the top level has the right namespace, and will use the
// same namespace prefix for the `Body` element.
const extractData = (data, path) => {
  const envKey = Object.keys(data).find((key) => /^(\w+:)?Envelope$/.test(key))
  const env = data[envKey]
  const body = env[envKey.replace('Envelope', 'Body')]

  return dotProp.get(body, path)
}

/**
 * Extracts the normalized body from the provided SOAP xml.
 * `path` may be provided to extract a node further down in the body.
 *
 * @param {string} xml - A SOAP xml string
 * @param {string} path - A path to follow into the body object
 * @returns {Object} Normalized data
 */
function dataFromXML (xml, path) {
  const obj = convert.xml2js(xml, {compact: true})

  const data = extractData(obj, path)

  return normalize(data)
}

module.exports = dataFromXML
