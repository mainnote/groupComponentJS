require.config({
    paths: {
        'mockjax': '../../jquery.mockjax'
    },
    shim: {
        'mockjax': {
            'deps': ['jquery']
        }
    }
});

//start entry of this eample
define(['jquery',
    'myApp/myModules/myForm',
    'myApp/myModules/myPromptForm',
    'request',
    'mockjax'
], function($, MyForm, MyPromptForm,
    Request, m) {
    //title -- update your title
    $('#title').text('groupComponent.js Example 08');
    $('#title').attr('data-id', 'myForm');
    //Introduction -- update your Introduction
    $('.demo_section').prepend('<h2>Form</h2><i>Fill the form</i>');

    //file list -- update you list
    var list = [{
            name: 'myForm.js',
            src: 'myModules/myForm.js',
            type: 'javascript'
        },
        {
            name: 'myFormOption.js',
            src: 'myModules/myFormOption.js',
            type: 'javascript'
        }, {
            name: 'myPromptForm.js',
            src: 'myModules/myPromptForm.js',
            type: 'javascript'
        },
        {
            name: 'example.js',
            src: 'example.js',
            type: 'javascript'
        },
        {
            name: 'example.html',
            src: 'example.html',
            type: 'htmlmixed'
        },
        {
            name: 'menu.js',
            src: 'menu.js',
            type: 'javascript'
        },
    ];

    //append -- you don't have to change this block
    var html = [];
    html.push('<ul>');
    $.each(list, function(index, value) {
        html.push('<li><a href="javascript:void(0)" data-src="' + value.src + '" data-type="' + value.type + '">' + value.name + '</a></li>');
    });
    html.push('</ul>');
    $('#file_list').append(html.join(''));

    //example code -- apply your own example code
    $.mockjax({
        url: '/myForm/',
        type: 'post',
        dataType: 'json',
        responseTime: 100,
        responseText: {
            status: 'success',
        }
    });

    //mack REST APIs
    console.log('Start example now');
    //add layout
    $('#demo_sample').append('<div class="container"><div class="row"><div id="centerContent"></div></div></div>');

    //randomly put components to sample box
    var myForm = MyForm.create();
    myForm.set({
        container: $('#demo_sample')
    });

    var myPromptForm = MyPromptForm.create();
    myPromptForm.setButton({
        container: $('#demo_sample')
    });
});
