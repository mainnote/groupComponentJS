define(['jquery', 'component', 'tpl!templates/prompt'], function($, Component, tpl) {
    var Prompt = Component.create('Prompt');
    Prompt.extend({
        tpl: tpl,
        defaultOpt: {
            prompt_title: 'Prompt'
        },
        setup: function(opt) {
            var that = this;
            if (!window.layerCount) window.layerCount = 10000;
            this.comp.css('z-index', window.layerCount++);
            var btn_done = this.comp.find('.promptHead .done');
            var btn_back = this.comp.find('.promptHead .back');
            btn_done.on('click', function(e) {
                that.donePrompt();
            });

            btn_back.on('click', function(e) {
                that.remove();
            });
            return this.comp;
        },
        donePrompt: function(opt) {
            this.afterSubmit(opt);
        },
        afterSubmit: function(opt) {
            this.remove();
        }

    });

    return Prompt;
});
