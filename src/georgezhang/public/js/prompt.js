define(['jquery', 'component', 'tpl!templates/prompt', 'scroll'], function($, Component, tpl, Scroll) {
    var Prompt = Component.create('Prompt');
    Prompt.extend({
        tpl: tpl,
        defaultOpt: {
            prompt_title: 'Prompt',
            defaultLayerCount: 10000
        },
        setup: function(opt) {
            Scroll.disableScroll();
            var that = this;
            if (!window.layerCount) window.layerCount = this.opt.defaultLayerCount;
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
        },
        afterRemoved: function(opt) {
            window.layerCount--;
            if (window.layerCount == this.opt.defaultLayerCount)
                Scroll.enableScroll();
        },

    });

    return Prompt;
});
