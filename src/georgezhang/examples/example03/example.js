//start entry of this eample
define(['jquery', 'myApp/myModules/myCollectionListGrp'], function($, MyCollectionListGrp) {
    //title -- update your title
    $('#title').text('groupComponent.js Example 03');
    $('#title').attr('data-id', 'myCollectionListGrp');
    //Introduction -- update your Introduction
    $('.demo_section').prepend('<h2>Synchronize Collection and List</h2><i>Click and change the item</i>');

    //file list -- update you list
    var list = [{
            name: 'myCollectionListGrp.js',
            src: 'myModules/myCollectionListGrp.js',
            type: 'javascript'
        },{
                name: 'myListItemGrp.js',
                src: 'myModules/myListItemGrp.js',
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
    //add layout
    $('#demo_sample').append('<div class="container"><div class="row"><div id="leftSide" class="col col-6"></div><div id="rightSide" class="col col-6"></div></div></div>');

    var myCollectionListGrp = MyCollectionListGrp.create('myCollectionListGrp');
    myCollectionListGrp.setup({
        container: $('#demo_sample'),
        values: ['Apple', 'Orange', 'Banana', 'Pineapple', 'Grape'],
    });
});
