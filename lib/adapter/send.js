const dataFromXML = require('./dataFromXML')

function wireSend (got) {
  return async function send ({endpoint}) {
    const {uri, path} = endpoint
    const {body: xml} = await got(uri)
    const data = dataFromXML(xml, path)
    return {
      status: 'ok',
      data
    }
  }
}

module.exports = wireSend
