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

class SegmentSelector{
        constructor(){ 
            return this; 
        }
        fromRange(range, inRange){  Object.defineProperty(this, 'tmp', { value: null, enumerable: false, writable:true }); this.tmp = range; }
        firstRange(inRange){ return this.tmp; } //matches any match, in document order
        toRange(inRange){
            if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
             var thisRange = this.firstRange(inRange); 
             if(thisRange==null){ console.warn('selector did not find any results. Return null and aborting further refinement so upstream selectors know to move on and try possible alternatives.'); return null; }
             if(typeof this.refinedBy !='undefined'){ 
                        if(Array.isArray(this.refinedBy)){
                            for(var i = 0; i < this.refinedBy.length; i++){
                                    var refinedRange = this.refinedBy[i].toRange(thisRange); 
                                    if(refinedRange != null) {return refinedRange ;}
                                }
                        } else {  
                                var refinedRange = this.refinedBy.toRange(thisRange);    
                                if(refinedRange != null) {return refinedRange ;}
                        }  
                    } else {
                       return thisRange
                    }
        }
        toSelection(scroll=false){
                    var selection = window.getSelection();
                    selection.removeAllRanges();
                    var range = this.toRange();
                    selection.addRange(range); //TODO, funciton to get 'most popular' range.

                    if(scroll){
                         var absolutePosition = Math.round(window.scrollY+ range.getBoundingClientRect().top);
                        var windowBottom = Math.round(window.scrollY + window.innerHeight);
                        var windowTop = Math.round(window.scrollY);
                        if(absolutePosition > windowBottom | absolutePosition < windowTop){
                            window.scroll(0, absolutePosition); //TODO: breaks in fixed position div. make sure to get correct fixed div locaction..
                        }  
                }
            return this;
        }
        fromSelection(selection= document.getSelection()){
            if(selection.anchorNode==null){
                throw 'user selection in document window is empty. There is no anchorNode indicating its even starting.';
            }
            this.fromRange(selection.getRangeAt(0)); 
            return this;
        }
}

class RangeSelector extends SegmentSelector{
    constructor(object={startSelector:new SegmentSelector(),endSelector:new SegmentSelector()}){
        super();
        this.type = 'RangeSelector';
        this.startSelector = object.startSelector; //can check they are type of segment selector
        this.endSelector = object.endSelector;
        return this;
    }
    firstRange(inRange){
         if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
            var revived = [];
            var start= this.startSelector.toRange(inRange); //will revive refinedBy given  parent.
            var end = this.endSelector.toRange(inRange); // will revive these
            var range = new Range();
            range.setStart(start.startContainer,start.startOffset);
            range.setEnd(end.startContainer, end.startOffset);
            return range;     
    }
    fromRange(range, inRange){
         if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
                var start = new Range(); //will be a POINT
                start.setStart(range.startContainer, range.startOffset);
                start.setEnd(range.startContainer, range.startOffset);
                this.startSelector.fromRange(start,inRange);
                var end = new Range();//will be a POINT if a text node.
                end.setStart(range.endContainer, range.endOffset);
                end.setEnd(range.endContainer, range.endOffset);  
                this.endSelector.fromRange(end,inRange);
            return this;
    }
}

