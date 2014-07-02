define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "dijit/_WidgetsInTemplateMixin", // extends
    "../mixins/_Container", // extends
    "../mixins/_ContextAware", // extends
    "../mixins/_Serializable", // extends
    "dojo/text!./templates/Builder.html", // template
    "dojo/_base/lang", // lang.hitch
    "dojo/Deferred", // new Deferred
    "dojo/when", // when
    "../widgets/ToolBar", // pre-fetching for _WidgetsInTemplateMixin
    "../widgets/ResizeHandle" // pre-fetching for _WidgetsInTemplateMixin
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container,
    _ContextAware, _Serializable, template, lang, Deferred, when) {
    //	module:
    //		gennex/screen/Builder
    var Builder = declare([
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        _Container,
        _ContextAware,
        _Serializable
    ], {
        //	summary:
        //		The Builder screen

        //	type: [public readonly] String
        //		the name of this class
        type : "../screen/Builder",

        //	templateString: [private] String
        //		the Builder screen template placed at templates/Builder.html
        templateString : template,

        //	baseClass: [private] String
        //		the builder base class
        baseClass : "gennexBuilder",

        //	_targetNodes: [private] String[]
        //		the list of nodes in this widget that are targets for child elements. All the child 
        //		elements in the children referred by _targetNodes list will be scanned for 
        //		_Serializable children.
        _targetNodes : [
            'northNode',
            'westNode',
            'southNode',
            'eastNode'
        ],

        //  sceneId: [public] String
        //      the sceneId property is an identifier for the scene to be loaded in the 
        //      ViewPortGroup
        _sceneId : null,

        _postChildAdd : function(childNode) {
            //  summary:
            //      In the _postChildAdd function, we check if the new child added is a 
            //      ViewPortGroup. If so, we try to fetch the current scene from the database and 
            //      set it into the ViewPortGroup
            //  childNode: dijit/_Widget
            //      the newly added child widget
            //  tags:
            //      extension private
            this.inherited(arguments);
            if (childNode.type === "../widgets/ViewPortGroup") {
                when(this.loadScene(), lang.hitch(this, function(scene) {
                    childNode.setScene(scene);
                }));
            }
        },

        loadScene : function() {
            //  summary:
            //      Fetches the scene corresponding to the _sceneId attribute from the database and 
            //      loads it into the ViewPortGroup. If no _sceneId is provided, the Builder screen 
            //      is cleared and the user can create a new scene.
            //  returns: dojo/promise/Promise | THREE.Scene
            //      A promise that will get resolved with the THREE.Scene object when the scene is 
            //      loaded
            //  tags:
            //      public callback
            // TODO: implementation pending. for demonstration only

            var scene = new THREE.Scene();
            var geometry = new THREE.CubeGeometry(1, 1, 1);
            var material = new THREE.MeshBasicMaterial({
                color : 0x00ff00
            });
            var cube = new THREE.Mesh(geometry, material);
            var grid = new THREE.GridHelper( 500, 1 );
            
            scene.add(cube);
            scene.add(grid);
            return scene;
        }
    });
    return Builder;
});