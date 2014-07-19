define([
    "dojo/_base/declare", // declare
    "dojo/_base/lang", // lang.hitch
    "dojo/topic", // topic.publish
    "dojo/dom-class", // domClass.add, domClass.remove
    "dojo/on" // on
], function(declare, lang, topic, domClass, on) {
    //	module:
    //		gennex/mixins/_Draggable
    var _Draggable = declare(null, {
        //	summary:
        // 		_Draggable is a mixin for all widgets that can be dragged

        //	type: [public readonly] String
        //		the name of this class
        type : "../mixins/_Draggable",

        postCreate : function() {
            //	summary:
            //		This function adds draggable capabilities to the widget
            //  tags:
            //		extension private
            this.inherited(arguments);
            this.own(
            // dragstart
            on(this.domNode, 'dragstart', lang.hitch(this, "_dragStart")),
            // dragend
            on(this.domNode, 'dragend', lang.hitch(this, "_dragEnd")));
        },

        _dragStart : function(event) {
            //	summary:
            //		Callback function for dragStart of the widget. Sets the data in the event so 
            //		that the widget becomes draggable and publishes a gennex/dragstart topic with 
            //		this widget as parameter. All widgets subscribed to this topic get the 
            //		currently dragged widget.
            //	tags:
            //		private callback
            domClass.add(this, "dragging");
            topic.publish("gennex/dragstart", this);
            event.dataTransfer.setData("text/plain", "*");
            event.stopPropagation();
        },

        _dragEnd : function(event) {
            //	summary:
            //		Callback function for dragEnd of the widget. Publishes a gennex/dragend topic 
            //		with this widget as parameter. All widgets subscribed to this topic get the 
            //		currently dropped widget.
            //	tags:
            //		private callback
            domClass.remove(this, "dragging");
            topic.publish("gennex/dragend", this);
            event.stopPropagation();
        }
    });
    return _Draggable;
});