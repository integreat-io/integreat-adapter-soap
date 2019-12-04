const convert = require('xml-js')
const dotProp = require('dot-prop')
const declareNamespaces = require('./declareNamespaces')
const encodeText = require('./encodeText')

const defaultNamespaces = (xsiPrefix) => ({
  [xsiPrefix]: 'http://www.w3.org/2001/XMLSchema-instance'
})

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

const prepareProp = (element, props, key, soap) => {
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

  // Set prop if it is not null
  const prop = prepareObject(soap)(element[key])
  return (prop !== null) ? { ...props, [key]: prop } : props
}

const prepareArray = (elements, soap) => (elements.length === 1)
  ? prepareObject(soap)(elements[0])
  : elements.map(prepareObject(soap))

const prepareObject = (soap) => (element) => {
  if (element === null) {
    return { _attributes: { [`${soap.xsiPrefix}:nil`]: 'true' } }
  } else if (typeof element === 'undefined') {
    return null
  } else if (element === '') {
    return {}
  } else if (typeof element !== 'object') {
    return { _text: element }
  } else if (element instanceof Date) {
    return { _text: element.toISOString() }
  } else if (Array.isArray(element)) {
    return prepareArray(element, soap)
  }

  return Object.keys(element).reduce((props, key) => prepareProp(element, props, key, soap), {})
}

const extractActionName = (body) =>
  Object.keys((Array.isArray(body)) ? body[0] : body)[0]

const splitPrefixAndName = (elementName) => {
  const [prefix, name] = elementName.split(':')
  return (name) ? { prefix, name } : { prefix: '*', name: prefix }
}

const ensureTrailingSlash = (url) => (!url || url.endsWith('/')) ? url : `${url}/`

const getSoapAction = (data, soapAction, soapActionNamespace, namespaces, soapPrefix) => {
  if (soapAction) {
    return soapAction
  }
  const body = dotProp.get(data, `${soapPrefix}:Envelope.${soapPrefix}:Body`)
  const elementName = extractActionName(body)
  const { prefix, name } = splitPrefixAndName(elementName)
  return `${ensureTrailingSlash(soapActionNamespace || namespaces[prefix])}${name}`
}

const stripDefaultNs = (ns) => (ns.startsWith('*')) ? ns.split(':')[1] : ns

const stripDefaultNamespaces = (element) => (element && typeof element === 'object' && !Array.isArray(element))
  ? Object.keys(element).reduce((newEl, key) => ({
    ...newEl,
    [stripDefaultNs(key)]: stripDefaultNamespaces(element[key])
  }), {})
  : element

const createXmlObject = (element, namespaces, data, soapAction, soapActionNamespace, prefix, xsiPrefix) =>
  stripDefaultNamespaces({
    soapAction: (data) ? getSoapAction(element, soapAction, soapActionNamespace, namespaces, prefix) : undefined,
    _declaration: { _attributes: { version: '1.0', encoding: 'utf-8' } },
    ...declareNamespaces(prepareObject({ xsiPrefix })(element), namespaces)
  })

const prepareData = (data, path, namespace, soapAction, soapActionNamespace, { prefix = 'soap', xsiPrefix = 'xsi', version = '1.1' }) => {
  const { [`${prefix}:Header`]: header, ...body } = ((Array.isArray(data)) ? data[0] : data) || {}
  const element = {}
  if (header) {
    dotProp.set(element, `${prefix}:Envelope.${prefix}:Header`, header)
  }
  const fullPath = `${prefix}:Envelope.${prefix}:Body${(path) ? `.${path}` : ''}`
  dotProp.set(element, fullPath, [body])

  const namespaces = {
    ...defaultNamespaces(xsiPrefix),
    ...((typeof namespace === 'string') ? { '*': namespace } : namespace)
  }
  namespaces[prefix] = getSoapNamespace(version)

  return createXmlObject(element, namespaces, data, soapAction, soapActionNamespace, prefix, xsiPrefix)
}

/**
 * Serialize data before sending to the source.
 * Will set the given data as a property according to the path set on the
 * request endpoint, if specified.
 * @param {Object} request - The request
 * @returns {Object} Serialized data
 */
async function serialize (request) {
  const { requestPath, namespace, soapAction: soapActionOption, soapActionNamespace, soap = {} } = request.endpoint
  const { soapAction, ...preparedObj } = prepareData(request.data, requestPath, namespace, soapActionOption, soapActionNamespace, soap)

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
