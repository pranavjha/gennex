define([
    "dojo/_base/declare", // declare
    "dojo/_base/lang", // lang.partial, lang.hitch
    "dojo/dom-class", // domClass.add, domClass.remove
    "dojo/on", // on
    "dojo/topic", // topic.subscribe
    "dijit/focus" // focus.focus
], function(declare, lang, domClass, on, topic, focus) {
    //	module:
    //		gennex/mixins/_Droppable
    var _Droppable = declare(null, {
        //	summary:
        // 		_Droppable is a mixin for all widgets that can accept a draggable widget

        //	type: [public readonly] String
        //		the name of this class
        type : "../mixins/_Droppable",

        //	_draggedElement: [private] gennex/mixins/_Draggable
        //		the currently active draggable element. At any point of time, only one _Draggable 
        //		widget can be dragged. This class subscribes to the 'gennex/dragstart' topic to 
        //		populate the value for this attribute.
        _draggedElement : null,

        //	acceptableDrops: [public] String[]
        //		An array of class names of all widget classes whose objects can be dropped into 
        //		this widget. Implementing classes must provide this object. An empty array means 
        //		that this _Droppable widget will not accept any other widget.
        acceptableDrops : [],

        postCreate : function() {
            //	summary:
            //		This function adds droppable capabilities to the widget and subscribes to the 
            //		'gennex/dragstart' and 'gennex/dragend' topic to monitor the currently dragged 
            //		element.
            //  tags:
            //		extension private
            this.inherited(arguments);
            this.own(
            // dragover
            on(this.containerNode, 'dragover', lang.hitch(this, "_dragOver")),
            // dragenter
            on(this.containerNode, 'dragenter', lang.hitch(this, "_dragEnter")),
            // dragleave
            on(this.containerNode, 'dragleave', lang.hitch(this, "_dragLeave")),
            // dragenter
            on(this.domNode, 'dragenter', lang.partial(focus.focus, this.domNode)),
            // drop
            on(this.containerNode, 'drop', lang.hitch(this, "_drop")));

            topic.subscribe("gennex/dragstart", lang.hitch(this, function(draggedElement) {
                // only if the dragged element is acceptable to this drop target, register it.
                if (this.acceptableDrops.indexOf(draggedElement.type) !== -1) {
                    this._draggedElement = draggedElement;
                } else {
                    this._draggedElement = null;
                }
            }));
            topic.subscribe("gennex/dragend", lang.hitch(this, function(draggedElement) {
                this._draggedElement = null;
            }));
        },

        _dragOver : function(event) {
            //	summary:
            //		Callback function for dragOver on this widget. Stops default non droppable 
            //		behaviour of this widget. Here, we add the dropTarget class to the container
            //		for visual aid. The actual drop implementation is done in this function itself.
            //		If the draggedElement is not this element or this elements ancestor or this 
            //		elements immediate child, it is added to this widget. If this widget is also 
            //		a _SortableContainer, the _sortingElement property is populates so that sorting
            //		can resume with the newly added child
            //	event: Event
            //		The browser event object
            //	tags:
            //		private callback
            if (this._draggedElement) {
                // stop propagation here. if not stopped, the call will go to the parent _Droppable
                // element and so on leading to inconsistent drops and performance hits
                event.stopPropagation();
                domClass.add(this.containerNode, 'dropTarget');
                //		If the draggedElement is not this element or this elements ancestor or this 
                //		elements immediate child, it is added to this widget.
                if (this === this._draggedElement || this.isDescendantOf(this._draggedElement)
                    || this._draggedElement.getParent() === this) {
                    return;
                }
                this.addChild(this._draggedElement);
                // if the widget is sortable, instantiate the sorting element to the currently 
                // dropped element
                if ('_sortingElement' in this) {
                    this._sortingElement = this._draggedElement;
                }
                // focus the dom node. this is important because, if not done, the collapsible 
                // widgets like commandgroups get collapsed as soon as a new child is added
                focus.focus(this.domNode);
                // Necessary. Allows us to drop.
                event.preventDefault();
            }
        },

        _dragEnter : function(event) {
            //	summary:
            //		Callback function for a _Draggable dragged into this widget. Adds classes for 
            //		visual aid of the user
            //	event: Event
            //		The browser event object
            //	tags:
            //		private callback
            if (this._draggedElement) {
                domClass.add(this.containerNode, 'dropTarget');
                event.stopPropagation();
            }
        },

        _dragLeave : function(event) {
            //	summary:
            //		Callback function for a _Draggable dragged out of this widget. Removes classes 
            //		for visual aid of the user
            //	event: Event
            //		The browser event object
            //	tags:
            //		private callback
            if (this._draggedElement) {
                domClass.remove(this.containerNode, 'dropTarget');
                event.stopPropagation();
            }
        },

        _drop : function(event) {
            //	summary:
            //		Callback function for a _Draggable dropped on this widget. Adds the dropped 
            //		_Draggable into this widget. The original _Draggable is destroyed as 
            //		a new _Draggable is created.
            //	event: Event
            //		The browser event object
            //	tags:
            //		private callback
            event.stopPropagation();
            domClass.remove(this.containerNode, 'dropTarget');
        }
    });
    return _Droppable;
});