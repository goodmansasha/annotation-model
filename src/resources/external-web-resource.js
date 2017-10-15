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

class ExternalWebResource {
  constructor (object = {id: null}) {
    this.type = 'ExternalWebResource'
    this.id = object.id
    if (typeof object.purpose !== 'undefined') { this.purpose = object.purpose }
    return this
  }
  // can be refinedBy fragment selector, so same segment interface I guess.
  // not sure why I'm putting these here, to be honest this needs other methods to deal with WebResource like url parsing.
  toRange () {
    if (this.source !== AnnotationBuilder.parseURL(window.location.href)) {
      throw new Error('currently does not support getting range on other than current page. should add code to navigate to page or otherwise return null (but trying the first option before throwing null is best)')
    }
    const webResourceRange = new Range()
    webResourceRange.selectNode(document.documentElement)
    return webResourceRange
  }
  toSelection () {
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(this.toRange()) // TODO, funciton to get 'most popular' range.
    return this
  }
}

export default ExternalWebResource
