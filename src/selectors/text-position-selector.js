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

class TextPositionSelector extends SegmentSelector {
  constructor (object = {start: null, end: null}) {
    super()
    this.type = 'TextPositionSelector'
    this.start = object.start
    this.end = object.end
  }

  _textNodeIterator (inRange) {
    let commonAncestorContainer = inRange.commonAncestorContainer
    // console.log(commonAncestorContainer)
    if (commonAncestorContainer.nodeType === Node.TEXT_NODE) {
      commonAncestorContainer = commonAncestorContainer.parentElement
    }
    else if (commonAncestorContainer.nodeType === Node.DOCUMENT_NODE) {
      commonAncestorContainer = document.documentElement
    }
    return document.createNodeIterator(commonAncestorContainer, NodeFilter.SHOW_TEXT, { acceptNode: function (node) {
      if (node === inRange.startContainer || node === inRange.endContainer || inRange.comparePoint(node, 0) === 0) {
        return NodeFilter.FILTER_ACCEPT
      }
    } })
  }

  fromRange (range, inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    const nodeIterator = this._textNodeIterator(inRange)
    let commonAncestorContainerCount = 0
    let inRangeStart = null
    let inRangeEnd = null
    let rangeStart = null
    let rangeEnd = null
    let node
    while ((node = nodeIterator.nextNode())) {
      const nodeValueLength = node.nodeValue.length
      if (inRangeStart === null) {
        if (node === inRange.startContainer) {
          inRangeStart = commonAncestorContainerCount + inRange.startOffset
        }
        else if (inRange.comparePoint(node, 0) === 0) {
          inRangeStart = commonAncestorContainerCount
        }
      }
      if (inRangeEnd === null) {
        if (node === inRange.endContainer) {
          inRangeEnd = commonAncestorContainerCount + inRange.endOffset
        }
      }
      if (inRangeStart !== null && rangeStart === null) {
        if (node === range.startContainer) {
          rangeStart = commonAncestorContainerCount - inRangeStart + range.startOffset
        }
        else if (range.comparePoint(node, 0) === 0) {
          rangeStart = commonAncestorContainerCount - inRangeStart
        }
      }
      if (inRangeStart !== null && rangeEnd === null) {
        if (node === range.endContainer) {
          rangeEnd = commonAncestorContainerCount - inRangeStart + range.endOffset
        }
        else if (range.comparePoint(node, 0) === 1) {
          rangeEnd = commonAncestorContainerCount - inRangeStart
        }
      }
      if (rangeStart !== null && rangeEnd !== null) {
        this.start = rangeStart
        this.end = rangeEnd
        break
      }
      commonAncestorContainerCount = commonAncestorContainerCount + nodeValueLength
    }
    return this
  }
  firstRange (inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    const nodeIterator = this._textNodeIterator(inRange)
    const exactMatchStart = this.start
    const exactMatchEnd = this.end

    let commonAncestorContainerCount = 0
    let inRangeStart = null
    let inRangeEnd = null
    let rangeStartContainer = null
    let rangeStartOffset = null
    let rangeEndContainer = null
    let rangeEndOffset = null

    let node
    while ((node = nodeIterator.nextNode())) {
      const nodeValueLength = node.nodeValue.length
      if (inRangeStart === null) {
        if (node === inRange.startContainer) {
          inRangeStart = commonAncestorContainerCount + inRange.startOffset
        }
        else if (inRange.comparePoint(node, 0) === 0) {
          inRangeStart = commonAncestorContainerCount
        }
      }
      if (inRangeEnd === null) {
        if (node === inRange.endContainer) {
          inRangeEnd = commonAncestorContainerCount + inRange.endOffset
        }
      }
      if (inRangeStart !== null && rangeStartContainer === null) {
        if (commonAncestorContainerCount + nodeValueLength >= exactMatchStart + inRangeStart && commonAncestorContainerCount < exactMatchStart + inRangeStart) {
          rangeStartContainer = node
          rangeStartOffset = exactMatchStart + inRangeStart - commonAncestorContainerCount
        }
      }
      if (inRangeStart !== null && rangeEndContainer === null) {
        if (commonAncestorContainerCount + nodeValueLength >= exactMatchEnd + inRangeStart && commonAncestorContainerCount < exactMatchEnd + inRangeStart) {
          // TODO: check if in range.
          rangeEndContainer = node
          rangeEndOffset = exactMatchEnd + inRangeStart - commonAncestorContainerCount
        }
      }
      if (rangeStartContainer !== null && rangeEndContainer !== null) { break }
      commonAncestorContainerCount = commonAncestorContainerCount + nodeValueLength
    }
    const range = new Range()
    range.setStart(rangeStartContainer, rangeStartOffset)
    range.setEnd(rangeEndContainer, rangeEndOffset)
    return range
  }
}

export default TextPositionSelector
