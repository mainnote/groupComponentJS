define(['jquery', 'input'], function($, Input) {
    return function(prompt_add_item) {
        var formGrp = prompt_add_item.getMember('formGrp');
        var form = formGrp.getMember('form');
        var input_name = Input.create('input_name');
        input_name.extend({
            checkValid: function(opt) {
                var input_value = this.inputElem.val();
                if (input_value.length > 0) {
                    this.getResult({
                        invalidHints: false
                    });
                    return true;
                } else {
                    this.getResult({
                        invalidHints: 'Required'
                    });
                    return false;
                }
            },
        });

        formGrp.join(input_name);
        var form_done = form.done;
        form.extend({
            submit: function(opt) {
                //overridden the submit in form to a URL
                if (!this.submitting && this.checkValid()) {
                    var input_n = this.find({
                        _id: 'input_name'
                    });

                    this.done({
                        values: input_n.inputElem.val()
                    });
                    this.always();
                }
            },
            done: function(opt) {
                form_done.call(this, opt);
                var collection = this.group.upCall('collectionGrp', 'getMember', 'collection');
                collection.addExtra(opt);
            },
        });

        form.setOpt({
            form_action: '/add/',
            form_method: 'POST',
            form_elements: [{
                    elem: input_name,
                    opt: {
                        keyColumnMap: {
                            input_value: 'name'
                        },
                        input_id: 'input_name',
                        input_name: 'name',
                        input_type: 'text',
                        input_label: 'New Item Name',
                        input_required: true,
                    },
                }, //elem
            ],
        });
    };
});
