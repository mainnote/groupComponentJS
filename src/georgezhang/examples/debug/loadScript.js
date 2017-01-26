require(['jquery', 'myApp/example'], function($) {
    var myCode = CodeMirror(document.getElementById("sample_code"), {
        lineNumbers: "true",
    });
    var myList = [];

    function load(fileElem){
        $.ajax(fileElem.attr('data-src'), {
            dataType: 'text',
            success: function(data) {
                myCode.setOption('mode', fileElem.attr('data-type'))
                myCode.setValue(data);
            }
        });
    }

    $('#file_list li>a').each(function(ind){
        myList.push($(this));
        $(this).on('click', function(evt){
            load($(this));
        });
    });

    //initial
    load(myList[0]);

});
