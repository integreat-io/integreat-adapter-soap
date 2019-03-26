const extractNamespacePrefix = (key) => {
  if (key === '_text' || key === '_attributes') {
    return null
  }
  const index = key.indexOf(':')
  return (index >= 0) ? key.substr(0, index) : '*'
}

const generateNamespaceKey = (prefix) => (prefix === '*') ? 'xmlns' : `xmlns:${prefix}`

const declareNamespaceOnElement = (element, prefix, uri) => {
  element._attributes = {
    ...element._attributes,
    [generateNamespaceKey(prefix)]: uri
  }
}

const isElement = (element) => element && typeof element === 'object'

const elementOrOverride = (element, elOverride) =>
  (!isElement(element) && isElement(elOverride)) ? elOverride : element

const parentIfAttributes = (key, parent) => (key === '_attributes') ? parent : null

const addElementNamespace = (element, key, elOverride) => {
  const prefix = extractNamespacePrefix(key)
  return {
    ...(isElement(element) ? findNamespaceParents(element, elOverride) : {}),
    ...((prefix === null) ? {} : { [prefix]: elementOrOverride(element, elOverride) })
  }
}

const mergeOrSetParent = (left, right, parent) => Object.keys(right)
  .reduce((merged, key) => ({
    ...merged,
    [key]: (typeof left[key] !== 'undefined' || Array.isArray(right[key])) ? parent : right[key]
  }), left)

const findNamespaceParents = (parent, elOverride = null) => Object.keys(parent)
  .map((key) => addElementNamespace(parent[key], key, parentIfAttributes(key, parent) || elOverride))
  .reduce((parents, elParents) => mergeOrSetParent(parents, elParents, parent), {})

function declareNamespaces (element, namespaces) {
  const parents = findNamespaceParents(element)
  Object.keys(parents).forEach(
    (prefix) => declareNamespaceOnElement(parents[prefix], prefix, namespaces[prefix])
  )
  return element
}

module.exports = declareNamespaces
