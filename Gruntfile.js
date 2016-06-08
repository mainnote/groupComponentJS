/*
 * cd node_modules/ && git clone https://github.com/georgezhang/requirejs-tpl.git
 */

module.exports = function (grunt) {
    var module_list = require('./src/georgezhang/build/main');
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src/georgezhang/public/js',
                    include: module_list,
                    out: 'dest/georgezhang/public/js/mainnote.js',
                    paths: {
                        'jquery': 'empty:',
                        'autosize': 'empty:',
                        'bootstrap': 'empty:',
                        'fastclick': 'empty:',
                        'bootstrap-switch': 'empty:',
                        'bootstrap-tagsinput': 'empty:',
                        'validator': 'empty:',
                        'notify': 'empty:',
                        'templates': '../templates',
                        'tpl': '../../build/tpl',
                        'underscore': '../../build/underscore',
                        'text': '../../build/text',
                        'ckeditor-core': 'empty:',
                        'ckeditor-jquery': 'empty:',
                    },
                    shim: {
                        underscore: {
                            exports: '_'
                        }
                    },
                    stubModules: ['underscore', 'text'],
                    removeCombined: true,
                    inlineText: true,
                    preserveLicenseComments: false,
                    optimize: 'none',
                    onModuleBundleComplete: function (data) {
                        var replace = require('replace');
                        replace({
                            regex: /define\('(text|underscore)',{.*?}\);/g,
                            replacement: '',
                            paths: [data.path],
                            recursive: false,
                            silent: false,
                        });
                    },
                },
            },
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                options: {
                    sourceMap: true,
                },
                files: {
                    'build/mainnote.min.js': ['build/mainnote.js'],
                }
            },

        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: [{
                        src: ['dest/georgezhang/public/css/*.css'],
                        dest: 'build/mainnote.min.css',
					}
				],

            },
        },
        jasmine: {
            requirejs: {
                src: 'src/georgezhang/public/js/*.js',
                options: {
                    specs: 'test/specs/requirejs/*Spec.js',
                    helpers: 'spec/*Helper.js',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfigFile: 'src/georgezhang/public/js/config.js',
                        requireConfig: {
                            baseUrl: 'src/georgezhang/public/js',
                            paths: {
                                'jquery': 'http://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery.min',
                                'autosize': 'http://cdnjs.cloudflare.com/ajax/libs/autosize.js/3.0.8/autosize.min',
                                'bootstrap': 'http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha/js/bootstrap.min',
                                'fastclick': 'http://cdnjs.cloudflare.com/ajax/libs/fastclick/1.0.6/fastclick.min',
                                'bootstrap-switch': 'http://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/js/bootstrap-switch.min',
                                'bootstrap-tagsinput': 'http://cdnjs.cloudflare.com/ajax/libs/bootstrap-tagsinput/0.8.0/bootstrap-tagsinput.min',
                                'underscore': 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
                                'text': 'http://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min',
                                'jasmine-jquery': '../../../../bower_components/jasmine-jquery/lib/jasmine-jquery',
                                'validator': 'http://cdnjs.cloudflare.com/ajax/libs/validator/5.2.0/validator.min',
                                'notify': 'http://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min',
                                'ckeditor-core': 'http://cdnjs.cloudflare.com/ajax/libs/ckeditor/4.5.9/ckeditor',
                                'ckeditor-jquery': 'http://cdnjs.cloudflare.com/ajax/libs/ckeditor/4.5.9/adapters/jquery',
                            },
                            shim: {
                                'jasmine-jquery': {
                                    deps: ['jquery'],
                                    exports: 'jasmine-jquery'
                                }
                            },
                        },
                    }
                }
            }
        },
        watch: {
            all: {
                files: ['test/specs/**/*Spec.js', 'src/georgezhang/public/js/*.js'],
                tasks: ['test'],
                options: {
                    spawn: false,
                },
            },
        },
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default task(s).
    grunt.registerTask('default', ['requirejs', 'uglify', 'cssmin']);
    grunt.registerTask('test', ['jasmine:requirejs']);
};
