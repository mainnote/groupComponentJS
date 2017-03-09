//start entry of this eample
define(['jquery', 'myApp/myModules/myInputItemGrp'], function($, MyInputItemGrp) {
    //title -- update your title
    $('#title').text('groupComponent.js Example 02');
    $('#title').attr('data-id', 'myInputItemGrp');
    //Introduction -- update your Introduction
    $('.demo_section').prepend('<h2>Synchronize Entity and Item</h2><i></i>');

    //file list -- update you list
    var list = [{
            name: 'myInputItemGrp.js',
            src: 'myModules/myInputItemGrp.js',
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
    console.log('Start example now');
    var myInputItemGrp = MyInputItemGrp.create('myInputItemGrp');
    myInputItemGrp.set({
        container: $('#demo_sample'),
        input_placeholder: 'Type something here!'
    });
});
