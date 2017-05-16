# annotation-model
JavaScript implementation of the W3C Web Annotation Data Model, probably most useful for Web Extensions and serializing references to specific resources on a HTML page.

The specification: 
https://www.w3.org/TR/annotation-model/

A demo: 
https://predict-r.github.io/annotation-model/

# Usage

```js
var ab = new AnnotationBuilder().highlight(); //takes current user selection and builds an Annotation
var json = ab.toJSON(); // exports serialized version to JSON-LD 
console.log(json); //dumps serialized version to developer console
var ab2 = new AnnotationBuilder().fromJSON(json); //revives serialized version 
ab2.result.target.toSelection(); //highlights the original selection 
```

# Status

As of the current version 0.2.1, the following classes are implemented:

* Annotation
* SpecificResource
* RangeSelector
* XPathSelector  (generates a minimal unique XPath)
* DataPositionSelector
* TextQuoteSelector
* TextPositionSelector

# Design Notes

Selectors can refine one another, as defined in the W3C specification. So, if a class has a 'refinedBy' property with a Selector there, that refining Selector will only select inside its parent. For example, text positions are relative to the start of the parent selector's text in the overall document.

For Selectors, most of of hard work is done in just two methods: one for converting an HTML Range into the selector and the other for reviving the selector into a range (called 'firstRange'). HTML Ranges are the fundamental building blocks because they represent several specific parts of a web page: HTML Document Fragments, Nodes, and Boundary Points. Even various plaintext formats (e.g .csv or .tsv) can be selected using Ranges in a browser because that plaintext file is always *rendered* in a 'pre' element in a minimal HMTL page in a modern browser. Check the devtools and you will see. HTML Ranges are therefore super useful.

There is also an 'index.html' file that acts as an obstacle course for these selectors and provides the output Web Annotation Data Model in a textarea (for easy copy and paste).

It would be better to have it change dynamically and create a test suite.
