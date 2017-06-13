define(['jquery', 'optGrp', 'prompt', 'formGrp'], function($, OptGrp, Prompt, FormGrp) {
    var PromptFormGrp = OptGrp.create('PromptFormGrp');

    var prompt = Prompt.create('prompt');
    var prompt_setup = Prompt.setup;
    var prompt_afterSubmit = Prompt.afterSubmit;
    prompt.extend({
        setup: function(opt) {
            var promptComp = prompt_setup.call(this, opt);
            opt.container = promptComp;
            this.group.call('formGrp', 'set', opt);
            return promptComp;
        },
        donePrompt: function(opt) {
            return this.group.downCall('form', 'submit', opt);
        },
        afterSubmit: function(opt) {
            prompt_afterSubmit.call(this, opt);
        }
    });

    var formGrp = FormGrp.create('formGrp');
    var form = formGrp.getMember('form');
    form.extend({
        done: function(opt) {
            this.group.upCall('prompt', 'afterSubmit', opt); //fromGrp > promptFormGrp
        },
    });

    PromptFormGrp.extend({
        set: function(opt) {
            this.call('prompt', 'render', opt);
        },
    });
    PromptFormGrp.join(prompt, formGrp);

    return PromptFormGrp;
});
