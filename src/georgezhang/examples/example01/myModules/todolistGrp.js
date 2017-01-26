//in this example, we define a group
define(['jquery', 'optGrp', 'input', 'button', './myList'],
    function($, OptGrp, Input, Button, MyList) {
        //prepare components
        //prepare input
        var input_item = Input.create('input_item');
        input_item.extend({
            setup: function(opt) {
                var that = this;
                Input.setup.call(this, opt);
                this.setFocus();

                this.inputElem.keypress(function(e) {
                    if (e.which == 13) {
                        that.group.call('button_add', 'trigger');
                        return false;
                    }
                });

                return this.comp;
            },
            setFocus: function(opt) {
                this.inputElem.focus();
            },
            val: function(opt) {
                if (opt) {
                    this.inputElem.val(opt.value);
                    this.setFocus();
                } else {
                    return this.inputElem.val();
                }
            },
            checkValid: function(opt) {
                var input_value = this.val();
                if (this.validator.isAlphanumeric(input_value) || !input_value) {
                    this.getResult({
                        invalidHints: false
                    });
                    return true;
                } else {
                    this.getResult({
                        invalidHints: 'You input must be alphanumeric.'
                    });
                    return false;

                }
            },
        });

        //prepare button
        var button_add = Button.create('button_add');
        button_add.extend({
            setup: function(opt) {
                var that = this;
                Button.setup.call(this, opt);
                this.comp.on('click', function(evt) {
                    if (that.group.call('input_item', 'checkValid')) {
                        var input_value = that.group.call('input_item', 'val');
                        //process the new value
                        console.log(input_value)
                        that.group.call('myList', 'addItem', {
                            item_value: input_value
                        });

                        //clear the value
                        that.group.call('input_item', 'val', {
                            value: ''
                        });
                    }
                });

                return this.comp;
            },
            trigger: function(opt) {
                this.comp.trigger('click');
            }
        });

        //prepare my list
        var myList = MyList.create('myList');

        //create an instance of a group
        var TodolistGrp = OptGrp.create('TodolistGrp');
        TodolistGrp.extend({
            setup: function(opt) {
                this.call('input_item', 'render', opt);
                this.call('button_add', 'render', opt);
                this.call('myList', 'render', opt);
            },
        });


        TodolistGrp.join(input_item, button_add, myList);

        return TodolistGrp;
    });
