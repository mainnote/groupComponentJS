(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define('group',[], function () {
      return (root['Grp'] = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Grp'] = factory();
  }
}(this, function () {

//for stupid old IE
var TAG = 'groupjs';
if (typeof window !== 'undefined' && window) global = window; //for browser 
if (!Object.create) {
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }

        function F() {}
        F.prototype = o;
        return new F();
    };
}
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
if (typeof Array.isArray === 'undefined') {
    Array.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
};
/*Object.prototype.renameProperty = function (oldName, newName) {
    // Do nothing if the names are the same
    if (oldName == newName) {
        return this;
    }
    // Check for the old property name to avoid a ReferenceError in strict mode.
    if (this.hasOwnProperty(oldName)) {
        this[newName] = this[oldName];
        delete this[oldName];
    }
    return this;
};*/

//----------------------------
function reservedAttr(attribute) {
    if ((attribute in obj) || (attribute in group) || attribute === 'parentNames' || attribute === 'group' || attribute === '_memberList' || attribute === 'name' || attribute === '_callToMembers') {
        return true;
    } else {
        return false;
    }
};


function _resetCallToMember(thisGrp) {
    if ('_callToMembers' in thisGrp) { //reset setCallToMembers and level up
        //clone first since it will reset later
        var tmp_callToMembers = [];
        for (var i = 0, l = thisGrp._callToMembers.length; i < l; i++) {
            tmp_callToMembers[i] = thisGrp._callToMembers[i];
        }
        //apply
        for (var i = 0, l = tmp_callToMembers.length; i < l; i++) {
            var toMem = tmp_callToMembers[i];
            thisGrp.setCallToMember(toMem.memberName, toMem.methodName);
        }
        return true;
    }
    return false;
}

var obj = {
    create: function (name) {
        var newObj = Object.create(this);

        //copy all inherited parents list to new object
        if (this.hasOwnProperty('parentNames')) {
            newObj.parentNames = [];
            var len = this.parentNames.length;
            for (var i = 0; i < len; i++) {
                newObj.parentNames.push(this.parentNames[i]);
            }
        }

        //add current parent to the parents list
        if (this.hasOwnProperty('name')) {
            if (!newObj.hasOwnProperty('parentNames'))
                newObj.parentNames = [];
            newObj.parentNames.push(this.name);

            if (!name) {
                name = this.name; //name from originate during instance
            }
        }

        newObj.name = name;

        return newObj;
    },
    extend: function () {
        for (var i = 0; i < arguments.length; i++) {
            var extObj = arguments[i];
            for (var key in extObj)
                this[key] = extObj[key];
        }
        return this;
    },
    command: function () {
        var self = this;
        return function (cmd, opt) {
            if (!(cmd in self)) throw 'This object ' + self.name + ' does not have key ' + cmd;

            if (typeof self[cmd] === 'function') {
                if (global.LOG) {
                    var result = self[cmd](opt);
                    if (!(reservedAttr(cmd))) {
                        LOG(TAG, ' Method ' + self.name + '.' + cmd + ' ', opt, result);
                    }
                    return result;
                } else {
                    return self[cmd](opt);
                }
            } else {
                if (global.LOG) {
                    var result = self[cmd];
                    if (!(reservedAttr(cmd))) {
                        LOG(TAG, ' Attribute ' + self.name + '.' + cmd + ' ', '', result);
                    }
                    return result;
                } else {
                    return self[cmd]; //value
                }
            }
        };
    },
    thisObj: function () {
        return this;
    },
};

var group = obj.create('group');
group.extend({
    create: function (name) {
        var newObj = obj.create.apply(this, arguments);
        //all members should recreated within new group
        newObj._buildMemberList();

        //reset callToMember after group instantial
        _resetCallToMember(newObj);

        return newObj;
    },
    _buildMemberList: function () {
        if (!this._memberList) { //base group
            this._memberList = {};
        } else if (!this.hasOwnProperty('_memberList')) { //inherited group
            var prototypeMemberList = this._memberList;
            this._memberList = {}; //in object level memberList
            for (var key in prototypeMemberList) {
                var memberCmd = prototypeMemberList[key];
                var newMember = memberCmd('create');
                newMember.group = this; //member

                this._memberList[key] = newMember.command();
            }
        }
    },
    /* I don't see there is any neccesary to rename a member as member name will keep forever.
        If rename function happen, it will break the nature of group call function for others.
    renameMember: function (oldMemberName, newMember) {
        if (this._memberList[oldMemberName]) {
            if (newMember) {
                //put newMember into new function
            } else {
                //rename it
                //this._memberList.renameProperty();
            }
        }
    }, */
    join: function () {
        for (var i = 0; i < arguments.length; i++) {
            var member = arguments[i];
            //add new member in command interface
            var newMember = member.create(member.name);
            newMember.group = this;
            this._memberList[member.name] = newMember.command();
        }

        return this;
    },
    call: function (memberName, methodName, opt) {
        var found = false;
        //call member in this group
        if (memberName in this._memberList) {
            found = true;
            var memberCmd = this._memberList[memberName];
            if (global.LOG) {
                var result = memberCmd(methodName, opt);
                LOG(TAG, ' Group ' + this.name + ' [ ' + memberName + '.' + methodName + ' ] ', opt, result);
                return result;
            } else {
                return memberCmd(methodName, opt);
            }
            //deep call sub group's member
        } else {
            var prototypeMemberList = this._memberList;
            for (var key in prototypeMemberList) {
                var memberCmd = prototypeMemberList[key];
                if (typeof memberCmd === 'function') {
                    var member = prototypeMemberList[key]('thisObj');
                    if (member.hasOwnProperty('parentNames')) {
                        var parentNames = member.parentNames;
                        var p_len = parentNames.length;
                        for (var j = 0; j < p_len; j++) {
                            if (memberName === parentNames[j]) {
                                found = true;
                                if (global.LOG) {
                                    var result = memberCmd(methodName, opt);
                                    LOG(TAG, ' SubGroup ' + this.name + ' [ ' + memberName + '.' + methodName + ' ] ', opt, result);
                                } else {
                                    memberCmd(methodName, opt); //no return till all members checked
                                }
                            }
                        }
                    }
                }
            }
        }
        //if not found, should we leave error?
        if (!found)  throw 'This group ' + this.name + ' does not have member ' + memberName;
    },

    /* call through to specific member whom play as a major role*/
    setCallToMember: function (memberName, methodName) {
        var that = this;
        var member = this.call(memberName, 'thisObj');
        if (member) {
            //newly create group object
            if (!this.hasOwnProperty('_callToMembers'))
                this._callToMembers = [];

            function arraySearch(arr, memberName, methodName) {
                for (var i = 0; i < arr.length; i++)
                    if (arr[i].memberName == memberName && arr[i].methodName == methodName)
                        return true;
                return false;
            }

            //ensure no duplicate
            if (!arraySearch(this._callToMembers, memberName, methodName)) {
                this._callToMembers.push({
                    memberName: memberName,
                    methodName: methodName
                });
            }

            if (methodName) {
                _setMethod(methodName, member); //override specific attribute. Even the one might exist.
            } else {
                for (var key in member) {
                    _setMethod(key, member);
                }
            }

            function _setMethod(attribute, memberObj) {
                if (!reservedAttr(attribute)) { //skip those attributes exist in group!!!
                    if (typeof memberObj[attribute] === 'function' && !memberObj[attribute].binded) {
                        that[attribute] = memberObj[attribute].bind(memberObj);
                        that[attribute].binded = true;
                    } else {
                        that[attribute] = memberObj[attribute];
                    }
                }
            }
        }

        return this;
    },

    members: function () {
        function _getMember(thisGroup) {
            var memberList = thisGroup._memberList;
            var ms = [];
            for (var key in memberList) {
                var member = {
                    name: key,
                };
                var memberObj = memberList[key]('thisObj');
                if (memberObj.hasOwnProperty('_memberList')) {
                    member['members'] = _getMember(memberObj);
                }
                ms.push(member);
            }
            return ms;
        }
        return _getMember(this);
    },

    getMember: function (memberName, memberMap) {
        if (memberMap && Array.isArray(memberMap)) {
            //find the first one in map
            return _findMemberInMap(memberMap, this);

            function _findMemberInMap(map, thisGroup) {
                if (Array.isArray(map) && thisGroup && thisGroup.hasOwnProperty('_memberList')) {
                    var len = map.length;
                    for (var i = 0; i < len; i++) {
                        //if level down
                        if (map[i].hasOwnProperty('members')) {
                            var member = _findMemberInMap(map[i].members, thisGroup.call(map[i].name, 'thisObj'));
                            if (member)
                                return member;
                        } else {
                            return _getMember(thisGroup);
                        }
                    }
                }
                return null;
            }
        } else {
            //get the first matched member if memberMap not specified
            return _getMember(this);
        }

        function _getMember(thisGroup) {
            var memberList = thisGroup._memberList;
            if (memberName in memberList) {
                return memberList[memberName]('thisObj');
            } else {
                for (var key in memberList) {
                    var memberObj = memberList[key]('thisObj');
                    if (memberObj.hasOwnProperty('_memberList')) {
                        var member = _getMember(memberObj);
                        if (member) return member;
                    }
                }
            }
            return null;
        }
    },

    override: function (newMember, memberMap, newMemberName) {
        if (newMember) {
            if (memberMap && Array.isArray(memberMap)) {
                //only override the ones in map
                _overrideMemberInMap(memberMap, this);

                function _overrideMemberInMap(map, thisGroup) {
                    if (Array.isArray(map) && thisGroup && thisGroup.hasOwnProperty('_memberList')) {
                        var len = map.length;
                        for (var i = 0; i < len; i++) {
                            //if level down
                            if (map[i].hasOwnProperty('members')) {
                                _overrideMemberInMap(map[i].members, thisGroup.call(map[i].name, 'thisObj'));
                            } else {
                                _overrideMember(thisGroup);
                            }
                        }
                    }
                }

            } else {
                //override all member with the same name
                _overrideMember(this);
            }

            function _overrideMember(thisGroup) {
                var reset = false;
                if (thisGroup.hasOwnProperty('_memberList')) {
                    for (var key in thisGroup._memberList) {
                        var memberObj = thisGroup._memberList[key]('thisObj');
                        if (memberObj.name === newMember.name) {
                            thisGroup.join(newMember);
                            reset = _resetCallToMember(thisGroup);
                        } else if (memberObj.hasOwnProperty('_memberList')) {
                            if (_overrideMember(memberObj)) {
                                reset = _resetCallToMember(thisGroup);
                            }
                        }
                    }

                }

                return reset;
            }
        }

        return this;
    },
});

var Grp = {
    obj: obj,
    group: group
};

return Grp;

}));

