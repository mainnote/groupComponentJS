define(['jquery', 'formOption', 'input', 'textareaCountGrp', 'button', 'checkbox'], function($, FormOption, Input, TextareaCountGrp, Button, Checkbox) {
    var formOption = FormOption.create('formOption');
    var button_submit = Button.create('button_submit');
    var input_text = Input.create('input_text');
    input_text.extend({
        checkValid: function(opt) {
            var val = this.inputElem.val();
            if (val.length <= 2) {
                this.getResult({
                    invalidHints: 'Input text must be longer than 2 charactors.'
                });
                return false;
            } else {
                this.getResult({
                    invalidHints: false
                });
                return true;
            }

        }
    });
    var textareaCountGrp = TextareaCountGrp.create('textareaCountGrp');
    var checkbox = Checkbox.create('checkbox');

    formOption.extend({
        get: function(opt) {
            return {
                form_action: '/myForm/',
                form_method: 'POST',
                form_elements: [{
                    elem: input_text,
                    opt: {
                        input_id: 'inputtext',
                        input_name: 'myForm_input',
                        input_type: 'text',
                        input_placeholder: 'Title',
                        input_required: true,
                        input_autofocus: true,
                        input_action: '/',
                    },
                }, {
                    elem: textareaCountGrp,
                    opt: {
                        textarea_name: 'myForm_textarea',
                        textarea_placeholder: 'Description',
                        textareaCountGrp_maxCount: 120,
                    },
                },{
                    elem: checkbox,
                    opt: {
                        checkbox_name: 'myForm_checkbox',
                        checkbox_placeholder: 'Like it? '
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
