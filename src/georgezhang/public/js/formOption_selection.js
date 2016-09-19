define(['jquery', 'optObj', 'button', 'input'], function ($, OptObj, Button, Input) {
    var FormOption = OptObj.create('FormOption');
    FormOption.extend({
        init: function () {
            OptObj.init.call(this);
            this.optionKey = 1;
        },
        setKey: function(opt) {
            this.optionKey = opt.optionKey;
        },
        get: function (opt) {
            var optionKey = opt.optionKey || this.optionKey;
            if (optionKey == '1') {
                //setup form
                var input_optionKey = Input.create('input_optionKey');
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
					},
                        {
                            elem: input_optionKey,
                            opt: {
                                keyColumnMap: {
                                    input_value: 'optionKey'
                                },
                                input_id: 'input_optionKey',
                                input_name: 'optionKey',
                                input_type: 'hidden',
                                input_value: '1'
                            },
					}]
                };
            } else if (optionKey == '2') {
                //setup form
                var input_optionKey = Input.create('input_optionKey');
                var input_book = Input.create('input_book');
                var input_author = Input.create('input_author');

                return {
                    form_action: '/',
                    form_method: 'POST',
                    form_elements: [{
                            elem: input_book,
                            opt: {
                                keyColumnMap: {
                                    input_value: 'heading'
                                },
                                input_id: 'inputtext',
                                input_name: 'heading',
                                input_type: 'text',
                                input_placeholder: 'Book Name',
                                input_action: '/',
                            },
					},
                        {
                            elem: input_author,
                            opt: {
                                keyColumnMap: {
                                    input_value: 'text'
                                },
                                input_id: 'input_author',
                                input_name: 'text',
                                input_type: 'text',
                                input_placeholder: 'Author',
                                input_action: '/',
                            },
					},
                        {
                            elem: input_optionKey,
                            opt: {
                                keyColumnMap: {
                                    input_value: 'optionKey'
                                },
                                input_id: 'input_optionKey',
                                input_name: 'optionKey',
                                input_type: 'hidden',
                                input_value: '2'
                            },
					}]
                };
            }
        },
        extractForm: function (opt) {
            var data = {};
            $.each(opt.inputData, function (index, obj) {
                if (obj.name == 'optionKey') data.optionKey = obj.value;
                if (obj.name == 'heading') data.heading = obj.value;
                if (obj.name == 'text') data.text = obj.value;
            });

            return data;
        },
    });
    return FormOption;
});
