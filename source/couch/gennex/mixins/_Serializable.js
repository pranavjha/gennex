define([
    "dojo/_base/declare", // declare
    "dojo/_base/lang" // lang.mixin
], function(declare, lang) {
    // 	module:
    // 		gennex/mixins/_Serializable
    var _Serializable = declare(null, {
        //	summary:
        //		A _Serializable mixin allows widgets to be serialized and persisted in a store. It 
        //		defines a single serialize function which takes care of the serialization.

        //	type: [public readonly] String
        //		the name of this class
        type : "../mixins/_Serializable",

        //	_targetNodes: [private] String[]
        //		the list of nodes in this widget that are targets for child elements. All the child 
        //		elements in the children referred by _targetNodes list will be scanned for 
        //		_Serializable children. If there are any _Serializable children present, they will 
        //		be serialized and added to the childConstruct property of this element.
        _targetNodes : null,

        serialize : function() {
            //	summary
            //		The serialize function is used to serialize objects of this class into a json 
            //		object. The same json object can later be used to reconstruct this object. 
            //		Serialization is required to persist the state of an Object into the database 
            //		and get the state back when required. Implementing classes must override this 
            //		function if required to have their own version of serialization logic.
            //		The default implementation does the following:
            //		- adds inherited return value and the object type into the serialized object.
            //		- adds the _storeId value if it exists in this object
            //		- if this class has serializable children, serializes the children and appends
            //		it into the childConstruct array recursively
            // 		- if the class has _targetNodes attribute set, then serializable components 
            // 		listed in the _targetNodes array are also persisted. In that case, we loop 
            //		through the _targetNodes array and try to serialize properties inside it 
            // recursively
            //  tags:
            //		public
            //	returns:
            //		The serialized version of this Class object. The basic structure of the 
            //		serialized object will be:
            //		{ type : String } { targetNode : String } { childConstruct : Object[] }
            //		{_storeId : String }? ...
            //		- type: the class location of the widget relative to this file. The type is 
            //		used to require the class
            //		- targetNode: the optional node, this element should be attached to. If not 
            //		specified, the element is attached to containerNode
            //		- childConstruct: an array of serialized child Objects with the same structure 
            //		as this object
            //		- _storeId: The unique id of this object used to retrieve it from the store, 
            //		If _storeId is not present, it is not added to the serialized object

            // add inherited return value and the object type into the serialized object.
            var _serializedObj = lang.mixin(this.inherited(arguments), {
                "type" : this.type,
                "childConstruct" : []
            });
            // add the _storeId value if it exists in this object
            if ('_storeId' in this) {
                _serializedObj['_storeId'] = this._storeId;
            }

            // if this class has a getChildren function, serialize the children and append it into 
            // the childConstruct array recursively
            (function getSerializedChildren(parent, targetNodeName) {
                if ('getChildren' in parent) {
                    // if there is a getChildren function in the parent, loop through the children 
                    // and serialize them.
                    parent.getChildren().forEach(function(oneChild, childIndex) {
                        // if the child is serializable, serialize it and add it to the child
                        // Construct. Get children returns an ordered sequence of children. So, no 
                        // need to call getIndexOfChild
                        if ('serialize' in oneChild) {
                            _serializedObj.childConstruct.push(lang.mixin({
                                'childIndex' : childIndex,
                                'targetNode' : targetNodeName
                            }, oneChild.serialize()));
                        }
                    });
                }
                // if the parent has _targetNodes attribute set, then serializable components 
                // listed in the _targetNodes array must also be persisted. In that case, we loop 
                // through the _targetNodes array and try to serialize properties inside it 
                // recursively
                if (parent._targetNodes) {
                    parent._targetNodes.forEach(function(oneNode) {
                        getSerializedChildren(parent[oneNode], oneNode);
                    });
                }
            })(this);
            return _serializedObj;
        }
    });
    return _Serializable;
});