define('opt',['jquery'
	], function ($) {
    return {
        defaultOpt: {},
        opt: {},
        setOpt: function (opt) {
            this.opt = $.extend({}, this.defaultOpt, this.opt, opt);
        }
    };
});

define('optObj',['jquery', 'group', 'opt'
	], function ($, Grp, Opt) {
    var OptObj = Grp.obj.create('OptObj');
    OptObj.extend(Opt);
    return OptObj;
});

define('optGrp',['jquery', 'group', 'opt'
	], function ($, Grp, Opt) {
    var OptGrp = Grp.group.create('OptGrp');
    OptGrp.extend(Opt);
    return OptGrp;
});
define('component',['jquery', 'optObj'
	], function ($, OptObj) {
    var Component = OptObj.create('Component');
    Component.extend({
        template: function (opt) {
            return this.tpl ? this.tpl(opt) : '';
        },
        beforeRender: function (opt) {},
        render: function (opt) {
            this.setOpt(opt || {});
            this.beforeRender(this.opt);

            var opt_ = this.opt;

            if (!this.comp) {
                var comp = $(this.template(opt_));
                if (opt_.prepend) {
                    comp.prependTo(this.opt.container);
                } else {
                    comp.appendTo(this.opt.container);
                }
                this.comp = comp;
            }
            return this.opt.noSetup ? this.comp : this.setup(opt_);
        },

        setup: function (opt) {
            return this.comp;
        },
        remove: function (opt) {
            this.comp.remove();
            this.comp = null;
            this.afterRemoved(opt);
        },
        afterRemoved: function (opt) {},
        setElements: function (opt) {
            var that = this;
            if (opt.elements && $.isArray(opt.elements)) {
                for (var i = 0, len = opt.elements.length; i < len; i++) {
                    var elem = opt.elements[i];
                    var elemObj = elem.elem.create();

                    if (elemObj.hasOwnProperty('parentNames')) {
                        this.addElement({
                            elemCmd: elemObj.command(),
                            elemOpt: elem.opt,
                            container: opt.container || this.comp
                        });
                        if (!this.elements) this.elements = [];
                        this.elements.push(elemObj);
                    }
                }
            }
        },
        addElement: function (opt) {
            if (!opt.elemOpt) opt.elemOpt = {};
            opt.elemOpt.container = opt.container;
            opt.elemOpt.parent = this;
            opt.elemCmd('render', opt.elemOpt);
        }
    });

    return Component;
});



// RequireJS UnderscoreJS template plugin
// http://github.com/jfparadis/requirejs-tpl
//
// An alternative to http://github.com/ZeeAgency/requirejs-tpl
//
// Using UnderscoreJS micro-templates at http://underscorejs.org/#template
// Using and RequireJS text.js at http://requirejs.org/docs/api.html#text
// @author JF Paradis
// @version 0.0.2
//
// Released under the MIT license
//
// Usage:
//   require(['backbone', 'tpl!mytemplate'], function (Backbone, mytemplate) {
//     return Backbone.View.extend({
//       initialize: function(){
//         this.render();
//       },
//       render: function(){
//         this.$el.html(mytemplate({message: 'hello'}));
//     });
//   });
//
// Configuration: (optional)
//   require.config({
//     tpl: {
//       extension: '.tpl' // default = '.html'
//     }
//   });

/*jslint nomen: true */
/*global define: false */

define('tpl',['text', 'underscore'], function (text, _) {
    'use strict';

    var buildMap = {},
        buildTemplateSource = "define('{pluginName}!{moduleName}', [\'underscore\'], function (_) { return {source}; });\n";

    return {
        version: '0.0.2',

        load: function (moduleName, parentRequire, onload, config) {

            if (config.tpl && config.tpl.templateSettings) {
                _.templateSettings = config.tpl.templateSettings;
            }

            if (buildMap[moduleName]) {
                onload(buildMap[moduleName]);

            } else {
                var ext = (config.tpl && config.tpl.extension) || '.html';
                var path = (config.tpl && config.tpl.path) || '';
                text.load(path + moduleName + ext, parentRequire, function (source) {
                    buildMap[moduleName] = _.template(source);
                    onload(buildMap[moduleName]);
                }, config);
            }
        },

        write: function (pluginName, moduleName, write) {
            var build = buildMap[moduleName],
                source = build && build.source;
            if (source) {
                write.asModule(pluginName + '!' + moduleName,
                    buildTemplateSource
                    .replace('{pluginName}', pluginName)
                    .replace('{moduleName}', moduleName)
                    .replace('{source}', source));
            }
        }
    };
});


define('tpl!templates/count', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<p></p>';
}
return __p;
}; });

define('count',['jquery', 'component', 'tpl!templates/count'
	], function ($, Component, tpl) {
	var Count = Component.create('Count');
	Count.extend({
        tpl: tpl,
        setup: function(opt) {
            var that = this;
            this.watchComp.on('input', function(e){
                e.preventDefault();
                e.stopPropagation();
                var val = $(this).val();
                var opt_ = {
                    val: val,
                };
                that.count(opt_);
            });
            return this.comp;
        },
        
		render : function (opt) {
			var showTpl = $(this.template());
			opt.comp.after(showTpl);
            this.comp = showTpl;
            this.watchComp = opt.comp;
            this.maxCount = opt.maxCount;
			return this.setup();
		},
        
        count: function(opt) {
            var count = opt.val.length;
            if (this.maxCount) {
                var remaining = this.maxCount - count;
                if (remaining < 0) {
                    this.overMaxCount(opt);
                } else {
                    this.comp.text(remaining + ' characters remaining');
                }
            } else {
                this.comp.text(count + ' characters totally');
            }
        },
        
        overMaxCount: function(opt) {
            this.watchComp.val(opt.val.substring(0, this.maxCount));
        },
	});

	return Count;
});

