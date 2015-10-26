define(['jquery', 'group', 'prompt', 'formGrp'
	], function ($, Grp, Prompt, FormGrp) {
	var PromptFormGrp = Grp.group.create('PromptFormGrp');
    var prompt = Prompt.create('prompt');
    var formGrp = FormGrp.create('formGrp');
    PromptFormGrp.join(prompt, formGrp);
    
    prompt.extend({
        setup: function(opt) {
            var promptComp = Prompt.setup.call(this, opt);
            opt.container = promptComp;
            this.group.call('formGrp', 'render', opt);
            return promptComp;
        },
        
        donePrompt: function(opt) {
            var formValue = this.group.call('formGrp', 'submit', opt);
            Prompt.donePrompt.call(this, opt);
        },
    });
    
	PromptFormGrp.extend({
        render: function(opt) {
            return this.call('prompt', 'render', opt);
        },
	});

	return PromptFormGrp;
});
