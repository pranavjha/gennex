var dojoConfig = (function() {

    // returns true if dojo is to be run in debug mode
    var isDebug = function() {
        try {
            // if the server is running on localhost, the application will run in debug mode
            return (location.search.match(/debug=([\w\-]+)/) ? (RegExp.$1 === 'true') : false);
        } catch (e) {
            // an exception will occur when the file is used for build. in this case, false should
            // be returned
            return false;
        }
    };

    // returns the locale dojo has to use for widgets
    var getLocale = function() {
        try {
            // if the location.search has a locale=xx query string param, the application will run 
            // with the locale specified
            return (location.search.match(/locale=([\w\-]+)/) ? RegExp.$1 : "en-us");
        } catch (e) {
            // an exception will occur when the file is used for build. in this case, en-us should
            // be returned
            return "en-us";
        }
    };

    // the dojoConfig object
    return {
        // async: Defines if Dojo core should be loaded asynchronously. Values can be true, false or
        // legacyAsync, which puts the loader permanently in legacy cross-domain mode
        async : true,

        // waitSeconds: Amount of time to wait before signaling load timeout for a module; defaults 
        // to 0 (wait forever)
        waitSeconds : 0,

        // cacheBust: If true, appends the time as a querystring to each module URL to avoid module
        // caching
        cacheBust : false,

        // isDebug: if true, the dojo/parser will log to a console when a module is auto-required.
        isDebug : isDebug(),

        // parseOnLoad: If true, parses the page with dojo/parser when the DOM and all initial
        // dependencies (including those in the dojoConfig.deps array) have loaded.
        parseOnLoad : false,

        // a path to prepend to a computed path if the computed path is relative.  If defined, 
        // the has feature config-tlmSiblingOfDojo is false; otherwise, it is true.
        baseUrl : './',

        // if truthy, then non-package top-level modules not mentioned in paths are assumed to be 
        // siblings of the dojo package; otherwise, they are assumed to be relative to baseUrl
        tlmSiblingOfDojo : false,

        // package definitions and location. this is required for the build and the configuration
        // to identify the package locations.
        packages : [
            {
                name : 'dojo',
                location : 'dojo'
            },
            {
                name : 'dijit',
                location : 'dijit'
            },
            {
                name : 'gennex',
                location : 'gennex'
            }
        ],

        // The locale option lets you override the default provided to Dojo by your browser
        locale : getLocale(),

        // An array of resource paths which should load immediately once Dojo has loaded
        // if the debug mode is on, the layer file must be loaded before any dependency is required
        // This is done here. If isDebug is set to false, no dependency is loaded
        deps : isDebug() ? [] : [
            "layers/common"
        ],

        // The callback to execute once dependencies have been retrieved.
        callback : function() {
            // require the ScreenLoader class here so that the screen can be set up
            require([
                'gennex/behavioral/ScreenLoader'
            ]);
        }
    };
})();