define('entity',['jquery', 'optObj'
	], function ($, OptObj) {
    var Entity = OptObj.create('Entity');
    Entity.extend({
        value: null,
        update: function (opt) {
            if (opt.hasOwnProperty('value')) {
                if ($.isPlainObject(opt.value)) {
                    this.value = $.extend({}, this.value || {}, opt.value);
                } else {
                    this.value = opt.value;
                }
            }
            return this.command();
        },
        get: function (opt) {
            return this.value;
        }
    });

    return Entity;
});

define('collection',['jquery', 'optObj'
	], function ($, OptObj) {
    var Collection = OptObj.create('Collection');
    Collection.extend({
        values: [],
        reset: function (opt) {
            this.values = [];
        },
        add: function (opt) {
            var that = this;

            function addValue(value) {
                var entityCmd = that.group.call('entity', 'create', 'entityCmd').command();
                var opt_ = {
                    value: value,
                };
                var v = entityCmd('update', opt_);
                that.values.push(v);
            }

            if (opt.values) {
                if ($.isArray(opt.values)) {
                    $.each(opt.values, function (index, value) {
                        addValue(value);
                    });
                } else {
                    addValue(opt.values);
                }
            }
            return this.values;
        },
        addExtra: function (opt) {
            var startIndex = this.values.length;
            this.add(opt);
            return this.values.slice(startIndex);
        }
    });

    return Collection;
});

define('request',['jquery', 'optObj'
	], function ($, OptObj) {
    var Request = OptObj.create('Request');
    Request.extend({
        defaultOpt: {},
        opt: {},
        connect: function (opt) {
            this.setOpt(opt);
            
            $.ajax({
                    url: this.opt.request_url,
                    method: this.opt.request_method,
                    data: this.opt.request_data,
                    dataType: 'json'
                })
                .done(this.opt.request_done)
                .fail(this.opt.request_fail)
                .always(this.opt.request_always);
        },
        setOpt: function (opt) {
            this.opt = $.extend({}, this.opt, opt);
        },
    });

    return Request;
});

 define('collectionGrp',['jquery', 'optGrp', 'collection', 'entity', 'request'
	], function ($, OptGrp, Collection, Entity, Request) {
     var CollectionGrp = OptGrp.create('CollectionGrp');
     var collection = Collection.create('collection');
     collection.extend({
         connectEntity: function (opt) {
             var that = this;
             this.setOpt(opt);
             var opt_ = {
                 request_url: (this.opt.request_baseUrl || '/') + opt.entity._id,
                 request_method: opt.connectMethod,
                 request_done: function (data, textStatus, jqXHR) {
                     if (data.hasOwnProperty('error')) {
                         var opt_callback = {
                             error: data.error
                         };
                         that.opt.callback(opt_callback);
                     } else {
                         that.opt.callback(data);
                     }
                 },
                 request_fail: function (jqXHR, textStatus, errorThrown) {
                     var opt_callback = {
                         error: errorThrown
                     };
                     that.opt.callback(opt_callback);
                 },
                 request_always: function (data_jqXHR, textStatus, jqXHR_errorThrow) {},
             };
             this.group.call('request', 'connect', opt_);
         }
     });

     var entity = Entity.create('entity');
     entity.extend({
         remove: function (opt) {
             //back to collection to remove this entity
             var opt_ = {
                 connectMethod: 'DELETE',
                 entity: this.value,
                 callback: function (opt_callback) {
                     opt.callback(opt_callback);
                 }
             };
             this.group.call('collection', 'connectEntity', opt_);

         },
         fetch: function (opt) {
             var opt_ = {
                 connectMethod: 'GET',
                 entity: this.value,
                 callback: function (opt_callback) {
                     opt.callback(opt_callback);
                 }
             };
             this.group.call('collection', 'connectEntity', opt_);
         },
         error: function (opt) {
             //back to collection to remove this entity
             var opt_ = {
                 connectMethod: 'PUT',
                 entity: this.value,
                 callback: function (opt_callback) {
                     opt.callback(opt_callback);
                 }
             };
             this.group.call('collection', 'connectEntity', opt_);
         },
     });

     var request = Request.create('request');

     CollectionGrp.join(collection, entity, request);

     CollectionGrp.setCallToMember('collection');
     return CollectionGrp;
 });


define('tpl!templates/form', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<form onsubmit="return false;" method="'+
((__t=( form_method ))==null?'':__t)+
'" action="'+
((__t=( form_action ))==null?'':__t)+
'">\r\n<fieldset>\r\n</fieldset>\r\n</form>';
}
return __p;
}; });

define('form',['jquery', 'component', 'tpl!templates/form'
	], function ($, Component, tpl) {
    var Form = Component.create('Form');
    Form.extend({
        defaultOpt: {
            form_action: '/',
            form_method: 'GET'
        },
        tpl: tpl,
        setup: function (opt) {
            var that = this;
            //build fieldset from JSON
            if (opt.form_elements && $.isArray(opt.form_elements)) {
                var len = opt.form_elements.length;
                for (var i = 0; i < len; i++) {
                    var elem = opt.form_elements[i];
                    var comp = elem.elem.create();

                    var compOpt;
                    if (opt.doc && elem.opt && elem.opt.keyColumnMap) {
                        compOpt = elem.opt || {};
                        var keyColumnMap = elem.opt.keyColumnMap;
                        for (var key in keyColumnMap) {
                            compOpt[key] = opt.doc[keyColumnMap[key]];
                        }
                    } else {
                        compOpt = elem.opt;
                    }
                    if (comp.hasOwnProperty('parentNames')) {
                        this.add({
                            compCmd: comp.command(),
                            compOpt: compOpt,
                        });
                    }
                }
            }
            return this.comp;
        },
        submitting: false,
        submit: function (opt) {
            if (!this.submitting) {
                this.submitting = true;
                var id;
                if (this.opt && this.opt.doc && this.opt.doc._id) id = this.opt.doc._id;
                var action = (this.opt.form_action || this.comp.attr('action')) + id || '';
                var method = this.opt.form_method || this.comp.attr('method');
                var data = this.serialize();
                $.ajax({
                    type: method,
                    url: action,
                    data: data,
                    context: this,
                    done: function (data) {
                        var opt_ = {
                            data: data,
                        };
                        this.done(opt_);
                    },
                    always: function () {
                        this.always();
                    },
                });
            }
        },
        done: function (opt) {},
        always: function (opt) {
            this.submitting = false;
        },
        add: function (opt) {
            var opt_ = $.extend({
                container: this.comp.find('fieldset'),
                form: this
            }, opt.compOpt);
            opt.compCmd('render', opt_);
        },

        serialize: function (opt) {
            return this.comp.serialize();
        },

        serializeArray: function (opt) {
            return this.comp.serializeArray();
        },

    });

    return Form;
});


define('tpl!templates/error', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<b>'+
((__t=( message ))==null?'':_.escape(__t))+
'</b>\n<ol>\n    ';
 _.each(errors, function(msg){ 
__p+='\n        <li>'+
((__t=( msg ))==null?'':_.escape(__t))+
'</li>\n    ';
 }); 
__p+='\n</ol>';
}
return __p;
}; });

