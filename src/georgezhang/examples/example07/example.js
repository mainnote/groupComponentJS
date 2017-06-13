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
    'myApp/myModules/myModals',
    'mockjax'
], function($, MyModals,
    m) {
    //title -- update your title
    $('#title').text('groupComponent.js Example 07');
    $('#title').attr('data-id', 'myModals');
    //Introduction -- update your Introduction
    $('.demo_section').prepend('<h2>Modal</h2><i>Click button</i>');

    //file list -- update you list
    var list = [{
            name: 'myModals.js',
            src: 'myModules/myModals.js',
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

    //mack REST APIs
    console.log('Start example now');
    //add layout
    $('#demo_sample').append('<div class="container"><div class="row"><div id="centerContent"></div></div></div>');

    //randomly put components to sample box
    var myModals = MyModals.create();
    myModals.set({
        container: $('#demo_sample'),
        button_name: 'Get Level 1'
    });
});
