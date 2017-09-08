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

class Annotation {
  constructor (object = {id: null, target: null}) { // uuid can also apply to Body and Target.
    this['@context'] = 'http://www.w3.org/ns/anno.jsonld'
    this.type = 'Annotation'
    this.id = object.id // An Annotation must have exactly 1 URL that identifies it.
    this.target = object.target // There must be 1 or more target relationships associated with an Annotation
    if (typeof object.motivation !== 'undefined') { this.motivation = object.motivation }
    if (typeof object.canonical !== 'undefined') { this.canonical = object.canonical }
    if (typeof object.bodyValue !== 'undefined') { this.bodyValue = object.bodyValue }
    if (typeof object.body !== 'undefined') { this.body = object.body }

    return this
  }
}

export default Annotation
