const convert = require('xml-js')
const dotProp = require('dot-prop')
const declareNamespaces = require('./declareNamespaces')
const encodeText = require('./encodeText')

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

const prepareProp = (element, props, key) => {
  // Exsisting _attributes or _text object - simply pass on
  if (key === '_attributes' || key === '_text') {
    return { ...props, [key]: element[key] }
  }

  // Prop is an attribute
  if (key[0] === '@') {
    return {
      ...props,
      _attributes: setAttribute(props, key.substr(1), element[key])
    }
  }

  return { ...props, [key]: prepareObject(element[key]) }
}

const prepareArray = (elements) => (elements.length === 1)
  ? prepareObject(elements[0])
  : elements.map(prepareObject)

const prepareObject = (element) => {
  if (element === null || typeof element === 'undefined') {
    return {}
  } else if (typeof element !== 'object') {
    return { _text: element }
  } else if (element instanceof Date) {
    return { _text: element.toISOString() }
  } else if (Array.isArray(element)) {
    return prepareArray(element)
  }

  return Object.keys(element).reduce((props, key) => prepareProp(element, props, key), {})
}

const extractActionName = (body) =>
  Object.keys((Array.isArray(body)) ? body[0] : body)[0]

const splitPrefixAndName = (elementName) => {
  const [prefix, name] = elementName.split(':')
  return (name) ? { prefix, name } : { prefix: '*', name: prefix }
}

const ensureTrailingSlash = (url) => (!url || url.endsWith('/')) ? url : `${url}/`

const getSoapAction = (data, namespaces, soapPrefix) => {
  const body = dotProp.get(data, `${soapPrefix}:Envelope.${soapPrefix}:Body`)
  const elementName = extractActionName(body)
  const { prefix, name } = splitPrefixAndName(elementName)
  return `${ensureTrailingSlash(namespaces[prefix])}${name}`
}

const prepareData = (data, path, namespace, { prefix = 'soap', version = '1.1' }) => {
  const { [`${prefix}:Header`]: header, ...body } = ((Array.isArray(data)) ? data[0] : data) || {}
  const element = {}
  if (header) {
    dotProp.set(element, `${prefix}:Envelope.${prefix}:Header`, header)
  }
  const fullPath = `${prefix}:Envelope.${prefix}:Body${(path) ? `.${path}` : ''}`
  dotProp.set(element, fullPath, [body])

  const namespaces = (typeof namespace === 'string') ? { '*': namespace } : { ...namespace }
  namespaces[prefix] = getSoapNamespace(version)

  return {
    soapAction: (data) ? getSoapAction(element, namespaces, prefix) : undefined,
    _declaration: { _attributes: { version: '1.0', encoding: 'utf-8' } },
    ...declareNamespaces(prepareObject(element), namespaces)
  }
}

/**
 * Serialize data before sending to the source.
 * Will set the given data as a property according to the path set on the
 * request endpoint, if specified.
 * @param {Object} request - The request
 * @returns {Object} Serialized data
 */
async function serialize (request) {
  const { requestPath, namespace, soap = {} } = request.endpoint
  const { soapAction, ...preparedObj } = prepareData(request.data, requestPath, namespace, soap)

  const options = { compact: true, spaces: soap.spaces || 2, textFn: encodeText }
  const data = convert.js2xml(preparedObj, options)

  return {
    ...request,
    data,
    params: {
      ...((soapAction) ? { soapAction } : {}),
      ...request.params
    }
  }
}

module.exports = serialize
