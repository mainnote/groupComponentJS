define(['jquery', 'component', 'tpl!templates/tagsinput.html', 'bootstrap-tagsinput'
	], function ($, Component, tpl) {
    var Tagsinput = Component.create('Tagsinput');
    Tagsinput.extend({
        defaultOpt: {
            tagsinput_id: 'tagsinput_id',
            tagsinput_label_class: 'tagsinput_label_class',
            tagsinput_name: 'tagsinput_name',
            tagsinput_placeholder: 'tagsinput_placeholder',
            tagsinput_values: [],
            tagsinput_options: null
        },
        tpl: tpl,
        setup: function (opt) {
            var tagsinputComp = this.comp.find('select');
            tagsinputComp.tagsinput(opt.tagsinput_options);
            for (var i = 0; i < opt.tagsinput_values.length; i++) {
                tagsinputComp.tagsinput('add', opt.tagsinput_values[i]);
            }
        },
    });

    return Tagsinput;
});
