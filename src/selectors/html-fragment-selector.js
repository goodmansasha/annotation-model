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

class HTMLFragmentSelector extends SegmentSelector {
  constructor (object = {value: null}) {
    super()
    this.type = 'FragmentSelector'
    this.value = object.value
    this.conformsTo = 'http://tools.ietf.org/rfc/rfc3236'
    Object.defineProperty(this, 'epsilon', { value: 100, enumerable: false, writable: true })
  }
  fromRange (range, inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    const treeWalker = document.createTreeWalker(inRange.commonAncestorContainer, NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT)
    let lastNamed = null
    let node
    while ((node = treeWalker.nextNode())) {
      // can check if inRange of acceptable
      if (node.nodeType === 1 && node.hasAttribute('id')) {
        lastNamed = node
      }
      if (node === range.startContainer || node === range.endContainer || range.comparePoint(node, 0) === 0) {
        if (lastNamed !== null) { // TODO: check if lastNamed is within epsilon pixels from this, or else reject?
          const lastNamePosition = Math.round(lastNamed.getBoundingClientRect().top + window.scrollY)
          const rangePosition = Math.round(range.getBoundingClientRect().top + window.scrollY)
          if (Math.abs(lastNamePosition - rangePosition) < 200) {
            this.value = lastNamed.getAttribute('id')
            return this
          }
        }
      }
    }
    console.warn('could not find a named attribute within 100 pixes of range boundary .')
    return this
  }

  firstRange (inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    if (this.value === null) { return null }
    const element = document.getElementById(this.value)
    if (inRange.intersectsNode(element)) {
      const range = new Range()
      range.selectNode(element) // TODO: in the HTML case, we actually want to select a POINT at the start of the node and ending immediately after
      return range
    }
    return null
  }
}

export default HTMLFragmentSelector
