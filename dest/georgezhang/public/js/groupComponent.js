(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define('group',[], function () {
      return (root['Grp'] = factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Grp'] = factory();
  }
}(this, function () {

//for stupid old IE
if (typeof window !== 'undefined' && window) global = window; //for browser
if (!Object.create) {
    Object.create = function(o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }

        function F() {}
        F.prototype = o;
        return new F();
    };
}
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function() {},
            fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
if (typeof Array.isArray === 'undefined') {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
};

function contains(a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

//---------------------------
// Define base obj
//---------------------------
var obj = {
    create: function(_id) {
        var newObj = Object.create(this);

        //copy all inherited parents list to new object
        if (this.hasOwnProperty('_parentIDs')) {
            newObj._parentIDs = []; //init
            var len = this._parentIDs.length;
            for (var i = 0; i < len; i++) {
                newObj._parentIDs.push(this._parentIDs[i]);
            }
        }

        //add current parent to the parents list
        if (this.hasOwnProperty('_id')) {
            if (!newObj.hasOwnProperty('_parentIDs'))
                newObj._parentIDs = []; //init array for parent list
            newObj._parentIDs.push(this._id);

            if (!_id) {
                _id = this._id; //name from original _id during instance
            }
        }

        newObj._id = _id; //init

        //calling init() method
        if ('init' in newObj && typeof newObj.init === 'function') newObj.init();

        return newObj;
    },

    //extend this object methods and attributes
    //e.g. OBJ.extend({}, {}, {}......)
    //
    extend: function() {
        for (var i = 0; i < arguments.length; i++) {
            var extObj = arguments[i];
            for (var key in extObj) {
                this[key] = extObj[key];

                //perform init() for new object
                if (key === 'init' && typeof this.init === 'function') this.init();
            }
        }
        return this;
    },

    _isReservedAttr: function(attribute) {
        if ((attribute in obj) || (attribute in group) || contains(['_parentIDs', 'obj', 'group', '_memberList', '_id'], attribute) || (this.reservedAttr && Array.isArray(this.reservedAttr) && contains(this.reservedAttr, attribute))) {
            return true;
        } else {
            return false;
        }
    },
    self: function(){
        return this;
    }
};

var __NOTFOUND__ = '__NOTFOUND__';

//---------------------------
// Define base group
//---------------------------
var group = obj.create('group');
group.extend({
    //create a new group
    create: function(_groupId) {
        var newGroup = obj.create.apply(this, arguments);
        //all group members should recreated within new group
        if ('_buildMemberList' in newGroup && typeof newGroup._buildMemberList === 'function')
            newGroup._buildMemberList();

        return newGroup;
    },
    _buildMemberList: function() {
        if (!this._memberList) { //base group
            this._memberList = {}; //init member list for this group
        } else if (!this.hasOwnProperty('_memberList')) { //inherited group
            var parentMemberList = this._memberList;
            this._memberList = {}; //init in object level memberList
            for (var key in parentMemberList) {
                var member = parentMemberList[key];
                var newMember = member.create();
                newMember.group = this; //refer to group

                this._memberList[key] = newMember;
            }
        }
    },

    join: function() {
        for (var i = 0; i < arguments.length; i++) {
            var member = arguments[i];
            //add new member in command interface
            var newMember = member.create();
            newMember.group = this;
            this._memberList[member._id] = newMember;
        }

        return this;
    },
    // a convinience way to execute a method for specific member in current group
    call: function(memberID, methodName) {
        if (typeof memberID !== 'string')
            throw 'Group ' + this._id + ' calling ' + memberID + ' Error: member id is not string.';
        if (typeof methodName === 'undefined')
            throw 'Group ' + this._id + ' calling ' + memberID + ' Error: Method name is not provided';

        //call member in this group
        if (memberID in this._memberList) {
            found = true;
            var member = this._memberList[memberID];

            if (methodName in member && typeof member[methodName] === 'function') {
                return member[methodName].apply(member, Array.prototype.slice.call(arguments, 2));
            } else {
                throw 'Group ' + this._id + ' calling ' + memberID + ' Error: Method name ' + methodName + ' is not found';
            }
            //check all members if anyone parent object id matched the memberID (inherited member)
        } else {
            var memberList = this._memberList;
            for (var key in memberList) {
                var member = memberList[key];
                if (member.hasOwnProperty('_parentIDs') && methodName in member && typeof member[methodName] === 'function') {
                    var _parentIDs = member._parentIDs;
                    var p_len = _parentIDs.length;
                    for (var j = 0; j < p_len; j++) {
                        if (memberID === _parentIDs[j]) {
                            return member[methodName].apply(member, Array.prototype.slice.call(arguments, 2));
                        }
                    }
                }
            }
        }
        //if not found, should we leave error?
        throw 'Group ' + this._id + ' does not contain object member ' + memberID;
    },

    //go up level group to find member and execute its method
    upCall: function(memberID, methodName) {
        var result = this._upCall.apply(this, arguments);
        if (typeof result === 'string' && result === __NOTFOUND__) {
            throw 'The upper groups from group ' + this._id + ' does not have member ' + memberID + ' with method ' + methodName;
        } else {
            return result;
        }
    },
    _upCall: function(memberID, methodName) {
        if (memberID in this._memberList) { //check current group members
            return this.call.apply(this, arguments);
        } else {
            if (this.group) { //go up one level
                return this.group._upCall.apply(this.group, arguments);
            } else {
                return __NOTFOUND__;
            }
        }

    },


    //go down level group to find member and execute its method
    downCall: function(memberID, methodName) {
        var result = this._downCall.apply(this, arguments);
        if (typeof result === 'string' && result === __NOTFOUND__) {
            throw 'The downward groups from group ' + this._id + ' does not have member ' + memberID + ' with method ' + methodName;
        } else {
            return result;
        }
    },
    _downCall: function(memberID, methodName) {
        if (memberID in this._memberList) { //check current group members
            return this.call.apply(this, arguments);
        } else {
            var memberList = this._memberList;
            //loop members to find group
            for (var key in memberList) {
                var member = memberList[key];
                if (member.hasOwnProperty('_memberList')) { //group
                    return member._downCall.apply(member, arguments); //first hit
                }
            }
            return __NOTFOUND__;
        }

    },
    members: function() {
        function _getMember(thisGroup) {
            var memberList = thisGroup._memberList;
            var ms = [];
            for (var key in memberList) {
                var memberKey = {
                    _id: key,
                };
                var memberObj = memberList[key];
                if (memberObj.hasOwnProperty('_memberList')) {
                    memberKey['members'] = _getMember(memberObj);
                }
                ms.push(memberKey);
            }
            return ms;
        }
        return _getMember(this);
    },

    getMember: function(memberID, memberMap) {
        if (memberMap && Array.isArray(memberMap)) {
            //find the first one in map
            return _findMemberInMap(memberMap, this);

            function _findMemberInMap(map, thisGroup) {
                if (Array.isArray(map) && thisGroup && thisGroup.hasOwnProperty('_memberList')) {
                    var len = map.length;
                    for (var i = 0; i < len; i++) {
                        //if level down
                        if (map[i].hasOwnProperty('members')) {
                            var member = _findMemberInMap(map[i].members, thisGroup.getMember(map[i]._id));
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
            if (memberID in memberList) {
                return memberList[memberID];
            } else {
                for (var key in memberList) {
                    var memberObj = memberList[key];
                    if (memberObj.hasOwnProperty('_memberList')) {
                        var member = _getMember(memberObj);
                        if (member) return member;
                    }
                }
            }
            return null;
        }
    },

    override: function(newMember, memberMap) {
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
                                _overrideMemberInMap(map[i].members, map[i]);
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
                if (thisGroup.hasOwnProperty('_memberList')) {
                    for (var key in thisGroup._memberList) {
                        var memberObj = thisGroup._memberList[key];
                        if (memberObj._id === newMember._id) {
                            thisGroup.join(newMember);
                        } else if (memberObj.hasOwnProperty('_memberList')) {
                            _overrideMember(memberObj);
                        }
                    }

                }
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

define('opt',['jquery', 'Promise'], function($) {
    return {
        opt: {}, //should not be overriden
        defaultOpt: {},
        reservedAttr: ['opt', 'defaultOpt', 'init', 'setOpt', 'set'],
        init: function() {},
        setOpt: function(opt) {
            if (opt) this.opt = $.extend({}, this.defaultOpt, this.opt, opt);
        }
    };
});

define('optObj',['jquery', 'group', 'opt'], function($, Grp, Opt) {
    var OptObj = Grp.obj.create('OptObj');
    OptObj.extend(Opt);
    return OptObj;
});

define('optGrp',['jquery', 'group', 'opt'], function($, Grp, Opt) {
    var OptGrp = Grp.group.create('OptGrp');
    OptGrp.extend(Opt);
    return OptGrp;
});

define('component',['jquery', 'optObj'], function($, OptObj) {
    var Component = OptObj.create('Component');
    Component.extend({
        template: function(opt) {
            return this.tpl ? this.tpl(opt) : '';
        },
        beforeRender: function(opt) {},
        render: function(opt) {
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

        setup: function(opt) {
            return this.comp;
        },
        remove: function(opt) {
            this.comp.remove();
            this.comp = null;
            this.afterRemoved(opt);
        },
        afterRemoved: function(opt) {},
        setElements: function(opt) {
            var that = this;
            if (opt.elements && $.isArray(opt.elements)) {
                for (var i = 0, len = opt.elements.length; i < len; i++) {
                    var elem = opt.elements[i];

                    if (typeof elem === 'string') {
                        opt.container.append(elem);
                    } else {
                        var elemObj = elem.elem.create();
                        if (elemObj.hasOwnProperty('_parentIDs')) {
                            this.addElement({
                                elem: elemObj,
                                elemOpt: elem.opt,
                                container: opt.container || this.comp
                            });
                            if (!this.elements) this.elements = [];
                            this.elements.push(elemObj);
                        } else {
                            throw 'invalid element object';
                        }
                    }
                }
            }
        },
        addElement: function(opt) {
            if (!opt.elemOpt) opt.elemOpt = {};
            opt.elemOpt.container = opt.container;
            opt.elemOpt.parent = this;
            opt.elem.render(opt.elemOpt);
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
        setup: function (opt) {
            var that = this;
            this.watchComp.on('input', function (e) {
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

        render: function (opt) {
            var showTpl = $(this.template());
            opt.comp.after(showTpl);
            this.comp = showTpl;
            this.watchComp = opt.comp;
            this.maxCount = opt.maxCount;
            return this.setup();
        },

        count: function (opt) {
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

        overMaxCount: function (opt) {
            this.watchComp.val(opt.val.substring(0, this.maxCount));
        },
    });

    return Count;
});

define('entity',['jquery', 'optObj'], function($, OptObj) {
    var Entity = OptObj.create('Entity');
    Entity.extend({
        init: function() {
            OptObj.init.call(this);
            this.value = null;
            this.items = []; //items
        },
        add: function(opt) {
            if (opt.hasOwnProperty('value')) {
                if ($.isPlainObject(opt.value)) {
                    this.value = $.extend({}, this.value || {}, opt.value);
                } else {
                    this.value = opt.value;
                }
            }
            return this;
        },
        update: function(opt) {
            if (opt.hasOwnProperty('value')) {
                if ($.isPlainObject(opt.value)) {
                    this.value = $.extend({}, this.value || {}, opt.value);
                } else {
                    this.value = opt.value;
                }
                //inform collection
                if (this.group && this.group.getMember('collection')) {
                    this.group.call('collection', 'update', {
                        entity: this
                    });
                }
                this.notify({
                    action: 'update'
                });
            }
            return this;
        },
        notify: function(opt) {
            $.each(this.items, function(index, item) {
                item[opt.action]();
            });
        },
        setItem: function(opt) {
            this.items.push(opt.item);
        },
        get: function(opt) {
            return this.value;
        },
        delete: function(opt) {
            //inform collection
            if (this.group) {
                this.group.call('collection', 'remove', {
                    entity: this
                });
            }
            this.notify({
                action: 'delete'
            });
        },
    });

    return Entity;
});

define('collection',['jquery', 'optObj'], function($, OptObj) {
    var Collection = OptObj.create('Collection');
    Collection.extend({
        init: function() {
            OptObj.init.call(this);
            this.values = [];
        },
        reset: function(opt) {
            this.values = [];
        },
        add: function(opt) {
            var that = this;

            function addValue(value) {
                var entity = that.group.call('entity', 'create', 'entity');
                var opt_ = {
                    value: value,
                };
                var v = entity.add(opt_);
                that.values.push(v);
            }

            //if values is array, add individually; otherwise, add as single entity
            if (opt.values) {
                if ($.isArray(opt.values)) {
                    $.each(opt.values, function(index, value) {
                        addValue(value);
                    });
                } else {
                    addValue(opt.values);
                }
            }
            return this.values;
        },

        //return the entity back
        addExtra: function(opt) {
            var startIndex = this.values.length;
            this.add(opt);
            return this.values.slice(startIndex);
        },
        getValues: function(opt) {
            return $.map(this.values, function(entity, i) {
                return entity.get();
            });
        },
        getEntities: function(opt) {
            return this.values;
        },
        update: function(opt) {},
        remove: function(opt) {
            var values = this.values;
            $.each(values, function(i, entity) {
                if (entity === opt.entity) {
                    values.splice(i, 1);
                    return false;
                }
            });
        }
    });

    return Collection;
});

 define('collectionGrp',['jquery', 'optGrp', 'collection', 'entity'], function($, OptGrp, Collection, Entity) {
     var CollectionGrp = OptGrp.create('CollectionGrp');
     var collection = Collection.create('collection');
     var entity = Entity.create('entity');

     CollectionGrp.join(collection, entity);

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

define('form',['jquery', 'component', 'tpl!templates/form'], function($, Component, tpl) {
    function _v(obj, pathStr) {
        var paths = pathStr.split('.');
        var len = paths.length;
        if (len > 1) {
            var result = obj;
            for (var i=0; i<len; i++) {
                if (result.hasOwnProperty(paths[i])) {
                    result = result[paths[i]];
                } else {
                    throw new TypeError('invalid pathStr when mapping!');
                }
            }

            return result;
        } else {
            return obj[pathStr];
        }
    }

    var Form = Component.create('Form');
    Form.extend({
        tpl: tpl,
        defaultOpt: {
            form_action: '/',
            form_method: 'GET'
        },
        init: function() {
            Component.init.call(this);
            this.submitting = false;
            this.components = [];
        },
        setup: function(opt) {
            var that = this;
            //build fieldset from JSON
            if (opt.form_elements && $.isArray(opt.form_elements)) {
                var len = opt.form_elements.length;
                for (var i = 0; i < len; i++) {
                    var elem = opt.form_elements[i];
                    var comp = elem.elem.create();

                    var compOpt;
                    if (opt.doc && elem.opt && elem.opt.keyColumnMap) {
                        compOpt = elem.opt ? $.extend({}, elem.opt) : {};
                        var keyColumnMap = elem.opt.keyColumnMap;
                        for (var key in keyColumnMap) {
                            compOpt[key] = _v(opt.doc, keyColumnMap[key]);
                        }
                    } else {
                        compOpt = elem.opt;
                    }
                    if (comp.hasOwnProperty('_parentIDs')) {
                        this.add({
                            comp: comp,
                            compOpt: compOpt,
                        });
                    }
                }
            }
            return this.comp;
        },
        submit: function(opt) {
            if (!this.submitting && this.checkValid()) {
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
                    done: function(data) {
                        var opt_ = {
                            data: data,
                        };
                        this.done(opt_);
                    },
                    always: function() {
                        this.always();
                    },
                });
            }
        },
        checkValid: function(opt) {
            var validFlag = true;
            $.each(this.components, function(index, component) {
                if ('checkValid' in component) {
                    var result = component.checkValid(); //valid?
                    if (!result) validFlag = false;
                }
            });
            return validFlag;
        },
        done: function(opt) {},
        always: function(opt) {
            this.submitting = false;
        },
        add: function(opt) {
            this.components.push(opt.comp);
            var opt_ = $.extend({
                container: this.comp.find('fieldset'),
                form: this
            }, opt.compOpt);
            opt.comp.render(opt_);
        },
        find: function(opt) {
            var subComp;
            $.each(this.components, function(i, comp) {
                if (comp._id === opt._id) {
                    subComp = comp;
                    return false;
                }
            });
            return subComp;
        },
        serialize: function(opt) {
            return this.comp.serialize();
        },

        serializeArray: function(opt) {
            return this.comp.serializeArray();
        },

    });

    return Form;
});

define('request',['jquery', 'optObj', 'Promise'], function($, OptObj, Promise) {
    var Request = OptObj.create('Request');
    Request.extend({
        init: function(opt) {
            this.xhr = null;
        },
        abort: function(opt) {
            if (this.xhr) this.xhr.abort();
        },
        connect: function(opt) {
            var that = this;
            this.setOpt(opt);
            var params = {
                url: this.opt.request_url,
                method: this.opt.request_method,
                data: this.opt.request_data,
                dataType: 'json',
                contentType: this.opt.request_contentType || 'application/json'
            };
            if (opt.request_params && $.isPlainObject(opt.request_params)) {
                $.extend(params, opt.request_params);
            }

            if (!params.url) throw new TypeError('invalid URL in request');

            return new Promise(function(resolve, reject) {
                that.xhr = $.ajax(params)
                    .done(function(data, textStatus, jqXHR) {
                        return resolve(data);
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        return reject(jqXHR.responseText || errorThrown);
                    });
            });
        },
        getJSON: function(opt) {
            console.log('getJSON');
            var that = this;
            return new Promise(function(resolve, reject) {
                that.xhr = $.getJSON(opt.url)
                    .done(function(data, textStatus, jqXHR) {
                        return resolve(data);
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        return reject(jqXHR.responseText || errorThrown);
                    });
            });
        },
    });

    return Request;
});


define('tpl!templates/errorList', ['underscore'], function (_) { return function(obj){
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

define('errorList',['jquery', 'component', 'tpl!templates/errorList'
	], function ($, Component, tpl) {
    var ErrorList = Component.create('ErrorList');
    ErrorList.extend({
        tpl: tpl,
        defaultOpt: {
            message: '',
            errors: []
        },
    });

    return ErrorList;
});

define('formGrp',['jquery', 'optGrp', 'form', 'request', 'errorList'], function($, OptGrp, Form, Request, ErrorList) {
    var FormGrp = OptGrp.create('FormGrp');
    var form = Form.create('form');
    var request = Request.create('request');
    var errorList = ErrorList.create('errorList');


    var form_checkValid = form.checkValid;
    form.extend({
        submit: function(opt) {
            if (!this.submitting && this.checkValid()) {
                this.submitting = true;
                var that = this;
                this.comp.find('.error').each(function(index) {
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
                };
                return this.group.call('request', 'connect', opt_)
                    .then(function(data) {
                        var opt0 = {
                            data: data
                        };

                        return that.done(opt0);
                    })
                    .catch(function(err) {
                        return that.error({
                            error: err,
                        });
                    })
                    .finally(function() {
                        return that.always();
                    });
            }
        },
        checkValid: function(opt) {
            var validFlag = form_checkValid.call(this, opt);
            if (validFlag) {
                return true;
            } else {
                this.error({
                    error: 'Please correct error above.'
                });
            }
        },
        error: function(opt) {
            if ($.isPlainObject(opt.error)) {
                var errorList = this.group.getMember('errorList');
                var form_error = errorList.create();
                form_error
                    .render($.extend(opt.error, {
                        container: $('<div class="error"></div>').appendTo(this.comp)
                    }));
            } else {
                this.comp.append('<div class="error">' + opt.error + '</div>');
            }
        },

    });

    FormGrp.join(form, request, errorList);
    FormGrp.extend({
        set: function(opt) {
            this.call('form', 'render', opt);
        }
    });

    return FormGrp;
});


define('tpl!templates/item', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class="list-group-item"><div class="item_value">'+
((__t=( item_value ))==null?'':__t)+
'</div></li>\n';
}
return __p;
}; });

define('item',['jquery', 'component', 'tpl!templates/item'], function($, Component, tpl) {
    var Item = Component.create('Item');
    Item.extend({
        tpl: tpl,
        init: function() {
            Component.init.call(this);
            this.entity = null;
            this.list = null;
        },
        render: function(opt) {
            this.entity = opt.item_entity;
            this.entity.setItem({
                item: this
            });
            this.list = opt.list;
            var opt_ = {
                container: opt.container,
                noSetup: opt.noSetup,
                item_value: this.entity.get(),
            };
            if (opt.prepend) opt_.prepend = true;

            return Component.render.call(this, opt_);
        },
        getEntityValue: function(opt) {
            return this.entity.get();
        },
        deleteEntityValue: function(opt) {
            this.entity.delete();
        },
        delete: function(opt) {
            //remove from list
            this.list.removeItem({
                itemObj: this.group
            });
            //destroy itself
            this.remove();
        },
        removeAsync: function(opt) {
            var that = this;
            var opt_ = {};
            if (opt && opt.data) opt_.data = opt.data;
            return this.entity.removeAsync(opt_)
                .then(function(data) {
                    //remove from list
                    that.list.removeItem({
                        itemObj: that
                    });

                    //remove UI
                    that.comp.remove();

                    return data;
                });
        },
        postAsync: function(opt) {
            return this.entity.postAsync(opt);
        },
        fetchAsync: function(opt) {
            var that = this;
            this.setOpt(opt);
            return this.entity.fetchAsync();
        },
        update: function(opt) {
            //update UI
            this.updateUI({
                doc: {
                    item_value: this.entity.get(),
                },
            });
        },
        /* consider an item may have heavy UI. I try not to render it again. So, you have to decide which part might be changed during update. e.g. title, description etc. */
        updateUI: function(opt) {
            if (opt && opt.doc && opt.doc.item_value && typeof opt.doc.item_value == 'object') {
                throw new TypeError('Method item.updateUI have to be overriden for object value.');
            }
            this.comp.find('.item_value').html(opt.doc.item_value);
        },
        updateEntity: function(opt) {
            this.entity.update(opt);
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

define('list',['jquery', 'component', 'tpl!templates/list', ], function($, Component, tpl) {
    var List = Component.create('List');
    List.extend({
        tpl: tpl,
        init: function() {
            Component.init.call(this);
            this.collectionGrp = null;
            this.items = [];
        },
        reset: function(opt) {
            //make the original frame firm by setting min-height and width
            if (this.comp && this.comp.css) {
                this.comp.css({
                    'min-height': this.comp.css('height'),
                    'min-width': this.comp.css('width')
                });
                this.comp.empty();
            }

            this.items = [];
        },
        setup: function(opt) {
            var that = this;
            if (!this.collectionGrp)
                this.collectionGrp = opt.collectionGrp;

            var list_entities;
            //direct from opt
            if (opt.list_entities) {
                list_entities = opt.list_entities;
            } else {
                var collection = opt.collectionGrp.getMember('collection');
                list_entities = collection.getEntities();
            }

            if (list_entities && $.isArray(list_entities) && list_entities.length > 0) {
                $.each(list_entities, function(index, data) {
                    var itemGrp = that.group.call('itemGrp', 'create', 'itemGrp'); //member create
                    that.items.push(itemGrp);
                    var opt_ = {
                        list: that,
                        container: that.comp,
                        item_entity: data,
                    };
                    if (opt.prepend) opt_.prepend = true;

                    var itemComp = itemGrp.set(opt_);
                    return itemComp;
                });

                //remove fixed css value so that less blank under the list
                var minH = this.comp.css('min-height');
                var winH = $(window).height() / 2;
                this.comp.css({
                    'min-height': minH > winH ? winH : minH,
                    'min-width': ''
                });
            } else {
                this.showEmptyList(opt);
            }

            return this.comp;
        },
        removeItem: function(opt) {
            var items = this.items;
            $.each(items, function(i, itemObj) {
                if (itemObj === opt.itemObj) {
                    items.splice(i, 1);
                    return false;
                }
            });
        },
        showEmptyList: function(opt) {},
    });

    return List;
});

define('itemGrp',['jquery', 'optGrp', 'item'
	], function ($, OptGrp, Item) {
	var ItemGrp = OptGrp.create('ItemGrp');
    var item = Item.create('item');

	ItemGrp.extend({
		set: function(opt){
			this.call('item', 'render', opt);
		},
	});
    ItemGrp.join(item);

	return ItemGrp;
});

define('listItemGrp',['jquery', 'optGrp', 'list', 'itemGrp'], function($, OptGrp, List, ItemGrp) {
    var ListItemGrp = OptGrp.create('ListItemGrp');
    var list = List.create('list');
    var itemGrp = ItemGrp.create('itemGrp');
    ListItemGrp.extend({
        set: function(opt) {
            this.call('list', 'render', opt);
        },
    });

    ListItemGrp.join(list, itemGrp);
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

define('prompt',['jquery', 'component', 'tpl!templates/prompt'], function($, Component, tpl) {
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
                var len = this.events.length;
                for (var i = 0; i < len; i++) {
                    var eventObj = this.events[i];
                    if (eventObj && eventObj.obj && opt.obj && eventObj.obj === opt.obj) {
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

define('promptFormGrp',['jquery', 'optGrp', 'prompt', 'formGrp', 'scroll'], function($, OptGrp, Prompt, FormGrp, Scroll) {
    var PromptFormGrp = OptGrp.create('PromptFormGrp');

    var prompt = Prompt.create('prompt');
    prompt.extend({
        setup: function(opt) {
            Scroll.disableScroll();
            var promptComp = Prompt.setup.call(this, opt);
            opt.container = promptComp;
            this.group.call('formGrp', 'set', opt);
            return promptComp;
        },

        donePrompt: function(opt) {
            return this.group.downCall('form', 'submit', opt);
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
        done: function(opt) {
            this.group.upCall('prompt', 'afterSubmit', opt); //fromGrp > promptFormGrp
        },
    });

    PromptFormGrp.extend({
        render: function(opt) {
            this.call('prompt', 'render', opt);
        },
    });
    PromptFormGrp.join(prompt, formGrp);

    return PromptFormGrp;
});


define('tpl!templates/textarea', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<textarea name="'+
((__t=( textarea_name ))==null?'':__t)+
'" class="form-control '+
((__t=( textarea_class ))==null?'':__t)+
'" placeholder="'+
((__t=( textarea_placeholder ))==null?'':__t)+
'">'+
((__t=( textarea_value ))==null?'':__t)+
'</textarea>';
}
return __p;
}; });

define('textarea',['jquery', 'component', 'tpl!templates/textarea', 'autosize'], function($, Component, tpl, autosize) {
    var Textarea = Component.create('Textarea');
    Textarea.extend({
        tpl: tpl,
        defaultOpt: {
            textarea_name: 'defaultTextareaName',
            textarea_value: '',
            textarea_placeholder: '',
            textarea_class: '',
            textarea_autoResize: false
        },
        setup: function(opt) {
            this.setOpt(opt);
            if (this.opt.textarea_autoResize) {
                autosize(this.comp);
            }

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

define('button',['jquery', 'component', 'tpl!templates/button'], function($, Component, tpl) {
    var Button = Component.create('Button');
    Button.extend({
        tpl: tpl,
        defaultOpt: {
            button_name: 'Button',
            button_title: 'button title',
            button_type: 'button',
            button_class: 'btn-sm btn-primary'
        },
        setup: function(opt) {
            if (opt && opt.form && opt.button_type === 'submit') {
                this.comp.on('click', function(e) {
                    e.preventDefault();
                    opt.form.submit();
                });
            }
            return this.comp;
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
        tpl: tpl,
        defaultOpt: {
            checkbox_id: 'checkbox_id',
            checkbox_label_class: 'checkbox_label_class',
            checkbox_name: 'checkbox_name',
            checkbox_placeholder: 'checkbox_placeholder',
            checkbox_checked: false,
            checkbox_onText: 'Yes',
            checkbox_offText: 'No'
        },
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
        tpl: tpl,
        defaultOpt: {
            tagsinput_id: 'tagsinput_id',
            tagsinput_label_class: 'tagsinput_label_class',
            tagsinput_name: 'tagsinput_name',
            tagsinput_placeholder: 'tagsinput_placeholder',
            tagsinput_values: [],
            tagsinput_options: null,
        },
        init: function(){
            Component.init.call(this);
            this.tagsinputComp = null;
        },
        setup: function (opt) {
            this.tagsinputComp = this.comp.find('select');
            this.tagsinputComp.tagsinput(opt.tagsinput_options);
            for (var i = 0; i < opt.tagsinput_values.length; i++) {
                this.tagsinputComp.tagsinput('add', opt.tagsinput_values[i]);
            }
            return this.comp;
        },
        val: function(opt) {
            return this.tagsinputComp.val();
        },
    });

    return Tagsinput;
});


define('tpl!templates/input', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="form-group">\r\n    ';
 if (input_label && input_label.length > 0) { 
__p+='<label for="'+
((__t=( input_id ))==null?'':__t)+
'" class="'+
((__t=( input_label_class ))==null?'':__t)+
'">'+
((__t=( input_label ))==null?'':__t)+
'</label>';
 } 
__p+='\r\n    <input type="'+
((__t=( input_type ))==null?'':__t)+
'" id="'+
((__t=( input_id ))==null?'':__t)+
'" name="'+
((__t=( input_name ))==null?'':__t)+
'" class="form-control '+
((__t=( input_class ))==null?'':__t)+
'" placeholder="'+
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

define('input',['jquery', 'component', 'validator', 'tpl!templates/input'], function($, Component, validator, tpl) {
    var Input = Component.create('Input');
    Input.extend({
        tpl: tpl,
        validator: validator,
        defaultOpt: {
            input_required: false,
            input_autofocus: false,
            input_action: false,
            input_value: '',
            input_id: 'input_id',
            input_name: 'input_name',
            input_class: '',
            input_type: 'text',
            input_label: '',
            input_placeholder: '',
            input_timeout: 700,
            input_label_class: 'input_label', //sr-only to hide it
        },
        init: function() {
            Component.init.call(this);
            this.inputElem = null;
        },
        setup: function(opt) {
            var that = this;
            this.inputElem = this.comp.find('input');

            //automatically check if input is valid or not
            if (this.inputElem && opt.input_type.toLowerCase() !== 'hidden') {
                var wait;
                this.inputElem.on('input', function(e) {
                    if (wait) {
                        clearTimeout(wait);
                        wait = null;
                    }
                    wait = setTimeout(function() {
                        that.checkValid();
                    }, opt.input_timeout);
                });
            }

            if (opt.input_type.toLowerCase() === 'hidden') this.comp.hide();
            return this.comp;
        },
        checkValid: function(opt) { //to be overriden
            /*            var input_value = this.inputElem.val();
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

                        }*/
            return true; //to be removed
        },
        getResult: function(opt) {
            if (this && this.comp) {
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
            }
        },
    });

    return Input;
});

define('inputGrp',['jquery', 'optGrp', 'input', 'request'
	], function ($, OptGrp, Input, Request) {
    var InputGrp = OptGrp.create('InputGrp');
    var input = Input.create('input');
    input.extend({
        checkValid: function (opt) {
            var that = this;
            var action = this.comp.find('input').attr('action');
            //request
            var opt_ = {
                request_url: action,
                request_method: 'GET',
                request_data: {
                    value: opt.input_value
                },
            };
            this.group.call('request', 'connectAsync', opt_)
                .then(function (data) {
                    that.getResult({
                        invalidHints: false
                    });
                })
                .catch(function (err) {
                    if ($.isPlainObject(err)) {
                        err = err.message || err.code || JSON.stringify(err);
                    }
                    that.getResult({
                        invalidHints: err,
                    });
                });
            return true; //skip waiting for remote validation if submit
        },
    });

    var request = Request.create('request');
	InputGrp.extend({
		render: function(opt){
			this.call('input', 'render', opt);
		},
	});
    InputGrp.join(input, request);

    return InputGrp;
});


define('tpl!templates/navbar', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<nav class="navbar '+
((__t=( navbar_placement ))==null?'':__t)+
'">\r\n  <div class="pull-right">\r\n      <button class="navbar-toggler pull-xs-right hidden-sm-up" type="button" data-toggle="collapse" data-target="#'+
((__t=( navbar_id ))==null?'':__t)+
'">\r\n        &#9776;\r\n      </button>\r\n  </div>\r\n  <div class="nav-middle"></div>\r\n  <div class="collapse navbar-toggleable-xs menu-items" id="'+
((__t=( navbar_id ))==null?'':__t)+
'">\r\n    <ul class="nav navbar-nav">\r\n    </ul>\r\n  </div>\r\n</nav>\r\n\r\n';
}
return __p;
}; });

define('navbar',['jquery', 'component', 'tpl!templates/navbar'
	], function ($, Component, tpl) {
    var Navbar = Component.create('Navbar');
    Navbar.extend({
        tpl: tpl,
        defaultOpt: {
            navbar_id: 'navbar_id',
            navbar_placement: 'navbar-fixed-top navbar-light bg-faded'
        },
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
                    elemObj.clearActive();
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
                    elemObj.clearActive();
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

define('navbarGrp',['jquery', 'optGrp', 'navbar', 'toggleHeaderScroll'], function($, OptGrp, Navbar, ToggleHeaderScroll) {
    var NavbarGrp = OptGrp.create('NavbarGrp');
    var Navbar = Navbar.create('Navbar');
    var ToggleHeaderScroll = ToggleHeaderScroll.create('ToggleHeaderScroll');
    NavbarGrp.extend({
        render: function(opt) {
            this.call('Navbar', 'render', opt);
        },
    });
    NavbarGrp.join(Navbar, ToggleHeaderScroll);
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
        tpl: tpl,
        defaultOpt: {
            navBrand_url: '#',
            navBrand_html: '',
            prepend: true,
        },
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
        tpl: tpl,
        defaultOpt: {
            navItem_url: '#',
            navItem_html: '',
            navitem_click: false,
            pullright: false,
            activeOn: 'item',
            active: false,
            badge: 0,
        },
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
        tpl: tpl,
        defaultOpt: $.extend({}, NavDropdownItem.defaultOpt, {
            navUserItem_user: null,
            navUserItem_signinUrl: '/login',
            navUserItem_signText: 'Login',
            navUserItem_signupUrl: '/signup',
            navUserItem_signupText: 'Signup'
        }),
        setup: function (opt) {
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
        tpl: tpl,
        defaultOpt: {
            dropdownItem_url: '#',
            dropdownItem_html: '',
            pullright: false,
        },
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
        tpl: tpl,
        defaultOpt: {
            navItem_url: '#',
            navItem_html: '',
            pullright: false,
        },
    });

    return DropdownDivider;
});

define('fetcher',['jquery', 'optObj', 'scroll', 'request'
	], function ($, OptObj, Scroll, Request) {
    var Fetcher = OptObj.create('Fetcher');
    Fetcher.extend({
        defaultOpt: {
            data: {},
        },
        init: function () {
            OptObj.init.call(this);
            this.request = Request.create('request');
        },
        /* not sure how this function work */
        stop: function (opt) {
            this.request.abort();
            Scroll.remove({
                obj: this
            });
        },
        getAsync: function (opt) {
            this.setOpt(opt);
            if (this.opt.url) {
                var opt_ = {
                    request_url: this.opt.url,
                    request_method: 'GET',
                    request_data: this.opt.data,
                };
                return this.request.connectAsync(opt_);
            } //no error if no url
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
                    if (!opt.lastPage && !opt.pageLoading.status) {
                        opt.pageLoading.status = true;
                        var opt_ = {
                            url: opt.getUrl(),
                        }
                        return that.getAsync(opt_)
                            .then(opt.afterNextFetch)
                            .catch(opt.error);
                    }
                }

                fetchNext();
            }
        }
    });

    return Fetcher;
});

define('collectionRequestGrp',['jquery', 'collectionGrp', 'request', 'Promise'], function($, CollectionGrp, Request, Promise) {
    var CollectionRequestGrp = CollectionGrp.create('CollectionRequestGrp');
    var request = Request.create('request');
    CollectionRequestGrp.join(request);

    var collection = CollectionRequestGrp.getMember('collection');
    var collection_remove = collection.remove;
    var collection_update = collection.update;
    collection.extend({
        fetchAdd: function(opt) {
            var that = this;
            that.setOpt(opt);
            if (opt && opt.url) {
                return this.remoteGet(opt)
                    .then(function(values) {
                        var _opt = {
                            values: values
                        };

                        that.add(_opt);
                    });
                //must return promise
            } else {
                throw new TypeError('invalid URL');
            }
        },
        remove: function(opt){
            var that = this;
            if (opt && opt.entity) {
                return this.remoteRemove(opt)
                    .then(function(values) {
                        collection_remove.call(that, opt);
                    });
                //must return promise
            } else {
                throw new TypeError('invalid entity');
            }
        },
        update: function(opt) {
            var that = this;
            if (opt && opt.entity) {
                return this.remoteUpdate(opt)
                    .then(function(values) {
                        collection_update.call(that, opt);
                    });
                //must return promise
            } else {
                throw new TypeError('invalid entity');
            }
        },
        //to be overriden
        remoteGet: function(opt) {
            throw new TypeError('Method collectionRequestGrp.remoteGet(opt) must be overriden!');
            //must return Promise
        },
        //to be overriden
        remoteRemove: function(opt) {
            throw new TypeError('Method collectionRequestGrp.remoteRemove(opt) must be overriden!');
            //must return Promise
        },
        //to be overriden
        remoteUpdate: function(opt) {
            throw new TypeError('Method collectionRequestGrp.remoteUpdate(opt) must be overriden!');
            //must return Promise
        },
        //to be overriden
        remoteAdd: function(opt) {
            throw new TypeError('Method collectionRequestGrp.remoteAdd(opt) must be overriden!');
            //must return Promise
        }
    });

    return CollectionRequestGrp;
});

define('listScrollEndFetchGrp',['jquery', 'optGrp', 'listItemGrp', 'collectionRequestGrp', 'fetcher'], function ($, OptGrp, ListItemGrp, CollectionRequestGrp, Fetcher) {
    var ListScrollEndFetchGrp = OptGrp.create('ListScrollEndFetchGrp');
    var listItemGrp = ListItemGrp.create('listItemGrp');
    var collectionRequestGrp = CollectionRequestGrp.create('collectionRequestGrp');
    var fetcher = Fetcher.create('fetcher');
    ListScrollEndFetchGrp.join(listItemGrp, collectionRequestGrp, fetcher);

    ListScrollEndFetchGrp.extend({
        reset: function (opt) {
            this.call('fetcher', 'stop');
            this.call('listItemGrp', 'reset');
            this.call('collectionRequestGrp', 'reset');
            this.set(opt);
        },
        getUrl: function () {}, //to be overriden
        set: function (opt) {
            this.setOpt(opt);
            var thatGrp = this;
            //declaration
            var container = this.opt.container;
            var page = 1;
            var pageLoading = {
                status: false
            };

            function getUrl() {
                return thatGrp.getUrl(page);
            }

            //fetch data from server API for initial dataset
            var opt_firstFetch = {
                url: getUrl(),
            }
            thatGrp.call('fetcher', 'getAsync', opt_firstFetch)
                .then(function (firstResult) {
                    /*
                       main logic
                    */

                    //after first load process
                    //prepare for next load
                    var lastPage = false;

                    function setNext(result) {
                        var currentPage = parseInt(result.page);
                        var nextPage = currentPage + 1;
                        if (nextPage > result.pages || lastPage) {
                            lastPage = true;
                            thatGrp.call('fetcher', 'stop');
                            //todo: hide a "show more" button to load more
                        } else {
                            page = nextPage;
                            //todo: show a "show more" button to load more
                        }
                    }

                    function afterNextFetch(nextResult) {
                        setNext(nextResult);
                        //rendering list next time
                        var opt_next = {
                            list_entities: thatGrp.call('collectionRequestGrp', 'addExtra', {
                                values: nextResult.docs
                            }),
                        };
                        thatGrp.call('listItemGrp', 'setup', opt_next);
                        pageLoading.status = false;
                    }

                    setNext(firstResult);

                    //rendering list fisrt time
                    var opt_ = {
                        container: container,
                        list_entities: thatGrp.call('collectionRequestGrp', 'add', {
                            values: firstResult.docs
                        }),
                        noListDataInfo: thatGrp.opt.noListDataInfo,
                    };
                    thatGrp.call('listItemGrp', 'render', opt_);

                    //scroll to end function
                    var opt_next = {
                        pageLoading: pageLoading,
                        lastPage: lastPage,
                        getUrl: getUrl,
                        afterNextFetch: afterNextFetch,
                        error: thatGrp.opt.error || function (err) {
                            throw err;
                        },
                    };
                    thatGrp.call('fetcher', 'setScrollEndFetch', opt_next);
                }).catch(this.opt.error || function (err) {
                    throw err;
                });
        }
    });


    return ListScrollEndFetchGrp;
});


define('tpl!templates/inputList', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="inputList">\n    <label>'+
((__t=( inputList_lable ))==null?'':__t)+
'</label>\n    <input name="'+
((__t=( inputList_name ))==null?'':__t)+
'" type="hidden" value="'+
((__t=( inputList_value ))==null?'':__t)+
'" />\n    <button class="btn btn-info btn-sm additem"><i class="fa fa-plus-circle" aria-hidden="true"></i>Add</button>\n    <div class="list_items"></div>\n</div>\n';
}
return __p;
}; });

define('inputList',['jquery', 'component', 'tpl!templates/inputList'
	], function ($, Component, tpl) {
    var InputList = Component.create('InputList');
    InputList.extend({
        tpl: tpl,
        defaultOpt: {
            inputList_name: 'inputList_name',
            inputList_lable: 'Add: ',
            inputList_value: '',
        },
    });

    return InputList;
});


define('tpl!templates/item_inputList', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class="list-group-item">\n    <h4 class="list-group-item-heading">'+
((__t=( item_value.heading ))==null?'':__t)+
'</h4>\n    <p class="list-group-item-text">\n        '+
((__t=( item_value.text ))==null?'':__t)+
'\n    </p>\n    <div class="accessories"></div>\n</li>\n';
}
return __p;
}; });

define('formOption',['jquery', 'optObj', 'button', 'input'], function ($, OptObj, Button, Input) {
    var FormOption = OptObj.create('FormOption');
    FormOption.extend({
        get: function (opt) {
            //setup form
            var input_user = Input.create('input_user');
            var input_desc = Input.create('input_desc');

            return {
                form_action: '/',
                form_method: 'POST',
                form_elements: [{
                        elem: input_user,
                        opt: {
                            keyColumnMap: {
                                input_value: 'heading'
                            },
                            input_id: 'inputtext',
                            input_name: 'heading',
                            input_type: 'text',
                            input_placeholder: 'User Name',
                            input_action: '/',
                        },
					},
                    {
                        elem: input_desc,
                        opt: {
                            keyColumnMap: {
                                input_value: 'text'
                            },
                            input_id: 'input_desc',
                            input_name: 'text',
                            input_type: 'text',
                            input_placeholder: 'Description',
                            input_action: '/',
                        },
					}]
            };
        },
        extractForm: function (opt) {
            var data = {};
            $.each(opt.inputData, function (index, obj) {
                if (obj.name == 'heading') data.heading = obj.value;
                if (obj.name == 'text') data.text = obj.value;
            });

            return data;
        },
    });
    return FormOption;
});

define('inputListGrp',['jquery', 'optGrp', 'inputList', 'promptFormGrp', 'listItemGrp', 'collectionRequestGrp', 'tpl!templates/item_inputList', 'button', 'formOption'
	], function ($, OptGrp, InputList, PromptFormGrp, ListItemGrp, CollectionRequestGrp, tpl, Button, FormOption) {
    var inputList = InputList.create('inputList');
    var promptFormGrp_Add = PromptFormGrp.create('promptFormGrp_Add');
    var listItemGrp = ListItemGrp.create('listItemGrp');
    var InputListGrp = OptGrp.create('InputListGrp');
    var collectionRequestGrp = CollectionRequestGrp.create('collectionRequestGrp');
    var formOption = FormOption.create('formOption');

	InputListGrp.extend({
		render: function(opt) {
			this.call('inputList', 'render', opt);
		},
	});

    InputListGrp.join(inputList, promptFormGrp_Add, listItemGrp, collectionRequestGrp, formOption);

    //form customization for add
    var form_Add = promptFormGrp_Add.getMember('form');
    form_Add.extend({
        beforeRender: function (opt) {
            var opt_ = {
                form_btn: 'Add',
                optionKey: null
            };

            this.setOpt(this.group.upCall('formOption', 'get', opt_)); //fromGrp > promptFormGrp_Add > inputListGrp
        },
        submit: function (opt) {
            if (!this.submitting && this.checkValid()) {
                this.submitting = true;
                var that = this;
                this.comp.find('.error').each(function (index) {
                    $(this).remove();
                });

                var inputData = this.serializeArray();

                var opt_ = $.extend({}, opt, {
                    inputData: inputData,
                    formOption: this.opt.formOption,
                });
                this.group.upCall('inputList', 'addItem', opt_); //fromGrp > promptFormGrp_Add > inputListGrp
                this.done(opt_);
            }
        }
    });

    //form customization for edit
    var promptFormGrp_Edit = PromptFormGrp.create('promptFormGrp_Edit');
    var form_Edit = promptFormGrp_Edit.getMember('form');
    form_Edit.extend({
        beforeRender: function (opt) {
            var opt_ = {
                form_btn: 'Edit',
                optionKey: opt.doc.optionKey || null
            };
            this.setOpt(this.group.upCall('formOption', 'get', opt_)); //formGrp > promptFormGrp_Edit > itemGrp
        },
        submit: function (opt) {
            if (!this.submitting) {
                this.submitting = true;
                var that = this;
                this.comp.find('.error').each(function (index) {
                    $(this).remove();
                });

                var inputData = this.serializeArray();

                //form_Edit will call its form Grp > promptFormGrp_Edit > itemGrp - item from the same group, then item will update its value
                //how item will update it value
                var opt_ = {
                    doc: this.group.upCall('formOption', 'extractForm', {
                        inputData: inputData
                    })
                };
                this.group.upCall('item', 'update', opt_); //formGrp > promptFormGrp_Edit > itemGrp
                this.group.upCall('inputList', 'updateInputValue'); //formGrp > promptFormGrp_Edit > itemGrp > listItemGrp > inputListGrp
                this.done(opt_);
            }
        }
    });

    //collectionRequestGrp customization
    var collection = InputListGrp.getMember('collection');
    collection.extend({
        defaultOpt: $.extend({}, collection.defaultOpt, {
            remote: false
        }),
    });


    //item customization
    var itemGrp = InputListGrp.getMember('itemGrp');

    var button_edit = Button.create('button_edit');
    button_edit.extend({
        defaultOpt: $.extend({}, Button.defaultOpt, {
            button_name: '<i class="fa fa-pencil-square-o"></i>&nbsp;Edit',
            button_class: 'btn-sm btn-primary edit',
            button_title: 'Edit'
        }),
        setup: function (opt) {
            var that = this;
            this.comp.on('click', function (e) {
                that.group.call('item', 'fetchAsync')
                    .then(function (data) {
                        var opt_prompt = {
                            container: $('#mnbody'),
                            doc: data
                        };
                        var prompt = that.group.getMember('promptFormGrp_Edit').create(); //itemGrp
                        prompt.render(opt_prompt);
                    });
            });
        },
    });

    var button_delete = Button.create('button_delete');
    button_delete.extend({
        defaultOpt: $.extend({}, Button.defaultOpt, {
            button_name: '<i class="fa fa-trash-o"></i>',
            button_class: 'btn-sm btn-danger delete',
            button_title: 'Delete'
        }),
        setup: function (opt) {
            var that = this;
            this.comp.on('click', function (e) {
                that.group.call('item', 'removeAsync')
                    .then(function () {
                        that.group.upCall('inputList', 'updateInputValue'); //itemGrp > listItemGrp > inputListGrp
                    });
            });
        },
    });

    itemGrp.join(button_edit, button_delete, promptFormGrp_Edit);

    var item = InputListGrp.getMember('item');
    item.extend({
        tpl: tpl,
        setAccessories: function (opt) {
            var $accessories = this.comp.find('.accessories');
            var opt_ = {
                container: $accessories
            };
            this.group.call('button_edit', 'render', opt_);
            this.group.call('button_delete', 'render', opt_);
        },
        setup: function (opt) {
            var that = this;
            //set accessories
            this.setAccessories(opt);
            return this.comp;
        },
        updateUI: function (opt) {
            if (opt && opt.doc) {
                var newHeading = opt.doc.heading;
                var newText = opt.doc.text;


                var oldHeading = this.comp.find('h4').html();
                if (newHeading && newHeading !== oldHeading) {
                    this.comp.find('h4').html(newHeading);
                }

                var oldText = this.comp.find('p').html();
                if (newText && newText !== oldText) {
                    this.comp.find('p').html(newText);
                }
            }
        }
    });

    //inputList customization
    inputList.extend({
        setup: function (opt) {
            var that = this;
            //setup button
            InputList.setup.call(this, opt);
            var btn = this.comp.find('button.additem');
            btn.on('click', function (e) {
                var opt_ = $.extend({}, opt, {
                    container: $('#mnbody'),
                });
                var prompt_form = (that.group.call('promptFormGrp_Add', 'create'));
                prompt_form.render(opt_)
            });

            //setup list items
            var list_entities = this.group.call('collectionRequestGrp', 'add', {
                values: opt.list_entities || this.getInputValue(),
            });
            var opt_ = {
                container: this.comp.find('.list_items'),
                list_entities: list_entities,
            };
            this.group.call('listItemGrp', 'render', opt_);
            this.updateInputValue();
            //return
            return this.comp;
        },
        getInputValue: function (opt) {
            var value = this.comp.find('input[type="hidden"]').val();
            try {
                return JSON.parse(decodeURIComponent(value));
            } catch (e) {
                return null;
            }
        },
        addItem: function (opt) {
            //rendering list next time
            var opt_next = {
                list_entities: this.group.call('collectionRequestGrp', 'addExtra', {
                    values: this.group.call('formOption', 'extractForm', opt)
                }),
            };
            this.group.call('listItemGrp', 'setup', opt_next);
            this.updateInputValue();
        },
        updateInputValue: function (opt) {
            var values = this.group.call('collectionRequestGrp', 'getValues');
            this.comp.find('input[type="hidden"]').val(encodeURIComponent(JSON.stringify(values)));
        }
    });

    return InputListGrp;
});


define('tpl!templates/inputList_selection', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="inputList">\n    <label>'+
((__t=( inputList_lable ))==null?'':__t)+
'</label>\n    <input name="'+
((__t=( inputList_name ))==null?'':__t)+
'" type="hidden" value="'+
((__t=( inputList_value ))==null?'':__t)+
'" />\n    <select class="c-select">\n        <option selected>'+
((__t=( inputList_header ))==null?'':__t)+
'</option>\n        ';
 _.each(inputList_options, function(option){ 
__p+='\n            <option value="'+
((__t=( option.key ))==null?'':__t)+
'">'+
((__t=( option.value ))==null?'':__t)+
'</option> \n        ';
 }); 
__p+='\n    </select>\n    <button class="btn btn-info btn-sm additem"><i class="fa fa-plus-circle" aria-hidden="true"></i>Add</button>\n    <div class="list_items"></div>\n</div>\n';
}
return __p;
}; });

define('formOption_selection',['jquery', 'optObj', 'button', 'input'], function ($, OptObj, Button, Input) {
    var FormOption = OptObj.create('FormOption');
    FormOption.extend({
        init: function () {
            OptObj.init.call(this);
            this.optionKey = 1;
        },
        setKey: function(opt) {
            this.optionKey = opt.optionKey;
        },
        get: function (opt) {
            var optionKey = opt.optionKey || this.optionKey;
            if (optionKey == '1') {
                //setup form
                var input_optionKey = Input.create('input_optionKey');
                var input_user = Input.create('input_user');
                var input_desc = Input.create('input_desc');

                return {
                    form_action: '/',
                    form_method: 'POST',
                    form_elements: [{
                            elem: input_user,
                            opt: {
                                keyColumnMap: {
                                    input_value: 'heading'
                                },
                                input_id: 'inputtext',
                                input_name: 'heading',
                                input_type: 'text',
                                input_placeholder: 'User Name',
                                input_action: '/',
                            },
					},
                        {
                            elem: input_desc,
                            opt: {
                                keyColumnMap: {
                                    input_value: 'text'
                                },
                                input_id: 'input_desc',
                                input_name: 'text',
                                input_type: 'text',
                                input_placeholder: 'Description',
                                input_action: '/',
                            },
					},
                        {
                            elem: input_optionKey,
                            opt: {
                                keyColumnMap: {
                                    input_value: 'optionKey'
                                },
                                input_id: 'input_optionKey',
                                input_name: 'optionKey',
                                input_type: 'hidden',
                                input_value: '1'
                            },
					}]
                };
            } else if (optionKey == '2') {
                //setup form
                var input_optionKey = Input.create('input_optionKey');
                var input_book = Input.create('input_book');
                var input_author = Input.create('input_author');

                return {
                    form_action: '/',
                    form_method: 'POST',
                    form_elements: [{
                            elem: input_book,
                            opt: {
                                keyColumnMap: {
                                    input_value: 'heading'
                                },
                                input_id: 'inputtext',
                                input_name: 'heading',
                                input_type: 'text',
                                input_placeholder: 'Book Name',
                                input_action: '/',
                            },
					},
                        {
                            elem: input_author,
                            opt: {
                                keyColumnMap: {
                                    input_value: 'text'
                                },
                                input_id: 'input_author',
                                input_name: 'text',
                                input_type: 'text',
                                input_placeholder: 'Author',
                                input_action: '/',
                            },
					},
                        {
                            elem: input_optionKey,
                            opt: {
                                keyColumnMap: {
                                    input_value: 'optionKey'
                                },
                                input_id: 'input_optionKey',
                                input_name: 'optionKey',
                                input_type: 'hidden',
                                input_value: '2'
                            },
					}]
                };
            }
        },
        extractForm: function (opt) {
            var data = {};
            $.each(opt.inputData, function (index, obj) {
                if (obj.name == 'optionKey') data.optionKey = obj.value;
                if (obj.name == 'heading') data.heading = obj.value;
                if (obj.name == 'text') data.text = obj.value;
            });

            return data;
        },
    });
    return FormOption;
});

define('inputListGrp_selection',['jquery', 'inputListGrp', 'tpl!templates/inputList_selection', 'formOption_selection'
	], function ($, InputListGrp, tpl, FormOption_selection) {
    var formOption = FormOption_selection.create('formOption');
    var inputListGrp_selection = InputListGrp.create('inputListGrp_selection');
    var inputList = inputListGrp_selection.getMember('inputList');
    var inputList_setup = inputList.setup;
    inputList.extend({
        tpl: tpl,
        defaultOpt: $.extend({}, inputList.defaultOpt, {
            inputList_lable: 'Choose and add: ',
            inputList_header: 'Select a source',
            inputList_options: [{
                key: '1',
                value: 'one'
            }, {
                key: '2',
                value: 'two'
            }]
        }),
        setup: function (opt) {
            var that = this;
            inputList_setup.call(this, opt);
            var selection = this.comp.find('select');
            selection.on('change', function () {
                var option = selection.find('option:selected');
                that.group.call('formOption', 'setKey', {
                    optionKey: option.val()
                });
            });
            return this.comp;
        },
    });

    inputListGrp_selection.override(formOption);


    return inputListGrp_selection;
});


define('tpl!templates/content', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<p class="'+
((__t=( content_class ))==null?'':__t)+
'">'+
((__t=( content_content ))==null?'':_.escape(__t))+
'</p>';
}
return __p;
}; });

define('content',['jquery', 'component', 'tpl!templates/content'
	], function ($, Component, tpl) {
    var Content = Component.create('Content');
    Content.extend({
        tpl: tpl,
        defaultOpt: {
            content_class: 'text-muted',
            content_content: ''
        },
        reset: function (opt) {
            var content = this.comp;
            content.empty().html(opt.content_content);
            if (opt.content_class) {
                content.attr('class',
                    function (i, c) {
                        return c.replace(/(^|\s)text-\S+/g, '');
                    });
                content.addClass(opt.content_class);
            }
        },
    });

    return Content;
});


define('tpl!templates/footer', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<footer class="bd-footer text-muted" role="contentinfo">\n  <div class="container">\n    <ul class="bd-footer-links">\n    </ul>\n  </div>\n</footer>';
}
return __p;
}; });

define('footer',['jquery', 'component', 'tpl!templates/footer'
	], function ($, Component, tpl) {
    var Footer = Component.create('Footer');
    Footer.extend({
        tpl: tpl,
        defaultOpt: {
            footer_link: [],
            footer_p: [],
        },
        setup: function (opt) {
            //links
            var opt_link = {
                container: this.comp.find('ul.bd-footer-links'),
                elements: opt.footer_link,
            }
            this.setElements(opt_link);
            
            //paragraphs
            var opt_p = {
                container: this.comp.find('div.container'),
                elements: opt.footer_p,
            }
            this.setElements(opt_p);
            
            return this.comp;
        },
    });

    return Footer;
});

define('autocomplete',['jquery', 'input', 'typeahead', 'bloodhound'
	], function ($, Input, typeahead, Bloodhound) {
    var Autocomplete = Input.create('Autocomplete');
    Autocomplete.extend({
        defaultOpt: $.extend({}, Autocomplete.defaultOpt, {
            input_class: 'typeahead',
            forceSelect: true,
        }),
        bloodhound: Bloodhound,
        setDataSource: function (opt) {
            // constructs the suggestion engine
            var opt_bloodhound = $.extend({}, {
                datumTokenizer: this.bloodhound.tokenizers.whitespace,
                queryTokenizer: this.bloodhound.tokenizers.whitespace,
                identify: function (obj) {
                    return obj._id;
                },
            }, opt.engine_opt || {});
            this.source = new this.bloodhound(opt_bloodhound);

            return $.extend({}, {
                source: this.source
            }, opt.source_opt || {});
        },
        setup: function (opt) {
            var that = this;
            this.inputElem = this.comp.find('input');

            var opt_typeahead = $.extend({}, {
                hint: true,
                highlight: true,
                minLength: 1,
                autoselect: true,
            }, opt.autocomplete_typeahead_opt || {});
            this.inputElem.typeahead(opt_typeahead, this.setDataSource(opt.autocomplete_bloodhound_opt || {}));

            this.comp.find('.typeahead.input-sm').siblings('input.tt-hint').addClass('hint-small');
            this.comp.find('.typeahead.input-lg').siblings('input.tt-hint').addClass('hint-large');

            //bind events
            this.input_hidden = $('<input type="hidden" name="' + this.inputElem.attr('name') + '_id">');
            if (opt.autocomplete_id) this.input_hidden.val(opt.autocomplete_id);
            this.comp.append(this.input_hidden);

            this.inputElem.bind('typeahead:select', function (ev, suggestion) {
                that.input_hidden.val(suggestion._id);
            });
            this.inputElem.bind('typeahead:change', function (ev) {
                var val = that.inputElem.typeahead('val');
                that.input_hidden.val('');
                if (val && val.length > 0 && that.opt.forceSelect) {
                    that.input_hidden.val('');
                    var skip = false;
                    that.source.search(val, function (datums) {
                        if (datums && datums.length > 0) {
                            skip = true;
                            that.input_hidden.val(datums[0]._id);
                            that.inputElem.typeahead('val', datums[0].name);
                        }
                    }, function (datums) {
                        if (!skip) {
                            if (datums && datums.length > 0) {
                                that.input_hidden.val(datums[0]._id);
                                that.inputElem.typeahead('val', datums[0].name);
                            }
                        }
                    });
                }
            });

            return this.comp;
        },
        checkValid: function (opt) {
            if (this.opt.forceSelect) {
                var input_hidden_id = this.input_hidden.val();
                if (input_hidden_id && input_hidden_id.length > 0) {
                    this.getResult({
                        invalidHints: false
                    });
                    return true;
                } else {
                    this.getResult({
                        invalidHints: 'invalid selection'
                    });
                    return false;

                }
            }
            return true;
        },
    });

    return Autocomplete;
});


define('tpl!templates/upload', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div>\n    <label class="'+
((__t=( upload_label_class ))==null?'':__t)+
'">'+
((__t=( upload_label_name ))==null?'':__t)+
'</label>\n    <div class="fineuploader">\n        <script type="text/template" class="qq-template-manual-trigger">\n            <div class="qq-uploader-selector qq-uploader" qq-drop-area-text="Drop files here">\n                <div class="qq-total-progress-bar-container-selector qq-total-progress-bar-container">\n                    <div role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" class="qq-total-progress-bar-selector qq-progress-bar qq-total-progress-bar"></div>\n                </div>\n                <div class="qq-upload-drop-area-selector qq-upload-drop-area" qq-hide-dropzone>\n                    <span class="qq-upload-drop-area-text-selector"></span>\n                </div>\n                <div class="buttons">\n                    <div class="qq-upload-button-selector qq-upload-button">\n                        <div>Select files</div>\n                    </div>\n                    <button type="button" class="trigger-upload" class="btn btn-primary">\n                        <i class="icon-upload icon-white"></i> Upload\n                    </button>\n                </div>\n                <span class="qq-drop-processing-selector qq-drop-processing">\n                    <span>Processing dropped files...</span>\n                    <span class="qq-drop-processing-spinner-selector qq-drop-processing-spinner"></span>\n                </span>\n                <ul class="qq-upload-list-selector qq-upload-list" aria-live="polite" aria-relevant="additions removals">\n                    <li>\n                        <div class="qq-progress-bar-container-selector">\n                            <div role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" class="qq-progress-bar-selector qq-progress-bar"></div>\n                        </div>\n                        <span class="qq-upload-spinner-selector qq-upload-spinner"></span>\n                        <img class="qq-thumbnail-selector" qq-max-size="100" qq-server-scale>\n                        <span class="qq-upload-file-selector qq-upload-file"></span>\n                        <span class="qq-edit-filename-icon-selector qq-edit-filename-icon" aria-label="Edit filename"></span>\n                        <input class="qq-edit-filename-selector qq-edit-filename" tabindex="0" type="text">\n                        <span class="qq-upload-size-selector qq-upload-size"></span>\n                        <button type="button" class="qq-btn qq-upload-cancel-selector qq-upload-cancel">Cancel</button>\n                        <button type="button" class="qq-btn qq-upload-retry-selector qq-upload-retry">Retry</button>\n                        <button type="button" class="qq-btn qq-upload-delete-selector qq-upload-delete">Delete</button>\n                        <span role="status" class="qq-upload-status-text-selector qq-upload-status-text"></span>\n                    </li>\n                </ul>\n\n                <dialog class="qq-alert-dialog-selector">\n                    <div class="qq-dialog-message-selector"></div>\n                    <div class="qq-dialog-buttons">\n                        <button type="button" class="qq-cancel-button-selector">Close</button>\n                    </div>\n                </dialog>\n\n                <dialog class="qq-confirm-dialog-selector">\n                    <div class="qq-dialog-message-selector"></div>\n                    <div class="qq-dialog-buttons">\n                        <button type="button" class="qq-cancel-button-selector">No</button>\n                        <button type="button" class="qq-ok-button-selector">Yes</button>\n                    </div>\n                </dialog>\n\n                <dialog class="qq-prompt-dialog-selector">\n                    <div class="qq-dialog-message-selector"></div>\n                    <input type="text">\n                    <div class="qq-dialog-buttons">\n                        <button type="button" class="qq-cancel-button-selector">Cancel</button>\n                        <button type="button" class="qq-ok-button-selector">Ok</button>\n                    </div>\n                </dialog>\n            </div>\n        </script>\n    </div>\n</div>';
}
return __p;
}; });

define('upload',['jquery', 'component', 'fineuploader', 'tpl!templates/upload'
	], function ($, Component, qq, tpl) {
    var Upload = Component.create('Upload');
    Upload.extend({
        tpl: tpl,
        defaultOpt: {
            upload_label_class: 'upload_label_class',
            upload_label_name: '',
            upload_endpoint: '/api/upload',
            upload_waitingPath: '/img/waiting-generic.png',
            upload_notAvailablePath: '/img/not_available-generic.png',
        },
        setup: function (opt) {
            var fineuploader = this.comp.find('.fineuploader');
            var handler = fineuploader.fineUploader($.extend({
                template: fineuploader.find('.qq-template-manual-trigger'),
                request: {
                    endpoint: opt.upload_endpoint,
                    customHeaders: opt.upload_customHeaders || {},
                },
                thumbnails: {
                    placeholders: {
                        waitingPath: opt.upload_waitingPath,
                        notAvailablePath: opt.upload_notAvailablePath,
                    }
                },
                autoUpload: false,
            }, opt.upload_options || {}));

            if (opt.upload_options && opt.upload_options.autoUpload) {
                fineuploader.find('.trigger-upload').remove();
            } else {
                fineuploader.find('.trigger-upload').on('click', function (evt) {
                    handler.fineUploader('uploadStoredFiles');
                });
            }
        }
    });

    return Upload;
});


define('tpl!templates/iconToggle', ['underscore'], function (_) { return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<i class="iconToggle fa ';
 if (iconToggle_checked) { 
__p+=''+
((__t=( iconToggle_class_checked ))==null?'':__t)+
'';
 } else { 
__p+=''+
((__t=( iconToggle_class_unchecked ))==null?'':__t)+
'';
 } 
__p+='" aria-hidden="true"></i>';
}
return __p;
}; });

define('iconToggle',['jquery', 'component', 'tpl!templates/iconToggle'
	], function ($, Component, tpl) {
    var IconToggle = Component.create('IconToggle');
    IconToggle.extend({
        tpl: tpl,
        defaultOpt: {
            iconToggle_class_unchecked: 'fa-check-circle-o',
            iconToggle_class_checked: 'fa-check-circle',
            iconToggle_checked: false,
        },
        init: function (opt) {
            this.isProcessing = false;
        },
        setup: function (opt) {
            var that = this;
            this.comp.on('click', function (e) {
                e.preventDefault();
                that.toggle();
            });
        },
        toggle: function (opt) {
            if (!this.isProcessing) {
                this.isProcessing = true;
                if (this.opt.iconToggle_checked) {
                    this.unchecked();
                } else {
                    this.checked();
                }
            }
        },
        checked: function (opt) {
            this.afterChecked();
        },
        afterChecked: function (opt) {
            this.opt.iconToggle_checked = true;
            this.isProcessing = false;
            this.comp.removeClass(this.opt.iconToggle_class_unchecked)
                .addClass(this.opt.iconToggle_class_checked);
        },
        unchecked: function (opt) {
            this.afterUnchecked();
        },
        afterUnchecked: function (opt) {
            this.opt.iconToggle_checked = false;
            this.isProcessing = false;
            this.comp.removeClass(this.opt.iconToggle_class_checked)
                .addClass(this.opt.iconToggle_class_unchecked);
        },
    });

    return IconToggle;
});

