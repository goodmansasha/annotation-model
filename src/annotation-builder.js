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

import Annotation from './annotation'
import SpecificResource from './resources/specific-resource'
import RangeSelector from './selectors/range-selector'
import XPathSelector from './selectors/xpath-selector'
import DataPositionSelector from './selectors/data-position-selector'
import TextQuoteSelector from './selectors/text-quote-selector'
import TextPositionSelector from './selectors/text-position-selector'
import ExternalWebResource from './resources/external-web-resource'
import UUID from './uuid'

// the intention of the builder pattern is to find a solution to the telescoping constructor anti-pattern
class AnnotationBuilder {
  constructor () {
    this.result = new Annotation() // temp
    Object.defineProperty(this, 'uuid', { value: UUID.v4(), enumerable: false, writable: true })
    Object.defineProperty(this, 'url', { value: AnnotationBuilder.parseURL(window.location.href), enumerable: false, writable: true })
    return this
  }

  toJSON () {
    return JSON.stringify(this.result)
  }
  fromJSON (json) {
    this.result = JSON.parse(json, function (key, value) {
      if (value !== null && value.hasOwnProperty('type')) {
        switch (value.type) {
          case 'Annotation': return new Annotation(value)
          case 'SpecificResource': return new SpecificResource(value)
          case 'RangeSelector': return new RangeSelector(value)
          case 'XPathSelector': return new XPathSelector(value)
          case 'DataPositionSelector': return new DataPositionSelector(value)
          case 'TextQuoteSelector': return new TextQuoteSelector(value)
          case 'TextPositionSelector': return new TextPositionSelector(value)
          default: console.warn('mismatched type attribute in JSON reviver function')
        }
      }
      else {
        return this[key]
      }
    })
    return this
  }

  bookmark () {
    this.result.motivation = 'bookmarking'
    this.result.canonical = 'urn:uuid:' + this.uuid
    // might include fragment?
    this.result.target = new ExternalWebResource()
    this.result.target.id = this.url
    return this
  }

  highlight (selection) {
    if (typeof selection === 'undefined') {
      selection = document.getSelection()
    }
    if (selection.anchorNode === null || selection.isCollapsed) {
      throw new Error('user selection in document window is empty (indicating nothing pressed) or collapsed (indicating mere touch or press in window). In general might use scroll position to get a fragment selector, but not valid for highlighting motivation.')
    }
    else {
      const range = selection.getRangeAt(0)
      const rangeType = AnnotationBuilder.rangeType(range)
      // console.log(rangeType); // TEMP
      if (rangeType.includes(AnnotationBuilder.END_DOCUMENT_NODE())) {
        throw new Error('invalid end of range such as a brand new Range object collapsed at the start of the document root')
      }
      this.result.motivation = 'highlighting'
      this.result.canonical = 'urn:uuid:' + this.uuid

      const newTarget = new SpecificResource()
      newTarget.source = this.url
      newTarget.selector = []
      if (rangeType.includes(AnnotationBuilder.ONE_CONTAINER_NODE())) {
        const xpathSelector = new XPathSelector()
        if (rangeType.includes(AnnotationBuilder.START_SUBSTRING_DATA())) {
          xpathSelector.refinedBy = new DataPositionSelector()
        }
        xpathSelector.fromRange(range)
        newTarget.selector.push(xpathSelector)
      }
      else {
        const rangeSelector = new RangeSelector()
        rangeSelector.startSelector = new XPathSelector()
        rangeSelector.endSelector = new XPathSelector()
        if (rangeType.includes(AnnotationBuilder.START_SUBSTRING_DATA())) {
          rangeSelector.startSelector.refinedBy = new DataPositionSelector()
        }
        if (rangeType.includes(AnnotationBuilder.END_SUBSTRING_DATA()) || rangeType.includes(AnnotationBuilder.END_CHARACTER_NODE())) {
          rangeSelector.endSelector.refinedBy = new DataPositionSelector()
        }
        rangeSelector.fromRange(range)
        newTarget.selector.push(rangeSelector)
      }

      const textQuoteSelector = new TextQuoteSelector().fromRange(range)
      newTarget.selector.push(textQuoteSelector)
      newTarget.selector.push(textQuoteSelector.toTextPositionSelector())

      this.result.target = newTarget
    }
    return this
  }