define('error',['jquery', 'component', 'tpl!templates/error'
	], function ($, Component, tpl) {
	var Error = Component.create('Error');
	Error.extend({
        defaultOpt: {
            message: '',
            errors: []
        },
        tpl: tpl,
	});
    
    return Error;
});
define('formGrp',['jquery', 'optGrp', 'form', 'request', 'error'
	], function ($, OptGrp, Form, Request, Error) {
    var FormGrp = OptGrp.create('FormGrp');
    var form = Form.create('form');
    form.extend({
        submit: function (opt) {
            if (!this.submitting) {
                this.submitting = true;
                var that = this;
                this.comp.find('.error').each(function (index) {
                    $(this).remove();
                });
                var id;
                if (this.opt && this.opt.doc && this.opt.doc._id) id = this.opt.doc._id;
                var action = (this.opt.form_action || this.comp.attr('action')) + (id || '');
                var method = this.opt.form_method || this.comp.attr('method');
                var inputData = this.serializeArray();
                //request
                var opt_ = {
                    request_url: action,
                    request_method: method,
                    request_data: inputData,
                    request_done: function (data, textStatus, jqXHR) {
                        if (data && 'error' in data) {
                            return that.error(data);
                        }
                        var opt0 = {
                            data: data
                        };

                        that.done(opt0);
                    },
                    request_fail: function (jqXHR, textStatus, errorThrown) {
                        var opt0 = {
                            error: errorThrown
                        };
                        that.error(opt0);
                    },
                    request_always: function (data_jqXHR, textStatus, jqXHR_errorThrow) {
                        that.always();
                    },
                };
                this.group.call('request', 'connect', opt_);
            }
        },
        error: function (opt) {
            if ($.isPlainObject(opt.error)) {
                var errorCmd = Error.create('errorCmd').command();
                errorCmd('render', $.extend(opt.error, {
                    container: $('<div class="error"></div>').appendTo(this.comp)
                }));
            } else {
                this.comp.append('<div class="error">' + opt.error + '</div>');
            }
        },

    });

    var request = Request.create('request');

    FormGrp.join(form, request);

    FormGrp.setCallToMember('form');

    return FormGrp;
});


define('tpl!templates/item', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class="list-group-item">'+
((__t=( item_value ))==null?'':__t)+
'</li>';
}
return __p;
}; });

define('item',['jquery', 'component', 'tpl!templates/item'
	], function ($, Component, tpl) {
    var Item = Component.create('Item');
    Item.extend({
        tpl: tpl,
        entityCmd: null,
        list: null,
        render: function (opt) {
            this.entityCmd = opt.item_data;
            this.list = opt.list;
            var opt_ = {
                container: opt.container,
                noSetup: opt.noSetup,
                item_value: this.entityCmd('get'),
            };
            return Component.render.call(this, opt_);
        },
        remove: function (opt) {
            var that = this;
            var opt_ = {
                callback: function () {
                    //remove from list
                    that.list.removeItem({
                        itemObj: that
                    });

                    //remove UI
                    that.comp.remove();
                }
            };
            this.entityCmd('remove', opt_);
        },
        fetch: function (opt) {
            var that = this;
            this.setOpt(opt);
            var opt_ = {
                callback: function (opt_callback) {
                    that.opt.callback(opt_callback);
                }
            };
            this.entityCmd('fetch', opt_);
        },
        update: function (opt) {
            //update UI
            this.updateUI(opt);
            //update entity
            this.entityCmd('update', {
                value: opt.doc || {}
            });
        },
        updateUI: function (opt) {
            this.comp.html(opt.doc);
        }
    });

    return Item;
});


define('tpl!templates/list', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul class="list-group"></ul>';
}
return __p;
}; });

define('list',['jquery', 'component', 'tpl!templates/list',
	], function ($, Component, tpl) {
    var List = Component.create('List');
    List.extend({
        tpl: tpl,
        items: [],
        reset: function (opt) {
            //make the original frame firm by setting min-height and width
            this.comp.css({
                'min-height': this.comp.css('height'),
                'min-width': this.comp.css('width')
            });

            this.items = [];
            this.comp.empty();
        },
        setup: function (opt) {
            var that = this;
            if (opt.list_data && $.isArray(opt.list_data)) {
                $.each(opt.list_data, function (index, data) {
                    var itemCmd = that.group.call('Item', 'create', 'itemCmd').command(); //member create
                    that.items.push(itemCmd);
                    var opt_ = {
                        list: that,
                        container: that.comp,
                        item_data: data,
                    };
                    var itemComp = itemCmd('render', opt_);
                    return itemComp;
                });

                //remove fixed css value so that less blank under the list
                var minH = this.comp.css('min-height');
                var winH = $(window).height() / 2;
                this.comp.css({
                    'min-height': minH > winH ? winH : minH,
                    'min-width': ''
                });
            }
        },
        removeItem: function (opt) {
            this.items = $.grep(this.items, function (itemObj, idx) {
                if (opt.itemObj === itemObj) return true;
            });
        }
    });

    return List;
});

define('listItemGrp',['jquery', 'optGrp', 'list', 'item'
	], function ($, OptGrp, List, Item) {
	var ListItemGrp = OptGrp.create('ListItemGrp');
    var List = List.create('List');
    var Item = Item.create('Item');
    ListItemGrp.join(List, Item);
    
    ListItemGrp.setCallToMember('List');
	return ListItemGrp;
});


define('tpl!templates/prompt', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="promptTop">\r\n    <div class="promptHead">\r\n        <a class="top-left ios-button back" href="javascript:void(0)">Back</a>\r\n        <div class="promptTitle">'+
((__t=( prompt_title ))==null?'':__t)+
'</div>\r\n        <a class="top-right ios-button done" href="javascript:void(0)">Done</a>\r\n    </div>\r\n</div>';
}
return __p;
}; });

define('prompt',['jquery', 'component', 'tpl!templates/prompt'
	], function ($, Component, tpl) {
	var Prompt = Component.create('Prompt');
	Prompt.extend({
        tpl: tpl,
        defaultOpt: {
            prompt_title: 'Prompt'  
        },
        setup: function(opt) {
            var that = this;
            if (!window.layerCount) window.layerCount = 10000;
            this.comp.css('z-index', window.layerCount++);
            var btn_done = this.comp.find('.promptHead .done');
            var btn_back = this.comp.find('.promptHead .back');
            btn_done.on('click', function(e) {
                that.donePrompt();
            });
            
            btn_back.on('click', function(e) {
                that.remove();
            });
            return this.comp;
        },
        donePrompt: function(opt) {
            this.afterSubmit(opt);
        },
        afterSubmit: function(opt) {
            this.remove();
        }
        
	});
    
    return Prompt;
});

/*
    scroll : Since scroll event doesn't bubble up, we need one static object to handle all events for one element like window.
*/
define('scroll',['jquery', 'optObj'], function ($, OptObj) {
    var Scroll = OptObj.create('Scroll');
    Scroll.extend({
        disableScroll: function (opt) {
            this.current = $(window).scrollTop();
            $(window).scrollTop(0);
            
            /*
            $('html, body').css({
                'overflow': 'hidden',
                'height': '100%'
            });
            $('html, body').on('mousewheel', function () {
                return false;
            });
            */
        },
        enableScroll: function (opt) {
            /*
            $('html, body').css({
                'overflow': '',
                'height': ''
            });
            */
            if (this.current) $(window).scrollTop(this.current);
            /* $('html, body').off('mousewheel'); */
        },
        set: function (opt) {
            var that = this;
            $(window).on('scroll', function (event) {
                that.triggerEvents(event);
            });
        },
        add: function (opt) {
            //if set, skip
            if (!this.isSet) {
                this.set();
                this.isSet = true;
            }
            //add to events array
            if (!(this.events && $.isArray(this.events) && this.events.length > 0)) {
                this.events = [];
            }
            if (opt && opt.fn && $.isFunction(opt.fn)) {
                this.events.push({
                    obj: opt.obj,
                    fn: opt.fn
                });
            }

        },

        remove: function (opt) {
            if (this.events && $.isArray(this.events) && this.events.length > 0 && opt && opt.obj) {
                for (var i = 0, len = this.events.length; i < len; i++) {
                    var eventObj = this.events[i];
                    if (eventObj.obj === opt.obj) {
                        this.events.splice(i, 1);
                    }
                }
            }
        },

        triggerEvents: function (event) {
            if (this.events && $.isArray(this.events) && this.events.length > 0) {
                for (var i = 0, len = this.events.length; i < len; i++) {
                    var eventObj = this.events[i];
                    eventObj.fn(event);

                }
            }
        }
    });

    return Scroll;
});

