define(['jquery', 'input', 'textarea'], function($, Input, Textarea) {
    return function(prompt_add_item) {
        var formGrp = prompt_add_item.getMember('formGrp');
        var form = formGrp.getMember('form');
        var input_title = Input.create('input_title');
        var textarea_desc = Textarea.create('textarea_desc');

        input_title.extend({
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

        formGrp.join(input_title);
        var form_done = form.done;
        form.extend({
            submit: function(opt) {
                //overridden the submit in form to a URL
                if (!this.submitting && this.checkValid()) {
                    var input_n = this.find({
                        _id: 'input_title'
                    });
                    var textarea_d = this.find({
                        _id: 'textarea_desc'
                    });

                    //this is how to pass controls values and build an item
                    this.done({
                        values: {
                            id: {
                                videoId: 'JZjAg6fK-BQ'
                            },
                            snippet: {
                                title: input_n.inputElem.val(),
                                description: textarea_d.comp.val(),
                                thumbnails: {
                                    medium: {
                                        url: 'https://i.ytimg.com/vi/JZjAg6fK-BQ/mqdefault.jpg',
                                        'width': 320,
                                        'height': 180
                                    },
                                }
                            }
                        }
                    });
                    this.always();
                }
            },
            done: function(opt) {
                form_done.call(this, opt);
                var collection = this.group.upCall('collectionRequestGrp', 'getMember', 'collection');
                collection.addExtra(opt);
            },
        });

        form.setOpt({
            form_action: '/add/',
            form_method: 'POST',
            form_elements: [{
                    elem: input_title,
                    opt: {
                        keyColumnMap: {
                            input_value: 'snippet.title'
                        },
                        input_id: 'input_title',
                        input_name: 'title',
                        input_type: 'text',
                        input_label: 'Title',
                        input_required: true,
                    },
                }, //elem
                {
                    elem: textarea_desc,
                    opt: {
                        keyColumnMap: {
                            textarea_value: 'snippet.description'
                        },
                        textarea_placeholder: 'Description',
                        textarea_autoResize: true,
                    },
                }, //elem
            ],
        });
    };
});
