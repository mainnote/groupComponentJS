//start entry of this eample
define(['jquery', 'myApp/myModules/todolistGrp'], function($, TodolistGrp) {
    //title
    $('#title').text('groupComponent.js Example 01');
    $('#title').attr('data-id', 'todolistGrp');
    //Introduction
    $('.demo_section').prepend('<h2>A simple Todo list!</h2><i>Try non-alphanumeric charactors</i>');

    //file list
    var list = [{
            name: 'todolistGrp.js',
            src: 'myModules/todolistGrp.js',
            type: 'javascript'
        },
        {
            name: 'myList.js',
            src: 'myModules/myList.js',
            type: 'javascript'
        },
        {
            name: 'myList.html',
            src: 'myTemplates/myList.html',
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

    //append
    var html = [];
    html.push('<ul>');
    $.each(list, function(index, value) {
        html.push('<li><a href="javascript:void(0)" data-src="' + value.src + '" data-type="' + value.type + '">' + value.name + '</a></li>');
    });
    html.push('</ul>');
    $('#file_list').append(html.join(''));

    //example code
    console.log('Start example now');
    var todolistGrp = TodolistGrp.create('todolistGrp');
    todolistGrp.set({
        container: $('#demo_sample'),
        button_name: 'Add',
    });
});
