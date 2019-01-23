const extractNamespacePrefix = (key) => {
  const index = key.indexOf(':')
  return (index >= 0) ? key.substr(0, index) : '*'
}

const generateNamespaceKey = (prefix) => (prefix === '*') ? 'xmlns' : `xmlns:${prefix}`

const declareNamespaceOnElement = (element, prefix, uri) => {
  element._attributes = {
    ...element['_attributes'],
    [generateNamespaceKey(prefix)]: uri
  }
}

const isElement = (element) => element && typeof element === 'object'

const addElementNamespace = (element, key) => ({
  ...(isElement(element) ? findNamespaceParents(element) : {}),
  [extractNamespacePrefix(key)]: element
})

const mergeOrSetParent = (left, right, parent) => Object.keys(right)
  .reduce((merged, key) => ({
    ...merged,
    [key]: (typeof left[key] !== 'undefined' || Array.isArray(right[key])) ? parent : right[key]
  }), left)

const findNamespaceParents = (parent) => Object.keys(parent)
  .map((key) => addElementNamespace(parent[key], key))
  .reduce((parents, elParents) => mergeOrSetParent(parents, elParents, parent), {})

function declareNamespaces (element, namespaces) {
  const parents = findNamespaceParents(element)
  Object.keys(parents).forEach((prefix) => declareNamespaceOnElement(parents[prefix], prefix, namespaces[prefix]))
  return element
}

module.exports = declareNamespaces
