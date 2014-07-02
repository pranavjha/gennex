define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "../mixins/_Container", // extends
    "dijit/_FocusMixin", // extends
    "../mixins/_ContextAware", // extends
    "dojo/Evented", // extends
    "dojo/text!./templates/ContextMenu.html", // template
    "dojo/_base/lang", // lang.hitch
    "dojo/on", // on
    "dojo/dom-class", // domClass.add, domClass.remove
    "dijit/focus", // focus.focus
    "dojo/dom-style", // domStyle.set
    "dojo/dom-geometry", // domGeometry.position
    "dojo/window" // win.getBox
], function(declare, _WidgetBase, _TemplatedMixin, _Container, _FocusMixin, _ContextAware, Evented,
    template, lang, on, domClass, focus, domStyle, domGeometry, win) {
    //	module:
    //		gennex/widgets/ContextMenu
    var ContextMenu = declare([
        _WidgetBase,
        _TemplatedMixin,
        _Container,
        _FocusMixin,
        _ContextAware,
        Evented
    ], {
        //	summary:
        //		A ContextMenu is a collection of CommandGroups displayed as a context menu. The 
        //		context menu gets attached to the parentNode of its domNode and shows up when the 
        //		user right clicks on the parentNode.

        //	type: [public readonly] String
        //		the name of this class
        type : "../widgets/ContextMenu",

        //	templateString: [private] String
        //		the footer template placed at templates/ContextMenu.html
        templateString : template,

        //	baseClass: [private] String
        //		the ContextMenu base class, this is used by _CssStateMixin 
        //		to create hover and active classes
        baseClass : "gennexContextMenu",

        postCreate : function() {
            //	summary:
            //		sets the tabIndex of the ContextMenu to 0. Hides the context menu and adds a 
            //		contextmenu handler to the parentNode to show the menu. A mouseover on the 
            //		context menu is not allowed to propagate to stop allowing on-hover focus 
            //		behavior of gennex/widgets/ExtendedCommandGroup and gennex/widgets/Command
            //  tags:
            //		extension private
            this.inherited(arguments);
            this.domNode.setAttribute('tabIndex', 0);
            domClass.add(this.domNode, 'hidden');
            this.own(on(this.domNode.parentNode, 'contextmenu', lang.hitch(this, '_showContext')));
            this.own(on(this.domNode, 'mouseover', function(event) {
                // to stop on-hover focus for ExtendedCommandGroups
                event.stopPropagation();
            }));
        },

        postMixInProperties : function() {
            //	summary:
            //		All the Command widgets that are descendants of the ContextMenu should trigger 
            //		the _doAction method of the context menu which in turn emits the action event. 
            //		To do that, we recursively loop through all the descendants and bind the 
            //		onAction property if the descendant is a Command
            //  tags:
            //		extension private
            var _doAction = lang.hitch(this, '_doAction');
            (function addActionRecursively(construct) {
                if (construct.type === "../widgets/Command") {
                    //bind the onAction property if the descendant is a Command
                    construct.onActive = lang.partial(_doAction, {
                        group : construct.group,
                        value : construct.value
                    });
                } else {
                    // for all other descendants, check if they have childConstructs. If so, search 
                    // Commands inside them
                    construct.childConstruct
                        && construct.childConstruct.forEach(addActionRecursively);
                }
            })(this);
        },

        _doAction : function(event) {
            //	summary:
            //		This is a private callback function which executes once any Command is clicked 
            //		on the context menu. It emits an 'action' event and then focuses on the 
            //		parentNode to close the context menu
            //	event:
            //		{group: String} {value: String}
            //		The event parameter is a map of two values
            //		- group: the group in which the currently executed command belongs to
            //		- value: the value of the currently executed command
            //  tags:
            //		private callback
            this.emit('action', event);
            focus.focus(this.domNode.parentNode);
        },

        _showContext : function(event) {
            //	summary
            //		Shows the context menu after adjusting its position and setting it up. This 
            //		function is triggered on context click on the parent widget. The sequence of 
            //		steps and the positioning logic of the function is elaborated below:
            // 		- Emit the beforeShow event with this ContextMenu as parameter
            // 		- Make the ContextMenu visible
            // 		- Calculate the position of the ContextMenu container
            // 		- Get the geometry of the ContextMenu's domNode, the ContextMenu's parentNode 
            // 		and the viewport
            // 		- If it is possible to show the context menu to the right, show it to the right 
            //      of the mouse pointer
            // 		- If it is not possible to show the context menu to the right, show it to the 
            //      left of the mouse pointer
            // 		- If it is possible to show the context menu to the bottom of the mouse 
            //      pointer, do that
            // 		- If it is not possible to show the context menu to the bottom of the mouse 
            // 		pointer, show it above the mouse pointer
            // 		- Event propagation should be stopped to prevent the parent element's context 
            // 		menu to be shown
            // 		- The default context menu should be hidden
            // 		- Focus the contextmenu after it is shown
            //	event: Object
            //		the browser event object
            //  tags:
            //		private callback

            // emit the beforeShow event with this ContextMenu as parameter
            this.emit('beforeShow', this);
            // make the ContextMenu visible
            domClass.remove(this.domNode, 'hidden');
            domClass.add(this.domNode, 'visible');
            // calculate the position of the ContextMenu container
            // get the geometry of the ContextMenu's domNode, the ContextMenu's parentNode 
            // and the viewport
            var _thisGeom = domGeometry.position(this.domNode);
            var _targetGeom = domGeometry.position(this.domNode.parentNode);
            var _windowGeom = win.getBox();
            if (event.pageX + _thisGeom.w > _windowGeom.w) {
                // if it is possible to show the context menu to the right, show it to the right of 
                // the mouse pointer
                domStyle.set(this.domNode, 'right', (_targetGeom.x + _targetGeom.w - event.pageX)
                    + 'px');
                domStyle.set(this.domNode, 'left', 'auto');
            } else {
                // if it is not possible to show the context menu to the right, show it to the left
                // of the mouse pointer
                domStyle.set(this.domNode, 'left', (event.pageX - _targetGeom.x) + 'px');
                domStyle.set(this.domNode, 'right', 'auto');
            }
            if (event.pageY + _thisGeom.h > _windowGeom.h) {
                // if it is possible to show the context menu to the bottom of the mouse pointer, 
                // do that
                domStyle.set(this.domNode, 'bottom', (_targetGeom.y + _targetGeom.h - event.pageY)
                    + 'px');
                domStyle.set(this.domNode, 'top', 'auto');
            } else {
                // if it is not possible to show the context menu to the bottom of the mouse 
                // pointer, show it above the mouse pointer
                domStyle.set(this.domNode, 'top', (event.pageY - _targetGeom.y) + 'px');
                domStyle.set(this.domNode, 'bottom', 'auto');
            }
            // event propagation should be stopped to prevent the parent element's context 
            // menu to be shown
            event.stopPropagation();
            // the default context menu should be hidden
            event.preventDefault();
            // focus the contextmenu after it is shown
            focus.focus(this.domNode);
        },

        _onBlur : function(event) {
            //	summary
            //		hides the context menu. This function gets executed when there is a blur event 
            //		on the ContextMenu widget.
            //	event: Object
            //		the event object
            //  tags:
            //		private callback
            domClass.add(this.domNode, 'hidden');
            domClass.remove(this.domNode, 'visible');
        }
    });
    return ContextMenu;
});