define([
    "dojo/_base/declare", // declare
    "../widgets/CommandGroup", // extends
    "dijit/_WidgetsInTemplateMixin", // extends
    "../mixins/_Draggable", // extends
    "../mixins/_Droppable", // extends
    "../mixins/_SortableContainer", // extends
    "../mixins/_Serializable", // extends
    "dojo/text!./templates/ExtendedCommandGroup.html", //template
    "dojo/dom-class", // domClass.add, domClass.remove
    "dojo/_base/lang", // lang.mixin
    "../widgets/ContextMenu" // pre-fetching for _WidgetsInTemplateMixin
], function(declare, CommandGroup, _WidgetsInTemplateMixin, _Draggable, _Droppable,
    _SortableContainer, _Serializable, template, domClass, lang) {
    //	module:
    //		gennex/widgets/ExtendedCommandGroup
    var ExtendedCommandGroup = declare([
        CommandGroup,
        _WidgetsInTemplateMixin,
        _Draggable,
        _Droppable,
        _SortableContainer,
        _Serializable
    ], {
        //	summary:
        //		A ExtendedCommandGroup is an extension of gennex/widgets/CommandGroup which can be 
        //		configured, repositioned and whose contents can be sorted by the user.

        //	type: [public readonly] String
        //		the name of this class
        type : "../widgets/ExtendedCommandGroup",

        //	acceptableDrops: [public] String[]
        //		An array of class names of all widget classes whose objects can be dropped into 
        //		this widget.
        acceptableDrops : [
            '../widgets/ExtendedCommandGroup'
        ],

        //	_availableStates: [private readonly] Object
        //		an array of all the possible ExtendedCommandGroup states that can be configured. 
        //		The current state settings are available in the inherited currentState property. 
        //		This is a reference state list used by the _toggleState function. For a complete 
        //		detail of all the states and its impact on visual representation of the 
        //		CommandGroup see __StateObject class and the currentState property documentation.
        _availableStates : {
            element : [
                'expanded',
                'collapsed'
            ],
            content : [
                'largeIconLabel',
                'largeIconOnly',
                'smallIconLabel',
                'smallIconOnly'
            ]
        },

        //	acceptableSorts: [public] String[]
        //		An array of class names of all child widget classes which can be sorted here.
        acceptableSorts : [
            '../widgets/ExtendedCommandGroup',
            '../widgets/Command'
        ],

        //	templateString: [private] String
        //		the footer template placed at templates/ExtendedCommandGroup.html
        templateString : template,

        _toggleContentState : function() {
            //	summary:
            //		Callback function to cycle between various content states. This function is 
            //		bound to the toggle content icon in the template
            //	tags:
            //		private callback
            this._toggleState('content');
        },

        _toggleElementState : function() {
            //	summary:
            //		Callback function to cycle between various element states. This function is 
            //		bound to the toggle element icon in the template
            //	tags:
            //		private callback
            this._toggleState('element');
        },

        _toggleState : function(stateName) {
            //	summary:
            //		changes the state represented by stateName of the ExtendedCommandGroup to the 
            //		next state. This is a callback function for a click on the toggle state icons.
            //		Here, we loop through all the available states and change the state referred 
            //		by the stateName category to the next possible one.
            //	stateName:
            //		The state category to be affected
            //  tags:
            //		private

            // get the index of the current state
            var position = this._availableStates[stateName].indexOf(this.currentState[stateName]);
            // move to the next index
            position = ((position + 1) % this._availableStates[stateName].length);
            // set the current state to the state at the next index
            this.setState(stateName, this._availableStates[stateName][position]);
        },

        setState : function(stateName, stateValue) {
            //	summary:
            //		Sets the state of the ExtendedCommandGroup to the state sent as parameter. 
            //		Here, we update the element and content control buttons to reflect the state 
            //		change and pass the control to the CommandGroup's setState method
            // 	stateName: String
            //       the category of the state to be used
            //	stateValue: String
            //		the value of the stateName category
            //  tags:
            //		public
            var _prevState = this.currentState[stateName];
            if (stateName === 'element') {
                // if the element state has changed, update the element control
                domClass.remove(this.elementControl, stateName + '-' + _prevState);
                domClass.add(this.elementControl, stateName + '-' + stateValue);
            } else if (stateName === 'content') {
                // if the content state has changed, update the content control
                domClass.remove(this.contentControl, stateName + '-' + _prevState);
                domClass.add(this.contentControl, stateName + '-' + stateValue);
            }
            this.inherited(arguments);
        },

        _contextAction : function(event) {
            //	summary:
            //		This function is called when a context option is activated. The value of the 
            //		context button is passed on to the function. In an ExtendedCommandGroup, all 
            //		contextActions change its state to a defined value. The context menu is 
            //		declaratively instantiated in the template of the ExtendedCommandGroup.
            //	event: Object
            //		the browser event object
            //  tags:
            //		private callback extension
            this.setState(event.group, event.value);
        },

        _beforeContextShow : function(contextMenu) {
            //	summary:
            //		This function will be called before the context menu is made visible. Here, the
            //		buttons in the ContextMenu is activated depending on the currentState of the 
            //		ExtendedCommandGroup
            //	contextMenu: gennex/widgets/ContextMenu
            //		the context menu to be shown after the event
            //  tags:
            //		private callback extension
            var _commandsArray = [];
            for ( var key in this.currentState) {
                _commandsArray.push(key + '/' + this.currentState[key]);
            }
            // activate all commands corresponding to the current state
            contextMenu.activateCommandsFromContext(_commandsArray);
        },

        serialize : function() {
            //	summary
            //		The default serialize function in gennex/mixins/_Serializable is used to 
            //		serialize objects of this class into a json object. Extra properties that 
            //		require to be serialized for ExtendedCommandGroup are added here.
            //  tags:
            //		public extension
            //	returns:
            //		The serialized version of this Class object. For the structure of the 
            //		serialized object please refer gennex/mixins/_Serializable#serialize. The 
            //		following extra properties are mixed with the serialized object here.
            //		{ currentState : Object } { label : String}
            //		- currentState: the current state of the CommandGroup
            //		- label: the CommandGroup label
            return lang.mixin(this.inherited(arguments), {
                "currentState" : this.currentState,
                "label" : this.label
            });
        }
    });
    return ExtendedCommandGroup;
});