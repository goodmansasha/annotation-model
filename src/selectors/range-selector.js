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

class RangeSelector extends SegmentSelector {
  constructor (object = {startSelector: new SegmentSelector(), endSelector: new SegmentSelector()}) {
    super()
    this.type = 'RangeSelector'
    this.startSelector = object.startSelector // can check they are type of segment selector
    this.endSelector = object.endSelector
    return this
  }
  firstRange (inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    const start = this.startSelector.toRange(inRange) // will revive refinedBy given  parent.
    const end = this.endSelector.toRange(inRange) // will revive these
    const range = new Range()
    range.setStart(start.startContainer, start.startOffset)
    range.setEnd(end.startContainer, end.startOffset)
    return range
  }
  fromRange (range, inRange) {
    if (typeof inRange === 'undefined') { inRange = new Range(); inRange.selectNode(document.documentElement) }
    const start = new Range() // will be a POINT
    start.setStart(range.startContainer, range.startOffset)
    start.setEnd(range.startContainer, range.startOffset)
    this.startSelector.fromRange(start, inRange)
    const end = new Range() // will be a POINT if a text node.
    end.setStart(range.endContainer, range.endOffset)
    end.setEnd(range.endContainer, range.endOffset)
    this.endSelector.fromRange(end, inRange)
    return this
  }
}

export default RangeSelector
