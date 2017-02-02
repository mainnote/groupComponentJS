requirejs.config({
    paths: {
        debug: '../../debug',
        myApp: '../..'
    }
});

require(['jquery', 'input', 'button', 'request', 'debug/debugGroupGrp', 'debug/debugMember', 'notify', 'myApp/example'], function($, Input, Button, Request, DebugGroupGrp, DebugMember, notify, example) {
    function objectDump(o) {
        console.log('== ' + o._id + ' ==');
        console.dir(o);
    }

    var container = $('#input_module');
    var input = Input.create('input')
    input.extend({
        checkValid: function(opt) {
            var input_value = this.inputElem.val();
            if (input_value) {
                var that = this;
                $('#member_map').empty();

                try {
                    require([input_value], function(module) {
                        try {
                            objectDump(module);
                            DebugGroupGrp.create('debugGroupGrp').set({
                                container: $('#member_map'),
                                module: module,
                            });

                            //clear hints
                            that.getResult({
                                invalidHints: false
                            });

                        } catch (e) {
                            console.error(JSON.stringify(e));
                            that.getResult({
                                invalidHints: 'This module cannote be extracted.'
                            });
                        }
                    }, function(err) {
                        //display error to user
                        console.error(JSON.stringify(err));
                        that.getResult({
                            invalidHints: 'Invalid module'
                        });
                    }); //require
                } catch (e) {
                    this.getResult({
                        invalidHints: JSON.stringify(e)
                    });
                }

            } else {
                this.getResult({
                    invalidHints: 'Please input a valid group name'
                });
            }
        }
    });

    //render
    var opt = {
        container: container,
        input_placeholder: 'Type in your group/member'
    };
    input.render(opt);

    //automatically put the current modlue to show the group map
    input.inputElem.val('myApp/myModules/' + $('#title').attr('data-id'));
    input.checkValid();
});