class XPathSelector extends SegmentSelector{
    constructor(object={value:null}){
        super();
        this.type = 'XPathSelector';
        this.value = object.value;
        if(typeof object.refinedBy !='undefined'){  this.refinedBy = object.refinedBy; }
        return this; 
    }
    firstRange(inRange){
         if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
                    var revived = [];
                    var query = document.evaluate(this.value, inRange.commonAncestorContainer, null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);
                    var node;
                    var nodes=[]; //could use weakmap to prevent memory leaks? but we are creating ranges, which are robust to changes (?)
                    while(node=query.iterateNext()){
                        if(node==inRange.startContainer){ nodes.push(node); }
                        else if(node==inRange.endContainer) {nodes.push(node); break;}
                        else if(inRange.comparePoint(node,0)==0){ nodes.push(node); }
                    }
                    if(nodes.length == 0) {
                        throw 'could not use xpath to find one element in a particular refinedRange. did page change? not a huge issue, might have better contintencies.';
                    }
                   // console.log(nodes);
                    for(var i = 0; i< nodes.length; i++){
                        var range = new Range();
                        if([Node.TEXT_NODE,Node.PROCESSING_INSTRUCTION_NODE,Node.COMMENT_NODE].includes(nodes[i].nodeType)){
                            range.setStart(nodes[i],0);
                            range.setEnd(nodes[i],nodes[i].nodeValue.length);
                        } else {
                            range.selectNode(nodes[i]); 
                        }
                         return range;
                    }
                return null; //couldnt' find anything
        }  
        fromRange(range, inRange){
        if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
        if(range.startContainer!=range.endContainer) {throw 'XPath selector can currently only encapsulate a single node, and a range that spans nodes was provided'}
                var node;
                if([Node.TEXT_NODE,Node.PROCESSING_INSTRUCTION_NODE,Node.COMMENT_NODE].includes(range.startContainer.nodeType)){
                    node = range.startContainer;   
                } else {
                    node = range.startContainer.childNodes[range.startOffset]; //https://dom.spec.whatwg.org/#concept-node-length //will not need refinement
                }
                var locationPath = [];
                var hasId = false;
                var SEMANTIC_ATTRIBUTES = ['id','role','name','itemid','itemtype','itemprop']; //first one must be id.
                var SECTION_ELEMENTS = ['address','article','aside','footer','h1','header','hgroup','nav','section','main','body'];
                var hasSection = false;
                var duplicate = true;
                findUniquePath:
                while(duplicate){ 
                    var step= {};
                    step.NodeTest = '*';  
                    step.AttributePredicate ={};
                    step.PositionPredicate = null;
                        if (node.nodeType==3){
                            step.NodeTest = 'text()';       //can include some text to improve, text()=' '        
                        } else if(node.nodeType==9){
                            //console.log("at document root level, will return absolute path instead!")
                            step.NodeTest = '';
                            if(this._setUniqueXpath(this._compileXpath('/',step,locationPath),inRange)){  duplicate=false; break findUniquePath;}
                            console.warn("did not find a unique xpath for node, even at root level, so there must be an error in the xpath generator code!")
                            return this;
                        } else {            
                            for(var i in SEMANTIC_ATTRIBUTES){
                                //if(!iterate){break;}
                            // hasSemantic = true;
                                var attribute = SEMANTIC_ATTRIBUTES[i];
                                if ( node.hasAttribute(attribute)) {
                                    if(i==0){hasId=true;}
                                    step.AttributePredicate[attribute] = node.getAttribute(attribute); //check for javascript??
                                    if((hasSection|hasId) && this._setUniqueXpath(this._compileXpath('//',step,locationPath),inRange)){   duplicate=false; break findUniquePath }
                                }
                                if(i==0){    //second thing to check after 'id' is if the node name is unique in the document. seems a bit fragile, but not brittle.
                                    step.NodeTest = node.nodeName.toLowerCase();
                                    if(SECTION_ELEMENTS.includes(step.NodeTest)) { hasSection=true }
                                    if((hasSection|hasId) && this._setUniqueXpath(this._compileXpath('//',step,locationPath),inRange)){  duplicate=false; break findUniquePath }
                                }
                            }
                        }  //end elment processing vs textnode processing
                             step.PositionPredicate = this._nodePosition(step,node); 
                            if(locationPath.length>0){
                                    if((hasSection|hasId) && _setUniqueXpath(this._compileXpath('//',step,locationPath),inRange)){  duplicate=false; break findUniquePath  }
                            }
                            locationPath.unshift(this._compileXpath('',step));
                            node = node.parentNode;
                        
                } //end while loop on xpath creationz
        if(typeof this.refinedBy !='undefined'){ 
                this.refinedBy.fromRange(range);
        }
         return this;
    }
        //need to check  ALL results to check if selector really unique within the inRange
    _setUniqueXpath(xpath,inRange){
                    if(document.evaluate('count(' + xpath +')',inRange.commonAncestorContainer,null,XPathResult.NUMBER_TYPE,null).numberValue==1){
                        this.value = xpath; //NOTE: SETS IT!!
                        return true;
                    } else {
                        return false;
                    }
                }