define('promptFormGrp',['jquery', 'optGrp', 'prompt', 'formGrp', 'scroll'
	], function ($, OptGrp, Prompt, FormGrp, Scroll) {
    var PromptFormGrp = OptGrp.create('PromptFormGrp');

    var prompt = Prompt.create('prompt');
    prompt.extend({
        setup: function (opt) {
            Scroll.disableScroll();
            var promptComp = Prompt.setup.call(this, opt);
            opt.container = promptComp;
            this.group.call('formGrp', 'render', opt);
            return promptComp;
        },

        donePrompt: function (opt) {
            var formValue = this.group.call('formGrp', 'submit', opt);
        },
        afterRemoved: function(opt) {
            Scroll.enableScroll();
        },
        afterSubmit: function(opt) {
            Prompt.afterSubmit.call(this, opt);
        }
    });

    var formGrp = FormGrp.create('formGrp');
    var form = formGrp.getMember('form');
    form.extend({
        done: function (opt) {
            this.group.group.call('prompt', 'afterSubmit', opt); //fromGrp > promptFormGrp
        },
    });

    PromptFormGrp.join(prompt, formGrp);
    PromptFormGrp.setCallToMember('prompt');

    return PromptFormGrp;
});


define('tpl!templates/textarea', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<textarea name="'+
((__t=( textarea_name ))==null?'':__t)+
'" class="form-control" placeholder="'+
((__t=( textarea_placeholder ))==null?'':__t)+
'">'+
((__t=( textarea_value ))==null?'':__t)+
'</textarea>';
}
return __p;
}; });

define('textarea',['jquery', 'component', 'tpl!templates/textarea', 'autosize'
	], function ($, Component, tpl, autosize) {
	var Textarea = Component.create('Textarea');
	Textarea.extend({
        tpl: tpl,
        defaultOpt: {
            textarea_name: 'defaultTextareaName',
            textarea_value: '',
            textarea_placeholder: '',
        },
        setup: function(opt) {
            autosize(this.comp);
            return this.comp;
        },
	});
    
    return Textarea;
});

define('textareaCountGrp',['jquery', 'optGrp', 'textarea', 'count'
	], function ($, OptGrp, Textarea, Count) {
	var TextareaCountGrp = OptGrp.create('TextareaCountGrp');
    var Textarea = Textarea.create('Textarea');
    var Count = Count.create('Count');
    TextareaCountGrp.join(Textarea, Count);
    
	TextareaCountGrp.extend({
        render: function(opt) {
            var textareaComp = this.call('Textarea', 'render', opt);
            var opt_ = {
                comp: textareaComp,
                maxCount: opt.textareaCountGrp_maxCount,
            };
            this.call('Count', 'render', opt_);
        },
	});

	return TextareaCountGrp;
});


define('tpl!templates/button', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<button class="btn '+
((__t=( button_class ))==null?'':__t)+
'" type="'+
((__t=( button_type ))==null?'':__t)+
'" title="'+
((__t=( button_title ))==null?'':__t)+
'">'+
((__t=( button_name ))==null?'':__t)+
'</button>';
}
return __p;
}; });

define('button',['jquery', 'component', 'tpl!templates/button'
	], function ($, Component, tpl) {
    var Button = Component.create('Button');
    Button.extend({
        defaultOpt: {
            button_name: 'Button',
            button_title: 'button title',
            button_type: 'button',
            button_class: 'btn-sm btn-primary'
        },
        tpl: tpl,
        setup: function (opt) {
            if (opt && opt.form && opt.button_type === 'submit') {
                this.comp.on('click', function (e) {
                    e.preventDefault();
                    opt.form.submit();
                });
            }
        }
    });

    return Button;
});


define('tpl!templates/checkbox', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="form-group">\n    <label for="'+
((__t=( checkbox_id ))==null?'':__t)+
'" class="'+
((__t=( checkbox_label_class ))==null?'':__t)+
'">'+
((__t=( checkbox_placeholder ))==null?'':__t)+
'</label>\n    <input type="checkbox" id="'+
((__t=( checkbox_id ))==null?'':__t)+
'" name="'+
((__t=( checkbox_name ))==null?'':__t)+
'" class="form-control" \n        ';
 if (checkbox_checked) {
__p+='\n         checked\n        ';
 } 
__p+='\n    >\n    <p class="hints"></p>\n</div>';
}
return __p;
}; });

define('checkbox',['jquery', 'component', 'tpl!templates/checkbox', 'bootstrap-switch'
	], function ($, Component, tpl) {
    var Checkbox = Component.create('Checkbox');
    Checkbox.extend({
        defaultOpt: {
            checkbox_id: 'checkbox_id',
            checkbox_label_class: 'checkbox_label_class',
            checkbox_name: 'checkbox_name',
            checkbox_placeholder: 'checkbox_placeholder',
            checkbox_checked: false,
            checkbox_onText: 'Yes',
            checkbox_offText: 'No'
        },
        tpl: tpl,
        setup: function (opt) {
            var checkboxComp = this.comp.find('input');
            checkboxComp.bootstrapSwitch({
                onText: opt.checkbox_onText,
                offText: opt.checkbox_offText
            });
            checkboxComp.on('switchChange.bootstrapSwitch', function (event, state) {
                checkboxComp.attr('checked', state);
            });
        },
    });

    return Checkbox;
});


define('tpl!templates/tagsinput', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="form-group">\n    <label for="'+
((__t=( tagsinput_id ))==null?'':__t)+
'" class="'+
((__t=( tagsinput_label_class ))==null?'':__t)+
'">\n        '+
((__t=( tagsinput_placeholder ))==null?'':__t)+
'\n    </label>\n    <select multiple name="'+
((__t=( tagsinput_name ))==null?'':__t)+
'" class="form-control">\n    </select>\n    <p class="hints"></p>\n</div>\n';
}
return __p;
}; });

define('tagsinput',['jquery', 'component', 'tpl!templates/tagsinput', 'bootstrap-tagsinput'
	], function ($, Component, tpl) {
    var Tagsinput = Component.create('Tagsinput');
    Tagsinput.extend({
        defaultOpt: {
            tagsinput_id: 'tagsinput_id',
            tagsinput_label_class: 'tagsinput_label_class',
            tagsinput_name: 'tagsinput_name',
            tagsinput_placeholder: 'tagsinput_placeholder',
            tagsinput_values: [],
            tagsinput_options: null
        },
        tpl: tpl,
        setup: function (opt) {
            var tagsinputComp = this.comp.find('select');
            tagsinputComp.tagsinput(opt.tagsinput_options);
            for (var i = 0; i < opt.tagsinput_values.length; i++) {
                tagsinputComp.tagsinput('add', opt.tagsinput_values[i]);
            }
        },
    });

    return Tagsinput;
});


define('tpl!templates/input', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="form-group">\r\n    <label for="'+
((__t=( input_id ))==null?'':__t)+
'" class="'+
((__t=( input_label_class ))==null?'':__t)+
'">'+
((__t=( input_placeholder ))==null?'':__t)+
'</label>\r\n    <input type="'+
((__t=( input_type ))==null?'':__t)+
'" id="'+
((__t=( input_id ))==null?'':__t)+
'" name="'+
((__t=( input_name ))==null?'':__t)+
'" class="form-control" placeholder="'+
((__t=( input_placeholder ))==null?'':__t)+
'" \r\n        ';
 if (input_required) {
__p+='\r\n         required \r\n        ';
 } 
__p+='\r\n        ';
 if (input_autofocus) {
__p+='\r\n         autofocus \r\n        ';
 } 
__p+='\r\n        ';
 if (input_action) {
__p+='\r\n         action="'+
((__t=( input_action ))==null?'':__t)+
'" \r\n        ';
 } 
__p+='\r\n        \r\n        value="'+
((__t=( input_value ))==null?'':__t)+
'"\r\n    >\r\n    <p class="hints"></p>\r\n</div>';
}
return __p;
}; });

