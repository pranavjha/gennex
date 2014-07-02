define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "dojo/text!./templates/Dialog.html", //template
    "dojo/Deferred", // new Deferred
    "dojo/_base/lang", // lang.mixin
    "dojo/dom-class", // domClass.remove, domClass.add
    "dojo/dom-construct", // domConstruct.create
    "dojo/topic" // topic
], function(declare, _WidgetBase, _TemplatedMixin, template, Deferred, lang, domClass,
    domConstruct, topic) {
    //  module:
    //      gennex/widgets/Dialog
    var Dialog = declare([
        _WidgetBase,
        _TemplatedMixin
    ], {
        //  summary:
        //      The Dialog widget implements a modal dialog window. When it is shown with the show 
        //      function, it will block access to the screen and also graying out the screen.

        //  type: [public readonly] String
        //      the name of this class
        type : "../widgets/Dialog",

        //  templateString: [private] String
        //      the Dialog template placed at templates/Dialog.html
        templateString : template,

        //  baseClass: [private] String
        //      the Dialog base class
        baseClass : "gennexDialog",

        //  dialogHeading: [public] String
        //      the Dialog heading. The Dialog heading is shown on the top of the dialog along with 
        //      a close button to the right.
        dialogHeading : 'Dialog',

        //  body: [public] String
        //      the body of the dialog. The body string gets parsed as a HTML string and is 
        //      displayed as the dialog body. In case the dialog box is instantiated declaratively, 
        //      this property will be ignored.
        body : '',

        // buttons: [public] Object
        //      buttons is a map of all buttons to be shown in the dialog footer with button label 
        //      as key and the click callback as value. The click callback is invoked in the 
        //      context of this Dialog widget.
        buttons : {},

        //  primaryButton: [public] String
        //      The button in the footer which is he recommended or default action for the dialog. 
        //      The primary button is shown with a different style for usability.
        primaryButton : null,

        postCreate : function() {
            //  summary:
            //      Here, we initialize the footer buttons in the Dialog and attach onclick events 
            //      to it
            //  tags:
            //      extension private
            this.inherited(arguments);
            for ( var buttonName in this.buttons) {
                var _buttonAttrs = {
                    innerHTML : buttonName,
                    onclick : lang.hitch(this, this.buttons[buttonName])
                };
                if (buttonName === this.primaryButton) {
                    _buttonAttrs.className = 'primary';
                }
                domConstruct.create("button", _buttonAttrs, this.footerNode);
            }
        },
        hide : function(event) {
            //  summary:
            //      This function hides the dialog along with the overlay making the screen 
            //      accessible
            //  event: Event
            //      The browser event object
            //  tags:
            //      callback public
            domClass.add(this.domNode, 'hidden');
            this.postHide(event);
        },
        show : function(event) {
            //  summary:
            //      This function shows the dialog on top of the window with an overlay
            //  event: Event
            //      The browser event object
            //  tags:
            //      callback public
            domClass.remove(this.domNode, 'hidden');
        },
        postHide : function(event) {
            //  summary:
            //      The postHide function is invoked immediately after the dialog box is hidden. 
            //      This method can be overridden when instantiating a dialog for custom 
            //      functionalities like destroying the Dialog widget altogether.
            //  event: Event
            //      The browser event object
            //  tags:
            //      public
            this.inherited(arguments);
        }
    });

    Dialog.alert = function(options) {
        //  summary:
        //      Dialog.alert is a shorthand method for creating alert boxes. An alert box is a 
        //      Dialog with a message and a single OK button
        //  Options: Object
        //      {dialogHeading : String } { body : String}
        //      - dialogHeading: the Dialog heading. The Dialog heading is shown on the top of the 
        //      dialog along with a close button to the right.
        //      - body: the body of the dialog. The body string gets parsed as a HTML string and is 
        //      displayed as the dialog body.
        // returns: dojo/promise/Promise
        //      A promise that gets resolved with a value of true when the user clicks on the OK 
        //      button or when the user closes the dialog
        //  tags:
        //      public

        var _d = new Deferred();
        var _dialog = new Dialog(lang.mixin(options, {
            buttons : {
                'OK' : function() {
                    // the OK button resolves the promise and hides the alert
                    _d.resolve(true);
                    this.hide();
                }
            },
            primaryButton: 'OK',
            postHide : function() {
                // on hide, resolve the promise and destroy the dialog
                _d.isFulfilled() || _d.resolve(true);
                this.destroy();
            }
        }), domConstruct.create("div", null, 'gennex-screen-container'));
        _dialog.startup();
        _dialog.show();
        return _d.promise;
    };

    Dialog.fatal = function(options) {
        //  summary:
        //      Dialog.fatal is a shorthand method for creating fatal error boxes. An fatal error 
        //      box is a Dialog with an error message and a reload page button
        //  Options: Object
        //      {dialogHeading : String } { body : String}
        //      - dialogHeading: the Dialog heading. The Dialog heading is shown on the top of the 
        //      dialog along with a close button to the right.
        //      - body: the body of the dialog. The body string gets parsed as a HTML string and is 
        //      displayed as the dialog body.
        //  tags:
        //      public
        var _dialog = new Dialog(lang.mixin(options, {
            buttons : {
                'Refresh Page' : function() {
                    // the Refresh page button reloads the page with a forceGet value of true
                    window.location.reload(true);
                }
            },
            primaryButton: 'Refresh Page',
            postHide : function() {
                // on hide, reload the page with a forceGet value of true
                window.location.reload(true);
            }
        }), domConstruct.create("div", null, 'gennex-screen-container'));
        _dialog.startup();
        _dialog.show();
    };

    Dialog.confirm = function(options) {
        //  summary:
        //      Dialog.confirm is a shorthand method for creating confirm boxes. An confirm box is
        //      a Dialog with a message and 'Yes' and 'No' button to accept and reject the message.
        //  Options: Object
        //      {dialogHeading : String } { body : String}
        //      - dialogHeading: the Dialog heading. The Dialog heading is shown on the top of the 
        //      dialog along with a close button to the right.
        //      - body: the body of the dialog. The body string gets parsed as a HTML string and is 
        //      displayed as the dialog body.
        // returns: dojo/promise/Promise
        //      A promise that:
        //      - gets resolved with a value of true when the user clicks on the 'Yes' button
        //      - gets resolved with a value of false when the user clicks on the 'No' button
        //      - gets rejected when the user clicks on the 'Close' button
        //  tags:
        //      public
        var _d = new Deferred();
        var _dialog = new Dialog(lang.mixin(options, {
            buttons : {
                'Yes' : function() {
                    // the Yes button resolves the promise with a value of true and hides the 
                    // confirmation dialog
                    _d.resolve(true);
                    this.hide();
                },
                'No' : function() {
                    // the No button resolves the promise with a value of false and hides the 
                    // confirmation dialog
                    _d.resolve(false);
                    this.hide();
                }
            },
            primaryButton: 'Yes',
            postHide : function() {
                // on hide, we reject the promise if it is not resolved and destroy the dialog
                _d.isFulfilled() || _d.reject('dialog closed');
                this.destroy();
            }
        }), domConstruct.create("div", null, 'gennex-screen-container'));
        _dialog.startup();
        _dialog.show();
        return _d.promise;
    };
    return Dialog;
});