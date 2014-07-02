define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "dijit/_FocusMixin", // extends
    "../mixins/_Container", // extends
    "dojo/text!./templates/CommandGroup.html", //template
    "dojo/dom-class", // domClass.add, domClass.remove
    "dojo/_base/lang", // lang.mixin
    "dijit/focus", // focus.focus
    "dojo/dom-geometry", // domGeometry.position
    "dojo/window", // win.getBox
    "dojo/dom-style" // domStyle.get, domStyle.set
], function(declare, _WidgetBase, _TemplatedMixin, _FocusMixin, _Container, template, domClass,
    lang, focus, domGeometry, win, domStyle) {

    /*=====
    var __StateObject = declare(null, {
    	//	element: String
    	//		The layout for the entire CommandGroup. Available values and their impact on 
    	//		presentation are:
    	//		- expanded: the entire layout including the widgets inside this CommandGroup is 
    	//		visible
    	//		- collapsed: only the CommandGroup header is visible. The contents can be seen on 
    	//		focus or mouseover on the CommandGroup
    	//	orientation: String
    	//		The orientation rules followed by the CommandButton. Available values and their 
    	//     impact on presentation are:
    	//		- horizontal: the CommandGroup is displayed horizontally like a MenuBar. The header 
    	//		label is hidden and appears as a drag indicator inline with the body
    	//		- vertical: the CommandGroup is displayed vertically like a vertical ToolBar. The 
    	//		header label is hidden and appears as a drag indicator above the body
    	//		- float: the default orientation where the CommandGroup is displayed with a full 
    	//		header and the contents are shown below it.
    	//	content: String
    	//		The content settings for the CommandGroup. Available values and their impact on the
    	//		child Commands are:
    	//		- smallIconOnly: only icons in small dimension are displayed inside the container.
    	//      Label is displayed on mouseover as a tooltip
    	//		- smallIconLabel: both icon and label are displayed with icon dimension as small 
    	//      inside the container
    	//		- largeIconOnly: only icons in large dimension are displayed inside the container. 
    	//      Label is displayed on mouseover as a tooltip
    	//		- largeIconLabel: both icon and label are displayed with icon dimension as large 
    	//      inside the container
    });
    =====*/

    //	module:
    //		gennex/widgets/CommandGroup
    var CommandGroup = declare([
        _WidgetBase,
        _TemplatedMixin,
        _FocusMixin,
        _Container
    ], {
        //	summary:
        //		A CommandGroup is a group of Commands of the same genre presented together. This 
        //		is different from a RadioGroup or a CheckboxGroup which are behavioral widgets 
        //		and have no presentation. On the other hand, a commandGroup is a visual grouping 
        //		of widgets.

        //	type: [public readonly] String
        //		the name of this class
        type : "../widgets/CommandGroup",

        //	templateString: [private] String
        //		the footer template placed at templates/CommandGroup.html
        templateString : template,

        //	baseClass: [private] String
        //		the CommandGroup base class
        baseClass : "gennexCommandGroup",

        /*=====
        //	currentState: [public] __StateObject
        //		the current state of the CommandGroup.
        currentState : {
        	element : 'collapsed',
        	orientation : 'float',
        	content : 'largeIconOnly'
        },
        =====*/

        //	label: [public] String
        //		the CommandGroup label
        label : '',

        //	_parentZIndex: [private] Integer
        //		The original z-index of the parent node. The z-index of the parent node is 
        //		increased when the CommandGroup gets focus to make sure that the sub-menu is on top
        //		of everything. It is then reduced on blur to the original value
        _parentZIndex : null,

        _preChildAdd : function(newChild) {
            //	summary:
            //		This function is called before a new child is added to the CommandGroup. Here, 
            //		we check if the new child is a CommandGroup. If it is so, we set its 
            //		orientation depending on this widgets orientation. If the child is a command, 
            //		we set its current layout to this widgets content state
            //	newChild: dijit/_Widget
            //		the new child widget
            //	returns:
            //		the same child object sent as parameter
            // 	tags:
            //		private callback
            child = this.inherited(arguments);
            if ('setState' in child) {
                child.setState('orientation',
                    ((this.currentState.element === 'collapsed') ? 'float'
                        : this.currentState.orientation));
            } else if ('setLayout' in child) {
                child.setLayout(this.currentState.content);
            }
            return child;
        },

        postMixInProperties : function() {
            //	summary:
            //		mixins the currentState of the CommandGroup Configured by the user with a set 
            //		of default states.
            //  tags:
            //		extension private
            this.inherited(arguments);
            this.currentState = lang.mixin({
                element : 'collapsed',
                content : 'largeIconOnly',
                orientation : 'float'
            }, this.currentState);
        },

        postCreate : function() {
            //	summary:
            //		sets the tabIndex of the CommandGroup to 0 so that it can be focused
            //  tags:
            //		extension private
            this.inherited(arguments);
            this.domNode.setAttribute('tabIndex', 0);
        },

        setState : function(stateName, stateValue) {
            //	summary:
            //		Sets the state of the CommandGroup to the state sent as parameter. The state 
            //		change logic is as follows:
            //		- remove the classes representing the previous state and add new classes for 
            //		the new state
            //		- set the header of all children to full if the element state is collapsed and 
            //		call the _onFocus function so that the CommandGroup expands
            // 		- if the new element state is expanded, remove the visible and hidden class if 
            //		it exists and change all its child orientations to the current orientation
            // 		- if the element is expanded and the orientation changes, the orientation 
            //		change is propagated to all child elements supporting orientation change
            // 		- if the content state changes, the change is propagated to all elements 
            //		supporting a content state
            // 	stateName: String
            //       the category of the state to be changed
            //	stateValue: String
            //		the new value of the stateName category
            //  tags:
            //		public

            var _prevState = this.currentState[stateName];
            this.currentState[stateName] = stateValue;
            // remove the classes representing the previous state and add new classes for the new 
            // state
            domClass.remove(this.domNode, stateName + "-" + _prevState);
            domClass.remove(this.headerNode, stateName + "-" + _prevState);
            domClass.remove(this.containerNode, stateName + "-" + _prevState);
            domClass.add(this.domNode, stateName + "-" + stateValue);
            domClass.add(this.headerNode, stateName + "-" + stateValue);
            domClass.add(this.containerNode, stateName + "-" + stateValue);
            if (stateName === 'element') {
                if (stateValue === 'collapsed') {
                    // set the header of all children to full if the element state is collapsed
                    this.getChildren().forEach(function(child) {
                        if (child.setState) {
                            child.setState('orientation', 'float');
                        }
                    });
                    // call the _onFocus function so that the CommandGroup expands
                    this._onFocus();
                } else {
                    // if the new element state is expanded, remove the visible and hidden class 
                    // if it exists and change all its child orientations to the current 
                    // orientation
                    domClass.remove(this.containerNode, 'visible hidden');
                    var _currOrientation = this.currentState.orientation;
                    this.getChildren().forEach(function(child) {
                        if (child.setState) {
                            child.setState('orientation', _currOrientation);
                        }
                    });
                }
            } else if (stateName === 'orientation') {
                if (this.currentState.element === 'expanded') {
                    // if the element is expanded and the orientation changes, the orientation 
                    // change is propagated to all child elements supporting orientation change
                    this.getChildren().forEach(function(child) {
                        child.setState && child.setState('orientation', stateValue);
                    });
                }
            } else if (stateName === 'content') {
                // if the content state changes, the change is propagated to all elements 
                // supporting a content state
                this.getChildren().forEach(function(child) {
                    child.setLayout && child.setLayout(stateValue);
                    child.setState && child.setState('content', stateValue);
                });
            }
        },

        _onFocus : function() {
            //	summary:
            //		This function will be called when the widget steals focus. The underlying 
            //		commands should be displayed here if the current CommandGroup state is 
            //		collapsed. This function takes care of positioning the sub-menus appropriately 
            //		for visibility on the screen. The original z-index of the parent node is 
            //		stored in a local variable and changed to make sure that the sub-menu is on 
            //		top of everything. It is then reduced on blur to the original value. The 
            //		positioning logic is described below:
            //		- Make the CommandGroup visible if it is collapsed
            // 		- Calculate the position of the CommandGroup container
            // 		- Get the geometry of the commandGroups domNode, the commandGroups 
            //		containerNode and the viewport
            // 		- Get the values of padding on the parentNode of the CommandGroup to correct 
            // 		padding errors in positioning
            // 		- If the orientation is horizontal, the CommandGroup should pop out above or 
            //		below the header. In that case, correct the left co-ordinates with a delta so 
            //		that the CommandGroup does not bleed beyond the right side of the viewport
            // 		- For horizontal orientation if the CommandGroup can be accomodated to the top 
            //		of the header node, do that. if accomodating the CommandGroup above the header 
            //		is not possible, display it below the header
            // 		- If the orientation is vertical or float, the CommandGroup should pop out to 
            // 		the right or left of the header. In that case, correct the top co-ordinates 
            //		with a delta so that the CommandGroup does not bleed beyond the bottom side of 
            //		the viewport
            // 		- For a vertical or float orientation, if the CommandGroup can be accomodated 
            //		to the right of the header node, do that. If accomodating the CommandGroup to 
            //		the right the header is not possible, display it to the left of the header
            //	tags:
            //		private callback extension

            // add the focused class to the widget header node for visual aid
            domClass.add(this.headerNode, "gennexCommandGroupHeaderFocused");
            // store the original z-index of the domNode
            this._parentZIndex = domStyle.get(this.getParent().domNode, 'zIndex');
            // set the z-index of the domNode to 99
            domStyle.set(this.getParent().domNode, 'zIndex', '99');
            if (this.currentState.element === 'collapsed') {
                // make the CommandGroup visible if it is collapsed
                domClass.add(this.containerNode, 'visible');
                // calculate the position of the CommandGroup container
                // get the geometry of the commandGroups domNode, the commandGroups containerNode 
                // and the viewport
                var _thisGeom = domGeometry.position(this.domNode);
                var _containerGeom = domGeometry.position(this.containerNode);
                var _windowGeom = win.getBox();
                // get the values of padding on the parentNode of the CommandGroup to correct 
                // padding errors in positioning
                var _padding = {
                    top : domStyle.get(this.domNode.parentNode, 'paddingTop'),
                    left : domStyle.get(this.domNode.parentNode, 'paddingLeft'),
                    bottom : domStyle.get(this.domNode.parentNode, 'paddingBottom'),
                    right : domStyle.get(this.domNode.parentNode, 'paddingRight')
                };
                if (this.currentState.orientation === "horizontal") {
                    // if the orientation is horizontal, the CommandGroup should pop out above or 
                    // below the header
                    var _left = (_windowGeom.w - _thisGeom.x - _containerGeom.w - 2);
                    // correct the left co-ordinates with a delta so that the CommandGroup does not
                    // bleed beyond the right side of the viewport
                    _left = (_left > 0 ? 0 : _left);
                    domStyle.set(this.containerNode, 'left', _left + 'px');
                    domStyle.set(this.containerNode, 'right', 'auto');
                    if ((_thisGeom.y - _containerGeom.h - 2) <= 0) {
                        // if the CommandGroup can be accomodated to the top of the header node, 
                        // do that
                        var _top = (_thisGeom.h + _padding.bottom + 2);
                        domStyle.set(this.containerNode, 'top', _top + 'px');
                        domStyle.set(this.containerNode, 'bottom', 'auto');
                    } else {
                        // if accomodating the CommandGroup above the header is not possible, 
                        // display it below the header
                        var _bottom = (_thisGeom.h + _padding.top + 2);
                        domStyle.set(this.containerNode, 'top', 'auto');
                        domStyle.set(this.containerNode, 'bottom', _bottom + 'px');
                    }
                } else {
                    // if the orientation is vertical or float, the CommandGroup should pop out to 
                    // the right or left of the header
                    var _top = (_windowGeom.h - _thisGeom.y - _containerGeom.h - 2);
                    // correct the top co-ordinates with a delta so that the CommandGroup does not
                    // bleed beyond the bottom side of the viewport
                    _top = (_top > 0 ? (-_padding.top - 2) : _top);
                    domStyle.set(this.containerNode, 'top', _top + 'px');
                    domStyle.set(this.containerNode, 'bottom', 'auto');
                    if ((_thisGeom.x + _thisGeom.w + _containerGeom.w) > _windowGeom.w) {
                        // if the CommandGroup can be accomodated to the right of the header node, 
                        // do that
                        var _right = (_thisGeom.w + _padding.left + 1);
                        domStyle.set(this.containerNode, 'left', 'auto');
                        domStyle.set(this.containerNode, 'right', _right + 'px');
                    } else {
                        // if accomodating the CommandGroup to the right the header is not 
                        // possible, display it to the left of the header
                        var _left = (_thisGeom.w + _padding.right + 1);
                        domStyle.set(this.containerNode, 'left', _left + 'px');
                        domStyle.set(this.containerNode, 'right', 'auto');
                    }
                }
            }
            this.inherited(arguments);
        },

        _onBlur : function() {
            //	summary:
            //		This function will be called when the widget focus is stolen. The underlying 
            //		commands should be hidden here if the current CommandGroup state is collapsed 
            //		and the z-index should be restored.
            //	tags:
            //		private callback extension
            domStyle.set(this.getParent().domNode, 'zIndex', this._parentZIndex);
            domClass.remove(this.headerNode, "gennexCommandGroupHeaderFocused");
            if (this.currentState.element === 'collapsed') {
                domClass.remove(this.containerNode, 'visible');
            }
            this.inherited(arguments);
        },

        _activateCommandGroup : function() {
            //	summary:
            //		The onmouseover event handler for the widget. A mouseover on the widget steals 
            //		focus for itself only if the parent node is focused. 
            //	tags:
            //		private callback
            if (this.getParent().focused && !this.focused) {
                focus.focus(this.domNode);
            }
        }
    });
    return CommandGroup;
});