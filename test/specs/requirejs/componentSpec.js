define(function (require) {
	describe('test cases of georgezhang/public/js/*.js', function () {
		it('group module is available.', function () {
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
			require(['jquery', 'promptFormGrp'], function ($, PromptFormGrp) {
				var testContainer = $('<div></div>');
                testContainer.appendTo('body');
				var btn = $('<button>PromptFormGrp</button>');
				testContainer.append(btn);

				btn.on('click', function (e) {
					var promptFormGrpCmd = PromptFormGrp.create('promptFormGrpCmd').command();
					var opt = {
						container : testContainer,
						prompt_title : 'Test PromptFormGrp',
						form_elements : [{
								elem : 'textareaCountGrp',
								name : 'textareaCountGrp',
								opt : {
									textarea_name : 'thisTextarea',
									textarea_value : 'In prompt Value',
								}
							}, {
								elem : 'textareaCountGrp',
								name : 'textareaCountGrp',
								opt : {
									textarea_name : 'thisTextarea2',
									textarea_value : 'In prompt Value2',
								}
							},
						],
					};
					promptFormGrpCmd('render', opt);
					var value = $(testContainer.find('textarea')[1]).val();
					expect(value).toBe('In prompt Value2');
					done();
				});
				btn.trigger('click');
                
			});
		});

		it('Component listItemGrp test cases', function (done) {
			require(['jquery', 'listItemGrp', 'dataCollectionGrp'], function ($, ListItemGrp, DataCollectionGrp) {
				var testContainer = $('<div></div>');
                testContainer.appendTo('body');
				var listItemGrpCmd = ListItemGrp.create('listItemGrpCmd').command();
				var dataCollectionGrpCmd = DataCollectionGrp.create('dataCollectionGrpCmd').command();
				var opt = {
					container : testContainer,
					list_data : dataCollectionGrpCmd('add', {
						values : ['yes', 'haha']
					}),
				};
				listItemGrpCmd('render', opt);
				var value = $(testContainer.find('li')[0]).text();
				expect(value).toBe('yes');
				done();
			});
		});
	});
});
