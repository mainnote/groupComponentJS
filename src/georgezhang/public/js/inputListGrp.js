define(['jquery', 'optGrp', 'inputList', 'promptFormGrp', 'listItemGrp', 'collectionRequestGrp', 'tpl!templates/item_inputList', 'button', 'formOption'
	], function ($, OptGrp, InputList, PromptFormGrp, ListItemGrp, CollectionRequestGrp, tpl, Button, FormOption) {
    var inputList = InputList.create('inputList');
    var promptFormGrp_Add = PromptFormGrp.create('promptFormGrp_Add');
    var listItemGrp = ListItemGrp.create('listItemGrp');
    var InputListGrp = OptGrp.create('InputListGrp');
    var collectionRequestGrp = CollectionRequestGrp.create('collectionRequestGrp');
    var formOption = FormOption.create('formOption');

	InputListGrp.extend({
		render: function(opt) {
			this.call('inputList', 'render', opt);
		},
	});

    InputListGrp.join(inputList, promptFormGrp_Add, listItemGrp, collectionRequestGrp, formOption);

    //form customization for add
    var form_Add = promptFormGrp_Add.getMember('form');
    form_Add.extend({
        beforeRender: function (opt) {
            var opt_ = {
                form_btn: 'Add',
                optionKey: null
            };

            this.setOpt(this.group.upCall('formOption', 'get', opt_)); //fromGrp > promptFormGrp_Add > inputListGrp
        },
        submit: function (opt) {
            if (!this.submitting && this.checkValid()) {
                this.submitting = true;
                var that = this;
                this.comp.find('.error').each(function (index) {
                    $(this).remove();
                });

                var inputData = this.serializeArray();

                var opt_ = $.extend({}, opt, {
                    inputData: inputData,
                    formOption: this.opt.formOption,
                });
                this.group.upCall('inputList', 'addItem', opt_); //fromGrp > promptFormGrp_Add > inputListGrp
                this.done(opt_);
            }
        }
    });

    //form customization for edit
    var promptFormGrp_Edit = PromptFormGrp.create('promptFormGrp_Edit');
    var form_Edit = promptFormGrp_Edit.getMember('form');
    form_Edit.extend({
        beforeRender: function (opt) {
            var opt_ = {
                form_btn: 'Edit',
                optionKey: opt.doc.optionKey || null
            };
            this.setOpt(this.group.upCall('formOption', 'get', opt_)); //formGrp > promptFormGrp_Edit > itemGrp
        },
        submit: function (opt) {
            if (!this.submitting) {
                this.submitting = true;
                var that = this;
                this.comp.find('.error').each(function (index) {
                    $(this).remove();
                });

                var inputData = this.serializeArray();

                //form_Edit will call its form Grp > promptFormGrp_Edit > itemGrp - item from the same group, then item will update its value
                //how item will update it value
                var opt_ = {
                    doc: this.group.upCall('formOption', 'extractForm', {
                        inputData: inputData
                    })
                };
                this.group.upCall('item', 'update', opt_); //formGrp > promptFormGrp_Edit > itemGrp
                this.group.upCall('inputList', 'updateInputValue'); //formGrp > promptFormGrp_Edit > itemGrp > listItemGrp > inputListGrp
                this.done(opt_);
            }
        }
    });

    //collectionRequestGrp customization
    var collection = InputListGrp.getMember('collection');
    collection.extend({
        defaultOpt: $.extend({}, collection.defaultOpt, {
            remote: false
        }),
    });


    //item customization
    var itemGrp = InputListGrp.getMember('itemGrp');

    var button_edit = Button.create('button_edit');
    button_edit.extend({
        defaultOpt: $.extend({}, Button.defaultOpt, {
            button_name: '<i class="fa fa-pencil-square-o"></i>&nbsp;Edit',
            button_class: 'btn-sm btn-primary edit',
            button_title: 'Edit'
        }),
        setup: function (opt) {
            var that = this;
            this.comp.on('click', function (e) {
                that.group.call('item', 'fetchAsync')
                    .then(function (data) {
                        var opt_prompt = {
                            container: $('#mnbody'),
                            doc: data
                        };
                        var prompt = that.group.getMember('promptFormGrp_Edit').create(); //itemGrp
                        prompt.render(opt_prompt);
                    });
            });
        },
    });

    var button_delete = Button.create('button_delete');
    button_delete.extend({
        defaultOpt: $.extend({}, Button.defaultOpt, {
            button_name: '<i class="fa fa-trash-o"></i>',
            button_class: 'btn-sm btn-danger delete',
            button_title: 'Delete'
        }),
        setup: function (opt) {
            var that = this;
            this.comp.on('click', function (e) {
                that.group.call('item', 'removeAsync')
                    .then(function () {
                        that.group.upCall('inputList', 'updateInputValue'); //itemGrp > listItemGrp > inputListGrp
                    });
            });
        },
    });

    itemGrp.join(button_edit, button_delete, promptFormGrp_Edit);

    var item = InputListGrp.getMember('item');
    item.extend({
        tpl: tpl,
        setAccessories: function (opt) {
            var $accessories = this.comp.find('.accessories');
            var opt_ = {
                container: $accessories
            };
            this.group.call('button_edit', 'render', opt_);
            this.group.call('button_delete', 'render', opt_);
        },
        setup: function (opt) {
            var that = this;
            //set accessories
            this.setAccessories(opt);
            return this.comp;
        },
        updateUI: function (opt) {
            if (opt && opt.doc) {
                var newHeading = opt.doc.heading;
                var newText = opt.doc.text;


                var oldHeading = this.comp.find('h4').html();
                if (newHeading && newHeading !== oldHeading) {
                    this.comp.find('h4').html(newHeading);
                }

                var oldText = this.comp.find('p').html();
                if (newText && newText !== oldText) {
                    this.comp.find('p').html(newText);
                }
            }
        }
    });

    //inputList customization
    inputList.extend({
        setup: function (opt) {
            var that = this;
            //setup button
            InputList.setup.call(this, opt);
            var btn = this.comp.find('button.additem');
            btn.on('click', function (e) {
                var opt_ = $.extend({}, opt, {
                    container: $('#mnbody'),
                });
                var prompt_form = (that.group.call('promptFormGrp_Add', 'create'));
                prompt_form.render(opt_);
            });

            //setup list items
            var list_entities = this.group.call('collectionRequestGrp', 'add', {
                values: opt.list_entities || this.getInputValue(),
            });
            var opt_ = {
                container: this.comp.find('.list_items'),
                list_entities: list_entities,
            };
            this.group.call('listItemGrp', 'render', opt_);
            this.updateInputValue();
            //return
            return this.comp;
        },
        getInputValue: function (opt) {
            var value = this.comp.find('input[type="hidden"]').val();
            try {
                return JSON.parse(decodeURIComponent(value));
            } catch (e) {
                return null;
            }
        },
        addItem: function (opt) {
            //rendering list next time
            var opt_next = {
                list_entities: this.group.call('collectionRequestGrp', 'addExtra', {
                    values: this.group.call('formOption', 'extractForm', opt)
                }),
            };
            this.group.call('listItemGrp', 'setup', opt_next);
            this.updateInputValue();
        },
        updateInputValue: function (opt) {
            var values = this.group.call('collectionRequestGrp', 'getValues');
            this.comp.find('input[type="hidden"]').val(encodeURIComponent(JSON.stringify(values)));
        }
    });

    return InputListGrp;
});
