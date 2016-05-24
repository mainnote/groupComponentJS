define(['jquery', 'optObj', 'button', 'input'], function ($, OptObj, Button, Input) {
    var FormOption = OptObj.create('FormOption');
    FormOption.extend({
        get: function (opt) {
            //setup form
            var input_user = Input.create('input_user');
            var input_desc = Input.create('input_desc');

            return {
                form_action: '/',
                form_method: 'POST',
                form_elements: [{
                        elem: input_user,
                        opt: {
                            keyColumnMap: {
                                input_value: 'heading'
                            },
                            input_id: 'inputtext',
                            input_name: 'heading',
                            input_type: 'text',
                            input_placeholder: 'User Name',
                            input_action: '/',
                        },
					},
                    {
                        elem: input_desc,
                        opt: {
                            keyColumnMap: {
                                input_value: 'text'
                            },
                            input_id: 'input_desc',
                            input_name: 'text',
                            input_type: 'text',
                            input_placeholder: 'Description',
                            input_action: '/',
                        },
					}]
            };
        },
        extractForm: function (opt) {
            var data = {};
            $.each(opt.inputData, function (index, obj) {
                if (obj.name == 'heading') data.heading = obj.value;
                if (obj.name == 'text') data.text = obj.value;
            });

            return data;
        },
    });
    return FormOption;
});
