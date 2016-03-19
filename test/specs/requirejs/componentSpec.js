define(function (require) {
	describe('test cases of georgezhang/public/js/*.js', function () {
		it('group module is available.', function () {
			window.LOG = function (tag, msg, type, result) {
				var skipObj = true;

				if (window.console) {
					if (typeof(tag) != 'string') {
						return console.error('TAG is required for LOG!');
					} else {
						tag = tag + ' ::: ';
					}

					if (msg == undefined) {
						return;
					} else if (type == '$') {
						if (skipObj) {
							return '';
						} else {
							return window.console.log(tag, msg);
						}
					} else if (typeof(msg) != 'string') {
						msg = stringify(msg);
					}

					if (type) {
						if (type == 'info' && window.console.info) {
							return window.console.info(tag, msg);
						} else if (type == 'error' && window.console.error) {
							return window.console.error(tag, msg);
						} else if (typeof(type) != 'string') {
							if (type == undefined) {
								type = '';
							} else {
								type = '( ' + stringify(type) + ' )';
							}
						}
					} else {
						type = '';
					}

					if (result == undefined) {
						result = '';
					} else {
						result = ' RETURN::' + stringify(result);
					}

					return window.console.log(tag, msg + type + result);
				}

				function stringify(obj) {
					var seen = [];
					if (skipObj) {
						return '';
					} else {
						return JSON.stringify(obj, function (key, val) {
							if (val != null && typeof val == "object") {
								if (seen.indexOf(val) >= 0) {
									return;
								}
								seen.push(val);
							}
							return val;
						});
					}
				}
			};
			expect(typeof require('group') === 'object').toBe(true);
			expect(typeof require('group').obj === 'object').toBe(true);
			expect(typeof require('group').group === 'object').toBe(true);
			expect(true).toBe(true);
		});
        
		it('Component textarea test cases', function (done) {
			require(['jquery', 'bootstrap', 'textarea'], function ($, bootstrap, Textarea) {
				var testContainer = $('<div></div>');
				testContainer.appendTo('body');
				var textareaCmd = Textarea.create('textareaCmd').command();
				var opt = {
					container : testContainer,
					textarea_name : 'thisTextarea',
					textarea_value : 'hello world',
					textarea_placeholder : 'Type Here',
				};
				textareaCmd('render', opt);
				var value = testContainer.find('textarea[name="thisTextarea"]').val();
				expect(value === 'hello world').toBe(true);
				done();
			});

		});
		it('Component promptFormGrp test cases', function (done) {

			define('requestMock', ['jquery', 'group'
				], function ($, Grp) {
				var RequestMock = Grp.obj.create('RequestMock');
				RequestMock.extend({
					connect : function (opt) {
						if (opt.request_data.value === "test" || opt.request_data.value === "test@local.com") {
							opt.request_done({
								data : {}

							});
						} else {
							opt.request_done({
								error : {
									message : 'this is wrong',
									code : 101
								}
							});
						}
						opt.request_always();
					},
				});

				return RequestMock;
			});
			require(['jquery', 'promptFormGrp', 'textareaCountGrp', 'button', 'input', 'inputPassword', 'inputEmailGrp', 'inputGrp', 'requestMock'], function ($, PromptFormGrp, TextareaCountGrp, Button, Input, InputPassword, InputEmailGrp, InputGrp, RequestMock) {
				var testContainer = $('<div></div>');
				testContainer.appendTo('body');
				var btn = $('<button>PromptFormGrp</button>');
				testContainer.append(btn);

				btn.on('click', function (e) {
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
						container : testContainer,
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
									input_name : 'inputtext',
									input_type : 'text',
									input_placeholder : 'User Name',
									input_required : true,
									input_autofocus : true,
									input_action : '/',
								},
							}, {
								elem : inputPassword,
								opt : {
									input_id : 'inputpassword',
									input_name : 'inputpassword',
									input_type : 'password',
									input_placeholder : 'Password',
									input_required : true,
								},
							}, {
								elem : inputEmailGrp,
								opt : {
									input_id : 'inputemail',
									input_name : 'inputemail',
									input_type : 'email',
									input_placeholder : 'Email Address',
									input_required : true,
								},
							}, {
								elem : button_submit,
								opt : {
									button_name : 'Submit',
                                    button_type: 'submit',
								},
							},
						],
					};

					var requestMock = RequestMock.create('request');
					promptFormGrpCmd('override', requestMock);
                    promptFormGrpCmd('render', opt);

					var value = $(testContainer.find('textarea')[1]).val();
					expect(value).toBe('In prompt Value2');

					
					//testContainer.find('#inputtext').trigger('keypress').val('abc');
					//console.log(testContainer.find('#inputtext').parents().html());
					//var value = testContainer.find('#inputtext').parents().find('.hints').html();
					//expect(value).toBe('this is wrong');
					 

					//click the submit button
					button_submit.comp.trigger('click');
					var value = $(testContainer.find('textarea')[1]).val();
					expect(value).toBe(undefined);
					done();
				});
				btn.trigger('click');

			});
		});

		it('Component listItemGrp test cases', function (done) {
			require(['jquery', 'listItemGrp', 'collectionGrp'], function ($, ListItemGrp, CollectionGrp) {
				var testContainer = $('<div></div>');
				testContainer.appendTo('body');
				var listItemGrpCmd = ListItemGrp.create('listItemGrpCmd').command();
				var collectionGrpCmd = CollectionGrp.create('collectionGrpCmd').command();
				var opt = {
					container : testContainer,
					list_data : collectionGrpCmd('add', {
						values : ['yes', 'haha']
					}),
				};
				listItemGrpCmd('render', opt);
				var value = $(testContainer.find('li')[0]).text();
				expect(value).toBe('yes');
				done();
			});
		});

		it('Component navbar test cases', function (done) {
			require(['jquery', 'bootstrap', 'navbar', 'navBrand', 'navItem', 'navDropdownItem', 'dropdownItem', 'dropdownDivider'], function ($, bootstrap, Navbar, NavBrand, NavItem, NavDropdownItem, DropdownItem, DropdownDivider) {
				var testContainer = $('<div></div>');
				testContainer.appendTo('body');
				var navBrandCmd = NavBrand.create('navBrandCmd').command();
				navBrandCmd('setOpt', {
					navBrand_url : '/',
					navBrand_html : 'Playground'
				});
				var NotesCmd = NavItem.create('NotesCmd').command();
				NotesCmd('setOpt', {
					navItem_url : '#',
					navItem_html : 'Notes',
				});

				var crtPageCmd = DropdownItem.create('crtPageCmd').command();
				crtPageCmd('setOpt', {
					dropdownItem_url : '/',
					dropdownItem_html : 'Create Page'
				});
				var crtNoteCmd = DropdownItem.create('crtNoteCmd').command();
				crtNoteCmd('setOpt', {
					dropdownItem_url : '/',
					dropdownItem_html : 'Create Note'
				});
				var dividerCmd = DropdownDivider.create('dividerCmd').command();
				var actionCmd = DropdownItem.create('actionCmd').command();
				actionCmd('setOpt', {
					dropdownItem_url : '/',
					dropdownItem_html : 'Another Item'
				});

				var PagesCmd = NavItem.create('PagesCmd').command();
				PagesCmd('setOpt', {
					navItem_html : 'Multiple',
					dropdown_items : [{
							cmd : crtPageCmd
						}, {
							cmd : crtNoteCmd
						}, {
							cmd : dividerCmd
						}, {
							cmd : actionCmd
						},
					],
				});
				var UserCmd = NavItem.create('UserCmd').command();
				UserCmd('setOpt', {
					navItem_url : '#',
					navItem_html : 'User',
					pullright : true,
				});

				var navbarCmd = Navbar.create('navCmd').command();
				var opt = {
					container : testContainer,
					navbar_brand : {
						cmd : navBrandCmd,
					},
					navbar_items : [{
							cmd : NotesCmd,
						}, {
							cmd : PagesCmd,
						},
						//right side
						{
							cmd : UserCmd,
						},
					],
				};
				navbarCmd('render', opt);
				var value = $(testContainer.find('#navbar_id ul li a')[0]).text();
				expect(value).toContain('Notes');
				done();
			});
		});
	});
});