define('input',['jquery', 'component', 'tpl!templates/input'
	], function ($, Component, tpl) {
    var Input = Component.create('Input');
    Input.extend({
        tpl: tpl,
        inputElem: null,
        defaultOpt: {
            input_required: false,
            input_autofocus: false,
            input_action: false,
            input_value: '',
            input_id: 'input_id',
            input_name: 'input_name',
            input_type: 'text',
            input_placeholder: '',
            input_timeout: 700,
            input_label_class: 'input_label' //sr-only to hide it
        },
        setup: function (opt) {
            var that = this;
            this.inputElem = this.comp.find('input');
            if (this.inputElem) {
                var wait;
                this.inputElem.on('input', function (e) {
                    if (wait) {
                        clearTimeout(wait);
                        wait = null;
                    }
                    wait = setTimeout(function () {
                        that.checkValid({
                            input_value: that.inputElem.val()
                        });
                    }, opt.input_timeout);
                });
            }
        },
        checkValid: function (opt) { //to be overriden
            this.getResult({
                invalidHints: false
            });
        },
        getResult: function (opt) {
            var hints = this.comp.find('.hints');
            if (opt && opt.invalidHints) {
                this.comp.removeClass('has-success').addClass('has-warning');
                if (this.inputElem) this.inputElem
                    .removeClass('form-control-success')
                    .addClass('form-control-warning');
                hints.html(opt.invalidHints);
            } else {
                this.comp.removeClass('has-warning').addClass('has-success');
                if (this.inputElem) this.inputElem
                    .removeClass('form-control-warning')
                    .addClass('form-control-success');
                hints.html('');
            }
        },
    });

    return Input;
});

define('inputPassword',['jquery', 'component', 'input'
	], function ($, Component, Input) {
	var InputPassword = Input.create('InputPassword');
	InputPassword.extend({
		checkValid : function (opt) {
            if (opt.input_value.length < 6) {
                this.getResult({
                    invalidHints : 'Error: Password must contain at least six characters!',
                });
            } else if (!/[a-z]/.test(opt.input_value)) {
                this.getResult({
                    invalidHints : 'Error: password must contain at least one lowercase letter (a-z)!',
                });                
            } else if (!/[A-Z]/.test(opt.input_value)) {
                this.getResult({
                    invalidHints : 'Error: password must contain at least one uppercase letter (A-Z)!',
                });                
            } else if (!/[0-9]/.test(opt.input_value)) {
                this.getResult({
                    invalidHints : 'Error: password must contain at least one number (0-9)!',
                });                
            } else {
                this.getResult({
                    invalidHints : false
                });
            }
		}
	});

	return InputPassword;
});

define('inputGrp',['jquery', 'optGrp', 'input', 'request'
	], function ($, OptGrp, Input, Request) {
	var InputGrp = OptGrp.create('InputGrp');
	var input = Input.create('input');
	input.extend({
		checkValid : function (opt) {
			var that = this;
            var action = this.comp.find('input').attr('action');
			//request
			var opt_ = {
				request_url : action,
				request_method : 'GET',
				request_data : {value: opt.input_value},
				request_done : function (data, textStatus, jqXHR) {
					if (data.hasOwnProperty('error')) {
						that.getResult({
							invalidHints : data.error.message || data.error.code,
						});
					} else {
						that.getResult({
							invalidHints : false
						});
					}
				},
				request_fail : function (jqXHR, textStatus, errorThrown) {
					that.getResult({
						invalidHints : errorThrown,
					});
				},
				request_always : function (data_jqXHR, textStatus, jqXHR_errorThrow) {},
			};
			this.group.call('request', 'connect', opt_);
		},
	});

	var request = Request.create('request');
	InputGrp.join(input, request);
	InputGrp.setCallToMember('input');

	return InputGrp;
});

define('inputEmailGrp',['jquery', 'inputGrp'
	], function ($, InputGrp) {
	var InputEmailGrp = InputGrp.create('InputEmailGrp');
    var input = InputEmailGrp.call('input', 'thisObj');
	var inputEmail = InputEmailGrp.call('input', 'create');
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

	inputEmail.extend({
		checkValid : function (opt) {
            if (re.test(opt.input_value)) {
                input.checkValid.call(this, opt);
            }
		},
	});
    
	InputEmailGrp.override(inputEmail);

	return InputEmailGrp;
});

define('validUrl',['jquery', 'optObj'
	], function ($, OptObj) {
    var ValidUrl = OptObj.create('ValidUrl');

    function isUrlValid(url) {
        return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
    }

    ValidUrl.extend({
        checkValid: function (opt) {
            return isUrlValid(opt.url);
        }
    });

    return ValidUrl;
});

define('inputUrlGrp',['jquery', 'optGrp', 'input', 'validUrl'
	], function ($, OptGrp, Input, ValidUrl) {
    var InputUrlGrp = OptGrp.create('InputUrlGrp');

    var validUrl = ValidUrl.create('validUrl');
    var inputUrl = Input.create('inputUrl');

    inputUrl.extend({
        checkValid: function (opt) {
            var opt_ = {
                url: opt.input_value
            }
            if (!this.group.call('validUrl', 'checkValid', opt_)) {
                this.getResult({
                    invalidHints: 'Invalid URL'
                });
            } else {
                this.getResult({
                    invalidHints : false
                });
            }

        }
    });

    InputUrlGrp.join(inputUrl, validUrl);
    InputUrlGrp.setCallToMember('inputUrl');

    return InputUrlGrp;
});


define('tpl!templates/navbar', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<nav class="navbar '+
((__t=( navbar_placement ))==null?'':__t)+
'">\r\n  <div class="pull-right">\r\n      <button class="navbar-toggler pull-xs-right hidden-sm-up" type="button" data-toggle="collapse" data-target="#'+
((__t=( navbar_id ))==null?'':__t)+
'">\r\n        &#9776;\r\n      </button>\r\n  </div>\r\n  <style>\r\n@media screen and (max-width: 542px) {\r\n    ul.nav li.nav-item {\r\n        width: 100%;\r\n        display: block;\r\n        clear: both;\r\n        text-align:left;\r\n        margin-left: 0 !important;\r\n    }\r\n    \r\n    nav .nav-middle {\r\n        width: 80%;\r\n        height: 2.5em;\r\n    }\r\n}\r\n  </style>\r\n  <div class="nav-middle"></div>\r\n  <div class="collapse navbar-toggleable-xs menu-items" id="'+
((__t=( navbar_id ))==null?'':__t)+
'">\r\n    <ul class="nav navbar-nav">\r\n    </ul>\r\n  </div>\r\n</nav>';
}
return __p;
}; });

define('navbar',['jquery', 'component', 'tpl!templates/navbar'
	], function ($, Component, tpl) {
    var Navbar = Component.create('Navbar');
    Navbar.extend({
        defaultOpt: {
            navbar_id: 'navbar_id',
            navbar_placement: 'navbar-fixed-top navbar-light bg-faded'
        },
        tpl: tpl,
        setup: function (opt) {
            if (opt.navbar_brand) {
                this.setElements({
                    elements: [opt.navbar_brand]
                });
            }

            if (opt.navbar_items) {
                this.setElements({
                    container: this.comp.find('#' + this.opt.navbar_id + ' ul'),
                    elements: opt.navbar_items
                });
            }

            //scoll
            if (opt && opt.toggleScoll) {
                this.toggleScoll(opt);
            }

            return this.comp;
        },

        toggleScoll: function (opt) {
            if (this.group) {
                //scroll down hide nav, up show
                var opt_ = $.extend({}, opt, {
                    header: this.comp
                });
                this.group.call('ToggleHeaderScroll', 'setToggleHeaderScroll', opt_);
            }
        },
        onActive: function (opt) {},
        clearActive: function (opt) {
            if (this.elements && $.isArray(this.elements))
                $.each(this.elements, function (index, elemObj) {
                    elemObj.command()('clearActive');
                });
        }

    });

    return Navbar;
});


define('tpl!templates/navtags', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul class="nav nav-tabs">\n</ul>';
}
return __p;
}; });

