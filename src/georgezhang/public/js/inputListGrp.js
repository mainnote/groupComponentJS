define(['jquery', 'optGrp', 'inputList', 'promptFormGrp', 'listItemGrp', 'collectionGrp'
	], function ($, OptGrp, InputList, PromptFormGrp, ListItemGrp, CollectionGrp) {
    var inputList = InputList.create('inputList');
    var promptFormGrp = PromptFormGrp.create('promptFormGrp');
    var listItemGrp = ListItemGrp.create('listItemGrp');
    var InputListGrp = OptGrp.create('InputListGrp');
    var collectionGrp = CollectionGrp.create('collectionGrp');
    console.log('CollectionGrp', CollectionGrp.values);
    console.log('collectionGrp', collectionGrp.values);
    InputListGrp.join(inputList, promptFormGrp, listItemGrp, collectionGrp);
    InputListGrp.setCallToMember('inputList');

    var form = promptFormGrp.getMember('form');
    form.extend({
        submit: function (opt) {
            if (!this.submitting) {
                this.submitting = true;
                var that = this;
                this.comp.find('.error').each(function (index) {
                    $(this).remove();
                });

                var inputData = this.serializeArray();

                var opt_ = $.extend({}, opt, {
                    inputData: inputData
                });
                this.group.group.group.call('inputList', 'addItem', opt_); //fromGrp > promptFormGrp > inputListGrp
                this.done(opt_);
            }
        }
    });

    inputList.extend({
        setup: function (opt) {
            var that = this;
            //setup button
            InputList.setup.call(this, opt);
            var btn = this.comp.find('button.additem');
            btn.on('click', function (e) {
                var opt_ = $.extend({}, opt, {
                    container: opt.inputList_listItem_container || $('#mnbody'),
                });
                that.group.call('promptFormGrp', 'render', opt_);
            });

            //setup list items
            console.log('this.group', this.group.name)
            console.log('collectionGrp', this.group.call('collectionGrp', 'values'));
            
            var list_data = this.group.call('collectionGrp', 'add', {
                    values: opt.list_data,
                });
            var opt_ = {
                container: this.comp.find('.list_items'),
                list_data: list_data,
            };
            this.group.call('listItemGrp', 'render', opt_);

            //return
            return this.comp;
        },
        extractItem: function (opt) {

        },
        addItem: function (opt) {
            //rendering list next time
            var opt_next = {
                list_data: this.group.call('collectionGrp', 'addExtra', {
                    values: this.extractItem(opt)
                }),
            };
            this.group.call('listItemGrp', 'setup', opt_next);
        },
    });

    return InputListGrp;
});
