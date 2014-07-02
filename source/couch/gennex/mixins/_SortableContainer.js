define([
    "dojo/_base/declare", // declare
    "dojo/_base/lang", // lang.mixin, lang.hitch
    "dojo/on", // on
    "dojo/dom-class", // domClass.add, domClass.remove
    "dijit/focus", // focus.focus
    "dijit/registry" // registry.byId
], function(declare, lang, on, domClass, focus, registry) {
    //	module:
    //		gennex/mixins/_SortableContainer
    var _SortableContainer = declare(null, {
        //	summary:
        // 		_SortableContainer is a mixin for all widgets whose children can be sorted using 
        //		drag and drop

        //	type: [public readonly] String
        //		the name of this class
        type : "../mixins/_SortableContainer",

        // _relativeElement: [private] dijit/_Widget
        //		The relative element contains a reference to the child element next to which the 
        //		currently sorting element is to be positioned. This element is identified by the 
        //		dragover event which is attached to all the child elements of this container. The 
        //		child over which a dragOver event occurs becomes the current relative element
        _relativeElement : null,

        //	_sortingElement: [private] dijit/_Widget
        //		the currently active dragging element. At any point of time, only one child 
        //		element can be dragged for sorting. The _sortingElement is populated in the 
        //		_sortStart function which is attached to dragstart event for all child widgets.
        _sortingElement : null,

        //	acceptableSorts: [public] String[]
        //		An array of class names of all child widget classes which can be sorted here. 
        //		Implementing classes must provide this object. An empty array means that this 
        //		_SortableContainer widget will not sort any child.
        acceptableSorts : [],

        _postChildAdd : function(childNode) {
            //	summary:
            //		This function adds sortableContainer capabilities to the newly created child 
            //		widget. This function makes all child elements in the widget sortable.
            //	childNode: dijit/_Widget
            //		the newly added child widget
            //  tags:
            //		extension private
            this.inherited(arguments);
            if (this.acceptableSorts.indexOf(childNode.type) !== -1) {
                this.own(
                // dragstart
                on(childNode.domNode, 'dragstart', lang.hitch(this, "_sortStart")),
                // dragend
                on(childNode.domNode, 'dragend', lang.hitch(this, "_sortEnd")),
                // dragover
                on(childNode.domNode, 'dragover', lang.hitch(this, "_repositionChildren")));
            }
        },

        _sortStart : function(event) {
            //	summary:
            //		Callback function for dragStart of the child widget. Sets the data in the 
            //		event.dataTransfer object so that it starts dragging. The _sortingElement 
            //		attribute for this class is set to the current event target and the 'dragging' 
            //		class is added to the child widget for visual aid.
            //	event: Event
            //		The browser event object
            //	tags:
            //		private callback
            this._sortingElement = registry.byId(event.currentTarget.id);
            domClass.add(event.currentTarget, "dragging");
            event.dataTransfer.setData("text/plain", "*");
            event.stopPropagation();
        },

        _sortEnd : function(event) {
            //	summary:
            //		Callback function for the widget which is dragged. Called when the drag ends. 
            //		Here, we remove the 'dragging' class from the dragged widget.
            //	event: Event
            //		The browser event object
            //	tags:
            //		private callback
            this._sortingElement = null;
            domClass.remove(event.currentTarget, "dragging");
            event.stopPropagation();
        },

        _repositionChildren : function(event) {
            //	summary:
            //		Callback function for the child widget over which another child is dragged.
            //		This function adds a 'dropTarget' class to the container for visual aid. Then, 
            //		it identifies the _relativeElement as the currently dragged over child and 
            //		positions the dragged child next to it. To avoid performance issues, the child 
            //		node is moved only when the _sortingElement changes and the drag is not on the 
            //		dragging element itself.
            //	event: Event
            //		The browser event object
            //	tags:
            //		private callback
            domClass.add(this.containerNode, 'dropTarget');
            // if the event target is the same as the dragging element, dont do anything
            if (!this._sortingElement || this._sortingElement === this
                || event.currentTarget.id === this._sortingElement.id) {
                return;
            }
            // To avoid performance issues, move the child node only when the _sortingElement 
            // changes
            if (!this._relativeElement || this._relativeElement.id !== event.currentTarget.id) {
                this._relativeElement = registry.byId(event.currentTarget.id);
                this.addChild(this._sortingElement,
                    (this.getIndexOfChild(this._relativeElement) + 1));

                // focus the dom node. this is important because, if not done, the collapsible 
                // widgets like commandgroups get collapsed as soon as a new child is added
                focus.focus(this.domNode);
            }
            event.stopPropagation();
            event.preventDefault();
        }
    });
    return _SortableContainer;
});