# annotation-model
A very lightweight JavaScript implementation of the W3C Web Annotation Data Model, most useful for Web Extensions and serializing references on HTML pages.

One of the project leaders of the Apache Annotator project (https://annotator.apache.org/ ) called this project "awesome" for capturing annotations, and has contributed. Both projects depend on the same interchangeable W3C recommended JSON data format. If your use is limited to annotations on relatively static content (e.g. the Internet Archive and not a news site), this project is a good starting point.  In the future, the Apache project will make annotations more durable by implementing an ambitious time-tested method to revive  annotations on ever-changing content, with graceful failures. 

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

As of the current version 0.3.0, the following classes are implemented:

* Annotation
* SpecificResource
* RangeSelector
* XPathSelector  (generates a minimal unique XPath)
* DataPositionSelector
* TextQuoteSelector
* TextPositionSelector

# Design Notes

As defined in the W3C specification, selectors refine one another. So, if a class has a 'refinedBy' property with a Selector there, that refining Selector will only select inside its parent. For example, text positions are relative to the start of the parent selector's text in the overall document. 

A builder pattern is used to produce annotations with just a few internal steps. This main builder class, "AnnotationBuilder", keeps the constructor simple. For example, "AnnotationBuilder().highlight()" will assume the current user Selection as the default input, while "AnnotationBuilder().fromJSON(json)" will take a serialized annotation in the W3C format and create a javascript Selector object of it in the "result" slot, which in turn has some convenience methods like "target.toSelection()".  

Internally, Selector classes do most of the work. There are two core methods: one for converting a given HTML Range into the serialized Selector and the other for reviving that serialized Selector into a javascript Range (the method is 'firstRange'). HTML Ranges are the basic building blocks because they can represent several other commonly used parts of a web page: HTML Document Fragments, Nodes, and Boundary Points. Even various plaintext formats (e.g .csv or .tsv) can be selected using Ranges in a browser because that plaintext file is always *rendered* in a 'pre' element in a minimal HMTL page in a modern browser. Check the devtools and you will see. HTML Ranges are therefore super useful. 

There is also an 'index.html' demo file that acts as an obstacle course for these selectors and provides the output Web Annotation Data Model in a textarea for easy copy and paste. A good way to contribute would be to make a simple test suite.
