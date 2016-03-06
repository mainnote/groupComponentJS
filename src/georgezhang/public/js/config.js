require.config({
	baseUrl : 'public/js/',
	paths : {
		'jquery' : '//cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-beta1/jquery.min',
		'underscore' : '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
		'text' : '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min',
		'tpl' : '//cdnjs.cloudflare.com/ajax/libs/requirejs-tpl/0.0.2/tpl.min',
		'autosize' : '//cdnjs.cloudflare.com/ajax/libs/autosize.js/3.0.8/autosize.min',
		'bootstrap' : '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha/js/bootstrap.min',
		'fastclick' : '//cdnjs.cloudflare.com/ajax/libs/fastclick/1.0.6/fastclick.min',
        'templates' : '../templates',
	},
	shim : {
		'bootstrap' : {
			"deps" : ['jquery']
		}
	},
	waitSeconds : 15,
});
