define(['jquery', 'component', 'tpl!templates/textarea', 'autosize'
	], function ($, Component, tpl, autosize) {
	var Textarea = Component.create('Textarea');
	Textarea.extend({
        tpl: tpl,
        defaultOpt: {
            textarea_name: 'defaultTextareaName',
            textarea_value: '',
            textarea_placeholder: '',
        },
        setup: function(opt) {
            autosize(this.comp);
            return this.comp;
        },
	});
    
    return Textarea;
});