  static START_DOCUMENT_NODE () { return 1 }
  static START_ELEMENT_NODE () { return 2 }
  static START_CHARACTER_NODE () { return 3 } // might just use 'node' since distinction between element node not needed??
  static START_SUBSTRING_DATA () { return 4 }
  static END_DOCUMENT_NODE () { return 5 }
  static END_ELEMENT_NODE () { return 6 }
  static END_CHARACTER_NODE () { return 7 } // difference between element and character node not needed for xpath selector. always get substring in range when there is character node, because ranges end on last node start..
  static END_SUBSTRING_DATA () { return 8 }
  static ONE_CONTAINER_NODE () { return 9 }
  static COLLAPSED () { return 10 } // might ignore this one, since it is irrelevant for data range selector

  static rangeType (range) {
    const result = []
    if (range.startContainer.nodeType === Node.DOCUMENT_NODE) { result.push(AnnotationBuilder.START_DOCUMENT_NODE()) }
    if (range.endContainer.nodeType === Node.DOCUMENT_NODE) { result.push(AnnotationBuilder.END_DOCUMENT_NODE()) }
    if (range.startContainer.nodeType === Node.ELEMENT_NODE) { result.push(AnnotationBuilder.START_ELEMENT_NODE()) }
    if (range.endContainer.nodeType === Node.ELEMENT_NODE) { result.push(AnnotationBuilder.END_ELEMENT_NODE()) }
    if ([Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(range.startContainer.nodeType)) {
      const length = range.startContainer.nodeValue.length
      if (range.startContainer === range.endContainer) {
        result.push(AnnotationBuilder.ONE_CONTAINER_NODE())
        if (range.startOffset === range.endOffset) {
          result.push(AnnotationBuilder.COLLAPSED())
        }
        else if (range.startOffset === 0 && range.endOffset === length) {
          result.push(AnnotationBuilder.START_CHARACTER_NODE())
        }
        else {
          result.push(AnnotationBuilder.START_SUBSTRING_DATA())
        }
      }
      else {
        if (range.startOffset === 0) {
          result.push(AnnotationBuilder.START_CHARACTER_NODE())
        }
        else {
          result.push(AnnotationBuilder.START_SUBSTRING_DATA())
        }
      }
    }
    if ([Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(range.endContainer.nodeType)) {
      const length = range.endContainer.nodeValue.length
      if (range.startContainer === range.endContainer) {
        // TECHNICALLY REDUNDANT INFO, but including anyhow
        if (range.startOffset === 0 && range.endOffset === length) {
          result.push(AnnotationBuilder.END_CHARACTER_NODE())
        }
        else {
          result.push(AnnotationBuilder.END_SUBSTRING_DATA())
        }
      }
      else {
        if (range.endOffset === length) {
          result.push(AnnotationBuilder.END_CHARACTER_NODE())
        }
        else {
          result.push(AnnotationBuilder.END_SUBSTRING_DATA())
        }
      }
    }
    return result
  }
  static parseURL (path) {
    // any relative URL references are resolved to their absolute form
    // https://www.ietf.org/rfc/rfc3987.txt https://url.spec.whatwg.org/#concept-basic-url-parser
    const parser = document.createElement('a')
    parser.href = path
    if (parser.protocol.toLowerCase() === 'javascript:') { console.warn('supplied URL path is javascript and could be mallicious.'); return null }
    return parser.protocol + '//' + parser.host + parser.pathname + parser.search + parser.hash
  }
}

export default AnnotationBuilder
