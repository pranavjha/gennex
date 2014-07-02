// The production build profile for gennex application.

// to run the profile form console use the following command:
// java -classpath ../closureCompiler/compiler.jar;../shrinksafe/js.jar 
//		org.mozilla.javascript.tools.shell.Main ../../dojo/dojo.js load=build baseUrl=../../dojo 
//		profile=../../build.profile.js dojoConfig=../../dojo.config.js localeList=hi-in,kn-in -r
var profile = {

    // This is the "root" of the build, from where the rest of the build will be calculated from.
    // This is relative to where the build profile is located.
    basePath : "./",

    // This is the root directory where the build should go. The builder will attempt to create
    // this directly and will overwrite anything it finds there. It is relative to the basePath
    releaseDir : "../scripts",

    // This provides a name to a particular release when outputting it. This is appended to the 
    // releaseDir. For example if you are going to release your code in release/prd you could 
    // set your releaseDir to release and your releaseName to prd.
    // releaseName : <<not set>>

    // This should be set to release
    action : "release",

    // Sets the minification setting for layers. This defaults to "shrinksafe". A value of false
    // turns off minification and the other valid values are "shrinksafe.keeplines", "closure", 
    // "closure.keeplines", "comment", and "comment.keeplines".
    layerOptimize : "closure",

    // Sets the minification for modules that aren't part of a layer. This defaults to false and
    // takes the sames values as layerOptimize.
    optimize : "closure",

    // Deals with out CSS is optimized. It defaults to false. A value of "comments" will strip out
    // comments and extra lines and inline any @import commands. A value of "comments.keepLines" 
    // strips the comments and inlines the @imports, but preserves any line breaks.
    cssOptimize : "comments",

    // This determines if the build is a "mini" build or not. If true it will exclude files that 
    // are tagged as miniExclude which is typically things like tests, demos and other items not 
    // required for the build to work. This defaults to false.
    mini : true,

    // This determines how console handling is dealt with in the output code. This defaults to 
    // "normal" which strips all console messages except console.error and console.warn. It is 
    // important to note though, this feature only applies when there is a level of optimization 
    // going on, otherwise it is ignored. Other possible values are "none", "warn" and "all".
    stripConsole : "all",

    // This identifies the default selector engine for the build and builds it into the code. 
    // While this does not directly make the code smaller, it ensure that a selector engine won't 
    // require another call to be loaded. It defaults to nothing and the two engines included with 
    // Dojo are lite and acme. We use the lite selector engine since we don’t need the full 
    // overhead of Acme or Sizzle or Slick for dgrid in modern browsers
    selectorEngine : "lite",

    // The list of locales to be flattened along with this custom build. If a locale is not 
    // specified here and used, It will be served as a non built resource.
    localeList : [
        "hi-in",
        "kn-in",
        "en-us"
    ],
    // This is a hash of features that you are "forcing" to be on or off for the build. When 
    // coupled with the Closure Complier, this allows dead code path removal.
    staticHasFeatures : {

        // Disables automatic loading of code that reports un-handled rejected promises
        "config-deferredInstrumentation" : 0,

        // Disables some of the error handling when loading modules.
        "config-dojo-loader-catches" : 0,

        // Enables non-standard module resolution code. Since baseUrl is not set in configuration,
        // this value should be truthy.
        "config-tlmSiblingOfDojo" : 0,

        // if truthy, the parser looks for a src attribute ending in dojo.js, optionally preceded 
        // with a path and uses the path to dojo.js (if any) without the trailing slash for the 
        // dojo baseUrl when not provided explicitly in the config data; this is the 1.6- behavior.
        "dojo-sniff" : 0,

        // Assumes that all modules are AMD
        "dojo-amd-factory-scan" : 0,

        // Disables some of the legacy loader API
        "dojo-combo-api" : 0,

        // Ensures that the build is configurable
        "dojo-config-api" : 1,

        // Disables configuration via the require()
        "dojo-config-require" : 0,

        // Disables some diagnostic information
        "dojo-debug-messages" : 0,

        // Ensures that the DOM ready API is available
        "dojo-dom-ready-api" : 1,

        // Disables Firebug Lite for browsers that don't have a developer console
        "dojo-firebug" : 0,

        // Disables the noop implementation of console object in browsers that don't 
        // have it available
        "dojo-guarantee-console" : 0,

        // Enables the has feature detection API.
        "dojo-has-api" : 1,

        // Ensures the cross domain loading of modules is supported. required for URL injection 
        // for loading modules
        "dojo-inject-api" : 1,

        // Ensures the loader is available. If not a foreign loader must be used
        "dojo-loader" : 1,

        // Disables the logging code of the loader
        "dojo-log-api" : 0,

        // Removes some legacy API related to loading modules
        "dojo-modulePaths" : 0,

        // Removes some legacy API related to loading modules
        "dojo-moduleUrl" : 0,

        // Disables the exposure of some internal information for the loader.
        "dojo-publish-privates" : 0,

        // Disables support for RequireJS
        "dojo-requirejs-api" : 0,

        // Disables the legacy loader
        "dojo-sync-loader" : 0,

        // Disables some features for testing purposes
        "dojo-test-sniff" : 0,

        // Disables code dealing with modules that don't load
        "dojo-timeout-api" : 0,

        // Disables the tracing of module loading.
        "dojo-trace-api" : 0,

        // Removes support for module unloading
        "dojo-undef-api" : 0,

        // Enables support for v1.x i18n loading (required by Dijit)
        "dojo-v1x-i18n-Api" : 1,

        // Ensures the DOM code is available. For a web browser, this should be 1
        "dom" : 1,

        // Ensures the code is built to run on a browser platform
        "host-browser" : 1,

        // Ensures the code is not built to run on node platform
        "host-node" : 0,

        // Ensures the code is not built to run on rhino platform
        "host-rhino" : 0,

        // If "extend-dojo" is truthy, then as a dojo module is defined it should push it's
        // definitions into the dojo object, and conversely. In 2.0, it will likely be unusual 
        // to augment another object as a result of defining a module.
        "extend-dojo" : 0,

        // Ensures that all the debug specific code is not available
        "config-isDebug" : 0
    },

    // The default configuration for the build. This can be overridden by an application or 
    // code, but if you are doing a specific build for a specific application, it might be 
    // very handy to utilize this.  If you are only ever using a single configuration for 
    // your production application, you could easily expand this to configure other things 
    // at build time and then omit them from your dojoConfig when you load your application.
    defaultConfig : {

        // hasCache is similar to the static has features, but instead of hard wiring the code,
        // it simply "tells" the code what the setting of the feature is, so it doesn't have 
        // to spend cycles figuring it out.
        hasCache : {
            "dojo-built" : 1,
            "dojo-loader" : 1,
            "dom" : 1,
            "host-browser" : 1,
            "config-selectorEngine" : "lite",
            "config-tlmSiblingOfDojo" : 1
        },
        // async: Defines if Dojo core should be loaded asynchronously. Values can be true, false or
        // legacyAsync, which puts the loader permanently in legacy cross-domain mode
        async : true
    },

    // This allows you to create different "layer" modules as part of a build that contain discreet
    // functionality all built into single file.
    layers : {
        "layers/common" : {

            // the common layer includes the ScreenLoader which is the bootstrap class of the 
            // gennex application. this layer is included as a part of dependency list in 
            // dojoConfig in production
            include : [
                // the bootstrap class of the gennex application
                "gennex/behavioral/ScreenLoader",
                // the common footer for the application
                "gennex/common/Footer",
                // the common header for the application
                "gennex/common/Header",

            ]
        },
        "layers/Builder" : {
            // the builder layer combines all the classes that are required for the builder 
            // screen to load.
            include : [
                // the builder screen
                "gennex/screen/Builder",
                // classes added dynamically as children to the builder screen
                "gennex/behavioral/CheckboxGroup",
                "gennex/behavioral/RadioGroup",
                "gennex/widgets/Command",
                "gennex/widgets/CommandGroup",
                "gennex/widgets/ExtendedCommandGroup",
                "gennex/widgets/ContextMenu"
            ],
            exclude : [
                // the common layer must be excluded from the builder layer to prevent duplicates
                "layers/common"
            ]
        },
        "layers/Viewer" : {
            // the builder layer combines all the classes that are required for the viewer 
            // screen to load.
            include : [
                // the builder screen
                "gennex/screen/Viewer"
            ],
            exclude : [
                // the common layer must be excluded from the viewer layer to prevent duplicates
                "layers/common"
            ]
        },
        "layers/Home" : {
            // the builder layer combines all the classes that are required for the home 
            // screen to load.
            include : [
                // the builder screen
                "gennex/screen/Home"
            ],
            exclude : [
                // the common layer must be excluded from the home layer to prevent duplicates
                "layers/common"
            ]
        }
    }
};