module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		requirejs : {
			compile : {
				options : {
					baseUrl : 'src/georgezhang/public/js',
					name : '../../build/main',
					out : 'dest/georgezhang/public/js/mainnote.js',
					paths : {
						'jquery' : 'empty:',
						'autosize' : 'empty:',
						'bootstrap' : 'empty:',
						'fastclick' : 'empty:',
						'templates' : '../templates',
						'underscore' : '../../build/underscore',
						'text' : '../../build/text',
						'tpl' : '../../build/tpl',
					},
					shim : {
						underscore : {
							exports : '_'
						}
					},
					stubModules : ['underscore', 'text', 'tpl', 'main'],
					removeCombined : true,
					inlineText : true,
					preserveLicenseComments : false,
					optimize : 'none',
				},
			},
		},
		uglify : {
			options : {
				banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build : {
				files : {
					'build/mainnote.min.js' : ['dest/georgezhang/public/js/mainnote.js'],
				}
			},

		},
		jasmine : {
			requirejs : {
				src : 'src/georgezhang/public/js/*.js',
				options : {
					specs : 'test/specs/requirejs/*Spec.js',
					helpers : 'spec/*Helper.js',
					template : require('grunt-template-jasmine-requirejs'),
					templateOptions : {
                        requireConfigFile : 'src/georgezhang/public/js/config.js',
						requireConfig : {
							baseUrl: 'src/georgezhang/public/js',
                            paths: {
                                'jquery' : 'http://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery.min',
                                'autosize' : 'empty:',
                                'bootstrap' : 'empty:',
                                'fastclick' : 'empty:',
                            },
						},
					}
				}
			}
		},
		watch : {
			all : {
				files : ['test/specs/**/*Spec.js', 'src/georgezhang/public/js/*.js'],
				tasks : ['test'],
				options : {
					spawn : false,
				},
			},
		},
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', ['requirejs', 'uglify']);
	grunt.registerTask('test', ['jasmine:requirejs']);
};