    _nodePosition(step, node){
                var xpath = this._compileXpath('',step);
                var simset = document.evaluate(xpath, node.parentNode, null , XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
                if(simset.snapshotLength >1){
                    for(var i = 0; i < simset.snapshotLength ; i++){    
                        if(simset.snapshotItem(i)==node){
                            return i+1;
                        }
                    }
                } else if (simset.snapshotLength==1){ // if there is only 1, then no reason to use.
                     return null; 
                }
                throw 'error in _nodePosition. Could the node have been removed?';
    }

    _compileXpath(axis='//',step,locationPath){
            var xpath = '';
            xpath = xpath + step.NodeTest; 
            if(Object.keys(step.AttributePredicate).length > 0){
                var keys = Object.keys(step.AttributePredicate);
                var expr = [];
                for (var i = 0; i < keys.length; i++) {     //@ abbreviated attribute::
                            expr.push('@' + keys[i] +'="'+step.AttributePredicate[keys[i]]+'"')      
                }
                xpath = xpath + '[' + expr.join(' and ') + ']';
            }
            if( step.PositionPredicate != null){
                xpath = xpath + '[' + step.PositionPredicate + ']'; //abbreviated syntax
            }
             if(typeof locationPath!='undefined' && locationPath.length >0){
                xpath = xpath + '/' + locationPath.join('/')  ;
            }
            xpath = axis + xpath;
            return xpath;
        }
}

class DataPositionSelector extends SegmentSelector{
    constructor(object = {start:0, end:null}){
        super();
        this.type = 'DataPositionSelector';
        this.start = object.start;
        this.end = object.end;
        return this;
    }
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
    //http://www.isthisthingon.org/unicode/index.phtml?glyph=10001 points above 10K have surrogate pairs.
    //http://stackoverflow.com/questions/2848462/count-bytes-in-textarea-using-javascript
    static fixedCharCodeAt(str, idx) {
            idx = idx || 0;
            var code = str.charCodeAt(idx);
            if(isNaN(code)) {return null;} //outside of string range returns null
            var hi, low;
            if (0xD800 <= code && code <= 0xDBFF) {
                hi = code;
                low = str.charCodeAt(idx + 1);
                if (isNaN(low)) {  throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()';}
                return ((hi - 0xD800) * 0x400) +
                (low - 0xDC00) + 0x10000;
            }
            if (0xDC00 <= code && code <= 0xDFFF) {
                return null; //  if already accounted for in earlier part of surrogate pair, return null
            }
            return code;
    }
    static charCodeBytes(charCode) {
            if (typeof charCode === "number") {
                if (charCode < 128) {
                    return 1;
                } else if (charCode < 2048) {
                    return 2;
                } else if (charCode < 65536) {
                    return 3;
                } else if (charCode < 2097152) {
                   return 4;
                } else if (charCode < 67108864) {
                    return 5;
                } else {
                    return 6;
                }
            } else { return 0;} //null char code has 0 length
    }

    firstRange(inRange){
         if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
               var range = inRange;//unambigous cannot handle multiple??
                    if(range.startContainer!=range.endContainer) {throw 'range must encapsulate one node only'};

                    if(![Node.TEXT_NODE,Node.PROCESSING_INSTRUCTION_NODE,Node.COMMENT_NODE].includes(range.startContainer.nodeType)){
                    throw 'node must be a text node or similar for this to work currently.'
                    }
                    var newRange = new Range();
                    var str = range.startContainer.nodeValue;
                    var byteLen = 0;
                    var foundStart = false; 
                    for (var i = 0; i <= range.endOffset; i++) {
                            if(!foundStart && byteLen >= this.start){
                                newRange.setStart(range.startContainer,i);
                                foundStart = true;
                            }
                            if(byteLen >= this.end ){
                                newRange.setEnd(range.startContainer,i);
                                 return newRange;
                            }
                            var charCode = DataPositionSelector.fixedCharCodeAt(str,i);
                            byteLen += DataPositionSelector.charCodeBytes(charCode);
                    } 
                return null; //if we didn't find anything return null
     }
     fromRange(range, inRange){
            if(range.startContainer!=range.endContainer) {throw 'DataPositionSelector can only represent position in a single node currently'};
                if(![Node.TEXT_NODE,Node.PROCESSING_INSTRUCTION_NODE,Node.COMMENT_NODE].includes(range.startContainer.nodeType)){
                throw 'node must be a text node or similar for this to work currently.'
                 }
                 //TODO: check if range in refiningRange.
                var str = range.startContainer.nodeValue;
                var byteLen = 0;
                for (var i = 0; i <= range.endOffset; i++) {
                        if(i == range.startOffset){
                            this.start = byteLen;
                        }
                        if(i == range.endOffset){
                            this.end = byteLen;
                            break;
                        }
                    var charCode = DataPositionSelector.fixedCharCodeAt(str,i);
                    byteLen += DataPositionSelector.charCodeBytes(charCode);       
                }
                return this;
      }
}

class HTMLFragmentSelector extends SegmentSelector{
     constructor(object={value:null}){
            super();
            this.type = "FragmentSelector";
            this.value = object.value;
            this.conformsTo = 'http://tools.ietf.org/rfc/rfc3236';
            Object.defineProperty(this, 'epsilon', { value: 100, enumerable: false, writable:true })
        }
        fromRange(range,inRange){
            if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
             var treeWalker = document.createTreeWalker(inRange.commonAncestorContainer, NodeFilter.SHOW_ELEMENT+ NodeFilter.SHOW_TEXT)
            var lastNamed = null;
            var node;
            while(node = treeWalker.nextNode()){ 
                //can check if inRange of acceptable
                    if(node.nodeType==1 && node.hasAttribute('id')){
                        lastNamed = node;      
                    }
                   if(node == range.startContainer || node == range.endContainer || range.comparePoint(node,0)==0){
                       if(lastNamed != null){  //TODO: check if lastNamed is within epsilon pixels from this, or else reject?
                            var lastNamePosition = Math.round(lastNamed.getBoundingClientRect().top +window.scrollY) ;
                             var rangePosition =Math.round(range.getBoundingClientRect().top + window.scrollY) ;
                             if(Math.abs(lastNamePosition-rangePosition)<200){
                                 this.value = lastNamed.getAttribute('id');
                                return this;
                             }
                           
                       }
                }
            }
            console.warn("could not find a named attribute within 100 pixes of range boundary .")
            return this;
        }

