define([
    "dojo/_base/declare", // declare
    "dijit/_WidgetBase", // extends
    "dijit/_TemplatedMixin", // extends
    "dijit/_FocusMixin", // extends
    "dojo/text!./templates/ViewPort.html", //template
    "dojo/_base/lang", //lang.mixin
    "dojo/dom-geometry" // domGeometry.position
], function(declare, _WidgetBase, _TemplatedMixin, _FocusMixin, template, lang, domGeometry) {
    //	module:
    //		gennex/widgets/ViewPort
    var ViewPort = declare([
        _WidgetBase,
        _TemplatedMixin,
        _FocusMixin
    ], {
        //	summary:
        //		A ViewPort visual representation of a 3D scene. Each ViewPort is associated with a 
        //      camera which is used to render it.

        //	type: [public readonly] String
        //		the name of this class
        type : "../widgets/ViewPort",

        //	baseClass: [private] String
        //		the ViewPort base class
        baseClass : "gennexViewPort",

        //	templateString: [private] String
        //		the ViewPort template placed at templates/ViewPort.html
        templateString : template,

        //  config: [public] Object
        //      the config object is set during the ViewPort instantiation. It has properties 
        //      required to setup the camera and the renderer. The properties that can be 
        //      configured here are:
        //      - TODO: structural details pending.
        config : null,

        //  _camera: [private] THREE.Camera
        //      the camera corresponding to this ViewPort
        _camera : null,

        //  _renderer: [private] THREE.CanvasRenderer | THREE.WebGLRenderer
        //      the rendered used to display this ViewPort
        _renderer : null,

        //  _scene: [private] THREE.Scene
        //      the _scene object to be rendered in this ViewPort        
        _scene : null,

        //  _animationFrame: [private] Integer
        //      the output animation frame for the requestAnimationFrame call. Used to cancel/stop
        //      updates in the ViewPort
        _animationFrame : null,

        postCreate : function() {
            //  summary:
            //      In this function, we create the camera and the renderer objects for this 
            //      ViewPort using the configurations available. Also, the tabIndex is set to 0 for 
            //      this ViewPort to be able to be focused.
            //  tags:
            //      extension private
            this.inherited(arguments);
            this.domNode.setAttribute('tabIndex', 0);
            // TODO: implementation pending. for demonstration only
            //this._camera = new THREE.OrthographicCamera(-4, 4, 3, -3, 1, 1000);
            this._camera = new THREE.PerspectiveCamera();
            this._renderer = new THREE.WebGLRenderer();
            this.domNode.appendChild(this._renderer.domElement);
            this._camera.position.fromArray([
                5,
                5,
                5
            ]);
            this._camera.lookAt(new THREE.Vector3().fromArray([
                0,
                0,
                0
            ]));
        },

        setScene : function(scene) {
            //  summary:
            //      This function sets a particular scene into this ViewPort. Doing so will 
            //      make all its children ViewPorts to render this scene in different projections.
            //  scene: THREE.Scene
            //      The scene to be shown in this ViewPortGroup
            //  tags:
            //      public
            this._scene = scene;
        },

        resize : function() {
            //  summary:
            //      This resize function is called when a ViewPort resize is required. A resize can 
            //      be triggered by a window resize or by the user when the resize handles in the 
            //      ViewPortGroup are dragged. In this function, we calculate the new DOM Geometry 
            //      and adjust the renderer and the Camera Projections accordingly.
            //  tags:
            //      public callback
            var _thisGeom = domGeometry.position(this.domNode);
            this._camera.aspect = _thisGeom.w / _thisGeom.h;
            this._camera.updateProjectionMatrix();
            this._renderer.setSize(_thisGeom.w, _thisGeom.h);
        },

        _autoUpdate : function() {
            //  summary:
            //      This _autoUpdate function starts a render loop for this ViewPort using 
            //      requestAnimationFrame
            //  tags:
            //      private
            this._animationFrame = requestAnimationFrame(lang.hitch(this, '_autoUpdate'));
            this._renderer.render(this._scene, this._camera);
        },

        startUpdate : function() {
            //  summary:
            //      This startUpdate function starts the auto update render loop for this ViewPort
            //  tags:
            //      public
            if (!this._animationFrame) {
                this._autoUpdate();
            } else {
                console.warn('auto update is already running...');
            }
        },

        stopUpdate : function() {
            //  summary:
            //      This stopUpdate function stops the auto update render loop for this ViewPort
            //  tags:
            //      public
            cancelAnimationFrame(this._animationFrame);
            this._animationFrame = null;
        },
        _onFocus : function() {
            //  summary:
            //      This function is called when this ViewPort steals focus for itself. Here, 
            //      the auto-update loop is triggered.
            //  tags:
            //      private extension callback
            this.resize(arguments);
            this.startUpdate();
        },
        _onBlur : function() {
            //  summary:
            //      This function is called when this ViewPort loses focus. Here, the auto-update 
            //      loop is stopped.
            //  tags:
            //      private extension callback
            this.stopUpdate();
        }
    });
    return ViewPort;
});