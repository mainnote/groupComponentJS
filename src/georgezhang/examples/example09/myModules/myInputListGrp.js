define(['jquery', 'inputListGrp', 'button', 'myApp/myModules/myInputListGrp_promptFormGrp', 'myApp/myModules/myInputListGrp_listItemGrp'],
    function($, InputListGrp, Button, MyInputListGrp_promptFormGrp, MyInputListGrp_listItemGrp) {
        var myInputListGrp = InputListGrp.create('myInputListGrp');
        var myInputListGrp_promptFormGrp_add = MyInputListGrp_promptFormGrp.create('myInputListGrp_promptFormGrp_add');

        var button_new = Button.create('button_new');
        myInputListGrp.join(button_new, myInputListGrp_promptFormGrp_add);

        //add new item
        button_new.extend({
            setup: function(opt) {
                var that = this;
                this.comp.on('click', function(e) {
                    e.preventDefault();
                    var prompt_new_item = that.group.call('myInputListGrp_promptFormGrp_add', 'create', 'prompt_new_item');
                    prompt_new_item.set({
                        container: $('body'),
                        prompt_title: 'New Item Information',
                        action: 'add'
                    });
                });
            }
        });

        //customize listItemGrp
        MyInputListGrp_listItemGrp(myInputListGrp);

        var myInputListGrp_set = myInputListGrp.set;
        myInputListGrp.extend({
            //in page form, this group will be called. So in opt, there is a container from the form.
            set: function(opt) {
                this.call('button_new', 'render', $.extend({
                    container: opt.container
                }, opt.button_new));
                myInputListGrp_set.call(this, $.extend({
                    container: opt.container
                }, opt.inputListGrp));
            }
        });

        return myInputListGrp;
    });