        firstRange(inRange){
             if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
            if(this.value == null){return null};
            var element = document.getElementById(this.value);
            if(inRange.intersectsNode(element)){
                var range = new Range();
                range.selectNode(element); //TODO: in the HTML case, we actually want to select a POINT at the start of the node and ending immediately after
                return range;
             }
             return null;
        }
}

class SpecificResource{
    constructor(object={source:null,selector:null}){
        this.type = 'SpecificResource';
        this.source = String(object.source);
        if(typeof object.id !='undefined'){  this.id = object.id; }
        if(typeof object.selector !='undefined'){  this.selector = object.selector; }
        return this;
    }
    firstRange(){
        if(this.source!=AnnotationBuilder.parseURL(window.location.href)){
            throw 'currently does not support selecting on other than current page. should add code to navigate to page or otherwise return null (but trying the first option before throwing null is best)';
        }
        //webResourceRange represents ALL of a "Web Resource": A Resource that must be identified by an URL, as described in the Web Architecture [webarch]. Web Resources may be dereferencable via their URL.
        var webResourceRange = new Range(); webResourceRange.selectNode(document.documentElement); 
        if(typeof this.selector =='undefined'){ 
             return webResourceRange; 
        } else {
                 if(Array.isArray(this.selector)){
                            for(var i = 0; i < this.selector.length; i++){
                                    var range = this.selector[i].toRange(webResourceRange); 
                                    if(range != null) {return range ;}
                                }
                        } else {  
                                var range = this.selector.toRange(webResourceRange);    
                                if(range != null) {return range ;}
                        }  
        }
        return null; //if failed, return nothing  
    }

    toRange(){
        return this.firstRange();
    }

