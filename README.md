# annotation-model
A very lightweight JavaScript implementation of the W3C Web Annotation Data Model, most useful for Web Extensions and serializing references on HTML pages.

One of the project leaders of the Apache Annotator project (https://annotator.apache.org/ ) called this project "awesome" for capturing annotations, and has contributed. In the end, both projects depend on the same interchangeable W3C recommended JSON data format. If your use case is limited to reviving annotations on relatively static content for now (e.g. the Internet Archive and not a news site), this project is a good starting point.  In the future, that Apache project should make annotations more durable by implementing an ambitious and time-tested method to revive serialized annotations on ever-changing web pages, with graceful failures. 

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

As of the current version 0.2.2, the following classes are implemented:

* Annotation
* SpecificResource
* RangeSelector
* XPathSelector  (generates a minimal unique XPath)
* DataPositionSelector
* TextQuoteSelector
* TextPositionSelector

# Design Notes

As defined in the W3C specification, selectors refine one another. So, if a class has a 'refinedBy' property with a Selector there, that refining Selector will only select inside its parent. For example, text positions are relative to the start of the parent selector's text in the overall document. 

For Selectors, most of of hard work is done in just two methods: one for converting an HTML Range into the selector and the other for reviving the selector into a range (called 'firstRange'). HTML Ranges are the fundamental building blocks because they represent several specific parts of a web page: HTML Document Fragments, Nodes, and Boundary Points. Even various plaintext formats (e.g .csv or .tsv) can be selected using Ranges in a browser because that plaintext file is always *rendered* in a 'pre' element in a minimal HMTL page in a modern browser. Check the devtools and you will see. HTML Ranges are therefore super useful. 

There is also an 'index.html' file that acts as an obstacle course for these selectors and provides the output Web Annotation Data Model in a textarea (for easy copy and paste). It would be better to have this obstacle course change dynamically and have an accompanying test suite.
