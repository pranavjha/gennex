define([
    "dojo/_base/declare", // declare
    "dijit/_Container", // extends
    "dojo/_base/lang", // lang.mixin, lang.hitch
    "dojo/dom-construct", // domConstruct.create
    "dojo/aspect", // aspect.around
    "dojo/Deferred", // new Deferred
    "require", // require
    "../behavioral/messages" // behavioral handling for console events
], function(declare, _dijitContainer, lang, domConstruct, aspect, Deferred, require) {
    //	module:
    //		gennex/mixins/_Container
    var _Container = declare([
        _dijitContainer
    ], {
        //	summary:
        //		A _Container is a mixin for widgets that can contain dynamically created children. 
        //      It extends the dijit/_Container mixin and adds an aspect around the addChild 
        //      function. The new addChild function supports adding of widgets as well as 
        //      constructs. Additionally, it also defines pre and post addChild hooks and a utility 
        //      function 'isDescendantOf'

        /*=====
        //	childConstruct: [public] Object[]
        //		The data used to construct the child widgets. After all the children described by 
        //      the childConstruct attribute is added to the widget, the childConstruct attribute 
        //      is deleted from the object to release memory. So, this object is a temporary 
        //      placeholder for child element details and is not available after postCreate is 
        //      executed
        childConstruct : null,
        =====*/

        //	type: [public readonly] String
        //		the name of this class
        type : "../mixins/Container",

        constructor : function() {
            //	summary:
            //		Constructor function. Adds an aspect around the addChild function to enhance 
            //		its capabilities. The understand the new addChild enhancements, please refer 
            //		the addChild documentation
            // returns: dojo/promise/Promise?
            //      A promise if the addChild function is called with a construct object and it is 
            //      added asynchronously. This promise will get resolved with the newly created 
            //      child widget once the child is added.
            //  tags:
            //		public
            aspect.around(this, "addChild", function(originalAddChild) {
                return function(child, index) {
                    if ('isInstanceOf' in child) {
                        // if the child is a dojo class, invoke the _preChildAdd hook
                        child = this._preChildAdd(child);
                        // call the original addChild method if the child is returned from 
                        // preAddChild function. do not bother about targetNode here. TargetNode 
                        // is only supported when a child is added from a construct.
                        (child && originalAddChild.call(this, child, index));
                        // invoke the _postChildAdd hook if a child got added
                        (child && this._postChildAdd(child));
                        return child;
                    } else {
                        // if the child is not a dojo class, then the child is a construct and it 
                        // has to be used to create a new child element which should be added to 
                        // this widget as a child
                        if (child.targetNode) {
                            // if there is a target node in the child, call addChild of the target 
                            // node instead of this node. Clean the child object and remove 
                            // targetNode property.
                            var target = this[child.targetNode];
                            // If the targetNode property is not removed, the addChild function 
                            // will keep recursively searching for the target until it encounters 
                            // an undefined reference where target will be undefined.
                            delete child.targetNode;
                            target.addChild(child);
                            return null;
                        }
                        // if there is no target node configured in the construct, proceed with 
                        // child creation
                        var deferred = new Deferred();
                        var _childDom = null;
                        if (child.type.indexOf('/widgets/') !== -1) {
                            // if the construct is a widget, create a dom placeholder for it
                            _childDom = domConstruct.create("div", null, this.containerNode);
                        }
                        // add the child asynchronously
                        var _addChild = lang.hitch(this, 'addChild');
                        require([
                            child.type
                        ], function(ChildClass) {
                            // resolve the deferred object once the child gets added
                            var _newChild = new ChildClass(child, _childDom);
                            _addChild(_newChild, child.insertIndex);
                            deferred.resolve(_newChild);
                        });
                        // return the promise
                        return deferred.promise;
                    }
                };
            });
        },

        /*=====
        addChild : function(widgetOrConstruct, insertIndex){
        	// summary:
        	//		If the child is a dojo class, the _preChildAdd hook is invoked, followed by 
        	//		the original addChild method and _postChildAdd hook. If the child is not a 
        	//		dojo class, then the child is treated like a construct and it is used to 
        	//		create a new element which is added to this widget as a child. However, if 
        	//		there is a target node in the construct, the addChild of the target node is 
        	//		called and this function returns without doing anything. Only if there is no 
        	//		target node configured in the construct, the child creation is done. A dom 
        	//		placeholder is created for the child and the child is loaded asynchronously.
        	//	widgetOrConstruct: Object
        	//		can be a dijit/_Widget object or a construct object. A construct object is 
        	//		a descriptor for the child object used to save its state. The descriptor 
        	//		object is structured as follows:
        	//		{type: String} {targetNode: String} ...
        	//		- type: the class location of the widget relative to this file. The type is 
        	//		used to require the class
        	//		- targetNode: the optional node, this element should be attached to. If not 
        	//		specified, the element is attached to containerNode
        	//		All properties in the construct object are mixed in with the child widget when 
        	//		the child widget is created.
        	//	insertIndex: Integer ?
        	//		The optional index at which the child is to be added. If no insertIndex is 
    	    //      specified, the new child is added at last
        	//  tags:
        	//		extension public
        	this.inherited(arguments);
        },
        =====*/

        postCreate : function() {
            //	summary:
            //		Adds the children described by the childConstruct attribute to the widget.
            //		After all the children described by the childConstruct attribute is added 
            //		to the widget, the childConstruct attribute is deleted from the object.
            //  tags:
            //		extension private
            console.debug('creating widget of type', this.type, 'with label:', this.label);
            this.inherited(arguments);
            this.childConstruct && this.childConstruct.forEach(lang.hitch(this, 'addChild'));
            delete this.childConstruct;
        },

        _preChildAdd : function(newChild) {
            //	summary:
            //		This function is called before a new child is added into this widget. It 
            //		should be implemented by the extending class in case the child attributes need 
            //		to be modified before adding the child into the DOM. If this function returns 
            //		null, the addChild operation is cancelled.
            //	newChild: dijit/_Widget
            //		the child widget object
            //	returns:
            //		the modified child widget
            // 	tags:
            //		private callback
            return newChild;
        },

        _postChildAdd : function(newChild) {
            //	summary:
            //		This function is called after a new child is created and added to the 
            //      container. It should be implemented by the extending class in case some post 
            //      child rendering / creation activities are required
            //	newChild: Object
            //		the new child object added
            // 	tags:
            //		private callback
        },

        isDescendantOf : function(ancestor) {
            //	summary:
            //		Checks if this widget is the descendant of the ancestor widget sent as 
            //		parameter
            //	ancestor: gennex/_Widget
            //		the ancestor widget
            // 	tags:
            //		public
            //	returns:
            //		true if this widget is the descendant of the ancestor widget. false if the 
            //		ancestor is null or otherwise
            if (!ancestor) {
                return false;
            }
            var descendant = this;
            while ((descendant = descendant.getParent()) && descendant !== ancestor)
                ;
            return (descendant === ancestor);
        }
    });
    return _Container;
});