    toSelection(scroll=false){
                    var selection = window.getSelection();
                    selection.removeAllRanges();
                    var range = this.toRange();
                    selection.addRange(this.toRange()); //TODO, funciton to get 'most popular' range.
                    if(scroll){
                            var absolutePosition = Math.round(window.scrollY+ range.getBoundingClientRect().top);
                            var windowBottom = Math.round(window.scrollY + window.innerHeight);
                            var windowTop = Math.round(window.scrollY);
                            if(absolutePosition > windowBottom | absolutePosition < windowTop){
                                window.scroll(0, absolutePosition); //TODO: breaks in fixed position div. make sure to get correct fixed div locaction..
                            }  
                    }
            return this;
    }
}

class ExternalWebResource{
    constructor(object={id:null}){
        this.type = 'ExternalWebResource';
        this.id = object.id;
        if(typeof object.purpose !='undefined'){  this.purpose = object.purpose; }
        return this;
    }
    //can be refinedBy fragment selector, so same segment interface I guess.
    //not sure why I'm putting these here, to be honest this needs other methods to deal with WebResource like url parsing.
    toRange(){
         if(this.source!=AnnotationBuilder.parseURL(window.location.href)){
            throw 'currently does not support getting range on other than current page. should add code to navigate to page or otherwise return null (but trying the first option before throwing null is best)';
        }
        var webResourceRange = new Range(); webResourceRange.selectNode(document.documentElement); 
         return webResourceRange; 
    }
    toSelection(){
                    var selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(this.toRange()); //TODO, funciton to get 'most popular' range.     
            return this;
    }
}

class Annotation{
    constructor(object={id:null, target:null}){ //uuid can also apply to Body and Target. 
        this['@context'] = 'http://www.w3.org/ns/anno.jsonld';
        this.type = 'Annotation'; 
        this.id = object.id; //An Annotation must have exactly 1 URL that identifies it. 
        this.target = object.target; //There must be 1 or more target relationships associated with an Annotation
        if(typeof object.motivation != 'undefined'){ this.motivation = object.motivation }
       if(typeof object.canonical != 'undefined'){ this.canonical = object.canonical }
       if(typeof object.bodyValue != 'undefined'){ this.bodyValue = object.bodyValue }
       if(typeof object.body != 'undefined'){ this.body = object.body }

        return this;
    }  
}

class TextPositionSelector extends SegmentSelector{
        constructor(object={start:null, end:null}){
            super();
            this.type = 'TextPositionSelector';
            this.start = object.start;
            this.end = object.end;
        }

        _textNodeIterator(inRange){
            var commonAncestorContainer = inRange.commonAncestorContainer; 
           // console.log(commonAncestorContainer)
            if(commonAncestorContainer.nodeType == Node.TEXT_NODE) { 
                    commonAncestorContainer=commonAncestorContainer.parentElement 
            } else if(commonAncestorContainer.nodeType == Node.DOCUMENT_NODE){
                    commonAncestorContainer=document.documentElement; 
            }
            return document.createNodeIterator(commonAncestorContainer,NodeFilter.SHOW_TEXT,{ acceptNode: function(node){
                if(node==inRange.startContainer || node==inRange.endContainer || inRange.comparePoint(node,0)==0){
                    return NodeFilter.FILTER_ACCEPT; 
                }
            } });
        }

