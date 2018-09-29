const convert = require('xml-js')
const dotProp = require('dot-prop')

const extractNamespacePrefix = (key) => {
  const index = key.indexOf(':')
  return (index >= 0) ? key.substr(0, index) : '*'
}

const generateNamespaceKey = (prefix) => (prefix === '*') ? 'xmlns' : `xmlns:${prefix}`

const getSoapNamespace = (version) => {
  switch (version) {
    case '1.2': return 'http://www.w3.org/2003/05/soap-envelope'
    case '1.1': return 'http://schemas.xmlsoap.org/soap/envelope/'
  }
}

const setAttribute = (props, key, value) => ({
  ...props._attributes || {},
  [key]: value
})

const prepareProp = (element, props, key, namespaces) => {
  // Exsisting _attributes object - simply pass on
  if (key === '_attributes') {
    return { ...props, [key]: element[key] }
  }

  // Prop is an attribute
  if (key[0] === '@') {
    return {
      ...props,
      _attributes: setAttribute(props, key.substr(1), element[key])
    }
  }

  // Prop is the first in the tree of a certain namespace
  const prefix = extractNamespacePrefix(key)
  if (namespaces[prefix]) {
    const { [prefix]: namespace, ...rest } = namespaces
    return {
      ...props,
      [key]: prepareObject({
        ...element[key],
        _attributes: setAttribute(element[key], generateNamespaceKey(prefix), namespace)
      }, rest)
    }
  }

  // Prop is an ordinary element
  return { ...props, [key]: prepareObject(element[key], namespaces) }
}

const prepareObject = (element, namespaces) => {
  if (Array.isArray(element)) {
    return element.map(prepareObject)
  }

  if (typeof element !== 'object' || element === null) {
    return element
  }

  return Object.keys(element).reduce((el, key) => prepareProp(element, el, key, namespaces), {})
}

const prepareData = (data, path, namespace, { prefix = 'soap', version = '1.1' }) => {
  const fullPath = `${prefix}:Envelope.${prefix}:Body${(path) ? `.${path}` : ''}`

  const namespaces = (typeof namespace === 'string') ? { '*': namespace } : { ...namespace }
  namespaces[prefix] = getSoapNamespace(version)

  return {
    _declaration: { _attributes: { version: '1.0', encoding: 'utf-8' } },
    ...prepareObject(dotProp.set({}, fullPath, data), namespaces)
  }
}

/**
 * Serialize data before sending to the source.
 * Will set the given data as a property according to the path set on the
 * request endpoint, if specified.
 * @param {Object} data - The data to serialize
 * @param {Object} request - The request
 * @returns {Object} Serialized data
 */
async function serialize (data, { endpoint }) {
  const { requestPath, namespace, soap = {} } = endpoint
  const preparedObj = prepareData(data, requestPath, namespace, soap)

  return convert.js2xml(preparedObj, { compact: true, spaces: soap.spaces || 2 })
}

module.exports = serialize