define('navtags',['jquery', 'component', 'tpl!templates/navtags'
	], function ($, Component, tpl) {
    var Navtags = Component.create('Navtags');
    Navtags.extend({
        tpl: tpl,
        setup: function (opt) {
            this.setElements({
                elements: opt.navtags_elements
            });
            return this.comp;
        },
        onActive: function (opt) {},
        clearActive: function (opt) {
            if (this.elements && $.isArray(this.elements))
                $.each(this.elements, function (index, elemObj) {
                    elemObj.command()('clearActive');
                });
        }

    });

    return Navtags;
});

define('toggleHeaderScroll',['jquery', 'optObj', 'scroll'
	], function ($, OptObj, Scroll) {
    var ToggleHeaderScroll = OptObj.create('ToggleHeaderScroll');
    ToggleHeaderScroll.extend({
        scrollEventFn: function () {
            var opt = arguments[0];
            var event = arguments[1];
            
            var st = $(window).scrollTop();

            // Make sure they scroll more than delta
            if (Math.abs(opt.lastScrollTop - st) <= opt.delta)
                return;

            if (st > opt.lastScrollTop && st > opt.navbarHeight) {
                // Scroll Down
                opt.header.hide();
            } else {
                // Scroll Up
                if (st + $(window).height() < $(document).height()) {
                    opt.header.show();
                }
            }

            opt.lastScrollTop = st;
        },
        setToggleHeaderScroll: function (opt) {
            // Hide Header on on scroll down
            var $header = opt && opt.hasOwnProperty('header') ? opt.header : $('header');

            var opt_ = $.extend({}, {
                lastScrollTop: 0,
                delta: 5,
                header: $header,
                navbarHeight: $header.outerHeight()
            }, opt);

            Scroll.add({
                obj: this,
                fn: this.scrollEventFn.bind(this, opt_)
            });
        }
    });

    return ToggleHeaderScroll;
});

define('navbarGrp',['jquery', 'optGrp', 'navbar', 'toggleHeaderScroll'
	], function ($, OptGrp, Navbar, ToggleHeaderScroll) {
	var NavbarGrp = OptGrp.create('NavbarGrp');
    var Navbar = Navbar.create('Navbar');
    var ToggleHeaderScroll = ToggleHeaderScroll.create('ToggleHeaderScroll');
    NavbarGrp.join(Navbar, ToggleHeaderScroll);
    
    NavbarGrp.setCallToMember('Navbar');
	return NavbarGrp;
});


define('tpl!templates/navBrand', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<a class="navbar-brand pull-left" href="'+
((__t=( navBrand_url ))==null?'':__t)+
'">'+
((__t=( navBrand_html ))==null?'':__t)+
'</a>';
}
return __p;
}; });

define('navBrand',['jquery', 'component', 'tpl!templates/navBrand'
	], function ($, Component, tpl) {
	var NavBrand = Component.create('NavBrand');
	NavBrand.extend({
        defaultOpt: {
            navBrand_url: '#',
            navBrand_html: '',
            prepend: true,
        },
        tpl: tpl,
	});

	return NavBrand;
});


define('tpl!templates/navItem', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class="nav-item ';
 if (pullright){ 
__p+='pull-right';
 } 
__p+=' ';
 if (active && activeOn === 'item'){ 
__p+='active';
 } 
__p+='">\r\n    <a class="nav-link ';
 if (active && activeOn === 'link'){ 
__p+='active';
 } 
__p+='" href="'+
((__t=( navItem_url ))==null?'':__t)+
'">\r\n        <span class="label label-danger label-pill pull-right">';
 if ( badge > 0 ){ 
__p+=''+
((__t=( badge ))==null?'':__t)+
'';
 } 
__p+='</span>\r\n        '+
((__t=( navItem_html ))==null?'':__t)+
'\r\n    </a>\r\n</li>';
}
return __p;
}; });

define('navItem',['jquery', 'component', 'tpl!templates/navItem'
	], function ($, Component, tpl) {
    var NavItem = Component.create('NavItem');
    NavItem.extend({
        defaultOpt: {
            navItem_url: '#',
            navItem_html: '',
            navitem_click: false,
            pullright: false,
            activeOn: 'item',
            active: false,
            badge: 0,
        },
        tpl: tpl,
        setup: function (opt) {
            if (opt && opt.navitem_click) {
                var that = this;
                this.comp.on('click', function (e) {
                    if (that.opt.parent) {
                        if (typeof that.opt.parent.clearActive === 'function') that.opt.parent.clearActive();
                    }
                    that.setActive();
                    return false;
                });
            }
            if (this.opt.active) this.onActive({
                isInit: true,
                tag: this.name
            });
            return this.comp;
        },
        onActive: function (opt) {
            if (typeof this.opt.parent.onActive === 'function')
                this.opt.parent.onActive(opt);
        },
        setActive: function (opt) {
            this.setOpt({
                active: true,
            });
            this.onActive({
                isInit: false,
                tag: this.name
            });

            if (this.comp) {
                if (this.opt && this.opt.activeOn === 'item') {
                    this.comp.find('li.nav-item').addClass('active');
                }
                if (this.opt && this.opt.activeOn === 'link') {
                    this.comp.find('a.nav-link').addClass('active');
                }
            }
        },
        clearActive: function (opt) {
            this.setOpt({
                active: false,
            });

            if (this.comp) {
                if (this.opt && this.opt.activeOn === 'item') {
                    this.comp.find('li.nav-item').removeClass('active');
                }
                if (this.opt && this.opt.activeOn === 'link') {
                    this.comp.find('a.nav-link').removeClass('active');
                }
            }
        },
    });

    return NavItem;
});


define('tpl!templates/navDropdownItem', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class="nav-item dropdown ';
 if (pullright){ 
__p+='pull-right';
 } 
__p+=' ';
 if (active && activeOn === 'item'){ 
__p+='active';
 } 
__p+='">\r\n    <span class="label label-danger label-pill pull-right">';
 if ( badge > 0 ){ 
__p+=''+
((__t=( badge ))==null?'':__t)+
'';
 } 
__p+='</span>\r\n    <a class="nav-link dropdown-toggle ';
 if (active && activeOn === 'link'){ 
__p+='active';
 } 
__p+='" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">'+
((__t=( navItem_html ))==null?'':__t)+
'</a>\r\n    <div class="dropdown-menu">\r\n    </div>\r\n</li>';
}
return __p;
}; });

define('navDropdownItem',['jquery', 'navItem', 'tpl!templates/navDropdownItem'
	], function ($, NavItem, tpl) {
    var NavDropdownItem = NavItem.create('NavDropdownItem');
    NavDropdownItem.extend({
        tpl: tpl,
        setup: function (opt) {
            if (opt.dropdown_items) {
                this.setElements({
                    container: this.comp.find('.dropdown-menu'),
                    elements: opt.dropdown_items
                });
            }
            return this.comp;
        },
    });

    return NavDropdownItem;
});


define('tpl!templates/navUserItem', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class="nav-item ';
 if (pullright){ 
__p+='pull-right';
 } 
__p+=' ';
 if (active && activeOn === 'item'){ 
__p+='active';
 } 
__p+='">\n    ';
 if (!navUserItem_user) { 
__p+='\n        <a class="btn btn-secondary left" href="'+
((__t=( navUserItem_signinUrl ))==null?'':__t)+
'" role="button">'+
((__t=( navUserItem_signText ))==null?'':__t)+
'</a>\n        <a class="btn btn-success left" href="'+
((__t=( navUserItem_signupUrl ))==null?'':__t)+
'" role="button">'+
((__t=( navUserItem_signupText ))==null?'':__t)+
'</a>\n    ';
 } else { 
__p+='\n      <li class="nav-item dropdown pull-right">\n          <span class="label label-danger label-pill pull-right">';
 if ( badge > 0 ){ 
__p+=''+
((__t=( badge ))==null?'':__t)+
'';
 } 
__p+='</span>\n          <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="'+
((__t=( navItem_url ))==null?'':__t)+
'" role="button" aria-haspopup="true" aria-expanded="false"><img class="img-rounded profile_image" src="'+
((__t=( navUserItem_user.profile_img ))==null?'':__t)+
'"/>'+
((__t=( navUserItem_user.name ))==null?'':__t)+
'</a>\n          <div class="dropdown-menu">\n          </div>\n      </li>\n    ';
 } 
__p+='\n</li>\n';
}
return __p;
}; });

