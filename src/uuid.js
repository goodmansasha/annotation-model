class UUID {
  static v4 () {
    const bytes = UUID._randomBytes(16)
    // See https://www.ietf.org/rfc/rfc4122.txt (Section 4.4)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    let str = UUID._isNode() ? bytes.toString('hex') : ''
    if (str === '') {
      for (let i = 0; i < 16; i += 1) {
        str += UUID._bToStr(bytes[i])
      }
    }
    return str.substr(0, 8) + '-' +
      str.substr(8, 4) + '-' +
      str.substr(12, 4) + '-' +
      str.substr(16, 4) + '-' +
      str.substr(20)
  }
  static _isNode () {
    return typeof process !== 'undefined' && typeof process.pid === 'number'
  }
  static _randomBytes (count) {
    let crypto
    if (UUID._isNode()) return require('crypto').randomBytes(count)
    crypto = window.crypto || window.msCrypto // for IE 11
    if (!crypto) {
      console.warn('Your environment does not support Crypto, falling back to Math.random()')
      const bytes = new Array(count)
      for (let num, i = 0; i < count; i++) {
        if ((i & 0x03) === 0) num = Math.random() * 0x100000000
        bytes[i] = num >>> ((i & 0x03) << 3) & 0xff
      }
      return bytes
    }
    return crypto.getRandomValues(new Uint8Array(count))
  }
  static _bToStr (byte, sub) {
    let str = sub ? byte.toString(16).substr(sub) : byte.toString(16)
    while (str.length < 2) {
      str = '0' + str
    }
    return str
  }
}

export default UUID
