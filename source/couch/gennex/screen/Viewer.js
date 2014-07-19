define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "../mixins/_Container", // extends
    "../mixins/_Serializable", // extends
    "dojo/text!./templates/Viewer.html" // template
], function(declare, _WidgetBase, _TemplatedMixin, _Container, _Serializable, template) {
    //	module:
    //		gennex/screen/Viewer
    var Viewer = declare([
        _WidgetBase,
        _TemplatedMixin,
        _Container,
        _Serializable
    ], {
        //	summary:
        //		The Viewer screen

        //	type: [public readonly] String
        //		the name of this class
        type : "../screen/Viewer",

        //	templateString: [private] String
        //		the Viewer screen template placed at templates/Viewer.html
        templateString : template,

        //  baseClass: [private] String
        //      the viewer base class
        baseClass : "gennexViewer"
    });
    return Viewer;
});