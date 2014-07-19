// Script to process all the less files and convert them to CSS files
// Run from the base directory as:
//	$ node theme.compiler.js <<theme name>>

var fs = require('fs'), // file system access
path = require('path'), // get directory from file name
less = require('../../util/less/lib/less'); // less processor

// less compilation options
var options = {

    // disable compression. actual compression and minification will be done during the dojo build
    compress : false,
    
    optimization : 1,
    dumpLineNumbers : "comments",
    relativeUrls : true
};
var fname = process.argv[2] + '.less';
console.log("compiling... " + fname);
fs.readFile(fname, 'utf-8', function(e, data) {
    if (e) {
        console.error("file read failed. Error: ", e);
        process.exit(1);
    }
    new (less.Parser)({
        paths : [
            path.dirname(fname)
        ],
        optimization : options.optimization,
        filename : fname,
        relativeUrls : options.relativeUrls
    }).parse(data, function(err, tree) {
        if (err) {
            less.writeError(err, options);
            process.exit(1);
        } else {
            try {
                var css = tree.toCSS({
                    compress : options.compress,
                    relativeUrls : options.relativeUrls,
                    dumpLineNumbers : options.dumpLineNumbers
                }), outputFname = fname.replace('.less', '.css');
                var fd = fs.openSync(outputFname, "w");
                fs.writeSync(fd, css, 0, "utf8");
                console.log('compiled output written to ', outputFname);
            } catch (e) {
                less.writeError(e, options);
                process.exit(2);
            }
        }
    });
});