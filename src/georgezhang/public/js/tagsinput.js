define(['jquery', 'component', 'tpl!templates/tagsinput', 'bootstrap-tagsinput'
	], function ($, Component, tpl) {
    var Tagsinput = Component.create('Tagsinput');
    Tagsinput.extend({
        tpl: tpl,
        defaultOpt: {
            tagsinput_id: 'tagsinput_id',
            tagsinput_label_class: 'tagsinput_label_class',
            tagsinput_name: 'tagsinput_name',
            tagsinput_placeholder: 'tagsinput_placeholder',
            tagsinput_values: [],
            tagsinput_options: null,
        },
        init: function(){
            Component.init.call(this);
            this.tagsinputComp = null;
        },
        setup: function (opt) {
            this.tagsinputComp = this.comp.find('select');
            this.tagsinputComp.tagsinput(opt.tagsinput_options);
            for (var i = 0; i < opt.tagsinput_values.length; i++) {
                this.tagsinputComp.tagsinput('add', opt.tagsinput_values[i]);
            }
            return this.comp;
        },
        val: function(opt) {
            return this.tagsinputComp.val();
        },
    });

    return Tagsinput;
});
