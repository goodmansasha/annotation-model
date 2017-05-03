# annotation-model
Javascript implementation of the W3C Web Annotation Data Model, probably most useful for Web Extensions and serializing references to specific resources on a HTML page

The specification: 
https://www.w3.org/TR/annotation-model/

# Usage
~~~~
var ab = new AnnotationBuilder().highlight(); //takes current user selection and builds an Annotation
var json = ab.toJSON(); // exports serialized version to JSON-LD 
console.log(json); //dumps serialized version to developer consooe
var ab2 = new AnnotationBuilder().fromJSON(json); //revives serialized version 
ab2.result.target.toSelection(); //highlights the original selection 
~~~~

# Status

As of the current version 0.1.0, the following classes are implemented:

* Annotation
* SpecificResource
* RangeSelector
* XPathSelector
* DataPositionSelector (for Text, including Unicode with surrogate pairs)  

The following is partially implemented:

* TextQuoteSelector (de-serialization is not yet implemented but can be achieved with some straightforward work)

# Design Notes

The selectors all extend the 'Segment Selector' class and require writing just two methods currently: one for representing an HTML Range object called 'fromRange' and the other for reviving a range called 'firstRange'. HTML Ranges were chosen as a fundamental building block because they conveniently represent Document Fragments, Nodes, and Boundary Points. 

The 'Segment Selector' class further assumes that ranges refine one another, as defined in the W3C specification.

There are a few ways to implement TextQuoteSelector, and things get very difficult quickly if the wrong approach is taken. Ideally, this selector should reference text without destroying whitespace information found in whitespace preserving areas such as the 'pre' element or any element with CSS styles preserving whitespace. By 'normalizing' text using the HTML innerText standard (*instead of* something like XPath 'normalize-space'), meaningful whitespace is preserved. This is necessary for preserving leading and trailing whitespace in computer code that utilizes tabs and line breaks, such as Python or tab seperated value tables, and also aesthetically important for prose and poetry.

