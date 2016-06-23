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
    require(['jquery', 'promptFormGrp', 'textareaCountGrp', 'button', 'input', 'inputGrp', 'requestMock'], function ($, PromptFormGrp, TextareaCountGrp, Button, Input, InputGrp, RequestMock) {
        var btn = $('<button class="btn btn-primary">PromptFormGrp</button>');
        $('#mnbody').append(btn);

        btn.on('click', function (e) {
            var requestMock = RequestMock.create('request');
            var promptFormGrpCmd = PromptFormGrp.create('promptFormGrpCmd').command();
            var thisTextarea = TextareaCountGrp.create();
            var thisTextarea2 = TextareaCountGrp.create();

            var inputText = Input.create('inputText');
            inputText.extend({
                checkValid: function (opt) {
                    var input_value = this.inputElem.val();
                    if (input_value.length > 2) {
                        this.getResult({
                            invalidHints: false
                        });
                        return true;
                    } else {
                        this.getResult({
                            invalidHints: 'User name must longer than 2 charactors'
                        });
                        return false;

                    }
                },
            });

            var inputPassword = Input.create('inputPassword');
            inputPassword.extend({
                checkValid: function (opt) {
                    var input_value = this.inputElem.val();
                    if (input_value.length < 6) {
                        this.getResult({
                            invalidHints: 'Error: Password must contain at least six characters!',
                        });
                        return false;
                    } else if (!/[a-z]/.test(input_value)) {
                        this.getResult({
                            invalidHints: 'Error: password must contain at least one lowercase letter (a-z)!',
                        });
                        return false;
                    } else if (!/[A-Z]/.test(input_value)) {
                        this.getResult({
                            invalidHints: 'Error: password must contain at least one uppercase letter (A-Z)!',
                        });
                        return false;
                    } else if (!/[0-9]/.test(input_value)) {
                        this.getResult({
                            invalidHints: 'Error: password must contain at least one number (0-9)!',
                        });
                        return false;
                    } else {
                        this.getResult({
                            invalidHints: false
                        });
                        return true;
                    }
                },
            });

            var inputEmail = Input.create('inputEmail');
            inputEmail.extend({
                checkValid: function (opt) {
                    var input_value = this.inputElem.val();
                    if (this.validator.isEmail(input_value)) {
                        this.getResult({
                            invalidHints: false
                        });
                        return true;
                    } else {
                        this.getResult({
                            invalidHints: 'invalid email'
                        });
                        return false;

                    }
                },
            });

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
                        elem: inputEmail,
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
    require(['jquery', 'input'], function ($, Input) {
        var inputUrl = Input.create('inputUrlCmd');
        inputUrl.extend({
            checkValid: function (opt) {
                var input_value = this.inputElem.val();
                if (this.validator.isURL(input_value)) {
                    this.getResult({
                        invalidHints: false
                    });
                    return true;
                } else {
                    this.getResult({
                        invalidHints: 'invalid URL'
                    });
                    return false;

                }
            },
        });

        var inputUrlCmd = inputUrl.command();
        var opt = {
            container: $('#mnbody'),
            input_id: 'inputUrlCmd',
            input_name: 'inputUrlCmd',
            input_type: 'text',
            input_placeholder: 'inputUrlCmd',
            input_value: 'http://yes.com'
        };
        inputUrlCmd('render', opt);
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
    require(['jquery', 'inputListGrp'], function ($, InputListGrp) {
        var inputListGrpCmd = InputListGrp.create('inputListGrpCmd').command();
        var opt = {
            container: $('#mnbody'),
            prompt_title: 'Test PromptFormGrp',
            list_data: [{
                heading: 'item 1',
                text: 'this is a long text'
            }],
        };
        inputListGrpCmd('render', opt);
    }); //require

    require(['jquery', 'inputListGrp_selection'], function ($, InputListGrp_selection) {
        var InputListGrp_selectionCmd = InputListGrp_selection.create('InputListGrp_selectionCmd').command();
        var list_data = [{
            heading: 'item 1 selection',
            text: 'this is a long text selection',
            optionKey: '1'
            }];
        var opt = {
            container: $('#mnbody'),
            prompt_title: 'Test PromptFormGrp selection',
            inputList_value: encodeURIComponent(JSON.stringify(list_data)),
        };
        InputListGrp_selectionCmd('render', opt);
    }); //require

    require(['jquery', 'form', 'input', 'button'], function ($, Form, Input, Button) {
        var form = Form.create('form');
        var button_submit = Button.create('button_submit');
        var input_text = Input.create('input_text');
        input_text.extend({
            checkValid: function (opt) {
                var val = this.inputElem.val();
                if (val.length <= 2) {
                    this.getResult({
                        invalidHints: 'Input text must be longer than 2 charactors.'
                    });
                    return false;
                } else {
                    this.getResult({
                        invalidHints: false
                    });
                    return true;
                }

            }
        });
        var input_text2 = Input.create('input_text2');
        input_text2.extend({
            checkValid: function (opt) {
                var val = this.inputElem.val();
                if (val.length <= 2) {
                    this.getResult({
                        invalidHints: 'Input text must be longer than 2 charactors.'
                    });
                    return false;
                } else {
                    this.getResult({
                        invalidHints: false
                    });
                    return true;
                }

            }
        });
        var opt = {
            container: $('#mnbody'),
            form_elements: [{
                    elem: input_text,
                    opt: {
                        input_id: 'inputtext',
                        input_name: 'inputtext',
                        input_type: 'text',
                        input_placeholder: 'Test Validation',
                        input_required: true,
                        input_autofocus: true,
                        input_action: '/',
                    },
					}, {
                    elem: input_text2,
                    opt: {
                        input_id: 'inputtext2',
                        input_name: 'inputtext2',
                        input_type: 'text',
                        input_placeholder: 'Test Validation2',
                        input_required: true,
                        input_action: '/',
                    },
					}, {
                    elem: button_submit,
                    opt: {
                        button_name: 'Test Validate',
                        button_type: 'submit',
                        button_class: 'btn-sm btn-primary'
                    },
					},
				],
        };

        var formCmd = form.command();
        formCmd('render', opt);
    }); //require

    require(['jquery', 'content'], function ($, Content) {
        var content = Content.create('content');
        content.extend({
            setup: function (opt) {
                var that = this;
                this.comp.on('click', function (e) {
                    that.reset({
                        content_class: 'text-success',
                        content_content: 'www.google.ca'
                    });
                });
            }
        });
        var contentCmd = content.command();
        var opt = {
            container: $('.mncontent'),
            content_class: 'text-primary',
            content_content: 'This is my content'
        };
        contentCmd('render', opt);
    }); //require

    require(['jquery', 'notify'], function ($) {
        //$.notify('hello world');
    }); //require

    require(['jquery', 'footer'], function ($, Footer) {
        var footerCmd = Footer.create('footerCmd').command();
        footerCmd('render', {
            container: $('body'),
            footer_link: ['<li><a href="/public/privacy">Privacy</a></li>', '<li><a href="/public/about">About</a></li>'],
            footer_p: ['<p>&copy; All rights reservied.</p>'],
        });
    }); //require

    require(['jquery', 'ckeditor-jquery'], function ($, CJ) {
        var editor = $('<textarea id="myTextEditor">kjkjojojosjojs</textarea>');
        editor.appendTo('#mnbody');
        editor.ckeditor();
        //console.log('instances', CKEDITOR.instances.myTextEditor.getData());

    }); //require

    require(['jquery', 'autocomplete'], function ($, Autocomplete) {
        var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
    'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
    'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

        var autocomplete_statesCmd = Autocomplete.create('autocomplete_statesCmd').command();
        var opt = {
            container: $('#mnbody'),
            input_placeholder: 'Find state',
            input_id: 'input_state',
            input_name: 'input_state',
            autocomplete_bloodhound_opt: {
                engine_opt: {
                    local: states,
                },
                source_opt: {
                    name: 'states',
                },
            },
        };
        autocomplete_statesCmd('render', opt);

    }); //require

})();
