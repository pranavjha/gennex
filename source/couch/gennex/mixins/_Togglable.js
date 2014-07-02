define([
    "dojo/_base/declare", // declare
    "dojo/Evented", // extends
    "dijit/a11yclick", // a11yclick event
    "dojo/_base/lang", // lang.hitch, lang.mixin
    "dojo/on" // on
], function(declare, Evented, a11yclick, lang, on) {
    // 	module:
    // 		gennex/mixins/_Togglable
    var _Togglable = declare([
        Evented
    ], {
        //	summary:
        // 		This mixin is used by widgets that can be toggled to active and passive states.
        //		These widgets can be a part of CheckBox or Radio Groups.

        //	type: [public readonly] String
        //		the name of this class
        type : "../mixins/_Togglable",

        //	_active: [private] Boolean
        //		true when this Togglable widget is active
        _active : false,

        //	value: [private] Object
        //		The value of the togglable component. All togglable components of the same value 
        //		will share a common state.
        value : null,

        //	group: [public] String
        //		The name of the Radio or Checkbox group, this _Togglable belongs to.
        group : null,

        postCreate : function() {
            //	summary:
            //		Attaches an a11yclick event to toggle the state of the widget and registers it 
            //		to the group it belongs to. If the group associated with this component has 
            //		toggle enabled, the component is made togglable, meaning that it will be 
            //		activated and passivated upon subsequent clicks. If toggle is not enables in 
            //		this components group, a click event will activate this component if it is not 
            //		already activated.
            //  tags:
            //		extension private
            this.inherited(arguments);
            var _thisGroup = this.__getGroup(this.group);
            if (_thisGroup) {
                _thisGroup.addChild(this);
            }
            // If the group associated with this component has toggle enabled, the component is 
            // made togglable, meaning that it will be activated and passivated upon subsequent 
            // clicks. If toggle is not enabled in this components group, a click event will 
            // activate this component if it is not already activated.
            if (_thisGroup && _thisGroup.toggle !== false) {
                this.own(on(this.domNode, a11yclick, lang.hitch(this, '_toggleActivePassive')));
            } else {
                this.own(on(this.domNode, a11yclick, lang.hitch(this, '_makeActiveIfNot')));
            }
            // add handlers for activate and passivate events
            this.on('activate', this._activate);
            this.on('passivate', this._passivate);
        },

        _activate : function(event) {
            //	summary:
            // 		This function will be called when this widget is activated. Implementing 
            //      classes must implement this method to provide their own functionality
            //	event: Event
            //		The browser event object
            //  tags:
            //		callback private
            this._active = true;
        },

        _passivate : function(event) {
            //	summary:
            // 		This function will be called when this widget is inactivated. Implementing 
            //		classes must implement this method to provide their own functionality
            //	event: Event
            //		The browser event object
            //  tags:
            //		callback private
            this._active = false;
        },

        _toggleActivePassive : function(event) {
            //	summary:
            // 		This function toggles the state of the widget from active to passive and back. 
            //		This callback is attached to this component and gets triggered on a11yclick if 
            //		the group of this component has toggle enabled.
            //	event: Event
            //		The browser event object
            //  tags:
            //		callback private
            if (this._active) {
                this.emit('passivate');
            } else {
                this.emit('activate');
            }
        },

        _makeActiveIfNot : function(event) {
            //	summary:
            // 		This function changes the state of the widget to active if it is not already 
            //		active. This callback is attached to this component and gets triggered on 
            //		a11yclick if the group of this component has toggle disabled.
            //	event: Event
            //		The browser event object
            //  tags:
            //		callback private
            if (!this._active) {
                this.emit('activate');
            }
        },

        __getGroup : function(groupId) {
            //	summary
            //		fetches a group corresponding to a groupId respecting hierarchy. This function 
            //		recursively looks for a group starting from its parent and moving up in the 
            //		hierarchy till a matching group is found.
            //	groupId: [String]
            //		the groupId to look for
            //  tags:
            //		private
            //	returns:
            //		the group corresponding to the groupId or null if no group is found
            if (groupId === null) {
                return null;
            }
            var _element = this;
            var _group = null;
            while ((_element = _element.getParent())
                && !(_element.getFromContext && (_group = _element.getFromContext(groupId))))
                ;
            return _group;
        }
    });
    return _Togglable;
});