       fromRange(range,inRange){
            if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
            var nodeIterator = this._textNodeIterator(inRange);
            var commonAncestorContainerCount = 0; 
            var inRangeStart = null;
            var inRangeEnd = null;
            var rangeStart = null;
            var rangeEnd = null;
            var node;
            while(node = nodeIterator.nextNode()){
                 var nodeValueLength = node.nodeValue.length;
                    if(inRangeStart==null){
                        if(node==inRange.startContainer){
                            inRangeStart = commonAncestorContainerCount + inRange.startOffset;
                        } else if (inRange.comparePoint(node,0)==0){
                            inRangeStart = commonAncestorContainerCount;
                        }
                    }
                    if(inRangeEnd==null){
                         if(node==inRange.endContainer){
                             inRangeEnd = commonAncestorContainerCount + inRange.endOffset;
                         } 
                    }
                    if(inRangeStart!=null & rangeStart ==null){
                        if(node==range.startContainer){
                            rangeStart = commonAncestorContainerCount-inRangeStart + range.startOffset ;
                        } else if(range.comparePoint(node,0)==0){
                            rangeStart = commonAncestorContainerCount-inRangeStart ;
                        }
                    }
                    if(inRangeStart!=null & rangeEnd==null){
                        if(node==range.endContainer){
                            rangeEnd = commonAncestorContainerCount-inRangeStart + range.endOffset ;
                        } else if(range.comparePoint(node,0)==1){
                            rangeEnd = commonAncestorContainerCount-inRangeStart;
                        }
                    }
                     if(rangeStart !=null & rangeEnd != null){
                        this.start = rangeStart;
                        this.end = rangeEnd;
                        break;
                    }
                    commonAncestorContainerCount = commonAncestorContainerCount + nodeValueLength;
            }
            return this;
       }
        firstRange(inRange){ 
             if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
                var nodeIterator = this._textNodeIterator(inRange);
                var exactMatchStart = this.start;
                var exactMatchEnd = this.end;

                var commonAncestorContainerCount = 0; 
                var inRangeStart = null;
                var inRangeEnd = null;
                var rangeStartContainer = null;
                var rangeStartOffset = null;
                var rangeEndContainer = null;
                var rangeEndOffset = null;
            
                 var node;
                 while(node = nodeIterator.nextNode()){
                        var nodeValueLength = node.nodeValue.length;
                        if(inRangeStart==null){
                            if(node==inRange.startContainer){
                                inRangeStart = commonAncestorContainerCount + inRange.startOffset;
                            } else if (inRange.comparePoint(node,0)==0){
                                inRangeStart = commonAncestorContainerCount;
                            }
                        }
                        if(inRangeEnd==null){
                            if(node==inRange.endContainer){
                                inRangeEnd = commonAncestorContainerCount + inRange.endOffset;
                            } 
                        }
                    if(inRangeStart!=null & rangeStartContainer == null){
                            if(commonAncestorContainerCount + nodeValueLength >= exactMatchStart+inRangeStart & commonAncestorContainerCount < exactMatchStart+inRangeStart){
                                rangeStartContainer = node; 
                                rangeStartOffset = exactMatchStart+inRangeStart-commonAncestorContainerCount;
                            }
                        }
                        if(inRangeStart!=null & rangeEndContainer== null){
                            if(commonAncestorContainerCount + nodeValueLength >= exactMatchEnd+inRangeStart & commonAncestorContainerCount < exactMatchEnd+inRangeStart){
                            //TODO: check if in range.
                                rangeEndContainer = node;
                                rangeEndOffset = exactMatchEnd+inRangeStart - commonAncestorContainerCount;
                            } 
                        }
                        if(rangeStartContainer!=null & rangeEndContainer!=null) { break;}
                        commonAncestorContainerCount = commonAncestorContainerCount + nodeValueLength;
                
            }
             var range = new Range();
             range.setStart(rangeStartContainer, rangeStartOffset) ;
             range.setEnd(rangeEndContainer, rangeEndOffset) ;
            return range; 
        }

}

class TextQuoteSelector extends TextPositionSelector{
    constructor(object={exact:null, prefix:null, suffix:null}){
        super();
        this.type = 'TextQuoteSelector';
        this.exact = object.exact;
        this.suffix = object.suffix;
        this.prefix = object.prefix;
        Object.defineProperty(this, 'start', { value: this.start, enumerable: false, writable:true })
        Object.defineProperty(this, 'end', { value: this.end, enumerable: false, writable:true })
        Object.defineProperty(this, 'epsilon', { value: 32, enumerable: false, writable:true })
    }

     fromRange(range, inRange){ 
        if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
        super.fromRange(range,inRange);
        var textContent = inRange.toString();
  
        this.exact = textContent.substring(this.start,this.end); 
        this.prefix = textContent.substring(Math.max(this.start-this.epsilon,0), this.start); 
        this.suffix =  textContent.substring(this.end,Math.min(this.end+this.epsilon,textContent.length))           
        return this;
    }
    
