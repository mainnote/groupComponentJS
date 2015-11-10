(function () {
	require(['fastclick'], function (fastclick) {
		fastclick.attach(document.body);
	});
	require(['jquery', 'bootstrap', 'nav'], function ($, bootstrap, Nav) {
		var navCmd = Nav.create('navCmd').command();
		var opt = {
			container : $('#mnbody'),
		};
		navCmd('render', opt);
	});
	require(['jquery', 'bootstrap', 'textarea'], function ($, bootstrap, Textarea) {
		var textareaCmd = Textarea.create('textareaCmd').command();
		var opt = {
			container : $('#mnbody'),
			textarea_name : 'thisTextarea',
			textarea_value : 'hello world',
			textarea_placeholder : 'Type Here',
		};
		textareaCmd('render', opt);
	});
	require(['jquery', 'bootstrap', 'textareaCountGrp'], function ($, bootstrap, TextareaCountGrp) {
		var textareaCountGrpCmd = TextareaCountGrp.create('textareaCountGrpCmd').command();
		var opt = {
			container : $('#mnbody'),
			textareaCountGrp_maxCount : 120,
		};
		textareaCountGrpCmd('render', opt);
	});
	require(['jquery', 'prompt'], function ($, Prompt) {
		var btn = $('<button>Prompt</button>');
		$('#mnbody').append(btn);

		btn.on('click', function (e) {
			var promptCmd = Prompt.create('promptCmd').command();
			var opt = {
				container : $('#mnbody'),
				prompt_title : 'Test Prompt',
			};
			promptCmd('render', opt);

			var promptCmd1 = Prompt.create('promptCmd1').command();
			var opt1 = {
				container : $('#mnbody'),
				prompt_title : 'Test Prompt 1',
			};
			promptCmd1('render', opt1);
		});
	});
    
    define('requestMock', ['jquery', 'group'
        ], function ($, Grp) {
        var RequestMock = Grp.obj.create('RequestMock');
        RequestMock.extend({
            connect : function (opt) {
                if (opt.request_data.value === "test" || opt.request_data.value === "test@local.com") {
                    opt.request_done({data:{}});
                }else{
                    opt.request_done({error: {message: 'this is wrong', code: 101 }});
                }
                opt.request_always();
            },
        });

        return RequestMock;
    });
	require(['jquery', 'promptFormGrp', 'textareaCountGrp', 'button', 'input', 'inputPassword', 'inputEmailGrp', 'inputGrp', 'requestMock'], function ($, PromptFormGrp, TextareaCountGrp, Button, Input, InputPassword, InputEmailGrp, InputGrp, RequestMock) {
		var btn = $('<button>PromptFormGrp</button>');
		$('#mnbody').append(btn);

		btn.on('click', function (e) {
            var requestMock = RequestMock.create('request');  
			var promptFormGrpCmd = PromptFormGrp.create('promptFormGrpCmd').command();
            var thisTextarea = TextareaCountGrp.create();
            var thisTextarea2 = TextareaCountGrp.create();
            
            var inputText = InputGrp.create('inputText');
            inputText.override(requestMock);
            var inputPassword = InputPassword.create('inputPassword');
            var inputEmailGrp = InputEmailGrp.create('inputEmailGrp');
            inputEmailGrp.override(requestMock);
            
            var button_submit = Button.create();
			var opt = {
				container : $('#mnbody'),
				prompt_title : 'Test PromptFormGrp',
				form_elements : [{
						elem : thisTextarea,
						opt : {
							textarea_name : 'thisTextarea',
							textarea_value : 'In prompt Value',
						},
					}, {
						elem : thisTextarea2,
						opt : {
							textarea_name : 'thisTextarea2',
							textarea_value : 'In prompt Value2',
						},
					}, {
						elem : inputText,
						opt : {
							input_id : 'inputtext',
                            input_name: 'inputtext',
                            input_type: 'text',
                            input_placeholder: 'User Name',
                            input_required: true,
                            input_autofocus: true,
                            input_action: '/',
						},
                    }, {
						elem : inputPassword,
						opt : {
							input_id : 'inputpassword',
                            input_name: 'inputpassword',
                            input_type: 'password',
                            input_placeholder: 'Password',
                            input_required: true,
						},
                    }, {
						elem : inputEmailGrp,
						opt : {
							input_id : 'inputemail',
                            input_name: 'inputemail',
                            input_type: 'email',
                            input_placeholder: 'Email Address',
                            input_required: true,
						},
                    }, {
						elem : button_submit,
						opt : {
							button_name : 'Submit',
						},
					},
				],
			};

                      
            promptFormGrpCmd('override', requestMock);
			promptFormGrpCmd('render', opt);
		});
	});
	require(['jquery', 'listItemGrp', 'dataCollectionGrp'], function ($, ListItemGrp, DataCollectionGrp) {
		var listItemGrpCmd = ListItemGrp.create('listItemGrpCmd').command();
		var dataCollectionGrpCmd = DataCollectionGrp.create('dataCollectionGrpCmd').command();
		var opt = {
			container : $('#mnbody'),
			list_data : dataCollectionGrpCmd('add', {
				values : ['yes', 'haha']
			}),
		};
		listItemGrpCmd('render', opt);
	});

})();
