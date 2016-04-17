define(function (require) {
    describe('test cases of georgezhang/public/js/*.js', function () {
        it('validate jasmine is working', function () {
            expect(true).toBe(true);
        });
        it('group module is available.', function () {
            window.LOG1 = function (tag, msg, type, result) {
                var skipObj = true;

                if (window.console) {
                    if (typeof (tag) != 'string') {
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
                    container: testContainer,
                    textarea_name: 'thisTextarea',
                    textarea_value: 'hello world',
                    textarea_placeholder: 'Type Here',
                };
                textareaCmd('render', opt);
                var value = testContainer.find('textarea[name="thisTextarea"]').val();
                expect(value === 'hello world').toBe(true);
                done();
            });

        });
        it('Component promptFormGrp test cases', function (done) {

            define('requestMock', ['jquery', 'optObj'
				], function ($, OptObj) {
                var RequestMock = OptObj.create('RequestMock');
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
                var testContainer = $('<div></div>');
                testContainer.appendTo('body');
                var btn = $('<button>PromptFormGrp</button>');
                testContainer.append(btn);
                var requestMock = RequestMock.create('request');

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
                        container: testContainer,
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
                                },
							},
						],
                    };


                    promptFormGrpCmd('override', requestMock);
                    promptFormGrpCmd('render', opt);

                    var value = $(testContainer.find('textarea')[1]).val();
                    expect(value).toBe('In prompt Value2');

                    //click the submit button
                    expect($('.promptTop').length).toBe(1);
                    //console.log(testContainer.prop('outerHTML'));
                    testContainer.find('.btn-primary[type="submit"]').trigger('click');

                    expect($('.promptTop').length).toBe(0);

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
                    container: testContainer,
                    list_data: collectionGrpCmd('add', {
                        values: ['yes', 'haha']
                    }),
                };
                listItemGrpCmd('render', opt);
                var value = $(testContainer.find('li')[0]).text();
                expect(value).toBe('yes');
                done();
            });
        });

        it('Component navbar test cases', function (done) {
            require(['jquery', 'bootstrap', 'navbar', 'navBrand', 'navItem', 'navUserItem', 'navDropdownItem', 'dropdownItem', 'dropdownDivider'], function ($, bootstrap, Navbar, NavBrand, NavItem, NavUserItem, NavDropdownItem, DropdownItem, DropdownDivider) {
                var testContainer = $('<div></div>');
                testContainer.appendTo('body');

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
                    container: testContainer,
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
                var value = $(testContainer.find('#navbar_id ul li a')[0]).text();
                expect(value).toContain('Notes');
                done();
            }); //require
        }); //test case


        it('Component checkbox test cases', function (done) {
            require(['jquery', 'checkbox'], function ($, Checkbox) {
                var testContainer = $('<div></div>');
                testContainer.appendTo('body');
                var checkboxCmd = Checkbox.create('checkboxCmd').command();
                var opt = {
                    container: testContainer,
                    checkbox_checked: true
                };
                checkboxCmd('render', opt);
                expect(testContainer.find('input').attr('checked')).toBe('checked');
                done();
            }); //require
        }); //test case


        it('Component tagsinput test cases', function (done) {
            require(['jquery', 'tagsinput', 'bootstrap-tagsinput'], function ($, Tagsinput) {
                var testContainer = $('<div></div>');
                testContainer.appendTo('body');
                var tagsinputCmd = Tagsinput.create('tagsinputCmd').command();
                var opt = {
                    container: testContainer,
                    tagsinput_values: ['ok']
                };
                tagsinputCmd('render', opt);
                //console.log(testContainer.prop('outerHTML'));
                expect(testContainer.find('select').val()[0]).toBe('ok');
                done();
            }); //require
        }); //test case


        it('Component inputUrlGrp test cases', function (done) {
            require(['jquery', 'inputUrlGrp'], function ($, InputUrlGrp) {
                var testContainer = $('<div></div>');
                testContainer.appendTo('body');
                var inputUrlGrpCmd = InputUrlGrp.create('inputUrlGrpCmd').command();
                var opt = {
                    container: testContainer,
                    input_id: 'inputUrlGrpCmd',
                    input_name: 'inputUrlGrpCmd',
                    input_type: 'text',
                    input_placeholder: 'inputUrlGrpCmd',
                    input_value: 'http://yes.com'
                };
                inputUrlGrpCmd('render', opt);
                //console.log(testContainer.prop('outerHTML'));
                expect(testContainer.find('input').val()).toBe('http://yes.com');
                done();
            }); //require
        }); //test case


        it('Component navtags test cases', function (done) {
            require(['jquery', 'navtags', 'navItem', 'bootstrap'], function ($, Navtags, NavItem, Bootstrap) {
                var testContainer = $('<div></div>');
                testContainer.appendTo('body');
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
                    container: testContainer,
                    navtags_elements: [{
                            elem: link1,
				},
                        {
                            elem: link2,
				},

			],
                };
                navtagsCmd('render', opt);
                //console.log(testContainer.prop('outerHTML'));
                expect($(testContainer.find('a.nav-link')[0]).hasClass('active')).toBe(true);
                done();
            }); //require
        }); //test case
    }); //describe
}); //define
