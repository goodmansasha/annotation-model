/*
Copyright (c) 2017 Sasha Goodman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import SegmentSelector from './segment-selector'

class DataPositionSelector extends SegmentSelector {
  constructor (object = {start: 0, end: null}) {
    super()
    this.type = 'DataPositionSelector'
    this.start = object.start
    this.end = object.end
    return this
  }
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  // http://www.isthisthingon.org/unicode/index.phtml?glyph=10001 points above 10K have surrogate pairs.
  // http://stackoverflow.com/questions/2848462/count-bytes-in-textarea-using-javascript
  static fixedCharCodeAt (str, idx) {
    idx = idx || 0
    const code = str.charCodeAt(idx)
    if (isNaN(code)) { return null } // outside of string range returns null
    let hi, low
    if (code >= 0xD800 && code <= 0xDBFF) {
      hi = code
      low = str.charCodeAt(idx + 1)
      if (isNaN(low)) { throw new Error('High surrogate not followed by low surrogate in fixedCharCodeAt()') }
      return ((hi - 0xD800) * 0x400) +
        (low - 0xDC00) + 0x10000
    }
    if (code >= 0xDC00 && code <= 0xDFFF) {
      return null //  if already accounted for in earlier part of surrogate pair, return null
    }
    return code
  }
  static charCodeBytes (charCode) {
    if (typeof charCode === 'number') {
      if (charCode < 128) {
        return 1
      }
      else if (charCode < 2048) {
        return 2
      }
      else if (charCode < 65536) {
        return 3
      }
      else if (charCode < 2097152) {
        return 4
      }
      else if (charCode < 67108864) {
        return 5
      }
      else {
        return 6
      }
    }
    else { return 0 } // null char code has 0 length
  }

  firstRange (inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    const range = inRange// unambigous cannot handle multiple??
    if (range.startContainer !== range.endContainer) { throw new Error('range must encapsulate one node only') }

    if (![Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(range.startContainer.nodeType)) {
      throw new Error('node must be a text node or similar for this to work currently.')
    }
    const newRange = new Range()
    const str = range.startContainer.nodeValue
    let byteLen = 0
    let foundStart = false
    for (let i = 0; i <= range.endOffset; i++) {
      if (!foundStart && byteLen >= this.start) {
        newRange.setStart(range.startContainer, i)
        foundStart = true
      }
      if (byteLen >= this.end) {
        newRange.setEnd(range.startContainer, i)
        return newRange
      }
      const charCode = DataPositionSelector.fixedCharCodeAt(str, i)
      byteLen += DataPositionSelector.charCodeBytes(charCode)
    }
    return null // if we didn't find anything return null
  }
  fromRange (range, inRange) {
    if (range.startContainer !== range.endContainer) { throw new Error('DataPositionSelector can only represent position in a single node currently') }
    if (![Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(range.startContainer.nodeType)) {
      throw new Error('node must be a text node or similar for this to work currently.')
    }
    // TODO: check if range in refiningRange.
    const str = range.startContainer.nodeValue
    let byteLen = 0
    for (let i = 0; i <= range.endOffset; i++) {
      if (i === range.startOffset) {
        this.start = byteLen
      }
      if (i === range.endOffset) {
        this.end = byteLen
        break
      }
      const charCode = DataPositionSelector.fixedCharCodeAt(str, i)
      byteLen += DataPositionSelector.charCodeBytes(charCode)
    }
    return this
  }
}

export default DataPositionSelector
