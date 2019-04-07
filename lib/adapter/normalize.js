const convert = require('xml-js')
const dotProp = require('dot-prop')
const { compose, mergeRight, ifElse, isEmpty, always, identity } = require('ramda')

const envRegex = /^([\w-]+:)?Envelope$/
const anyRegex = /^([\w-]+:)?\w+$/

const getPrefixFromData = (data, regex = anyRegex) => {
  const envKey = Object.keys(data).find((key) => regex.test(key))
  const match = regex.exec(envKey)
  return (match && match.length > 1) ? match[1] : undefined
}

const stripPrefix = (key, prefix) =>
  (typeof key === 'string' && typeof prefix === 'string' && key.startsWith(prefix))
    ? key.substr(prefix.length) : key

const setDefaultPrefixInPath = (path, prefix) =>
  (typeof path === 'string' && typeof prefix === 'string')
    ? path.split('.').map(p => (p.indexOf(':') === -1) ? prefix + p : p).join('.')
    : path

const mergeOrNull = compose(ifElse(isEmpty, always(null), identity), mergeRight)

const shouldSkip = (key) => /^@xmlns:?/.test(key)

const normalizeElement = (element, defaultPrefix) => {
  const keys = Object.keys(element)
  if (keys.length === 0) {
    // An empty element - return null
    return null
  } else if (keys.length === 1 && keys[0] === '_text') {
    // Return _text if it is the only prop
    return element._text
  } else {
    // Normalize an element with props
    return normalizeObject(element, defaultPrefix)
  }
}

const shouldNormalizeKey = (prefix) => (key) => !(prefix === '@' && key === 'xsi:nil')

const setProp = (key, value, defaultPrefix) => (key === '_attributes')
  ? normalizeObject(value, defaultPrefix, '@')
  : (shouldSkip(key)) ? null : { [key]: normalizeElement(value, defaultPrefix) }

const normalizeObject = (obj, defaultPrefix, prefix = '') => {
  if (Array.isArray(obj)) {
    return obj.map((o) => normalizeObject(o, defaultPrefix, prefix))
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  return Object.keys(obj)
    .filter(shouldNormalizeKey(prefix))
    .map(key => setProp(prefix + stripPrefix(key, defaultPrefix), obj[key], defaultPrefix))
    .reduce((props, prop) => mergeOrNull(props, prop), null)
}

// Find the body element and return that object or the object at the `path` from
// it. Does a pretty coarse handling of namespaces – will simply trust that any
// `Envelope` element on the top level has the right namespace, and will use the
// same namespace prefix for the `Body` element.
const getDataAtPath = (data, path) => {
  const prefix = getPrefixFromData(data, envRegex)
  if (typeof prefix === 'undefined') {
    return { data: undefined }
  }

  const env = data[`${prefix}Envelope`]
  const body = env[`${prefix}Body`]
  const header = env[`${prefix}Header`]
  const defaultPrefix = (body) ? getPrefixFromData(body) : undefined

  const dataObj = dotProp.get(body, setDefaultPrefixInPath(path, defaultPrefix))
  if (header) {
    dataObj[`${prefix}Header`] = header
  }
  return { data: dataObj, defaultPrefix }
}

/**
 * Normalize data from the source.
 * Returns an object starting from the path set on the request endpoint.
 * @param {Object} response - The response with data to normalize
 * @param {Object} request - The request
 * @returns {Object} Normalized data
 */
async function normalize (response, { endpoint }) {
  if (response.status !== 'ok') {
    return response
  }
  const { path } = endpoint
  const rawObj = convert.xml2js(response.data, { compact: true })
  const { data, defaultPrefix } = getDataAtPath(rawObj, path)

  return {
    ...response,
    data: normalizeObject(data, defaultPrefix, '')
  }
}

module.exports = normalize
