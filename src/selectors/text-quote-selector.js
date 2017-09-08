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

import TextPositionSelector from './text-position-selector'

class TextQuoteSelector extends TextPositionSelector {
  constructor (object = {exact: null, prefix: null, suffix: null}) {
    super()
    this.type = 'TextQuoteSelector'
    this.exact = object.exact
    this.suffix = object.suffix
    this.prefix = object.prefix
    Object.defineProperty(this, 'start', { value: this.start, enumerable: false, writable: true })
    Object.defineProperty(this, 'end', { value: this.end, enumerable: false, writable: true })
    Object.defineProperty(this, 'epsilon', { value: 32, enumerable: false, writable: true })
  }

  fromRange (range, inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    super.fromRange(range, inRange)
    const textContent = inRange.toString()

    this.exact = textContent.substring(this.start, this.end)
    this.prefix = textContent.substring(Math.max(this.start - this.epsilon, 0), this.start)
    this.suffix = textContent.substring(this.end, Math.min(this.end + this.epsilon, textContent.length))
    return this
  }

  firstRange (inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    const textContent = inRange.toString()
    const fullMatchStart = textContent.indexOf(this.prefix + this.exact + this.suffix)
    if (fullMatchStart !== -1) {
      this.start = fullMatchStart + this.prefix.length
      this.end = this.start + this.exact.length
    }
    else {
      console.warn('TextQuoteSelector did not find a string match. returning null. try prefix/suffix and maybe string distance on those?')
      return null
    }
    return super.firstRange(inRange)
  }

  toTextPositionSelector () {
    return new TextPositionSelector({start: this.start, end: this.end})
  }
}

export default TextQuoteSelector