    firstRange(inRange){ 
        if(typeof inRange == 'undefined'){ var inRange = new Range(); inRange.selectNode(document.documentElement); }
        var textContent = inRange.toString();
        var fullMatchStart = textContent.indexOf(this.prefix + this.exact + this.suffix);
        if(fullMatchStart!==-1){
                this.start = fullMatchStart + this.prefix.length;
                this.end = this.start + this.exact.length ;
        } else {
            console.warn( 'TextQuoteSelector did not find a string match. returning null. try prefix/suffix and maybe string distance on those?');
            return null;
        }
        return super.firstRange(inRange);
    } 

     toTextPositionSelector(){
       return new TextPositionSelector({start:this.start,end:this.end});
    }
}

//the intention of the builder pattern is to find a solution to the telescoping constructor anti-pattern
class AnnotationBuilder{
    constructor(){
        this.result = new Annotation(); //temp
        Object.defineProperty(this, 'uuid', { value: AnnotationBuilder.UUID(), enumerable: false, writable:true });
        Object.defineProperty(this, 'url', { value: AnnotationBuilder.parseURL(window.location.href), enumerable: false, writable:true });
        return this;
    }

    toJSON(){
       return JSON.stringify(this.result);
    }
    fromJSON(json){
        var revived = JSON.parse(json,function(key,value){
            if(value != null && value.hasOwnProperty('type')){
            switch (value.type){
                    case "Annotation": return new Annotation(value);
                    case "SpecificResource": return new SpecificResource(value);
                    case "RangeSelector": return new RangeSelector(value);
                    case "XPathSelector": return new XPathSelector(value);
                    case "DataPositionSelector": return new DataPositionSelector(value);
                    case "TextQuoteSelector": return new TextQuoteSelector(value);
                    case "TextPositionSelector": return new TextPositionSelector(value);
                    default: console.warn('mismatched type attribute in JSON reviver function')
            }
        } else {
                return this[key];
            }
        });
        this.result = revived;
        return this;
    }

    bookmark(){
        this.result.motivation = 'bookmarking';
        this.result.canonical = "urn:uuid:" + this.uuid;
        //might include fragment?
        this.result.target = new ExternalWebResource();
        this.result.target.id = this.url;
        return this;
    }

    highlight(selection){
            if(typeof selection =='undefined'){
                var selection = document.getSelection();
            }
            if(selection.anchorNode==null | selection.isCollapsed){
                throw 'user selection in document window is empty (indicating nothing pressed) or collapsed (indicating mere touch or press in window). In general might use scroll position to get a fragment selector, but not valid for highlighting motivation.';
            } else {
                var range = selection.getRangeAt(0);
                var rangeType = AnnotationBuilder.rangeType(range);  
                //console.log(rangeType); //TEMP
                if(rangeType.includes(AnnotationBuilder.END_DOCUMENT_NODE())){
                    throw 'invalid end of range such as a brand new Range object collapsed at the start of the document root';
                }
                this.result.motivation = 'highlighting';
                this.result.canonical = "urn:uuid:" + this.uuid;

                var newTarget = new SpecificResource();
                newTarget.source = this.url;
                newTarget.selector = [];
                if(rangeType.includes(AnnotationBuilder.ONE_CONTAINER_NODE())){   
                        var xpathSelector = new XPathSelector();
                        if(rangeType.includes(AnnotationBuilder.START_SUBSTRING_DATA())){
                            xpathSelector.refinedBy = new DataPositionSelector();
                        }
                        xpathSelector.fromRange(range);
                        newTarget.selector.push(xpathSelector);  
                } else {
                     var rangeSelector = new RangeSelector();
                     rangeSelector.startSelector = new XPathSelector();
                     rangeSelector.endSelector = new XPathSelector();
                     if(rangeType.includes(AnnotationBuilder.START_SUBSTRING_DATA())){
                            rangeSelector.startSelector.refinedBy = new DataPositionSelector();
                     }
                     if(rangeType.includes(AnnotationBuilder.END_SUBSTRING_DATA())| rangeType.includes(AnnotationBuilder.END_CHARACTER_NODE())){
                            rangeSelector.endSelector.refinedBy = new DataPositionSelector();
                     }
                     rangeSelector.fromRange(range);
                     newTarget.selector.push(rangeSelector); 
                }

                var textQuoteSelector = new TextQuoteSelector().fromRange(range);
                newTarget.selector.push(textQuoteSelector);
                newTarget.selector.push(textQuoteSelector.toTextPositionSelector());
               
                this.result.target = newTarget;

            }
            return this;
        }
        
