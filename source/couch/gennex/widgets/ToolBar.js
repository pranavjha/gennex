define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "../mixins/_Container", // extends
    "../mixins/_Droppable", // extends
    "../mixins/_SortableContainer", // extends
    "dojo/text!./templates/ToolBar.html" //template
], function(declare, _WidgetBase, _TemplatedMixin, _Container, _Droppable, _SortableContainer,
    template) {
    //	module:
    //		gennex/widgets/ToolBar
    var ToolBar = declare([
        _WidgetBase,
        _TemplatedMixin,
        _Container,
        _Droppable,
        _SortableContainer
    ], {
        //	summary:
        //		A ToolBar is container for ExtendedCommandGroups and it supports dropping and 
        //		sorting of ExtendedCommandGroups inside it. A ToolBar will always be docked at 
        //		any of the four ends of the screen.

        //	type: [public readonly] String
        //		the name of this class
        type : "../widgets/ToolBar",

        //	acceptableDrops: [public] String[]
        //		An array of class names of all widget classes whose objects can be dropped into 
        //		this widget.
        acceptableDrops : [
            '../widgets/ExtendedCommandGroup'
        ],

        //	acceptableSorts: [public] String[]
        //		An array of class names of all child widget classes which can be sorted here.
        acceptableSorts : [
            '../widgets/ExtendedCommandGroup'
        ],

        //	baseClass: [private] String
        //		the ToolBar base class
        baseClass : "gennexToolBar",

        //	templateString: [private] String
        //		the ToolBar template placed at templates/ToolBar.html
        templateString : template,

        //	position: [public] String
        //		The current position of the ToolBar. This value represents the side of the screen 
        //		where the ToolBar is docked. Available values are:
        //		- north: when the ToolBar is docked at the top edge of the screen
        //		- south: when the ToolBar is docked at the bottom edge of the screen
        //		- east: when the ToolBar is docked at the right edge of the screen
        //		- west: when the ToolBar is docked at the left edge of the screen
        position : "north",

        _preChildAdd : function(child) {
            //	summary:
            //		This function is called before a new child is added to the ToolBar. Here, we 
            //		check if the new child is an ExtendedCommandGroup. If it is so, we set its 
            //		orientation depending on this ToolBar's orientation.
            //	newChild: dijit/_Widget
            //		the new child widget
            //	returns:
            //		the same child object sent as parameter
            // 	tags:
            //		private callback
            child = this.inherited(arguments);
            if (child.type === "../widgets/ExtendedCommandGroup") {
                child.setState('orientation',
                    ((this.position == 'north' || this.position == 'south') ? 'horizontal'
                        : 'vertical'));
            }
            return child;
        }
    });
    return ToolBar;
});