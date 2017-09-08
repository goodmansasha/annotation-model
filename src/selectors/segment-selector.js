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

class SegmentSelector {
  constructor () {
    return this
  }
  fromRange (range, inRange) { Object.defineProperty(this, 'tmp', { value: null, enumerable: false, writable: true }); this.tmp = range }
  firstRange (inRange) { return this.tmp } // matches any match, in document order
  toRange (inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    const thisRange = this.firstRange(inRange)
    if (thisRange === null) { console.warn('selector did not find any results. Return null and aborting further refinement so upstream selectors know to move on and try possible alternatives.'); return null }
    if (typeof this.refinedBy !== 'undefined') {
      if (Array.isArray(this.refinedBy)) {
        for (let i = 0; i < this.refinedBy.length; i++) {
          const refinedRange = this.refinedBy[i].toRange(thisRange)
          if (refinedRange !== null) { return refinedRange }
        }
      }
      else {
        const refinedRange = this.refinedBy.toRange(thisRange)
        if (refinedRange !== null) { return refinedRange }
      }
    }
    else {
      return thisRange
    }
  }
  toSelection (scroll = false) {
    const selection = window.getSelection()
    selection.removeAllRanges()
    const range = this.toRange()
    selection.addRange(range) // TODO: function to get 'most popular' range.

    if (scroll) {
      const absolutePosition = Math.round(window.scrollY + range.getBoundingClientRect().top)
      const windowBottom = Math.round(window.scrollY + window.innerHeight)
      const windowTop = Math.round(window.scrollY)
      if (absolutePosition > windowBottom || absolutePosition < windowTop) {
        window.scroll(0, absolutePosition) // TODO: breaks in fixed position div. make sure to get correct fixed div location..
      }
    }
    return this
  }
  fromSelection (selection = document.getSelection()) {
    if (selection.anchorNode === null) {
      throw new Error('user selection in document window is empty. There is no anchorNode indicating its even starting.')
    }
    this.fromRange(selection.getRangeAt(0))
    return this
  }
}

export default SegmentSelector
