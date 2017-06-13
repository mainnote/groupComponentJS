define(['jquery', 'button', 'tpl!myApp/myTemplates/myInputListGrp_item', 'myApp/myModules/myInputListGrp_promptFormGrp'],
function($, Button, tpl, MyInputListGrp_promptFormGrp) {
    return function(inputListGrp) {
        var itemGrp = inputListGrp.getMember('itemGrp');
        var myInputListGrp_promptFormGrp_edit = MyInputListGrp_promptFormGrp.create('myInputListGrp_promptFormGrp_edit');

        var button_edit = Button.create('button_edit');
        button_edit.extend({
            defaultOpt: $.extend({}, Button.defaultOpt, {
                button_name: '<i class="fa fa-pencil-square-o"></i>&nbsp;Edit',
                button_class: 'btn-sm btn-warning edit',
                button_title: 'Edit'
            }),
            setup: function(opt) {
                var that = this;
                this.comp.on('click', function(e) {
                    e.preventDefault();
                    var btn = $(this);
                    //disable the button after clicked
                    btn.attr('disabled', true);

                    //pull out the entity from item
                    var entity = that.group.call('item', 'getEntityValue');

                    //* - if you need more value of entity remotely, you need collection.remoteGet()
                    var promptFormGrp = that.group.getMember('myInputListGrp_promptFormGrp_edit').create();
                    var prompt = promptFormGrp.getMember('prompt');
                    var prompt_afterRemoved = prompt.afterRemoved;
                    prompt.extend({
                        afterRemoved: function(opt) {
                            btn.removeAttr('disabled');
                            return prompt_afterRemoved.call(this);
                        }
                    });

                    promptFormGrp.set({
                        container: $('body'), //body is OK since the promptTop is position : fixed
                        prompt_title: 'Edit Item Information',
                        action: 'edit',
                        doc: entity
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
            setup: function(opt) {
                var that = this;
                this.comp.on('click', function(e) {
                    that.group.call('item', 'deleteEntityValue');
                    that.group.upCall('inputList', 'updateInputValue');
                });
            },
        });

        itemGrp.join(button_edit, button_delete, myInputListGrp_promptFormGrp_edit);

        var item = inputListGrp.getMember('item');
        item.extend({
            tpl: tpl,
            setAccessories: function(opt) {
                var $accessories = this.comp.find('.accessories');
                var opt_ = {
                    container: $accessories
                };
                this.group.call('button_edit', 'render', opt_);
                this.group.call('button_delete', 'render', opt_);
            },
            setup: function(opt) {
                var that = this;
                //set accessories
                this.setAccessories(opt);
                return this.comp;
            },
            updateUI: function(opt) {
                if (opt && opt.doc) {
                    var newHeading = opt.doc.item_value.heading;
                    var newText = opt.doc.item_value.text;


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
    };
});
