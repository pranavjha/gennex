define([
    "dojo/_base/declare", // declare
    "dojo/hash", // hash
    "dojo/topic", // topic.subscribe, topic.publish
    "dojo/dom-construct", // domConstruct.create
    "dojo/_base/lang", // lang.hitch
    "dojo/parser", // parser.parse
    "dojo/has", // has('config-isDebug')
    "../store/ConfigurationStore", // new ConfigurationStore
    "dojo/when", // when
    "dijit/registry", // registry.byId
    "dojo/ready", // ready
    "require", // require
    "../behavioral/messages" // behavioral handling for console events
], function(declare, hash, topic, domConstruct, lang, parser, has, ConfigurationStore, when,
    registry, ready, require) {
    // 	module:
    // 		gennex/behavioral/ScreenLoader
    var ScreenLoader = declare(null, {
        //	summary:
        // 		This class is responsible for loading the main screen and navigating between 
        //      screens in the gennex application. It binds a hash change listener to the document 
        //      and maintains a hash - screen relationship to take care of the browser back and 
        //      next buttons

        //	type: [public readonly] String
        //		the name of this class
        type : "../behavioral/ScreenLoader",

        //	_dataStore: [private] gennex/store/ConfigurationStore
        //		the ConfigurationStore object to query screen details
        _dataStore : null,

        constructor : function(options) {
            //	summary
            //		Initializes the ScreenLoader utility class and sets up the application. In 
            //		order to set up the screen for use, it does the below activities.
            //		1. creates a store and seeds the data in the memory
            //		2. if a header is required, creates it
            //		3. if a footer is required, creates it
            // 		4. adds the theme, if required
            // 		5. attaches a hashchange event to control screen navigation
            //	options: Object ?
            //		{header: Boolean} {footer: Boolean} {theme: String} {container: String}
            //		Options is a map of configurations used to define the screen structure. The 
            //		keys and their values are as described below:
            //		- header: whether the screen should have a header or not. values are true and 
            //		false
            //		- footer: whether the screen should have a footer or not. values are true and 
            //		false
            //		- theme: the theme to use for the screen. Only 'gennex' theme is available 
            //		- container : the id of the dom element on which the screen is to be loaded
            //  tags:
            //		public

            // 1. create a store and seed the data in the indexedDB if required.
            this._dataStore = new ConfigurationStore();
            // 2. if there is no hash set, load the home screen
            hash(window.location.hash || 'Home', true);
            // 3. if a header is required, create it
            if (options.header) {
                var _header = domConstruct.create("div", {
                    id : "gennex-common-Header"
                }, options.container);
                require([
                    "../common/Header"
                ], function(Header) {
                    new Header({}, _header).startup();
                });
            }
            // 4. if a footer is required, create it
            if (options.footer) {
                var _footer = domConstruct.create("div", {
                    id : "gennex-common-Footer"
                }, options.container);
                require([
                    "../common/Footer"
                ], function(Footer) {
                    new Footer({}, _footer).startup();
                });
            }
            // 5. add the theme, if required
            if (options.theme) {
                if (has('config-isDebug')) {
                    // add less configurations
                    less = {
                        // or "production"
                        env : "development",
                        // load imports async
                        async : false,
                        // load imports async when in a page under
                        fileAsync : false,
                        // when in watch mode, time in ms between polls
                        poll : 1000,
                        // user functions, keyed by name
                        functions : {},
                        // or "mediaQuery" or "all"
                        dumpLineNumbers : "comments",
                        // whether to adjust url's to be relative if false, url's are already 
                        // relative to the entry less file
                        relativeUrls : false
                    };
                    domConstruct.create('link', {
                        rel : "stylesheet/less",
                        type : "text/css",
                        href : "gennex/themes/" + options.theme + ".less"
                    }, options.container);
                    require([
                        "externals/less"
                    ]);
                } else {
                    domConstruct.create('link', {
                        rel : "stylesheet",
                        type : "text/css",
                        href : "gennex/themes/" + options.theme + ".css"
                    }, options.container);
                }
            }
            // 6. attach a hashchange event to control screen navigation
            var _loadPage = lang.hitch(this, "_loadPage");
            topic.subscribe("/dojo/hashchange", function(actualHash) {
                _loadPage(actualHash, options.container);
            });
            topic.publish("/dojo/hashchange", location.hash.replace(/^#/, ''));
        },

        _loadPage : function(screenHash, container) {
            //	summary:
            //		hashchange function attached to the document. this function is responsible for 
            //		screen navigations. The screen setup involves the following activities in 
            //      sequence:
            //		1. the previous screen is destroyed after its state is stored in the 
            //		ConfigurationStore
            //		2. a new screen div is created
            //		3. if the server is not in debug mode, the layer file is loaded
            //		4. the new screen is loaded
            //	tags:
            //		private callback
            var _dataStore = this._dataStore;
            // 1. destroy the previous screen after storing its state in memory
            var _prevScreen = registry.byId("gennex-screen");
            if (_prevScreen) {
                console.debug('serialized data: ', _prevScreen.serialize());
                _dataStore.put(_prevScreen.serialize());
                _prevScreen.destroy();
            }
            // 2. create a new div for the screen
            var _screen = domConstruct.create("div", {
                id : "gennex-screen"
            }, container);
            // 3. if the server is not in debug mode, load the layer file first
            var _layersRequired = [];
            if (!has('config-isDebug')) {
                _layersRequired.push("layers/" + screenHash);
            }
            // 4. load the screen
            when(_dataStore.get("../screen/" + screenHash), function(_screenData) {
                require(_layersRequired, function() {
                    require([
                        "../screen/" + screenHash
                    ], function(Screen) {
                        new Screen(_screenData, _screen).startup();
                    });
                });
            });
        }
    });

    // invoke the ScreenLoader when the dom is ready
    ready(function() {
        new ScreenLoader({
            header : true,
            footer : true,
            theme : 'gennex',
            container : 'gennex-screen-container'
        });
    });
});