define(['jquery', 'optGrp', 'prompt', 'formGrp'
	], function ($, OptGrp, Prompt, FormGrp) {
    var PromptFormGrp = OptGrp.create('PromptFormGrp');

    var prompt = Prompt.create('prompt');
    prompt.extend({
        setup: function (opt) {
            var promptComp = Prompt.setup.call(this, opt);
            opt.container = promptComp;
            this.group.call('formGrp', 'render', opt);
            return promptComp;
        },

        donePrompt: function (opt) {
            var formValue = this.group.call('formGrp', 'submit', opt);
            Prompt.donePrompt.call(this, opt);
        },
    });

    var formGrp = FormGrp.create('formGrp');
    var form = formGrp.getMember('form');
    form.extend({
        done: function (opt) {
            this.group.group.call('prompt', 'donePrompt');
        },
    });
    formGrp.override(form);

    PromptFormGrp.join(prompt, formGrp);
    PromptFormGrp.setCallToMember('prompt');

    return PromptFormGrp;
});
