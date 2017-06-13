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
    'mockjax'
], function($, myForm,
    m) {
    //title -- update your title
    $('#title').text('groupComponent.js Example 09');
    $('#title').attr('data-id', 'myInputListGrp');
    //Introduction -- update your Introduction
    $('.demo_section').prepend('<h2>Input List</h2><i>Sometimes inside a form, you want user to add a list of items. We call it inputList.</i>');

    //file list -- update you list
    var list = [{
            name: 'myInputListGrp.js',
            src: 'myModules/myInputListGrp.js',
            type: 'javascript'
        },
        {
            name: 'myForm.js',
            src: 'myModules/myForm.js',
            type: 'javascript'
        },
        {
            name: 'myFormOption.js',
            src: 'myModules/myFormOption.js',
            type: 'javascript'
        },
        {
            name: 'myInputListGrp_formOption.js',
            src: 'myModules/myInputListGrp_formOption.js',
            type: 'javascript'
        },
        {
            name: 'myInputListGrp_listItemGrp.js',
            src: 'myModules/myInputListGrp_listItemGrp.js',
            type: 'javascript'
        },
        {
            name: 'myInputListGrp_promptFormGrp.js',
            src: 'myModules/myInputListGrp_promptFormGrp.js',
            type: 'javascript'
        },
        {
            name: 'myInputListGrp_item.html',
            src: 'myTemplates/myInputListGrp_item.html',
            type: 'htmlmixed'
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

    var myForm_1 = myForm.create('myForm_1');
    myForm_1.set({
        container: $('#demo_sample'),
        tag: 'InputList Demo',
    });

});
