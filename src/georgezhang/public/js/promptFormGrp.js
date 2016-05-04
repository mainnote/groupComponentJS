define(['jquery', 'optGrp', 'prompt', 'formGrp', 'scroll'
	], function ($, OptGrp, Prompt, FormGrp, Scroll) {
    var PromptFormGrp = OptGrp.create('PromptFormGrp');

    var prompt = Prompt.create('prompt');
    prompt.extend({
        setup: function (opt) {
            Scroll.disableScroll();
            var promptComp = Prompt.setup.call(this, opt);
            opt.container = promptComp;
            this.group.call('formGrp', 'render', opt);
            return promptComp;
        },

        donePrompt: function (opt) {
            var formValue = this.group.call('formGrp', 'submit', opt);
        },
        afterRemoved: function(opt) {
            Scroll.enableScroll();
        },
        afterSubmit: function(opt) {
            Prompt.afterSubmit.call(this, opt);
        }
    });

    var formGrp = FormGrp.create('formGrp');
    var form = formGrp.getMember('form');
    form.extend({
        done: function (opt) {
            this.group.group.call('prompt', 'afterSubmit', opt); //fromGrp > promptFormGrp
        },
    });

    PromptFormGrp.join(prompt, formGrp);
    PromptFormGrp.setCallToMember('prompt');

    return PromptFormGrp;
});
