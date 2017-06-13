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
    'myApp/myModules/myAutocomplete',
    'myApp/myModules/myCheckbox',
    'myApp/myModules/myIconToggle',
    'myApp/myModules/myEditor',
    'myApp/myModules/myUploader',
    'myApp/myModules/myTagInput',
    'mockjax'
], function($, MyAutocomplete, MyCheckbox, MyIconToggle, MyEditor, MyUploader, MyTagInput,
    m) {
    //title -- update your title
    $('#title').text('groupComponent.js Example 06');
    $('#title').attr('data-id', 'myAutocomplete');
    //Introduction -- update your Introduction
    $('.demo_section').prepend('<h2>Autocomplete, Checkbox, Icon Toggle, Editor, Uploader, Tags Input</h2><i>Try them</i>');

    //file list -- update you list
    var list = [{
            name: 'myAutocomplete.js',
            src: 'myModules/myAutocomplete.js',
            type: 'javascript'
        }, {
            name: 'myCheckbox.js',
            src: 'myModules/myCheckbox.js',
            type: 'javascript'
        }, {
            name: 'myIconToggle.js',
            src: 'myModules/myIconToggle.js',
            type: 'javascript'
        }, {
            name: 'myEditor.js',
            src: 'myModules/myEditor.js',
            type: 'javascript'
        }, {
            name: 'myUploader.js',
            src: 'myModules/myUploader.js',
            type: 'javascript'
        }, {
            name: 'myTagInput.js',
            src: 'myModules/myTagInput.js',
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
    var myautocomplete = MyAutocomplete.create();
    myautocomplete.render({
        container: $('#demo_sample')
    });

    var mycheckbox = MyCheckbox.create();
    mycheckbox.render({
        container: $('#demo_sample')
    });

    var myIconToggle = MyIconToggle.create();
    myIconToggle.render({
        container: $('#demo_sample')
    });

    var myEditor = MyEditor.create();
    myEditor.render({
        container: $('#demo_sample')
    });

    var myUploader = MyUploader.create();
    myUploader.render({
        container: $('#demo_sample')
    });

    var myTagInput = MyTagInput.create();
    myTagInput.render({
        container: $('#demo_sample')
    });
});
