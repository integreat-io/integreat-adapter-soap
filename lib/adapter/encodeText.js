const encodeSurrogate = (chars) =>
  `&#${((chars.charCodeAt(0) - 0xD800) * 0x400) + (chars.charCodeAt(1) - 0xDC00) + 0x10000};`

const encodeChar = (char) => {
  if (char === '"') {
    return '&quot;'
  } else if (char.length === 2) {
    return encodeSurrogate(char)
  } else {
    return `&#${char.charCodeAt(0)};`
  }
}

const regex = /[\u0022\u0027\u00A0-\u0100\u{10400}-\u{FFFFF}]/gu

function encodeText (text) {
  return (typeof text === 'string') ? text.replace(regex, encodeChar) : text
}

module.exports = encodeText