    static START_DOCUMENT_NODE(){return 1;}
    static START_ELEMENT_NODE(){return 2;}
    static START_CHARACTER_NODE(){return 3;} //might just use 'node' since distinction between element node not needed??
    static START_SUBSTRING_DATA(){return 4;}
    static END_DOCUMENT_NODE(){return 5;}
    static END_ELEMENT_NODE(){return 6;}
    static END_CHARACTER_NODE(){return 7;} //difference between element and character node not needed for xpath selector. always get substring in range when there is character node, because ranges end on last node start..
    static END_SUBSTRING_DATA(){return 8;}
    static ONE_CONTAINER_NODE(){return 9;}
    static COLLAPSED(){return 10;} //might ignore this one, since it is irrelevant for data range selector

    static rangeType(range){
        var result = [];
        if(range.startContainer.nodeType == Node.DOCUMENT_NODE){result.push(AnnotationBuilder.START_DOCUMENT_NODE())}
        if(range.endContainer.nodeType == Node.DOCUMENT_NODE){result.push(AnnotationBuilder.END_DOCUMENT_NODE())}
        if(range.startContainer.nodeType == Node.ELEMENT_NODE){result.push(AnnotationBuilder.START_ELEMENT_NODE())}
        if(range.endContainer.nodeType == Node.ELEMENT_NODE){result.push(AnnotationBuilder.END_ELEMENT_NODE())}
        if([Node.TEXT_NODE,Node.PROCESSING_INSTRUCTION_NODE,Node.COMMENT_NODE].includes(range.startContainer.nodeType)){
            var length = range.startContainer.nodeValue.length; 
            if(range.startContainer==range.endContainer){ 
                result.push(AnnotationBuilder.ONE_CONTAINER_NODE()); 
                if(range.startOffset == range.endOffset){
                    result.push(AnnotationBuilder.COLLAPSED()); 
                } else if(range.startOffset == 0 & range.endOffset == length) {
                    result.push(AnnotationBuilder.START_CHARACTER_NODE());
                } else {
                     result.push(AnnotationBuilder.START_SUBSTRING_DATA());
                }
            } else {
                if(range.startOffset == 0){
                    result.push(AnnotationBuilder.START_CHARACTER_NODE());
                } else {
                     result.push(AnnotationBuilder.START_SUBSTRING_DATA());
                }
            }  
        }
        if([Node.TEXT_NODE,Node.PROCESSING_INSTRUCTION_NODE,Node.COMMENT_NODE].includes(range.endContainer.nodeType)){
            var length = range.endContainer.nodeValue.length; 
            if(range.startContainer==range.endContainer){ 
                    //TECHNICALLY REDUNDANT INFO, but including anyhow 
                    if(range.startOffset == 0 & range.endOffset == length){
                        result.push(AnnotationBuilder.END_CHARACTER_NODE());
                    } else {
                        result.push(AnnotationBuilder.END_SUBSTRING_DATA());
                    }
            } else {
                if(range.endOffset == length){
                    result.push(AnnotationBuilder.END_CHARACTER_NODE());
                } else {
                    result.push(AnnotationBuilder.END_SUBSTRING_DATA());
                }
            }
        }
        return result;
    }
    static UUID() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
    static parseURL(path){
        // any relative URL references are resolved to their absolute form
        //https://www.ietf.org/rfc/rfc3987.txt https://url.spec.whatwg.org/#concept-basic-url-parser
        var parser = document.createElement('a');
        parser.href = path;
        if(parser.protocol.toLowerCase()=='javascript:'){ console.warning('supplied URL path is javascript and could be mallicious.'); return null; }
        return parser.protocol+'//'+ parser.host + parser.pathname + parser.search + parser.hash;
    }
}

// var ab = new AnnotationBuilder().highlight()
// //ab.result.target.toSelection()
// var json = ab.toJSON()
// var ab2 = new AnnotationBuilder().fromJSON(json)
// ab2.result.target.toSelection()