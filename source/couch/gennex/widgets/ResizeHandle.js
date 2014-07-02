define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "dojo/text!./templates/ResizeHandle.html", //template
    "dojo/dom-geometry", // domGeometry.position
    "dojo/on", // on
    "dojo/_base/lang", // lang.hitch
    "dojo/dom-style" // domStyle.get, domStyle.set
], function(declare, _WidgetBase, _TemplatedMixin, template, domGeometry, on, lang, domStyle) {

    /*=====
    var __ConstraintObject = declare(null, {
    	//	min: Number
    	//		The minimum allowed value of the dimension that is to be resized
    	//	max: Number
    	//		The maximum allowed value of the dimension that is to be resized. Setting this 
    	//		value to 0 or null removes the max constraint on the resize dimension
    	//	step: Number
    	//		The step value in which the dimension should be resized. Setting this value to 
    	//		0 enforces a smooth resize
    });
    =====*/

    var _SizingFunctions = declare(null, {
        //	summary:
        //		Defines the different sizing functions for each resize direction. Every sizing 
        //		function is invoked with the ResizeHandler context, So the this keyword here refers 
        //		to the ResizeHandler.
        //		The resize logic for all resize functions are almost same and it is documented 
        //		below:
        //		- Calculate the adjustment that has to be done in the width/height of the parent 
        //		element
        // 		- If the width/height adjustment is more than the step, normalize it with respect 
        //		to the step and calculate the new width/height
        // 		- Normalize the new width/height by slicing the value to the min max range
        // 		- If the normalized width/height is different from the actual element width/height,
        //		change the width/height of the element
        //		- Adjust the value of _targetSize accordingly

        'east' : function(event) {
            //	summary:
            //		mousemove sizing function for the east resize.
            //	event: Event
            //		The browser event object
            //  tags:
            //		private callback

            // calculate the adjustment that has to be done in the width of the parent element
            var _delta = event.pageX - this._targetSize.x - this._targetSize.w;
            if (Math.abs(_delta) > this.constraints.step) {
                // if the width adjustment is more than the step, normalize it with respect to the 
                // step and calculate the new width
                var wNew = Math.round(_delta / this.constraints.step) * this.constraints.step
                    + this._targetSize.w;
                // normalize the new width by slicing the value to the min max range
                wNew = (wNew < this.constraints.min) ? this.constraints.min
                    : ((wNew > this.constraints.max) ? this.constraints.max : wNew);
                // if the normalized width is different from the actual element width, change the 
                // width of the element
                if (wNew != this._targetSize.w) {
                    this._targetSize.w = wNew;
                    domStyle.set(this.domNode.parentNode, 'width', wNew + 'px');
                }
            }
        },
        'west' : function(event) {
            //	summary:
            //		mousemove sizing function for the west resize.
            //	event: Event
            //		The browser event object
            //  tags:
            //		private callback

            // calculate the adjustment that has to be done in the width of the parent element
            var _delta = this._targetSize.x - event.pageX;
            if (Math.abs(_delta) > this.constraints.step) {
                // if the width adjustment is more than the step, normalize it with respect to the 
                // step and calculate the new width
                var wNew = Math.round(_delta / this.constraints.step) * this.constraints.step
                    + this._targetSize.w;
                // normalize the new width by slicing the value to the min max range
                wNew = (wNew < this.constraints.min) ? this.constraints.min
                    : ((wNew > this.constraints.max) ? this.constraints.max : wNew);
                // if the normalized width is different from the actual element width, change the 
                // width of the element
                if (wNew != this._targetSize.w) {
                    this._targetSize.x = this._targetSize.x - wNew + this._targetSize.w;
                    this._targetSize.w = wNew;
                    domStyle.set(this.domNode.parentNode, 'width', wNew + 'px');
                }
            }
        },
        'north' : function(event) {
            //	summary:
            //		mousemove sizing function for the north resize.
            //	event: Event
            //		The browser event object
            //  tags:
            //		private callback

            // calculate the adjustment that has to be done in the height of the parent element
            var _delta = this._targetSize.y - event.pageY;
            if (Math.abs(_delta) > this.constraints.step) {
                // if the height adjustment is more than the step, normalize it with respect to the 
                // step and calculate the new height
                var hNew = Math.round(_delta / this.constraints.step) * this.constraints.step
                    + this._targetSize.h;
                // normalize the new height by slicing the value to the min max range
                hNew = (hNew < this.constraints.min) ? this.constraints.min
                    : ((hNew > this.constraints.max) ? this.constraints.max : hNew);
                if (hNew != this._targetSize.h) {
                    // if the normalized height is different from the actual element height, change 
                    // the height of the element
                    this._targetSize.y = this._targetSize.y - hNew + this._targetSize.h;
                    this._targetSize.h = hNew;
                    domStyle.set(this.domNode.parentNode, 'height', hNew + 'px');
                }
            }
        },
        'south' : function(event) {
            //	summary:
            //		mousemove sizing function for the south resize.
            //	event: Event
            //		The browser event object
            //  tags:
            //		private callback

            // calculate the adjustment that has to be done in the height of the parent element
            var _delta = event.pageY - this._targetSize.y - this._targetSize.h;
            if (Math.abs(_delta) > this.constraints.step) {
                // if the height adjustment is more than the step, normalize it with respect to the 
                // step and calculate the new height
                var hNew = Math.round(_delta / this.constraints.step) * this.constraints.step
                    + this._targetSize.h;
                // normalize the new height by slicing the value to the min max range
                hNew = (hNew < this.constraints.min) ? this.constraints.min
                    : ((hNew > this.constraints.max) ? this.constraints.max : hNew);
                if (hNew != this._targetSize.h) {
                    // if the normalized height is different from the actual element height, change 
                    // the height of the element
                    this._targetSize.h = hNew;
                    domStyle.set(this.domNode.parentNode, 'height', hNew + 'px');
                }
            }
        }

    });
    //	module:
    //		gennex/widgets/ResizeHandle
    var ResizeHandle = declare([
        _WidgetBase,
        _TemplatedMixin
    ], {
        //	summary:
        //		Defines the ResizeHandle class. A ResizeHandle class represents a resize control. 
        //		A resize control attaches itself to its parent node and resizes the parent node 
        //		when the used drags the resizeHandle

        //	type: [public readonly] String
        //		the name of this class
        type : "../widgets/ResizeHandle",

        //	templateString: [private] String
        //		the ResizeHandle template placed at templates/ResizeHandle.html
        templateString : template,

        //	baseClass: [private] String
        //		the ResizeHandle base class
        baseClass : "gennexResizeHandle",

        //	resizeDirection: [private] String
        //		This value represents the direction in which the resize should take place. 
        //		possible values are 'north', 'south', 'east' and 'west'
        resizeDirection : 'east',

        //	constraints: [public] __ConstraintObject
        //		the constraints to be enforced on the element resize.
        constraints : null,

        //	_registeredEvents: [private] Object[]
        //		list of currently registered events on the handler			
        _registeredEvents : [],

        //	_targetSize: [private] Object
        //		The current dimension of the target object which is resized
        _targetSize : null,

        // _sizingFunctions: [private] _SizingFunctions
        //		An object with key value pairs mapping the resizeDirection to the corresponding 
        //		mousemove sizing functions
        _sizingFunctions : new _SizingFunctions(),

        postCreate : function() {
            //	summary:
            //		Adds mousedown handlers to the resize component to begin resize
            //  tags:
            //		extension private
            this.own(on(this.domNode, "mousedown", lang.hitch(this, "_beginSizing")));
        },

        _beginSizing : function(event) {
            //	summary:
            //		The mousedown handler for the resize widget. Caches the current state of 
            //		the parent widget and attaches mousemove and mouseup handlers on document 
            //		for resize
            //	event: Event
            //		The browser event object
            //  tags:
            //		private callback

            // cache the size of the parent
            this._targetSize = domGeometry.position(this.domNode.parentNode, true);
            // unregister old mousemove events for safety
            this._unregisterEvents();
            // add mousemove event on document
            this._registeredEvents.push(on(document, "mousemove", lang.hitch(this,
                this._sizingFunctions[this.resizeDirection])));
            // add mouseup event on document
            this._registeredEvents.push(on(document, "mouseup", lang.hitch(this, "_endSizing")));
        },

        _endSizing : function(event) {
            //	summary:
            //		The mouseup handler for the resize widget attached to document. Ends the resize 
            //		operation by unregistering all document level events.
            //  tags:
            //		private callback
            this._unregisterEvents();
        },

        _unregisterEvents : function() {
            //	summary:
            //		Unregisters the mousemove and mousedown events on the document. This function 
            //		is called when resize ends.
            //  tags:
            //		private
            while (this._registeredEvents.length) {
                this._registeredEvents.pop().remove();
            }
        }
    });
    return ResizeHandle;
});