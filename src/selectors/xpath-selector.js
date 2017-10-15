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

class XPathSelector extends SegmentSelector {
  constructor (object = {value: null}) {
    super()
    this.type = 'XPathSelector'
    this.value = object.value
    if (typeof object.refinedBy !== 'undefined') { this.refinedBy = object.refinedBy }
    return this
  }
  firstRange (inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    const query = document.evaluate(this.value, inRange.commonAncestorContainer, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)
    const nodes = [] // could use weakmap to prevent memory leaks? but we are creating ranges, which are robust to changes (?)
    let node
    while ((node = query.iterateNext())) {
      if (node === inRange.startContainer) { nodes.push(node) }
      else if (node === inRange.endContainer) { nodes.push(node); break }
      else if (inRange.comparePoint(node, 0) === 0) { nodes.push(node) }
    }
    if (nodes.length === 0) {
      throw new Error('could not use xpath to find one element in a particular refinedRange. did page change? not a huge issue, might have better contintencies.')
    }
    for (let i = 0; i < nodes.length; i++) {
      const range = new Range()
      if ([Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(nodes[i].nodeType)) {
        range.setStart(nodes[i], 0)
        range.setEnd(nodes[i], nodes[i].nodeValue.length)
      }
      else {
        range.selectNode(nodes[i])
      }
      return range
    }
    return null // couldnt' find anything
  }
  fromRange (range, inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    if (range.startContainer !== range.endContainer) { throw new Error('XPath selector can currently only encapsulate a single node, and a range that spans nodes was provided') }
    let node
    if ([Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(range.startContainer.nodeType)) {
      node = range.startContainer
    }
    else {
      node = range.startContainer.childNodes[range.startOffset] // https://dom.spec.whatwg.org/#concept-node-length //will not need refinement
    }
    const locationPath = []
    const SEMANTIC_ATTRIBUTES = ['id', 'role', 'name', 'itemid', 'itemtype', 'itemprop'] // first one must be id.
    const SECTION_ELEMENTS = ['address', 'article', 'aside', 'footer', 'h1', 'header', 'hgroup', 'nav', 'section', 'main', 'body']
    let hasId = false
    let hasSection = false
    let duplicate = true
    while (duplicate) {
      const step = {}
      step.NodeTest = '*'
      step.AttributePredicate = {}
      step.PositionPredicate = null
      if (node.nodeType === 3) {
        step.NodeTest = 'text()' // can include some text to improve, text()=' '
      }
      else if (node.nodeType === 9) {
        // console.log("at document root level, will return absolute path instead!")
        step.NodeTest = ''
        if (this._setUniqueXpath(this._compileXpath('/', step, locationPath), inRange)) { duplicate = false; break }
        console.warn('did not find a unique xpath for node, even at root level, so there must be an error in the xpath generator code!')
        return this
      }
      else {
        for (let i in SEMANTIC_ATTRIBUTES) {
          // if(!iterate){break;}
          // hasSemantic = true;
          const attribute = SEMANTIC_ATTRIBUTES[i]
          if (node.hasAttribute(attribute)) {
            if (i === 0) { hasId = true }
            step.AttributePredicate[attribute] = node.getAttribute(attribute) // check for javascript??
            if ((hasSection | hasId) && this._setUniqueXpath(this._compileXpath('//', step, locationPath), inRange)) { duplicate = false; break }
          }
          if (i === 0) { // second thing to check after 'id' is if the node name is unique in the document. seems a bit fragile, but not brittle.
            step.NodeTest = node.nodeName.toLowerCase()
            if (SECTION_ELEMENTS.includes(step.NodeTest)) { hasSection = true }
            if ((hasSection | hasId) && this._setUniqueXpath(this._compileXpath('//', step, locationPath), inRange)) { duplicate = false; break }
          }
        }
      } // end element processing vs textnode processing
      step.PositionPredicate = this._nodePosition(step, node)
      if (locationPath.length > 0) {
        if ((hasSection | hasId) && this._setUniqueXpath(this._compileXpath('//', step, locationPath), inRange)) { duplicate = false; break }
      }
      locationPath.unshift(this._compileXpath('', step))
      node = node.parentNode
    } // end while loop on xpath creation
    if (typeof this.refinedBy !== 'undefined') {
      this.refinedBy.fromRange(range)
    }
    return this
  }
  // need to check ALL results to check if selector really unique within the inRange
  _setUniqueXpath (xpath, inRange) {
    if (document.evaluate('count(' + xpath + ')', inRange.commonAncestorContainer, null, XPathResult.NUMBER_TYPE, null).numberValue === 1) {
      this.value = xpath // NOTE: SETS IT!!
      return true
    }
    else {
      return false
    }
  }

  _nodePosition (step, node) {
    const xpath = this._compileXpath('', step)
    const simset = document.evaluate(xpath, node.parentNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
    if (simset.snapshotLength > 1) {
      for (let i = 0; i < simset.snapshotLength; i++) {
        if (simset.snapshotItem(i) === node) {
          return i + 1
        }
      }
    }
    else if (simset.snapshotLength === 1) { // if there is only 1, then no reason to use.
      return null
    }
    throw new Error('error in _nodePosition. Could the node have been removed?')
  }

  _compileXpath (axis = '//', step, locationPath) {
    let xpath = ''
    xpath = xpath + step.NodeTest
    if (Object.keys(step.AttributePredicate).length > 0) {
      const keys = Object.keys(step.AttributePredicate)
      const expr = []
      for (let i = 0; i < keys.length; i++) { // @ abbreviated attribute::
        expr.push('@' + keys[i] + '="' + step.AttributePredicate[keys[i]] + '"')
      }
      xpath = xpath + '[' + expr.join(' and ') + ']'
    }
    if (step.PositionPredicate !== null) {
      xpath = xpath + '[' + step.PositionPredicate + ']' // abbreviated syntax
    }
    if (typeof locationPath !== 'undefined' && locationPath.length > 0) {
      xpath = xpath + '/' + locationPath.join('/')
    }
    xpath = axis + xpath
    return xpath
  }
}

export default XPathSelector
