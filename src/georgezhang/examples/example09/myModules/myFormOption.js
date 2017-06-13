define(['jquery', 'formOption', 'button', 'myApp/myModules/myInputListGrp'], function($, FormOption, Button, MyInputListGrp) {
    var formOption = FormOption.create('formOption');
    var myInputListGrp = MyInputListGrp.create('myInputListGrp');

    var button_submit = Button.create('button_submit');
    formOption.extend({
        get: function(opt) {
            return {
                form_action: '/myForm/',
                form_method: 'POST',
                form_elements: [{
                    elem: myInputListGrp,
                    opt: {
                        button_new: {
                            button_name: '<i class="fa fa-plus-circle" aria-hidden="true"></i> Add more items',
                            button_class: 'btn-sm btn-success',
                        },
                        inputListGrp: {
                            list_entities: [{
                                heading: 'item 1',
                                text: 'this is a long text'
                            }],
                        }
                    },
                }, {
                    elem: button_submit,
                    opt: {
                        button_name: 'Submit',
                        button_type: 'submit',
                        button_class: 'btn-sm btn-primary'
                    },
                }, ],
            };
        },
    });

    return formOption;
});
