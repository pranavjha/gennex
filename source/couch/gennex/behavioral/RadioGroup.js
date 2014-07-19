define([
    "dojo/_base/declare", // declare
    "../mixins/_Togglable", // extends
    "dijit/Destroyable", // extends
    "../mixins/_Serializable", // extends
    "dojo/on", // on
    "dojo/_base/lang" // lang.hitch
], function(declare, _Togglable, Destroyable, _Serializable, on, lang) {
    // 	module:
    // 		gennex/behavioral/RadioGroup
    var RadioGroup = declare([
        _Togglable,
        Destroyable,
        _Serializable
    ], {
        //	summary:
        // 		This class represents a collection of _Togglable components which are mutually 
        //      exclusive. At any point of time, only one _Togglable component in a RadioGroup can 
        //      be active.

        //	type: [public readonly] String
        //		the name of this class
        type : "../behavioral/RadioGroup",

        //	_children: [private] Object
        //		The list of all children of the RadioGroup
        _children : null,

        //	toggle: [public] Boolean
        //		flag indicating whether the child components of this component can toggle. If this 
        //      value is true, clicking the child component when it is active will make it passive.
        toggle : true,

        //	_selectedValue: [private] Object
        //		The currently selected child value
        _selectedValue : null,

        constructor : function(data) {
            //	summary:
            // 		Instantiates the RadioGroup
            //	data: Object ?
            //		Optional value to mixin.
            //  tags:
            //		public
            declare.safeMixin(this, data || {});
        },

        _passivate : function() {
            //	summary:
            // 		Passivates the RadioGroup
            //  tags:
            //		private, callback, extension
            this._selectedValue && this._children[this._selectedValue].forEach(function(item) {
                item._passivate();
            });
            this._selectedValue = null;
            this.inherited(arguments);
        },

        addChild : function(newChild) {
            //	summary:
            // 		adds a new Child to the RadioGroup
            //	newChild: gennex/mixins/_Togglable
            //		the new child to be added
            //  tags:
            //		public
            if (this._children == null) {
                this._children = {};
            }
            if (!this._children[newChild.value]) {
                this._children[newChild.value] = [];
            }
            if (this._children[newChild.value].indexOf(newChild) == -1) {
                this._children[newChild.value].push(newChild);
                this.own(
                // activate handler
                on(newChild, 'activate', lang.hitch(this, '_activateChild', newChild)),
                // passivate handler
                on(newChild, 'passivate', lang.hitch(this, '_passivateChild', newChild)));
                if (newChild.value === this._selectedValue) {
                    newChild._activate();
                }
                return true;
            } else {
                return false;
            }
        },

        removeChild : function(ownChild) {
            //	summary:
            // 		removes a child from the RadioGroup
            //	ownChild: gennex/mixins/_Togglable
            //		the child to be removed
            //  tags:
            //		public
            var _childArr = this._children[ownChild.value];
            var _childIndex = _childArr.indexOf(ownChild);
            if (_childIndex !== -1) {
                _childArr.splice(_childIndex, 1);
                return true;
            } else {
                return false;
            }
        },

        activateByValue : function(childValue) {
            //	summary:
            // 		activates a child item by value.
            //	childValue: Object
            //		the value of children to be activated
            //  tags:
            //		public
            this._activateChild({
                value : childValue
            });
        },

        passivateByValue : function(childValue) {
            //	summary:
            // 		passivates a child item by value.
            //	childValue: Object
            //		the value of children to be activated
            //  tags:
            //		public
            this._passivateChild({
                value : childValue
            });
        },

        _activateChild : function(childItem) {
            //	summary:
            // 		callback function to activate a child item. If more than one child item 
            //		have same value, all of them will be activated, but the activate event 
            //		will not be triggered for any of them.
            //	childItem: gennex/mixins/_Togglable
            //		the child item on which the event is triggered
            //  tags:
            //		private, callback
            if (childItem.value === this._selectedValue) {
                return;
            }
            this._passivate();
            this._selectedValue = childItem.value;
            this._children[this._selectedValue].forEach(function(item) {
                (childItem === item) || item._activate();
            });
        },

        _passivateChild : function(childItem) {
            //	summary:
            // 		callback function to passivate a child item. If more than one child item 
            //		have same value, all of them will be passivated, but the passivate event 
            //		will not be triggered for any of them.
            //	childItem: gennex/mixins/_Togglable
            //		the child item on which the event is triggered
            //  tags:
            //		private, callback
            if (childItem.value !== this._selectedValue) {
                return;
            }
            this._passivate();
        },

        destroy : function() {
            // summary:
            //		Destroy this class, releasing all resources
            this.inherited(arguments);
            this._children = null;
        },

        serialize : function() {
            //	summary
            //		The default serialize function in gennex/mixins/_Serializable is used to 
            //		serialize objects of this class into a json object. Extra properties that 
            //		require to be serialized for RadioGroup are added here.
            //  tags:
            //		public extension
            //	returns:
            //		The serialized version of this Class object. For the structure of the 
            //		serialized object please refer gennex/mixins/_Serializable#serialize. The 
            //		following extra properties are mixed with the serialized object here.
            //		{ value : String} { toggle : Boolean}
            //		- value: The value of the RadioGroup component
            //		- toggle: flag indicating whether the child components of this component can 
            //		toggle
            return lang.mixin(this.inherited(arguments), {
                "value" : this.value,
                "toggle" : this.toggle
            });
        }
    });
    return RadioGroup;
});