define('navUserItem',['jquery', 'navDropdownItem', 'tpl!templates/navUserItem'
	], function ($, NavDropdownItem, tpl) {
	var NavUserItem = NavDropdownItem.create('NavUserItem');
	NavUserItem.extend({
        defaultOpt: $.extend({}, NavDropdownItem.defaultOpt, {
            navUserItem_user: null,
            navUserItem_signinUrl:'/login',
            navUserItem_signText:'Login',
            navUserItem_signupUrl: '/signup',
            navUserItem_signupText: 'Signup'
        }),
        tpl: tpl,
        setup: function(opt) {
            if (opt.navUserItem_user) {
                return NavDropdownItem.setup.call(this, opt);
            }
            
            return this.comp;
        }
	});

	return NavUserItem;
});



define('tpl!templates/dropdownItem', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<a class="dropdown-item ';
 if (pullright){ 
__p+='pull-right';
 } 
__p+='" href="'+
((__t=( dropdownItem_url ))==null?'':__t)+
'">'+
((__t=( dropdownItem_html ))==null?'':__t)+
'</a>';
}
return __p;
}; });

define('dropdownItem',['jquery', 'component', 'tpl!templates/dropdownItem'
	], function ($, Component, tpl) {
	var DropdownItem = Component.create('DropdownItem');
	DropdownItem.extend({
        defaultOpt: {
            dropdownItem_url: '#',
            dropdownItem_html: '',
            pullright: false,
        },
        tpl: tpl,
	});

	return DropdownItem;
});


define('tpl!templates/dropdownDivider', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="dropdown-divider"></div>';
}
return __p;
}; });

define('dropdownDivider',['jquery', 'component', 'tpl!templates/dropdownDivider'
	], function ($, Component, tpl) {
	var DropdownDivider = Component.create('DropdownDivider');
	DropdownDivider.extend({
        defaultOpt: {
            navItem_url: '#',
            navItem_html: '',
            pullright: false,
        },
        tpl: tpl,
	});

	return DropdownDivider;
});

define('fetcher',['jquery', 'optObj', 'scroll'
	], function ($, OptObj, Scroll) {
    var Fetcher = OptObj.create('Fetcher');
    Fetcher.extend({
        jqxhr: null,
        timeoutHandler: null,
        defaultOpt: {
            data: {},
            done: function () {},
            fail: function (err) {
                console.error(err);
            },
            always: function () {},
            dataType: 'json'
        },
        stop: function (opt) {
            if (this.jqxhr) this.jqxhr.abort();
            Scroll.remove({ obj: this });
            if (this.timeoutHandler) clearTimeout(this.timeoutHandler);
        },
        get: function (opt) {
            this.setOpt(opt);
            this.jqxhr = $.get({
                    url: this.opt.url,
                    data: this.opt.data,
                    dataType: this.opt.dataType,
                    context: this,
                })
                .done(function (result) {
                    this.opt.done(result);
                })
                .fail(function (err) {
                    this.opt.fail(err);
                })
                .always(function () {
                    this.opt.always();
                });
        },
        setScrollEndFetch: function (opt) {
            Scroll.add({
                obj: this,
                fn: this.scrollEventFn.bind(this, opt)
            });
        },

        scrollEventFn: function () {
            var opt = arguments[0];
            var event = arguments[1];

            var that = this;
            var nearToBottom = 100; //near 100 px from bottom, better to start loading
            if ($(document).height() - nearToBottom <= $(window).scrollTop() + $(window).height()) {
                //fetch more content
                function fetchNext() {
                    if (opt.pageLoading) { //we want it to match
                        this.timeoutHandler = setTimeout(fetchNext, 50); //wait 50 millisecnds then recheck
                        return;
                    }
                    if (!opt.lastPage) {
                        opt.pageLoading = true;
                        var opt_ = {
                            url: opt.getUrl(),
                            done: opt.afterNextFetch
                        }
                        that.get(opt_);
                    }
                }

                fetchNext();
            }
        }
    });

    return Fetcher;
});

define('listScrollEndFetchGrp',['jquery', 'optGrp', 'listItemGrp', 'collectionGrp', 'fetcher'], function ($, OptGrp, ListItemGrp, CollectionGrp, Fetcher) {
    var ListScrollEndFetchGrp = OptGrp.create('ListScrollEndFetchGrp');
    var listItemGrp = ListItemGrp.create('listItemGrp');
    var collectionGrp = CollectionGrp.create('collectionGrp');
    var fetcher = Fetcher.create('fetcher');
    ListScrollEndFetchGrp.join(listItemGrp, collectionGrp, fetcher);
    
    ListScrollEndFetchGrp.extend({
        initOpt: {},
        reset: function (opt) {
            this.call('fetcher', 'stop');
            this.call('listItemGrp', 'reset');
            this.call('collectionGrp', 'reset');
            var opt_ = {};
            $.extend(opt_, this.initOpt, opt||{});
            this.set(opt_);
        },
        set: function (opt) {
            if (opt) $.extend(this.initOpt, opt);
            var thatGrp = this;
            //declaration
            var container = opt.container;
            var page = 1;
            var pageLoading = false;
            function getUrl() {
                return opt.getUrl(page, opt.input_vaule||null);
            }

            //fetch data from server API for initial dataset
            var opt_firstFetch = {
                url: getUrl(),
                done: afterFirstFetch
            }
            thatGrp.call('fetcher', 'get', opt_firstFetch);

            //after first load process
            function afterFirstFetch(firstResult) {
                /*
                   main logic
                */
                //prepare for next load
                var lastPage = false;

                function setNext(result) {
                    if (result.page == result.pages || lastPage) {
                        lastPage = true;
                    } else {
                        page++;
                    }
                }

                function afterNextFetch(nextResult) {
                    setNext(nextResult);
                    //rendering list next time
                    var opt_next = {
                        list_data: thatGrp.call('collectionGrp', 'addExtra', {
                            values: nextResult.docs
                        }),
                    };
                    thatGrp.call('listItemGrp', 'setup', opt_next);
                    pageLoading = false;
                }

                setNext(firstResult);

                //rendering list fisrt time
                var opt_ = {
                    container: container,
                    list_data: thatGrp.call('collectionGrp', 'add', {
                        values: firstResult.docs
                    }),
                };
                thatGrp.call('listItemGrp', 'render', opt_);

                //scroll to end function
                var opt_next = {
                    pageLoading: pageLoading,
                    lastPage: lastPage,
                    getUrl: getUrl,
                    afterNextFetch: afterNextFetch
                };
                thatGrp.call('fetcher', 'setScrollEndFetch', opt_next);
            }
        }
    });


    return ListScrollEndFetchGrp;
});


define('tpl!templates/inputList', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="inputList">\n    <label>'+
((__t=( inputList_lable ))==null?'':__t)+
'</label>\n    <div class="list_items"></div>\n    <select class="c-select">\n        <option selected>'+
((__t=( inputList_header ))==null?'':__t)+
'</option>\n        ';
 _.each(inputList_options, function(option){ 
__p+='\n            <option value="'+
((__t=( option.key ))==null?'':__t)+
'">'+
((__t=( option.value ))==null?'':__t)+
'</option> \n        ';
 }); 
__p+='\n    </select>\n    <button class="btn btn-info btn-sm additem">Add</button>\n</div>\n';
}
return __p;
}; });

define('inputList',['jquery', 'component', 'tpl!templates/inputList'
	], function ($, Component, tpl) {
    var InputList = Component.create('InputList');
    InputList.extend({
        defaultOpt: {
            inputList_lable: 'Choose and add: ',
            inputList_header: 'Select a source',
            inputList_options: [{
                key: 1,
                value: 'one'
            }, {
                key: 2,
                value: 'two'
            }]
        },
        tpl: tpl
    });

    return InputList;
});

