define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "../mixins/_Container", // extends
    "../mixins/_Serializable", // extends
    "dojo/text!./templates/Home.html" // template
], function(declare, _WidgetBase, _TemplatedMixin, _Container, _Serializable, template) {
    //	module:
    //		gennex/screen/Home
    var Home = declare([
        _WidgetBase,
        _TemplatedMixin,
        _Container,
        _Serializable
    ], {
        //	summary:
        //		The Home screen

        //	type: [public readonly] String
        //		the name of this class
        type : "../screen/Home",

        //	templateString: [private] String
        //		the Home screen template placed at templates/Home.html
        templateString : template,

        //  baseClass: [private] String
        //      the home base class
        baseClass : "gennexHome"
    });
    return Home;
});