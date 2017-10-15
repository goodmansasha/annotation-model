/*!
 * MIT License
 * 
 * Copyright (c) 2017 Sasha Goodman
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * 
 * Build hash: 9422981150a1d9e8ece0
 * Version: 0.2.1
 * 
 * 
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SegmentSelector = function () {
  function SegmentSelector() {
    _classCallCheck(this, SegmentSelector);

    return this;
  }

  _createClass(SegmentSelector, [{
    key: 'fromRange',
    value: function fromRange(range, inRange) {
      Object.defineProperty(this, 'tmp', { value: null, enumerable: false, writable: true });this.tmp = range;
    }
  }, {
    key: 'firstRange',
    value: function firstRange(inRange) {
      return this.tmp;
    }
  }, {
    key: 'toRange',
    value: function toRange(inRange) {
      if (typeof inRange === 'undefined') {
        inRange = new Range();inRange.selectNode(document.documentElement);
      }
      var thisRange = this.firstRange(inRange);
      if (thisRange === null) {
        console.warn('selector did not find any results. Return null and aborting further refinement so upstream selectors know to move on and try possible alternatives.');return null;
      }
      if (typeof this.refinedBy !== 'undefined') {
        if (Array.isArray(this.refinedBy)) {
          for (var i = 0; i < this.refinedBy.length; i++) {
            var refinedRange = this.refinedBy[i].toRange(thisRange);
            if (refinedRange !== null) {
              return refinedRange;
            }
          }
        } else {
          var _refinedRange = this.refinedBy.toRange(thisRange);
          if (_refinedRange !== null) {
            return _refinedRange;
          }
        }
      } else {
        return thisRange;
      }
    }
  }, {
    key: 'toSelection',
    value: function toSelection() {
      var scroll = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var selection = window.getSelection();
      selection.removeAllRanges();
      var range = this.toRange();
      selection.addRange(range);

      if (scroll) {
        var absolutePosition = Math.round(window.scrollY + range.getBoundingClientRect().top);
        var windowBottom = Math.round(window.scrollY + window.innerHeight);
        var windowTop = Math.round(window.scrollY);
        if (absolutePosition > windowBottom || absolutePosition < windowTop) {
          window.scroll(0, absolutePosition);
        }
      }
      return this;
    }
  }, {
    key: 'fromSelection',
    value: function fromSelection() {
      var selection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.getSelection();

      if (selection.anchorNode === null) {
        throw new Error('user selection in document window is empty. There is no anchorNode indicating its even starting.');
      }
      this.fromRange(selection.getRangeAt(0));
      return this;
    }
  }]);

  return SegmentSelector;
}();

exports.default = SegmentSelector;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _annotation = __webpack_require__(5);

var _annotation2 = _interopRequireDefault(_annotation);

var _specificResource = __webpack_require__(6);

var _specificResource2 = _interopRequireDefault(_specificResource);

var _rangeSelector = __webpack_require__(7);

var _rangeSelector2 = _interopRequireDefault(_rangeSelector);

var _xpathSelector = __webpack_require__(8);

var _xpathSelector2 = _interopRequireDefault(_xpathSelector);

var _dataPositionSelector = __webpack_require__(9);

var _dataPositionSelector2 = _interopRequireDefault(_dataPositionSelector);

var _textQuoteSelector = __webpack_require__(10);

var _textQuoteSelector2 = _interopRequireDefault(_textQuoteSelector);

var _textPositionSelector = __webpack_require__(2);

var _textPositionSelector2 = _interopRequireDefault(_textPositionSelector);

var _externalWebResource = __webpack_require__(11);

var _externalWebResource2 = _interopRequireDefault(_externalWebResource);

var _uuid = __webpack_require__(12);

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnnotationBuilder = function () {
  function AnnotationBuilder() {
    _classCallCheck(this, AnnotationBuilder);

    this.result = new _annotation2.default();
    Object.defineProperty(this, 'uuid', { value: _uuid2.default.v4(), enumerable: false, writable: true });
    Object.defineProperty(this, 'url', { value: AnnotationBuilder.parseURL(window.location.href), enumerable: false, writable: true });
    return this;
  }

  _createClass(AnnotationBuilder, [{
    key: 'toJSON',
    value: function toJSON() {
      return JSON.stringify(this.result);
    }
  }, {
    key: 'fromJSON',
    value: function fromJSON(json) {
      this.result = JSON.parse(json, function (key, value) {
        if (value !== null && value.hasOwnProperty('type')) {
          switch (value.type) {
            case 'Annotation':
              return new _annotation2.default(value);
            case 'SpecificResource':
              return new _specificResource2.default(value);
            case 'RangeSelector':
              return new _rangeSelector2.default(value);
            case 'XPathSelector':
              return new _xpathSelector2.default(value);
            case 'DataPositionSelector':
              return new _dataPositionSelector2.default(value);
            case 'TextQuoteSelector':
              return new _textQuoteSelector2.default(value);
            case 'TextPositionSelector':
              return new _textPositionSelector2.default(value);
            default:
              console.warn('mismatched type attribute in JSON reviver function');
          }
        } else {
          return this[key];
        }
      });
      return this;
    }
  }, {
    key: 'bookmark',
    value: function bookmark() {
      this.result.motivation = 'bookmarking';
      this.result.canonical = 'urn:uuid:' + this.uuid;

      this.result.target = new _externalWebResource2.default();
      this.result.target.id = this.url;
      return this;
    }
  }, {
    key: 'highlight',
    value: function highlight(selection) {
      if (typeof selection === 'undefined') {
        selection = document.getSelection();
      }
      if (selection.anchorNode === null || selection.isCollapsed) {
        throw new Error('user selection in document window is empty (indicating nothing pressed) or collapsed (indicating mere touch or press in window). In general might use scroll position to get a fragment selector, but not valid for highlighting motivation.');
      } else {
        var range = selection.getRangeAt(0);
        var rangeType = AnnotationBuilder.rangeType(range);

        if (rangeType.includes(AnnotationBuilder.END_DOCUMENT_NODE())) {
          throw new Error('invalid end of range such as a brand new Range object collapsed at the start of the document root');
        }
        this.result.motivation = 'highlighting';
        this.result.canonical = 'urn:uuid:' + this.uuid;

        var newTarget = new _specificResource2.default();
        newTarget.source = this.url;
        newTarget.selector = [];
        if (rangeType.includes(AnnotationBuilder.ONE_CONTAINER_NODE())) {
          var xpathSelector = new _xpathSelector2.default();
          if (rangeType.includes(AnnotationBuilder.START_SUBSTRING_DATA())) {
            xpathSelector.refinedBy = new _dataPositionSelector2.default();
          }
          xpathSelector.fromRange(range);
          newTarget.selector.push(xpathSelector);
        } else {
          var rangeSelector = new _rangeSelector2.default();
          rangeSelector.startSelector = new _xpathSelector2.default();
          rangeSelector.endSelector = new _xpathSelector2.default();
          if (rangeType.includes(AnnotationBuilder.START_SUBSTRING_DATA())) {
            rangeSelector.startSelector.refinedBy = new _dataPositionSelector2.default();
          }
          if (rangeType.includes(AnnotationBuilder.END_SUBSTRING_DATA()) || rangeType.includes(AnnotationBuilder.END_CHARACTER_NODE())) {
            rangeSelector.endSelector.refinedBy = new _dataPositionSelector2.default();
          }
          rangeSelector.fromRange(range);
          newTarget.selector.push(rangeSelector);
        }

        var textQuoteSelector = new _textQuoteSelector2.default().fromRange(range);
        newTarget.selector.push(textQuoteSelector);
        newTarget.selector.push(textQuoteSelector.toTextPositionSelector());

        this.result.target = newTarget;
      }
      return this;
    }
  }], [{
    key: 'START_DOCUMENT_NODE',
    value: function START_DOCUMENT_NODE() {
      return 1;
    }
  }, {
    key: 'START_ELEMENT_NODE',
    value: function START_ELEMENT_NODE() {
      return 2;
    }
  }, {
    key: 'START_CHARACTER_NODE',
    value: function START_CHARACTER_NODE() {
      return 3;
    }
  }, {
    key: 'START_SUBSTRING_DATA',
    value: function START_SUBSTRING_DATA() {
      return 4;
    }
  }, {
    key: 'END_DOCUMENT_NODE',
    value: function END_DOCUMENT_NODE() {
      return 5;
    }
  }, {
    key: 'END_ELEMENT_NODE',
    value: function END_ELEMENT_NODE() {
      return 6;
    }
  }, {
    key: 'END_CHARACTER_NODE',
    value: function END_CHARACTER_NODE() {
      return 7;
    }
  }, {
    key: 'END_SUBSTRING_DATA',
    value: function END_SUBSTRING_DATA() {
      return 8;
    }
  }, {
    key: 'ONE_CONTAINER_NODE',
    value: function ONE_CONTAINER_NODE() {
      return 9;
    }
  }, {
    key: 'COLLAPSED',
    value: function COLLAPSED() {
      return 10;
    }
  }, {
    key: 'rangeType',
    value: function rangeType(range) {
      var result = [];
      if (range.startContainer.nodeType === Node.DOCUMENT_NODE) {
        result.push(AnnotationBuilder.START_DOCUMENT_NODE());
      }
      if (range.endContainer.nodeType === Node.DOCUMENT_NODE) {
        result.push(AnnotationBuilder.END_DOCUMENT_NODE());
      }
      if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
        result.push(AnnotationBuilder.START_ELEMENT_NODE());
      }
      if (range.endContainer.nodeType === Node.ELEMENT_NODE) {
        result.push(AnnotationBuilder.END_ELEMENT_NODE());
      }
      if ([Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(range.startContainer.nodeType)) {
        var length = range.startContainer.nodeValue.length;
        if (range.startContainer === range.endContainer) {
          result.push(AnnotationBuilder.ONE_CONTAINER_NODE());
          if (range.startOffset === range.endOffset) {
            result.push(AnnotationBuilder.COLLAPSED());
          } else if (range.startOffset === 0 && range.endOffset === length) {
            result.push(AnnotationBuilder.START_CHARACTER_NODE());
          } else {
            result.push(AnnotationBuilder.START_SUBSTRING_DATA());
          }
        } else {
          if (range.startOffset === 0) {
            result.push(AnnotationBuilder.START_CHARACTER_NODE());
          } else {
            result.push(AnnotationBuilder.START_SUBSTRING_DATA());
          }
        }
      }
      if ([Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(range.endContainer.nodeType)) {
        var _length = range.endContainer.nodeValue.length;
        if (range.startContainer === range.endContainer) {
          if (range.startOffset === 0 && range.endOffset === _length) {
            result.push(AnnotationBuilder.END_CHARACTER_NODE());
          } else {
            result.push(AnnotationBuilder.END_SUBSTRING_DATA());
          }
        } else {
          if (range.endOffset === _length) {
            result.push(AnnotationBuilder.END_CHARACTER_NODE());
          } else {
            result.push(AnnotationBuilder.END_SUBSTRING_DATA());
          }
        }
      }
      return result;
    }
  }, {
    key: 'parseURL',
    value: function parseURL(path) {
      var parser = document.createElement('a');
      parser.href = path;
      if (parser.protocol.toLowerCase() === 'javascript:') {
        console.warn('supplied URL path is javascript and could be mallicious.');return null;
      }
      return parser.protocol + '//' + parser.host + parser.pathname + parser.search + parser.hash;
    }
  }]);

  return AnnotationBuilder;
}();

exports.default = AnnotationBuilder;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _segmentSelector = __webpack_require__(0);

var _segmentSelector2 = _interopRequireDefault(_segmentSelector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextPositionSelector = function (_SegmentSelector) {
  _inherits(TextPositionSelector, _SegmentSelector);

  function TextPositionSelector() {
    var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { start: null, end: null };

    _classCallCheck(this, TextPositionSelector);

    var _this = _possibleConstructorReturn(this, (TextPositionSelector.__proto__ || Object.getPrototypeOf(TextPositionSelector)).call(this));

    _this.type = 'TextPositionSelector';
    _this.start = object.start;
    _this.end = object.end;
    return _this;
  }

  _createClass(TextPositionSelector, [{
    key: '_textNodeIterator',
    value: function _textNodeIterator(inRange) {
      var commonAncestorContainer = inRange.commonAncestorContainer;

      if (commonAncestorContainer.nodeType === Node.TEXT_NODE) {
        commonAncestorContainer = commonAncestorContainer.parentElement;
      } else if (commonAncestorContainer.nodeType === Node.DOCUMENT_NODE) {
        commonAncestorContainer = document.documentElement;
      }
      return document.createNodeIterator(commonAncestorContainer, NodeFilter.SHOW_TEXT, { acceptNode: function acceptNode(node) {
          if (node === inRange.startContainer || node === inRange.endContainer || inRange.comparePoint(node, 0) === 0) {
            return NodeFilter.FILTER_ACCEPT;
          }
        } });
    }
  }, {
    key: 'fromRange',
    value: function fromRange(range, inRange) {
      if (typeof inRange === 'undefined') {
        inRange = new Range();inRange.selectNode(document.documentElement);
      }
      var nodeIterator = this._textNodeIterator(inRange);
      var commonAncestorContainerCount = 0;
      var inRangeStart = null;
      var inRangeEnd = null;
      var rangeStart = null;
      var rangeEnd = null;
      var node = void 0;
      while (node = nodeIterator.nextNode()) {
        var nodeValueLength = node.nodeValue.length;
        if (inRangeStart === null) {
          if (node === inRange.startContainer) {
            inRangeStart = commonAncestorContainerCount + inRange.startOffset;
          } else if (inRange.comparePoint(node, 0) === 0) {
            inRangeStart = commonAncestorContainerCount;
          }
        }
        if (inRangeEnd === null) {
          if (node === inRange.endContainer) {
            inRangeEnd = commonAncestorContainerCount + inRange.endOffset;
          }
        }
        if (inRangeStart !== null && rangeStart === null) {
          if (node === range.startContainer) {
            rangeStart = commonAncestorContainerCount - inRangeStart + range.startOffset;
          } else if (range.comparePoint(node, 0) === 0) {
            rangeStart = commonAncestorContainerCount - inRangeStart;
          }
        }
        if (inRangeStart !== null && rangeEnd === null) {
          if (node === range.endContainer) {
            rangeEnd = commonAncestorContainerCount - inRangeStart + range.endOffset;
          } else if (range.comparePoint(node, 0) === 1) {
            rangeEnd = commonAncestorContainerCount - inRangeStart;
          }
        }
        if (rangeStart !== null && rangeEnd !== null) {
          this.start = rangeStart;
          this.end = rangeEnd;
          break;
        }
        commonAncestorContainerCount = commonAncestorContainerCount + nodeValueLength;
      }
      return this;
    }
  }, {
    key: 'firstRange',
    value: function firstRange(inRange) {
      if (typeof inRange === 'undefined') {
        inRange = new Range();inRange.selectNode(document.documentElement);
      }
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

      var node = void 0;
      while (node = nodeIterator.nextNode()) {
        var nodeValueLength = node.nodeValue.length;
        if (inRangeStart === null) {
          if (node === inRange.startContainer) {
            inRangeStart = commonAncestorContainerCount + inRange.startOffset;
          } else if (inRange.comparePoint(node, 0) === 0) {
            inRangeStart = commonAncestorContainerCount;
          }
        }
        if (inRangeEnd === null) {
          if (node === inRange.endContainer) {
            inRangeEnd = commonAncestorContainerCount + inRange.endOffset;
          }
        }
        if (inRangeStart !== null && rangeStartContainer === null) {
          if (commonAncestorContainerCount + nodeValueLength >= exactMatchStart + inRangeStart && commonAncestorContainerCount < exactMatchStart + inRangeStart) {
            rangeStartContainer = node;
            rangeStartOffset = exactMatchStart + inRangeStart - commonAncestorContainerCount;
          }
        }
        if (inRangeStart !== null && rangeEndContainer === null) {
          if (commonAncestorContainerCount + nodeValueLength >= exactMatchEnd + inRangeStart && commonAncestorContainerCount < exactMatchEnd + inRangeStart) {
            rangeEndContainer = node;
            rangeEndOffset = exactMatchEnd + inRangeStart - commonAncestorContainerCount;
          }
        }
        if (rangeStartContainer !== null && rangeEndContainer !== null) {
          break;
        }
        commonAncestorContainerCount = commonAncestorContainerCount + nodeValueLength;
      }
      var range = new Range();
      range.setStart(rangeStartContainer, rangeStartOffset);
      range.setEnd(rangeEndContainer, rangeEndOffset);
      return range;
    }
  }]);

  return TextPositionSelector;
}(_segmentSelector2.default);

exports.default = TextPositionSelector;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var AnnotationBuilder = __webpack_require__(1).default;
if (typeof process !== 'undefined' && typeof process.pid === 'number') {
  module.exports = AnnotationBuilder;
} else if (window) {
  window.AnnotationBuilder = AnnotationBuilder;
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Annotation = function Annotation() {
  var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { id: null, target: null };

  _classCallCheck(this, Annotation);

  this['@context'] = 'http://www.w3.org/ns/anno.jsonld';
  this.type = 'Annotation';
  this.id = object.id;
  this.target = object.target;
  if (typeof object.motivation !== 'undefined') {
    this.motivation = object.motivation;
  }
  if (typeof object.canonical !== 'undefined') {
    this.canonical = object.canonical;
  }
  if (typeof object.bodyValue !== 'undefined') {
    this.bodyValue = object.bodyValue;
  }
  if (typeof object.body !== 'undefined') {
    this.body = object.body;
  }

  return this;
};

exports.default = Annotation;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _annotationBuilder = __webpack_require__(1);

var _annotationBuilder2 = _interopRequireDefault(_annotationBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SpecificResource = function () {
  function SpecificResource() {
    var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { source: null, selector: null };

    _classCallCheck(this, SpecificResource);

    this.type = 'SpecificResource';
    this.source = String(object.source);
    if (typeof object.id !== 'undefined') {
      this.id = object.id;
    }
    if (typeof object.selector !== 'undefined') {
      this.selector = object.selector;
    }
    return this;
  }

  _createClass(SpecificResource, [{
    key: 'firstRange',
    value: function firstRange() {
      if (this.source !== _annotationBuilder2.default.parseURL(window.location.href)) {
        throw new Error('currently does not support selecting on other than current page. should add code to navigate to page or otherwise return null (but trying the first option before throwing null is best)');
      }

      var webResourceRange = new Range();webResourceRange.selectNode(document.documentElement);
      if (typeof this.selector === 'undefined') {
        return webResourceRange;
      } else {
        if (Array.isArray(this.selector)) {
          for (var i = 0; i < this.selector.length; i++) {
            var range = this.selector[i].toRange(webResourceRange);
            if (range !== null) {
              return range;
            }
          }
        } else {
          var _range = this.selector.toRange(webResourceRange);
          if (_range !== null) {
            return _range;
          }
        }
      }
      return null;
    }
  }, {
    key: 'toRange',
    value: function toRange() {
      return this.firstRange();
    }
  }, {
    key: 'toSelection',
    value: function toSelection() {
      var scroll = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var selection = window.getSelection();
      selection.removeAllRanges();
      var range = this.toRange();
      selection.addRange(this.toRange());
      if (scroll) {
        var absolutePosition = Math.round(window.scrollY + range.getBoundingClientRect().top);
        var windowBottom = Math.round(window.scrollY + window.innerHeight);
        var windowTop = Math.round(window.scrollY);
        if (absolutePosition > windowBottom || absolutePosition < windowTop) {
          window.scroll(0, absolutePosition);
        }
      }
      return this;
    }
  }]);

  return SpecificResource;
}();

exports.default = SpecificResource;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _segmentSelector = __webpack_require__(0);

var _segmentSelector2 = _interopRequireDefault(_segmentSelector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RangeSelector = function (_SegmentSelector) {
  _inherits(RangeSelector, _SegmentSelector);

  function RangeSelector() {
    var _ret;

    var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { startSelector: new _segmentSelector2.default(), endSelector: new _segmentSelector2.default() };

    _classCallCheck(this, RangeSelector);

    var _this = _possibleConstructorReturn(this, (RangeSelector.__proto__ || Object.getPrototypeOf(RangeSelector)).call(this));

    _this.type = 'RangeSelector';
    _this.startSelector = object.startSelector;
    _this.endSelector = object.endSelector;
    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  _createClass(RangeSelector, [{
    key: 'firstRange',
    value: function firstRange(inRange) {
      if (typeof inRange === 'undefined') {
        inRange = new Range();inRange.selectNode(document.documentElement);
      }
      var start = this.startSelector.toRange(inRange);
      var end = this.endSelector.toRange(inRange);
      var range = new Range();
      range.setStart(start.startContainer, start.startOffset);
      range.setEnd(end.startContainer, end.startOffset);
      return range;
    }
  }, {
    key: 'fromRange',
    value: function fromRange(range, inRange) {
      if (typeof inRange === 'undefined') {
        inRange = new Range();inRange.selectNode(document.documentElement);
      }
      var start = new Range();
      start.setStart(range.startContainer, range.startOffset);
      start.setEnd(range.startContainer, range.startOffset);
      this.startSelector.fromRange(start, inRange);
      var end = new Range();
      end.setStart(range.endContainer, range.endOffset);
      end.setEnd(range.endContainer, range.endOffset);
      this.endSelector.fromRange(end, inRange);
      return this;
    }
  }]);

  return RangeSelector;
}(_segmentSelector2.default);

exports.default = RangeSelector;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _segmentSelector = __webpack_require__(0);

var _segmentSelector2 = _interopRequireDefault(_segmentSelector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var XPathSelector = function (_SegmentSelector) {
  _inherits(XPathSelector, _SegmentSelector);

  function XPathSelector() {
    var _ret;

    var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { value: null };

    _classCallCheck(this, XPathSelector);

    var _this = _possibleConstructorReturn(this, (XPathSelector.__proto__ || Object.getPrototypeOf(XPathSelector)).call(this));

    _this.type = 'XPathSelector';
    _this.value = object.value;
    if (typeof object.refinedBy !== 'undefined') {
      _this.refinedBy = object.refinedBy;
    }
    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  _createClass(XPathSelector, [{
    key: 'firstRange',
    value: function firstRange(inRange) {
      if (typeof inRange === 'undefined') {
        inRange = new Range();inRange.selectNode(document.documentElement);
      }
      var query = document.evaluate(this.value, inRange.commonAncestorContainer, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      var nodes = [];
      var node = void 0;
      while (node = query.iterateNext()) {
        if (node === inRange.startContainer) {
          nodes.push(node);
        } else if (node === inRange.endContainer) {
          nodes.push(node);break;
        } else if (inRange.comparePoint(node, 0) === 0) {
          nodes.push(node);
        }
      }
      if (nodes.length === 0) {
        throw new Error('could not use xpath to find one element in a particular refinedRange. did page change? not a huge issue, might have better contintencies.');
      }
      for (var i = 0; i < nodes.length; i++) {
        var range = new Range();
        if ([Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(nodes[i].nodeType)) {
          range.setStart(nodes[i], 0);
          range.setEnd(nodes[i], nodes[i].nodeValue.length);
        } else {
          range.selectNode(nodes[i]);
        }
        return range;
      }
      return null;
    }
  }, {
    key: 'fromRange',
    value: function fromRange(range, inRange) {
      if (typeof inRange === 'undefined') {
        inRange = new Range();inRange.selectNode(document.documentElement);
      }
      if (range.startContainer !== range.endContainer) {
        throw new Error('XPath selector can currently only encapsulate a single node, and a range that spans nodes was provided');
      }
      var node = void 0;
      if ([Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(range.startContainer.nodeType)) {
        node = range.startContainer;
      } else {
        node = range.startContainer.childNodes[range.startOffset];
      }
      var locationPath = [];
      var SEMANTIC_ATTRIBUTES = ['id', 'role', 'name', 'itemid', 'itemtype', 'itemprop'];
      var SECTION_ELEMENTS = ['address', 'article', 'aside', 'footer', 'h1', 'header', 'hgroup', 'nav', 'section', 'main', 'body'];
      var hasId = false;
      var hasSection = false;
      var duplicate = true;
      while (duplicate) {
        var step = {};
        step.NodeTest = '*';
        step.AttributePredicate = {};
        step.PositionPredicate = null;
        if (node.nodeType === 3) {
          step.NodeTest = 'text()';
        } else if (node.nodeType === 9) {
          step.NodeTest = '';
          if (this._setUniqueXpath(this._compileXpath('/', step, locationPath), inRange)) {
            duplicate = false;break;
          }
          console.warn('did not find a unique xpath for node, even at root level, so there must be an error in the xpath generator code!');
          return this;
        } else {
          for (var i in SEMANTIC_ATTRIBUTES) {
            var attribute = SEMANTIC_ATTRIBUTES[i];
            if (node.hasAttribute(attribute)) {
              if (i === 0) {
                hasId = true;
              }
              step.AttributePredicate[attribute] = node.getAttribute(attribute);
              if (hasSection | hasId && this._setUniqueXpath(this._compileXpath('//', step, locationPath), inRange)) {
                duplicate = false;break;
              }
            }
            if (i === 0) {
              step.NodeTest = node.nodeName.toLowerCase();
              if (SECTION_ELEMENTS.includes(step.NodeTest)) {
                hasSection = true;
              }
              if (hasSection | hasId && this._setUniqueXpath(this._compileXpath('//', step, locationPath), inRange)) {
                duplicate = false;break;
              }
            }
          }
        }
        step.PositionPredicate = this._nodePosition(step, node);
        if (locationPath.length > 0) {
          if (hasSection | hasId && this._setUniqueXpath(this._compileXpath('//', step, locationPath), inRange)) {
            duplicate = false;break;
          }
        }
        locationPath.unshift(this._compileXpath('', step));
        node = node.parentNode;
      }
      if (typeof this.refinedBy !== 'undefined') {
        this.refinedBy.fromRange(range);
      }
      return this;
    }
  }, {
    key: '_setUniqueXpath',
    value: function _setUniqueXpath(xpath, inRange) {
      if (document.evaluate('count(' + xpath + ')', inRange.commonAncestorContainer, null, XPathResult.NUMBER_TYPE, null).numberValue === 1) {
        this.value = xpath;
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: '_nodePosition',
    value: function _nodePosition(step, node) {
      var xpath = this._compileXpath('', step);
      var simset = document.evaluate(xpath, node.parentNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      if (simset.snapshotLength > 1) {
        for (var i = 0; i < simset.snapshotLength; i++) {
          if (simset.snapshotItem(i) === node) {
            return i + 1;
          }
        }
      } else if (simset.snapshotLength === 1) {
        return null;
      }
      throw new Error('error in _nodePosition. Could the node have been removed?');
    }
  }, {
    key: '_compileXpath',
    value: function _compileXpath() {
      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '//';
      var step = arguments[1];
      var locationPath = arguments[2];

      var xpath = '';
      xpath = xpath + step.NodeTest;
      if (Object.keys(step.AttributePredicate).length > 0) {
        var keys = Object.keys(step.AttributePredicate);
        var expr = [];
        for (var i = 0; i < keys.length; i++) {
          expr.push('@' + keys[i] + '="' + step.AttributePredicate[keys[i]] + '"');
        }
        xpath = xpath + '[' + expr.join(' and ') + ']';
      }
      if (step.PositionPredicate !== null) {
        xpath = xpath + '[' + step.PositionPredicate + ']';
      }
      if (typeof locationPath !== 'undefined' && locationPath.length > 0) {
        xpath = xpath + '/' + locationPath.join('/');
      }
      xpath = axis + xpath;
      return xpath;
    }
  }]);

  return XPathSelector;
}(_segmentSelector2.default);

exports.default = XPathSelector;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _segmentSelector = __webpack_require__(0);

var _segmentSelector2 = _interopRequireDefault(_segmentSelector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataPositionSelector = function (_SegmentSelector) {
  _inherits(DataPositionSelector, _SegmentSelector);

  function DataPositionSelector() {
    var _ret;

    var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { start: 0, end: null };

    _classCallCheck(this, DataPositionSelector);

    var _this = _possibleConstructorReturn(this, (DataPositionSelector.__proto__ || Object.getPrototypeOf(DataPositionSelector)).call(this));

    _this.type = 'DataPositionSelector';
    _this.start = object.start;
    _this.end = object.end;
    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  _createClass(DataPositionSelector, [{
    key: 'firstRange',
    value: function firstRange(inRange) {
      if (typeof inRange === 'undefined') {
        inRange = new Range();inRange.selectNode(document.documentElement);
      }
      var range = inRange;
      if (range.startContainer !== range.endContainer) {
        throw new Error('range must encapsulate one node only');
      }

      if (![Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(range.startContainer.nodeType)) {
        throw new Error('node must be a text node or similar for this to work currently.');
      }
      var newRange = new Range();
      var str = range.startContainer.nodeValue;
      var byteLen = 0;
      var foundStart = false;
      for (var i = 0; i <= range.endOffset; i++) {
        if (!foundStart && byteLen >= this.start) {
          newRange.setStart(range.startContainer, i);
          foundStart = true;
        }
        if (byteLen >= this.end) {
          newRange.setEnd(range.startContainer, i);
          return newRange;
        }
        var charCode = DataPositionSelector.fixedCharCodeAt(str, i);
        byteLen += DataPositionSelector.charCodeBytes(charCode);
      }
      return null;
    }
  }, {
    key: 'fromRange',
    value: function fromRange(range, inRange) {
      if (range.startContainer !== range.endContainer) {
        throw new Error('DataPositionSelector can only represent position in a single node currently');
      }
      if (![Node.TEXT_NODE, Node.PROCESSING_INSTRUCTION_NODE, Node.COMMENT_NODE].includes(range.startContainer.nodeType)) {
        throw new Error('node must be a text node or similar for this to work currently.');
      }

      var str = range.startContainer.nodeValue;
      var byteLen = 0;
      for (var i = 0; i <= range.endOffset; i++) {
        if (i === range.startOffset) {
          this.start = byteLen;
        }
        if (i === range.endOffset) {
          this.end = byteLen;
          break;
        }
        var charCode = DataPositionSelector.fixedCharCodeAt(str, i);
        byteLen += DataPositionSelector.charCodeBytes(charCode);
      }
      return this;
    }
  }], [{
    key: 'fixedCharCodeAt',
    value: function fixedCharCodeAt(str, idx) {
      idx = idx || 0;
      var code = str.charCodeAt(idx);
      if (isNaN(code)) {
        return null;
      }
      var hi = void 0,
          low = void 0;
      if (code >= 0xD800 && code <= 0xDBFF) {
        hi = code;
        low = str.charCodeAt(idx + 1);
        if (isNaN(low)) {
          throw new Error('High surrogate not followed by low surrogate in fixedCharCodeAt()');
        }
        return (hi - 0xD800) * 0x400 + (low - 0xDC00) + 0x10000;
      }
      if (code >= 0xDC00 && code <= 0xDFFF) {
        return null;
      }
      return code;
    }
  }, {
    key: 'charCodeBytes',
    value: function charCodeBytes(charCode) {
      if (typeof charCode === 'number') {
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
      } else {
        return 0;
      }
    }
  }]);

  return DataPositionSelector;
}(_segmentSelector2.default);

exports.default = DataPositionSelector;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _textPositionSelector = __webpack_require__(2);

var _textPositionSelector2 = _interopRequireDefault(_textPositionSelector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextQuoteSelector = function (_TextPositionSelector) {
  _inherits(TextQuoteSelector, _TextPositionSelector);

  function TextQuoteSelector() {
    var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { exact: null, prefix: null, suffix: null };

    _classCallCheck(this, TextQuoteSelector);

    var _this = _possibleConstructorReturn(this, (TextQuoteSelector.__proto__ || Object.getPrototypeOf(TextQuoteSelector)).call(this));

    _this.type = 'TextQuoteSelector';
    _this.exact = object.exact;
    _this.suffix = object.suffix;
    _this.prefix = object.prefix;
    Object.defineProperty(_this, 'start', { value: _this.start, enumerable: false, writable: true });
    Object.defineProperty(_this, 'end', { value: _this.end, enumerable: false, writable: true });
    Object.defineProperty(_this, 'epsilon', { value: 32, enumerable: false, writable: true });
    return _this;
  }

  _createClass(TextQuoteSelector, [{
    key: 'fromRange',
    value: function fromRange(range, inRange) {
      if (typeof inRange === 'undefined') {
        inRange = new Range();inRange.selectNode(document.documentElement);
      }
      _get(TextQuoteSelector.prototype.__proto__ || Object.getPrototypeOf(TextQuoteSelector.prototype), 'fromRange', this).call(this, range, inRange);
      var textContent = inRange.toString();

      this.exact = textContent.substring(this.start, this.end);
      this.prefix = textContent.substring(Math.max(this.start - this.epsilon, 0), this.start);
      this.suffix = textContent.substring(this.end, Math.min(this.end + this.epsilon, textContent.length));
      return this;
    }
  }, {
    key: 'firstRange',
    value: function firstRange(inRange) {
      if (typeof inRange === 'undefined') {
        inRange = new Range();inRange.selectNode(document.documentElement);
      }
      var textContent = inRange.toString();
      var fullMatchStart = textContent.indexOf(this.prefix + this.exact + this.suffix);
      if (fullMatchStart !== -1) {
        this.start = fullMatchStart + this.prefix.length;
        this.end = this.start + this.exact.length;
      } else {
        console.warn('TextQuoteSelector did not find a string match. returning null. try prefix/suffix and maybe string distance on those?');
        return null;
      }
      return _get(TextQuoteSelector.prototype.__proto__ || Object.getPrototypeOf(TextQuoteSelector.prototype), 'firstRange', this).call(this, inRange);
    }
  }, {
    key: 'toTextPositionSelector',
    value: function toTextPositionSelector() {
      return new _textPositionSelector2.default({ start: this.start, end: this.end });
    }
  }]);

  return TextQuoteSelector;
}(_textPositionSelector2.default);

exports.default = TextQuoteSelector;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _annotationBuilder = __webpack_require__(1);

var _annotationBuilder2 = _interopRequireDefault(_annotationBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ExternalWebResource = function () {
  function ExternalWebResource() {
    var object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { id: null };

    _classCallCheck(this, ExternalWebResource);

    this.type = 'ExternalWebResource';
    this.id = object.id;
    if (typeof object.purpose !== 'undefined') {
      this.purpose = object.purpose;
    }
    return this;
  }

  _createClass(ExternalWebResource, [{
    key: 'toRange',
    value: function toRange() {
      if (this.source !== _annotationBuilder2.default.parseURL(window.location.href)) {
        throw new Error('currently does not support getting range on other than current page. should add code to navigate to page or otherwise return null (but trying the first option before throwing null is best)');
      }
      var webResourceRange = new Range();
      webResourceRange.selectNode(document.documentElement);
      return webResourceRange;
    }
  }, {
    key: 'toSelection',
    value: function toSelection() {
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.toRange());
      return this;
    }
  }]);

  return ExternalWebResource;
}();

exports.default = ExternalWebResource;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UUID = function () {
  function UUID() {
    _classCallCheck(this, UUID);
  }

  _createClass(UUID, null, [{
    key: 'v4',
    value: function v4() {
      var bytes = UUID._randomBytes(16);

      bytes[6] = bytes[6] & 0x0f | 0x40;
      bytes[8] = bytes[8] & 0x3f | 0x80;
      var str = UUID._isNode() ? bytes.toString('hex') : '';
      if (str === '') {
        for (var i = 0; i < 16; i += 1) {
          str += UUID._bToStr(bytes[i]);
        }
      }
      return str.substr(0, 8) + '-' + str.substr(8, 4) + '-' + str.substr(12, 4) + '-' + str.substr(16, 4) + '-' + str.substr(20);
    }
  }, {
    key: '_isNode',
    value: function _isNode() {
      return typeof process !== 'undefined' && typeof process.pid === 'number';
    }
  }, {
    key: '_randomBytes',
    value: function _randomBytes(count) {
      var crypto = void 0;
      if (UUID._isNode()) return __webpack_require__(13).randomBytes(count);
      crypto = window.crypto || window.msCrypto;
      if (!crypto) {
        console.warn('Your environment does not support Crypto, falling back to Math.random()');
        var bytes = new Array(count);
        for (var num, i = 0; i < count; i++) {
          if ((i & 0x03) === 0) num = Math.random() * 0x100000000;
          bytes[i] = num >>> ((i & 0x03) << 3) & 0xff;
        }
        return bytes;
      }
      return crypto.getRandomValues(new Uint8Array(count));
    }
  }, {
    key: '_bToStr',
    value: function _bToStr(byte, sub) {
      var str = sub ? byte.toString(16).substr(sub) : byte.toString(16);
      while (str.length < 2) {
        str = '0' + str;
      }
      return str;
    }
  }]);

  return UUID;
}();

exports.default = UUID;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ })
/******/ ]);