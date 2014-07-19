// The profile file the "minimum" information needed for the builder to build the gennex
// package. What will happen when the builder reads this package, is pass each file in 
// the package to the resourceTags functions in order to determine if the tag applies to 
// the file. There are two arguments that get passed, which are the filename and the MID 
// (Module ID). If the function returns true then the tag applies (and of course false 
// means that tag does not apply).
var profile = (function() {

    // if a resource is listed in this copyOnlyList, it is considered to be copyOnly
    var copyOnlyList = {
        "gennex/gennex.profile" : true,
        "gennex/package.json" : true,
        "gennex/themes/theme.compiler" : true
    };

    return {
        resourceTags : {
            test : function(filename, mid) {
                // The test function tests a file and returns true if the resource 
                // is part of the test code of the package.

                // we do not have any test resources for now. so we return false 
                // here
                return false;
            },

            copyOnly : function(filename, mid) {
                // The copyOnly function tests a file and returns true if the resource 
                // should be copied to the destination location and otherwise 
                // left unaltered

                // if a resource is listed in the copyOnlyList, it is considered to 
                // be copyOnly
                return (mid in copyOnlyList);
            },
            amd : function(filename, mid) {
                // The amd function tests a file and returns true if the resource 
                // is an AMD module.

                // If the specific resource is not listed in the copyOnlyList and 
                // is a javaScript file, we assume it to be an amd module.
                return /\.js$/.test(filename) && !(mid in copyOnlyList);
            }
        }
    };
})();
