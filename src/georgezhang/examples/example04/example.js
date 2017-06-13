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
define(['jquery', 'myApp/myModules/myCollectionListGrp', 'mockjax'], function($, MyCollectionListGrp, m) {
    //title -- update your title
    $('#title').text('groupComponent.js Example 04');
    $('#title').attr('data-id', 'myCollectionListGrp');
    //Introduction -- update your Introduction
    $('.demo_section').prepend('<h2>Remote Asyncrhonize Loading to List with Custom Item</h2><i>Try edit text</i>');

    //file list -- update you list
    var list = [{
            name: 'myCollectionListGrp.js',
            src: 'myModules/myCollectionListGrp.js',
            type: 'javascript'
        },
        {
            name: 'myListItemGrp.js',
            src: 'myModules/myListItemGrp.js',
            type: 'javascript'
        },
        {
            name: 'myAddItemGrp.js',
            src: 'myModules/myListItemGrp.js',
            type: 'javascript'
        },
        {
            name: 'example.js',
            src: 'example.js',
            type: 'javascript'
        },
        {
            name: 'myItem.html',
            src: 'myTemplates/myItem.html',
            type: 'htmlmixed'
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
    //mock delete entity
    $.mockjax({
        url: '/vevo/?videoId=*',
        type: 'delete',
        dataType: 'json',
        responseTime: 100,
        responseText: {
            status: 'success',
        }
    });
    //mock update entity
    $.mockjax({
        url: '/vevo/?videoId=*',
        type: 'put',
        dataType: 'json',
        responseTime: 100,
        responseText: {
            status: 'success',
        }
    });
    //mock add entity
    $.mockjax({
        url: '/vevo/',
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
    $('#demo_sample').append('<div class="container"><div class="add_item"></div><div class="row"><div id="leftSide" class="col col-6"></div><div id="rightSide" class="col col-6"></div></div></div>');

    var myCollectionListGrp = MyCollectionListGrp.create('myCollectionListGrp');
    myCollectionListGrp.set({
        container: $('#demo_sample'),
        url: '/src/georgezhang/examples/media/data/vevo.json',
        entity_url: '/vevo/'
    });
});
