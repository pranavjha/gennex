define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "../mixins/_Togglable", // extends
    "../mixins/_Serializable", // extends
    "dojo/text!./templates/Command.html", //template
    "dojo/dom-class", // domClass.remove, domClass.add
    "dijit/focus", // focus.focus
    "dojo/_base/lang" // lang.mixin
], function(declare, _WidgetBase, _TemplatedMixin, _Togglable, _Serializable,
    template, domClass, focus, lang) {
    //	module:
    //		gennex/widgets/Command
    var Command = declare([
        _WidgetBase,
        _TemplatedMixin,
        _Togglable,
        _Serializable
    ], {
        //	summary:
        //		Defines the command class. A command class defines an action in UI. Commands can 
        //		exist independently or can be a child of a CommandGroup. Also, a command can be 
        //		associated to a gennex/behavioral/RadioGroup or a gennex/behavioral/CheckboxGroup
        //		Normally, a command would perform an action or change the state of another widget.

        //	type: [public readonly] String
        //		the name of this class
        type : "../widgets/Command",

        //	templateString: [private] String
        //		the command template placed at templates/Command.html
        templateString : template,

        //	baseClass: [private] String
        //		the Command base class
        baseClass : "gennexCommand",

        //	spriteClass: [public] String
        //		The class of the sprite image. This class is defined by the implementor and should 
        //		set the background-position attribute. To get the list of available classes, 
        //		please see Icons.less file in the themes folder.
        spriteClass : null,

        //	label: [public] String
        //		the Command label.
        label : '',

        //	currentLayout: [public] String
        //		The current layout of the Command. This can be changed at the CommandGroup level
        //		Available values are:
        //		- smallIconOnly: only icons in small dimension are displayed. Label is displayed on 
        //      mouseover as a tooltip
        //		- smallIconLabel: both icon and label are displayed with icon dimension as small
        //		- largeIconOnly: only icons in large dimension are displayed. Label is displayed on 
        //      mouseover as a tooltip
        //		- largeIconLabel: both icon and label are displayed with icon dimension as large
        currentLayout : null,

        postCreate : function() {
            //	summary:
            //		sets the tabIndex of the command button to 0 (so that it is able to receive 
            //		focus).
            //  tags:
            //		extension private
            this.inherited(arguments);
            this.domNode.setAttribute('tabIndex', 0);
        },

        setLayout : function(newLayout) {
            //	summary:
            //		Changes the layout of the Command to the layout sent as parameter.
            //	newLayout: String
            //		the value of the new Layout
            //  tags:
            //		public

            // layout - className mapping for image node
            var _imageNodeClasses = {
                'largeIconLabel' : 'iconLarge',
                'largeIconOnly' : 'iconLarge',
                'smallIconLabel' : 'iconSmall',
                'smallIconOnly' : 'iconSmall'
            };
            // layout - className mapping for text node
            var _textNodeClasses = {
                'largeIconLabel' : '',
                'largeIconOnly' : 'hidden',
                'smallIconLabel' : '',
                'smallIconOnly' : 'hidden'
            };
            // remove the old classes and add new ones
            if (this.currentLayout) {
                domClass.remove(this.domNode, this.currentLayout);
                domClass.remove(this.imageNode, _imageNodeClasses[this.currentLayout]);
                domClass.remove(this.labelNode, _textNodeClasses[this.currentLayout]);
            }
            this.currentLayout = newLayout;
            domClass.add(this.domNode, this.currentLayout);
            domClass.add(this.imageNode, _imageNodeClasses[this.currentLayout]);
            domClass.add(this.labelNode, _textNodeClasses[this.currentLayout]);
        },

        _activateCommand : function() {
            //	summary:
            //		The MouseOver event handler for the Command. A MouseOver on the Command steals 
            //		focus for itself. 
            //	tags:
            //		private callback
            focus.focus(this.domNode);
        },

        _activate : function(event) {
            //	summary:
            // 		This function is called when this Command is activated. Here, the selected 
            //		class is added to the Command for visual aid and control is passed to the 
            //		onActive function.
            //	event: Event
            //		The browser event object
            //  tags:
            //		private callback
            this.inherited(arguments);
            domClass.add(this.domNode, 'selected');
            this.onActive(event);
        },
        _passivate : function() {
            //	summary:
            // 		This function is called when this Command is passivated. Here, the selected 
            //		class is removed to the Command for visual aid and control is passed to the 
            //		onPassive function.
            //  tags:
            //		private callback
            this.inherited(arguments);
            domClass.remove(this.domNode, 'selected');
            this.onPassive(event);
        },

        onActive : function(event) {
            //	summary:
            // 		This function will be called when this Command is activated.
            //	event: Event
            //		The browser event object
            //  tags:
            //		public callback
        },

        onPassive : function(event) {
            //	summary:
            // 		This function will be called when this Command is passivated.
            //	event: Event
            //		The browser event object
            //  tags:
            //		public callback
        },

        serialize : function() {
            //	summary
            //		The default serialize function in gennex/mixins/_Serializable is used to 
            //		serialize objects of this class into a json object. Extra properties that 
            //		require to be serialized for Command are added here.
            //  tags:
            //		public extension
            //	returns:
            //		The serialized version of this Class object. For the structure of the 
            //		serialized object please refer gennex/mixins/_Serializable#serialize. The 
            //		following extra properties are mixed with the serialized object here.
            //		{ label : String } { spriteClass : String} { value : String} { group : String}
            //		- label: the Command label
            //		- spriteClass: The class of the sprite image
            //		- value: The value of the Command component
            //		- group: The name of the Radio or Checkbox group, this Command belongs to.
            return lang.mixin(this.inherited(arguments), {
                "label" : this.label,
                "spriteClass" : this.spriteClass,
                "value" : this.value,
                "group" : this.group
            });
        }
    });
    return Command;
});