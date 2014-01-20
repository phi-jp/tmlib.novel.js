/*
 * gruntfile.js
 */

module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json');
    var target = [
        'scripts/script.js',
        'scripts/element.js',
    ];
    var banner = '\
/*\n\
 * tmlib.novel.js <%= version %>\n\
 * http://github.com/phi-jp/tmlib.novel.js\n\
 * MIT Licensed\n\
 * \n\
 * Copyright (C) 2010 phi, http://tmlife.net\n\
 */\n\
';

    grunt.initConfig({
        version: pkg.version,
        buildDir: ".",

        concat: {
            tmlib: {
                src: target,
                dest: '<%= buildDir %>/tmlib.novel.js',
                options: {
                    banner: banner
                }
            },
        },
        uglify: {
            tmlib: {
                options: {
                },
                files: {
                    '<%= buildDir %>/tmlib.novel.min.js': [ '<%= buildDir %>/tmlib.novel.js' ]
                },
            },
        },
    });

    for (var key in pkg.devDependencies) {
        if (/grunt-/.test(key)) {
            grunt.loadNpmTasks(key);
        }
    }

    grunt.registerTask('default', ['concat', 'uglify']);
};

