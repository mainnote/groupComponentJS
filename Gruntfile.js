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
                    stubModules : ['main'],
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
		cssmin : {
			options : {
				shorthandCompacting : false,
				roundingPrecision : -1
			},
			target : {
				files : [{
						src : ['dest/georgezhang/public/css/*.css'],
						dest : 'build/mainnote.min.css',
					}
				],

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
							baseUrl : 'src/georgezhang/public/js',
							paths : {
								'jquery' : 'http://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery.min',
								'autosize' : 'http://cdnjs.cloudflare.com/ajax/libs/autosize.js/3.0.8/autosize.min',
								'bootstrap' : 'http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha/js/bootstrap.min',
								'fastclick' : 'http://cdnjs.cloudflare.com/ajax/libs/fastclick/1.0.6/fastclick.min',
								'underscore' : 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
								'text' : 'http://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min',
								'tpl' : 'http://cdnjs.cloudflare.com/ajax/libs/requirejs-tpl/0.0.2/tpl.min',
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
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	// Default task(s).
	grunt.registerTask('default', ['requirejs', 'uglify', 'cssmin']);
	grunt.registerTask('test', ['jasmine:requirejs']);
};
