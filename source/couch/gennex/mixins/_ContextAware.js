define([
    "dojo/_base/declare", // declare
    "dijit/Destroyable", // extends
    "dojo/aspect", // aspect.after
    "dojo/Deferred", // deferred.then
    "dojo/_base/lang" // lang.hitch
], function(declare, Destroyable, aspect, deferred, lang) {
    //	module:
    //		gennex/mixins/_ContextAware
    var _ContextAware = declare([
        Destroyable
    ], {
        //	summary:
        // 		A context aware class can store any object of type gennex/behavioral/RadioGroup 
        //		or gennex/behavioral/CheckboxGroup object in its context that can be looked for 
        //		later.

        //	type: [public readonly] String
        //		the name of this class
        type : "../mixins/_ContextAware",

        //	__context: [private] Object
        //		the store for the context object
        __context : null,

        constructor : function() {
            //	summary
            //		Constructor function. Sets the context store to an empty store. Here, we add
            //		an aspect after the getChildren function of the implementing dijit/_Container 
            //		to return the contextual children also. This is required because, when 
            //		persisting the state of the widget, the contextual children must also be 
            //		persisted.
            //  tags:
            //		public
            this.__context = {};
            aspect.after(this, "getChildren", lang.hitch(this, '_getContextChildren'));
        },

        _getContextChildren : function(children) {
            //	summary
            //		This is an aspect after execution of getChildren function of the implementing 
            //		dijit/_Container. Here, we add the contextual children to the returned array 
            //		and return the modified array. This is required because, when persisting the 
            //		state of the widget, the contextual children must also be persisted.
            //	children: dijit/_Widget[]
            //		an array of child widgets returned by the original getChildren function
            //	returns:
            //		a new array with all contextual children of the widget added to it
            //  tags:
            //		private extension
            if (this.__context) {
                for ( var value in this.__context) {
                    children.unshift(this.__context[value]);
                }
            }
            return children;
        },

        getFromContext : function(value) {
            //	summary
            //		Gets a gennex/behavioral/RadioGroup or gennex/behavioral/CheckboxGroup object 
            //		corresponding to a value from the context. Returns null if there is no such 
            //		object in the context
            //	value: String
            //		the value corresponding to which, the object is to be retrieved
            //  tags:
            //		public
            //	returns:
            //		the corresponding object mapped to the key passed. null if 
            //		no value is mapped
            return this.__context[value];
        },

        setIntoContext : function(group) {
            //	summary
            //		Adds a RadioGroup or CheckboxGroup to the context. Before adding it to the 
            //		context, the group is owned so that adequate garbage collection is triggered 
            //		when the widget is destroyed.
            //	value: Object
            //		the value to be stored
            //  tags:
            //		public
            this.own(group);
            this.__context[group.value] = group;
        },

        activateCommandsFromContext : function(commandValues) {
            //	summary
            //		Activates a RadioGroup or CheckboxGroup command in this context. The function 
            //		fails silently for any RadioGroup or CheckboxGroup that are not present in the 
            //		context
            //	commandValues: String[]
            //		The commands corresponding to each element in the commandValue will be 
            //		activated. Every commandValue is structured as:
            //		| <radio/checkboxgroup value>/<command value>
            //  tags:
            //		public
            for (var i = 0, j = commandValues.length; i < j; i++) {
                var _group = this.getFromContext(commandValues[i].substring(0, commandValues[i]
                    .indexOf('/')));
                (_group && _group.activateByValue(commandValues[i].substring(commandValues[i]
                    .indexOf('/') + 1)));
            }
        },

        _preChildAdd : function(child) {
            //	summary:
            //		This function is called after a new child is created and added to the 
            //      container. Here, we check if the child is storable in the context, i.e. if it 
            //      is a gennex/behavioral/RadioGroup or gennex/behavioral/CheckboxGroup object. If 
            //      it is storable, we store it in the context and proceed return null so that the 
            //		original addChild is not invoked. Otherwise, the parameter is returned as is.
            //	child: Object
            //		the new child object added
            // 	tags:
            //		private extension
            child = this.inherited(arguments);
            if (child && child.type.indexOf('/behavioral/') !== -1) {
                this.setIntoContext(child);
                return null;
            }
            return child;
        }
    });
    return _ContextAware;
});