window.LOG1 = function (tag, msg, type, result) {
    var skipObj = false;

    if (window.console) {
        if (typeof (tag) != 'string') {
            return console.error('TAG is required for LOG!');
        } else {
            tag = tag + '       ';
        }

        if (msg == undefined) {
            return;
        } else if (type == '$') {
            if (skipObj) {
                return '';
            } else {
                return window.console.log(tag, msg);
            }
        } else if (typeof (msg) != 'string') {
            msg = stringify(msg);
        }

        if (type) {
            if (type == 'info' && window.console.info) {
                return window.console.info(tag, msg);
            } else if (type == 'error' && window.console.error) {
                return window.console.error(tag, msg);
            } else if (typeof (type) != 'string') {
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
            result = ' === ' + stringify(result);
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

(function () {
    require(['fastclick'], function (fastclick) {
        fastclick.attach(document.body);
    });
    require(['jquery', 'bootstrap', 'navbar', 'navBrand', 'navItem', 'navUserItem', 'navDropdownItem', 'dropdownItem', 'dropdownDivider'], function ($, bootstrap, Navbar, NavBrand, NavItem, NavUserItem, NavDropdownItem, DropdownItem, DropdownDivider) {
        var navBrand = NavBrand.create('navBrand');
        navBrand.setOpt({
            navBrand_url: '/',
            navBrand_html: 'Playground'
        });

        var notes = NavItem.create('notes');
        notes.setOpt({
            navItem_url: '#',
            navItem_html: 'Notes',
            active: true,
        });

        var crtPage = DropdownItem.create('crtPage');
        crtPage.setOpt({
            dropdownItem_url: '/',
            dropdownItem_html: 'Create Page'
        });
        var crtNote = DropdownItem.create('crtNote');
        crtNote.setOpt({
            dropdownItem_url: '/',
            dropdownItem_html: 'Create Note'
        });
        var divider = DropdownDivider.create('divider');
        var action = DropdownItem.create('action');
        action.setOpt({
            dropdownItem_url: '/',
            dropdownItem_html: 'Another Item'
        });

        var pages = NavDropdownItem.create('pages');
        pages.setOpt({
            navItem_html: 'Multiple',
            dropdown_items: [{
                    elem: crtPage
				}, {
                    elem: crtNote
				}, {
                    elem: divider
				}, {
                    elem: action
				},
			],
        });

        var myStuff = DropdownItem.create('myStuff');
        myStuff.setOpt({
            dropdownItem_url: '/private/mystuff',
            dropdownItem_html: 'My Stuff'
        });

        var myAccount = DropdownItem.create('myAccount');
        myAccount.setOpt({
            dropdownItem_url: '/account',
            dropdownItem_html: 'My Account'
        });

        var logout = DropdownItem.create('logout');
        logout.setOpt({
            dropdownItem_url: '/logout',
            dropdownItem_html: 'Logout'
        });

        var navUserItem = NavUserItem.create('navUserItem');
        navUserItem.setOpt({
            navUserItem_user: {
                name: 'George',
                profile_img: 'https://graph.facebook.com/1230943496933965/picture?type=small'
            },
            pullright: true,
            dropdown_items: [{
                    elem: myStuff
				}, {
                    elem: myAccount
				}, {
                    elem: divider
				}, {
                    elem: logout
				},
			]
        });

        var navbarCmd = Navbar.create('navCmd').command();
        var opt = {
            container: $('#mnbody'),
            navbar_brand: {
                elem: navBrand,
            },
            navbar_items: [{
                    elem: notes,
				}, {
                    elem: pages,
				},
				//right side
                {
                    elem: navUserItem,
				},
			],
        };
        navbarCmd('render', opt);
    });
    require(['jquery', 'bootstrap', 'textarea'], function ($, bootstrap, Textarea) {
        var textareaCmd = Textarea.create('textareaCmd').command();
        var opt = {
            container: $('#mnbody'),
            textarea_name: 'thisTextarea',
            textarea_value: 'hello world',
            textarea_placeholder: 'Type Here',
        };
        textareaCmd('render', opt);
    });
    require(['jquery', 'bootstrap', 'textareaCountGrp'], function ($, bootstrap, TextareaCountGrp) {
        var textareaCountGrpCmd = TextareaCountGrp.create('textareaCountGrpCmd').command();
        var opt = {
            container: $('#mnbody'),
            textareaCountGrp_maxCount: 120,
        };
        textareaCountGrpCmd('render', opt);
    });
    require(['jquery', 'prompt'], function ($, Prompt) {
        var btn = $('<button class="btn btn-primary">Prompt</button>');
        $('#mnbody').append(btn);

        btn.on('click', function (e) {
            var promptCmd = Prompt.create('promptCmd').command();
            var opt = {
                container: $('#mnbody'),
                prompt_title: 'Test Prompt',
            };
            promptCmd('render', opt);

            var promptCmd1 = Prompt.create('promptCmd1').command();
            var opt1 = {
                container: $('#mnbody'),
                prompt_title: 'Test Prompt 1',
            };
            promptCmd1('render', opt1);
        });
    });

    define('requestMock', ['jquery', 'group'
		], function ($, Grp) {
        var RequestMock = Grp.obj.create('RequestMock');
        RequestMock.extend({
            connect: function (opt) {
                if (opt.request_data.value === "test" || opt.request_data.value === "test@local.com") {
                    opt.request_done({
                        data: {}

                    });
                } else {
                    opt.request_done({
                        error: {
                            message: 'this is wrong',
                            code: 101
                        }
                    });
                }
                opt.request_always();
            },
        });

        return RequestMock;
    });
    require(['jquery', 'promptFormGrp', 'textareaCountGrp', 'button', 'input', 'inputPassword', 'inputEmailGrp', 'inputGrp', 'requestMock'], function ($, PromptFormGrp, TextareaCountGrp, Button, Input, InputPassword, InputEmailGrp, InputGrp, RequestMock) {
        var btn = $('<button class="btn btn-primary">PromptFormGrp</button>');
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
                container: $('#mnbody'),
                prompt_title: 'Test PromptFormGrp',
                form_elements: [{
                        elem: thisTextarea,
                        opt: {
                            textarea_name: 'thisTextarea',
                            textarea_value: 'In prompt Value',
                        },
					}, {
                        elem: thisTextarea2,
                        opt: {
                            textarea_name: 'thisTextarea2',
                            textarea_value: 'In prompt Value2',
                        },
					}, {
                        elem: inputText,
                        opt: {
                            input_id: 'inputtext',
                            input_name: 'inputtext',
                            input_type: 'text',
                            input_placeholder: 'User Name',
                            input_required: true,
                            input_autofocus: true,
                            input_action: '/',
                        },
					}, {
                        elem: inputPassword,
                        opt: {
                            input_id: 'inputpassword',
                            input_name: 'inputpassword',
                            input_type: 'password',
                            input_placeholder: 'Password',
                            input_required: true,
                        },
					}, {
                        elem: inputEmailGrp,
                        opt: {
                            input_id: 'inputemail',
                            input_name: 'inputemail',
                            input_type: 'email',
                            input_placeholder: 'Email Address',
                            input_required: true,
                        },
					}, {
                        elem: button_submit,
                        opt: {
                            button_name: 'Submit',
                            button_type: 'submit',
                            button_class: 'btn-sm btn-primary'
                        },
					},
				],
            };

            promptFormGrpCmd('override', requestMock);
            promptFormGrpCmd('render', opt);
        });
    });
    require(['jquery', 'listItemGrp', 'collectionGrp'], function ($, ListItemGrp, CollectionGrp) {
        var listItemGrpCmd = ListItemGrp.create('listItemGrpCmd').command();
        
        var collectionGrpCmd = CollectionGrp.create('collectionGrpCmd').command();
        var opt = {
            container: $('#mnbody'),
            list_data: collectionGrpCmd('add', {
                values: ['yes', 'hahasss']
            }),
        };
        listItemGrpCmd('render', opt);
        console.log('CollectionGrp 1', CollectionGrp.values);
        console.log('collectionGrp 1', collectionGrpCmd('values'));
    });
    require(['jquery', 'checkbox'], function ($, Checkbox) {
        var checkboxCmd = Checkbox.create('checkboxCmd').command();
        var opt = {
            container: $('#mnbody')
        };
        checkboxCmd('render', opt);
    }); //require
    require(['jquery', 'tagsinput'], function ($, Tagsinput) {
        var tagsinputCmd = Tagsinput.create('tagsinputCmd').command();
        var opt = {
            container: $('#mnbody'),
            tagsinput_values: ['ok']
        };
        tagsinputCmd('render', opt);
    }); //require
    require(['jquery', 'inputUrlGrp'], function ($, InputUrlGrp) {
        var inputUrlGrpCmd = InputUrlGrp.create('inputUrlGrpCmd').command();
        var opt = {
            container: $('#mnbody'),
            input_id: 'inputUrlGrpCmd',
            input_name: 'inputUrlGrpCmd',
            input_type: 'text',
            input_placeholder: 'inputUrlGrpCmd',
            input_value: 'http://yes.com'
        };
        inputUrlGrpCmd('render', opt);
    }); //require
    require(['jquery', 'navtags', 'navItem', 'bootstrap'], function ($, Navtags, NavItem, Bootstrap) {
        var link1 = NavItem.create('link1');
        link1.setOpt({
            navItem_url: '#',
            navItem_html: 'Link 1',
            activeOn: 'link',
            navitem_click: true,
            active: true,
        });
        var link2 = NavItem.create('link2');
        link2.setOpt({
            navItem_url: '#',
            navItem_html: 'Link 2',
            navitem_click: true,
            activeOn: 'link',
        });

        var navtagsCmd = Navtags.create('navtagsCmd').command();
        var opt = {
            container: $('#mnbody'),
            navtags_elements: [{
                    elem: link1,
				},
                {
                    elem: link2,
				},

			],
        };
        navtagsCmd('render', opt);
    }); //require
    require(['jquery', 'inputListGrp', 'input'], function ($, InputListGrp, Input) {
        var input_user = Input.create('input_user');

        var inputListGrpCmd = InputListGrp.create('inputListGrpCmd').command();
        var opt = {
            container: $('#mnbody'),
            prompt_title: 'Test PromptFormGrp',
            form_elements: [{
                elem: input_user,
                opt: {
                    input_id: 'inputtext',
                    input_name: 'inputtext',
                    input_type: 'text',
                    input_placeholder: 'User Name',
                    input_required: true,
                    input_autofocus: true,
                    input_action: '/',
                },
					}],
            list_data: [{
                name: 'item 1'
            }],
        };
        inputListGrpCmd('render', opt);
    }); //require
})();
