({
	baseUrl : 'src/georgezhang/public/js',
	name : '../../build/main',
	out : 'dest/georgezhang/js/mainnote.js',
	mainConfigFile : 'src/georgezhang/build/config.js',
	paths : {
        /* you should syncup the setting from Gruntfile.js if you want to call the command directly */
        'jquery' : 'empty:',
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
	stubModules : ['underscore', 'text', 'tpl'],
	removeCombined : true,
	inlineText : true,
    preserveLicenseComments: false,
})
