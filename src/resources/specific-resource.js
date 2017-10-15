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

import AnnotationBuilder from '../annotation-builder'

class SpecificResource {
  constructor (object = {source: null, selector: null}) {
    this.type = 'SpecificResource'
    this.source = String(object.source)
    if (typeof object.id !== 'undefined') { this.id = object.id }
    if (typeof object.selector !== 'undefined') { this.selector = object.selector }
    return this
  }
  firstRange () {
    if (this.source !== AnnotationBuilder.parseURL(window.location.href)) {
      throw new Error('currently does not support selecting on other than current page. should add code to navigate to page or otherwise return null (but trying the first option before throwing null is best)')
    }
    // webResourceRange represents ALL of a "Web Resource": A Resource that must be identified by an URL, as described in the Web Architecture [webarch]. Web Resources may be dereferencable via their URL.
    const webResourceRange = new Range(); webResourceRange.selectNode(document.documentElement)
    if (typeof this.selector === 'undefined') {
      return webResourceRange
    }
    else {
      if (Array.isArray(this.selector)) {
        for (let i = 0; i < this.selector.length; i++) {
          const range = this.selector[i].toRange(webResourceRange)
          if (range !== null) { return range }
        }
      }
      else {
        const range = this.selector.toRange(webResourceRange)
        if (range !== null) { return range }
      }
    }
    return null // if failed, return nothing
  }

  toRange () {
    return this.firstRange()
  }

  toSelection (scroll = false) {
    const selection = window.getSelection()
    selection.removeAllRanges()
    const range = this.toRange()
    selection.addRange(this.toRange()) // TODO, function to get 'most popular' range.
    if (scroll) {
      const absolutePosition = Math.round(window.scrollY + range.getBoundingClientRect().top)
      const windowBottom = Math.round(window.scrollY + window.innerHeight)
      const windowTop = Math.round(window.scrollY)
      if (absolutePosition > windowBottom || absolutePosition < windowTop) {
        window.scroll(0, absolutePosition) // TODO: breaks in fixed position div. make sure to get correct fixed div location.
      }
    }
    return this
  }
}

export default SpecificResource
