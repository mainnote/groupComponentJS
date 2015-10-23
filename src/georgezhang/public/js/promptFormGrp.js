define(['jquery', 'group', 'prompt', 'form'
	], function ($, Grp, Prompt, Form) {
	var PromptFormGrp = Grp.group.create('PromptFormGrp');
    var prompt = Prompt.create('prompt');
    var form = Form.create('form');
    PromptFormGrp.join(prompt, form);
    
    prompt.extend({
        setup: function(opt) {
            var promptComp = Prompt.setup.call(this, opt);
            opt.container = promptComp;
            this.group.call('form', 'render', opt);
            return promptComp;
        },
        
        donePrompt: function(opt) {
            var formValue = this.group.call('form', 'serialize', opt);
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
