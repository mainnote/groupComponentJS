require.config({
    baseUrl: 'public/js/',
    paths: {
        'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-beta1/jquery.min',
        'tpl': '../../build/tpl',
        'autosize': '//cdnjs.cloudflare.com/ajax/libs/autosize.js/3.0.8/autosize.min',
        'bootstrap': '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha/js/bootstrap.min',
        'fastclick': '//cdnjs.cloudflare.com/ajax/libs/fastclick/1.0.6/fastclick.min',
        'bootstrap-switch': '//cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/3.3.2/js/bootstrap-switch.min',
        'bootstrap-tagsinput': '//cdnjs.cloudflare.com/ajax/libs/bootstrap-tagsinput/0.8.0/bootstrap-tagsinput.min',
        'underscore': '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
        'text': '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min',
        'templates': '../templates',
    },
    shim: {
        'bootstrap': {
            "deps": ['jquery']
        },
        'bootstrap-switch': {
            "deps": ['bootstrap']
        },
        'bootstrap-tagsinput': {
            "deps": ['bootstrap']
        },
        underscore: {
            exports: '_'
        },
    },
    waitSeconds: 15,
});
