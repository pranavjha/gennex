define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "dojo/text!./templates/Footer.html" // template
], function(declare, _WidgetBase, _TemplatedMixin, template) {
    //	module:
    //		gennex/common/Footer
    var Footer = declare([
        _WidgetBase,
        _TemplatedMixin
    ], {
        //	summary:
        //		The Footer widget implements the common screen footer

        //	type: [public readonly] String
        //		the name of this class
        type : "../common/Footer",

        //	baseClass: [private] String
        //		the Footer base class, this is used by _CssStateMixin to create hover and active 
        //      classes
        baseClass : "gennexFooter",

        //	templateString: [private] String
        //		the footer template placed at templates/Footer.html
        templateString : template
    });
    return Footer;
});