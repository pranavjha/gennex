define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "dijit/_WidgetsInTemplateMixin", // extends
    "../mixins/_Container", // extends
    "dojo/text!./templates/ViewPortGroup.html", //template
    "dojo/_base/lang", // lang.hitch
    "dojo/Deferred", // new Deferred
    "dojo/when" // when
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, template,
    lang, Deferred, when) {
    //	module:
    //		gennex/widgets/ViewPortGroup
    var ViewPortGroup = declare([
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        _Container
    ], {
        //	summary:
        //		A ViewPortGroup visual representation of a group of ViewPorts arranged in a grid. 
        //      A ViewPortGroup can have ViewPorts or other ViewPortGroups as its children which 
        //      can in turn be horizontally or vertically stacked. This allows us to create 
        //      virtually any possible layout of ViewPorts

        //	type: [public readonly] String
        //		the name of this class
        type : "../widgets/ViewPortGroup",

        //	baseClass: [private] String
        //		the ViewPortGroup base class
        baseClass : "gennexViewPortGroup",

        //	templateString: [private] String
        //		the ViewPortGroup template placed at templates/ViewPortGroup.html
        templateString : template,

        //  layout: [public] String
        //      the layout property of the ViewPortGroup describes how the children of this group 
        //      should be stacked. Possible values are:
        //      - 'horizontal': the children are stacked one after the other
        //      - 'vertical': the children are stacked one below the other
        layout : null,

        //  _scene: [private] THREE.Scene
        //      the _scene object to be rendered in this ViewPortGroup       
        _scene : null,

        setScene : function(scene) {
            //  summary:
            //      This function sets a particular scene into this ViewPortGroup. Doing so will 
            //      make all its children ViewPorts to render this scene in different projections.
            //  scene: THREE.Scene
            //      The scene to be shown in this ViewPortGroup
            //  tags:
            //      public
            this._scene = scene;
            this.getChildren().forEach(function(item, index, array) {
                console.log('setting scene for ', item.type);
                item.setScene(scene);
            });
        },

        _postChildAdd : function(childNode) {
            //  summary:
            //      In the _postChildAdd function, we check if the ViewPortGroup has a scene 
            //      assigned to it. If so, assign the same scene to the newly added child.
            //  childNode: dijit/_Widget
            //      the newly added child widget
            //  tags:
            //      extension private
            this.inherited(arguments);
            this._scene && childNode.setScene(this._scene);
        }
    });
    return ViewPortGroup;
});