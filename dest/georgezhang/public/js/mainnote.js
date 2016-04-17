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
        if (this.hasOwnProperty('parentNames')) {
            newObj.parentNames = [];
            var len = this.parentNames.length;
            for (var i = 0; i < len; i++) {
                newObj.parentNames.push(this.parentNames[i]);
            }
        }

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
        //call member in this group
        if (memberName in this._memberList) {
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

/**
 * Adapted from the official plugin text.js
 *
 * Uses UnderscoreJS micro-templates : http://documentcloud.github.com/underscore/#template
 * @author Julien Cabanès <julien@zeeagency.com>
 * @version 0.2
 * 
 * @license RequireJS text 0.24.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint regexp: false, nomen: false, plusplus: false, strict: false */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, window: false, process: false, Packages: false,
  java: false */

(function () {
	var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
	
		xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
		
		bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
		
		buildMap = [],
		
		templateSettings = {
			evaluate	: /<%([\s\S]+?)%>/g,
			interpolate : /<%=([\s\S]+?)%>/g
		},

		/**
		 * JavaScript micro-templating, similar to John Resig's implementation.
		 * Underscore templating handles arbitrary delimiters, preserves whitespace,
		 * and correctly escapes quotes within interpolated code.
		 */
		template = function(str, data) {
			var c  = templateSettings;
			var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
				'with(obj||{}){__p.push(\'' +
				str.replace(/\\/g, '\\\\')
					.replace(/'/g, "\\'")
					.replace(c.interpolate, function(match, code) {
					return "'," + code.replace(/\\'/g, "'") + ",'";
					})
					.replace(c.evaluate || null, function(match, code) {
					return "');" + code.replace(/\\'/g, "'")
										.replace(/[\r\n\t]/g, ' ') + "; __p.push('";
					})
					.replace(/\r/g, '')
					.replace(/\n/g, '')
					.replace(/\t/g, '')
					+ "');}return __p.join('');";
			return tmpl;
			
			/** /
			var func = new Function('obj', tmpl);
			return data ? func(data) : func;
			/**/
		};

	define('tpl',[],function () {
		var tpl;

		var get, fs;
		if (typeof window !== "undefined" && window.navigator && window.document) {
			get = function (url, callback) {
				
				var xhr = tpl.createXhr();
				xhr.open('GET', url, true);
				xhr.onreadystatechange = function (evt) {
					//Do not explicitly handle errors, those should be
					//visible via console output in the browser.
					if (xhr.readyState === 4) {
						callback(xhr.responseText);
					}
				};
				xhr.send(null);
			};
		} else if (typeof process !== "undefined" &&
 				process.versions &&
 				!!process.versions.node) {
			//Using special require.nodeRequire, something added by r.js.
			fs = require.nodeRequire('fs');

			get = function (url, callback) {
				
				callback(fs.readFileSync(url, 'utf8'));
			};
		}
		return tpl = {
			version: '0.24.0',
			strip: function (content) {
				//Strips <?xml ...?> declarations so that external SVG and XML
				//documents can be added to a document without worry. Also, if the string
				//is an HTML document, only the part inside the body tag is returned.
				if (content) {
					content = content.replace(xmlRegExp, "");
					var matches = content.match(bodyRegExp);
					if (matches) {
						content = matches[1];
					}
				} else {
					content = "";
				}
				
				return content;
			},

			jsEscape: function (content) {
				return content.replace(/(['\\])/g, '\\$1')
					.replace(/[\f]/g, "\\f")
					.replace(/[\b]/g, "\\b")
					.replace(/[\n]/g, "")
					.replace(/[\t]/g, "")
					.replace(/[\r]/g, "");
			},

			createXhr: function () {
				//Would love to dump the ActiveX crap in here. Need IE 6 to die first.
				var xhr, i, progId;
				if (typeof XMLHttpRequest !== "undefined") {
					return new XMLHttpRequest();
				} else {
					for (i = 0; i < 3; i++) {
						progId = progIds[i];
						try {
							xhr = new ActiveXObject(progId);
						} catch (e) {}

						if (xhr) {
							progIds = [progId];  // so faster next time
							break;
						}
					}
				}

				if (!xhr) {
					throw new Error("require.getXhr(): XMLHttpRequest not available");
				}

				return xhr;
			},

			get: get,

			load: function (name, req, onLoad, config) {
				
				//Name has format: some.module.filext!strip
				//The strip part is optional.
				//if strip is present, then that means only get the string contents
				//inside a body tag in an HTML string. For XML/SVG content it means
				//removing the <?xml ...?> declarations so the content can be inserted
				//into the current doc without problems.

				var strip = false, url, index = name.indexOf("."),
					modName = name.substring(0, index),
					ext = name.substring(index + 1, name.length);

				index = ext.indexOf("!");
				
				if (index !== -1) {
					//Pull off the strip arg.
					strip = ext.substring(index + 1, ext.length);
					strip = strip === "strip";
					ext = ext.substring(0, index);
				}

				//Load the tpl.
				url = 'nameToUrl' in req ? req.nameToUrl(modName, "." + ext) : req.toUrl(modName + "." + ext);
				
				tpl.get(url, function (content) {
					content = template(content);
					
					if(!config.isBuild) {
					//if(typeof window !== "undefined" && window.navigator && window.document) {
						content = new Function('obj', content);
					}
					content = strip ? tpl.strip(content) : content;
					
					if (config.isBuild && config.inlineText) {
						buildMap[name] = content;
					}
					onLoad(content);
				});

			},

			write: function (pluginName, moduleName, write) {
				if (moduleName in buildMap) {
					var content = tpl.jsEscape(buildMap[moduleName]);
					write("define('" + pluginName + "!" + moduleName  +
  						"', function() {return function(obj) { " +
  							content.replace(/(\\')/g, "'").replace(/(\\\\)/g, "\\")+
  						"}});\n");
				}
			}
		};
		return function() {};	
	});
//>>excludeEnd('excludeTpl')
}());


define('tpl!templates/count.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<p></p>');}return __p.join('');}});

define('count',['jquery', 'component', 'tpl!templates/count.html'
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

            function addValue(values) {
                var entityCmd = that.group.call('Entity', 'create', 'entityCmd').command();
                var opt_ = {
                    value: values,
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
     var Collection = Collection.create();
     Collection.extend({
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
                 request_always: function (data_jqXHR, textStatus, jqXHR_errorThrow) {
                 },
             };
             this.group.call('Request', 'connect', opt_);
         }
     });

     var Entity = Entity.create();
     Entity.extend({
         remove: function (opt) {
             //back to collection to remove this entity
             var opt_ = {
                 connectMethod: 'DELETE',
                 entity: this.value,
                 callback: function (opt_callback) {
                     opt.callback(opt_callback);
                 }
             };
             this.group.call('Collection', 'connectEntity', opt_);

         },
         fetch: function (opt) {
             var opt_ = {
                 connectMethod: 'GET',
                 entity: this.value,
                 callback: function (opt_callback) {
                     opt.callback(opt_callback);
                 }
             };
             this.group.call('Collection', 'connectEntity', opt_);

         }
     });

     var Request = Request.create();

     CollectionGrp.join(Collection, Entity, Request);

     CollectionGrp.setCallToMember('Collection');
     return CollectionGrp;
 });


define('tpl!templates/form.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<form onsubmit="return false;" method="', form_method ,'" action="', form_action ,'"><fieldset></fieldset></form>');}return __p.join('');}});

define('form',['jquery', 'component', 'tpl!templates/form.html'
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

define('formGrp',['jquery', 'optGrp', 'form', 'request'
	], function ($, OptGrp, Form, Request) {
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
                var action = (this.opt.form_action || this.comp.attr('action')) + id || '';
                var method = this.opt.form_method || this.comp.attr('method');
                var inputData = this.serializeArray();
                //request
                var opt_ = {
                    request_url: action,
                    request_method: method,
                    request_data: inputData,
                    request_done: function (data, textStatus, jqXHR) {
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
            this.comp.append('<div class="error">' + opt.error + '</div>');
        },

    });

    var request = Request.create('request');

    FormGrp.join(form, request);

    FormGrp.setCallToMember('form');

    return FormGrp;
});


define('tpl!templates/item.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<li>', item_value ,'</li>');}return __p.join('');}});

define('item',['jquery', 'component', 'tpl!templates/item.html'
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


define('tpl!templates/list.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<ul class="clearfix"></ul>');}return __p.join('');}});

define('list',['jquery', 'component', 'tpl!templates/list.html',
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
                        noSetup: true,
                        list: that,
                        container: that.comp,
                        item_data: data,
                    };
                    var itemComp = itemCmd('render', opt_);
                    itemCmd('setup');
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


define('tpl!templates/prompt.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="promptTop">    <div class="promptHead">        <a class="top-left ios-button back" href="javascript:void(0)">Back</a>        <div class="promptTitle">', prompt_title ,'</div>        <a class="top-right ios-button done" href="javascript:void(0)">Done</a>    </div></div>');}return __p.join('');}});

define('prompt',['jquery', 'component', 'tpl!templates/prompt.html'
	], function ($, Component, tpl) {
	var Prompt = Component.create('Prompt');
	Prompt.extend({
        tpl: tpl,
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
            
            $('html, body').css({
                'overflow': 'hidden',
                'height': '100%'
            });
            $('html, body').on('mousewheel', function () {
                return false;
            });
        },
        enableScroll: function (opt) {
            $('html, body').css({
                'overflow': '',
                'height': ''
            });

            if (this.current) $(window).scrollTop(this.current);
            $('html, body').off('mousewheel');
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
            this.group.group.call('prompt', 'afterSubmit', opt);
        },
    });
    formGrp.override(form);

    PromptFormGrp.join(prompt, formGrp);
    PromptFormGrp.setCallToMember('prompt');

    return PromptFormGrp;
});


define('tpl!templates/textarea.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<textarea name="', textarea_name ,'" class="form-control" placeholder="', textarea_placeholder ,'">', textarea_value ,'</textarea>');}return __p.join('');}});

define('textarea',['jquery', 'component', 'tpl!templates/textarea.html', 'autosize'
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


define('tpl!templates/button.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<button class="btn ', button_class ,'" type="', button_type ,'" title="', button_title ,'">', button_name ,'</button>');}return __p.join('');}});

define('button',['jquery', 'component', 'tpl!templates/button.html'
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


define('tpl!templates/checkbox.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="form-group">    <label for="', checkbox_id ,'" class="', checkbox_label_class ,'">', checkbox_placeholder ,'</label>    <input type="checkbox" id="', checkbox_id ,'" name="', checkbox_name ,'" class="form-control"         '); if (checkbox_checked) {; __p.push('         checked        '); } ; __p.push('    >    <p class="hints"></p></div>');}return __p.join('');}});

define('checkbox',['jquery', 'component', 'tpl!templates/checkbox.html', 'bootstrap-switch'
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


define('tpl!templates/tagsinput.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="form-group">    <label for="', tagsinput_id ,'" class="', tagsinput_label_class ,'">        ', tagsinput_placeholder ,'    </label>    <select multiple name="', tagsinput_name ,'" class="form-control">    </select>    <p class="hints"></p></div>');}return __p.join('');}});

define('tagsinput',['jquery', 'component', 'tpl!templates/tagsinput.html', 'bootstrap-tagsinput'
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


define('tpl!templates/input.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="form-group">    <label for="', input_id ,'" class="', input_label_class ,'">', input_placeholder ,'</label>    <input type="', input_type ,'" id="', input_id ,'" name="', input_name ,'" class="form-control" placeholder="', input_placeholder ,'"         '); if (input_required) {; __p.push('         required         '); } ; __p.push('        '); if (input_autofocus) {; __p.push('         autofocus         '); } ; __p.push('        '); if (input_action) {; __p.push('         action="', input_action ,'"         '); } ; __p.push('                value="', input_value ,'"    >    <p class="hints"></p></div>');}return __p.join('');}});

define('input',['jquery', 'component', 'tpl!templates/input.html'
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
            console.log('checking');
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


define('tpl!templates/navbar.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<nav class="navbar ', navbar_placement ,'">  <div class="pull-right">      <button class="navbar-toggler pull-xs-right hidden-sm-up" type="button" data-toggle="collapse" data-target="#', navbar_id ,'">        &#9776;      </button>  </div>  <style>@media screen and (max-width: 542px) {    ul.nav li.nav-item {        width: 100%;        display: block;        clear: both;        text-align:left;        margin-left: 0 !important;    }        nav .nav-middle {        width: 80%;        height: 2.5em;    }}  </style>  <div class="nav-middle"></div>  <div class="collapse navbar-toggleable-xs menu-items" id="', navbar_id ,'">    <ul class="nav navbar-nav">    </ul>  </div></nav>');}return __p.join('');}});

define('navbar',['jquery', 'component', 'tpl!templates/navbar.html'
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


define('tpl!templates/navtags.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<ul class="nav nav-tabs"></ul>');}return __p.join('');}});

define('navtags',['jquery', 'component', 'tpl!templates/navtags.html'
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


define('tpl!templates/navBrand.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<a class="navbar-brand pull-left" href="', navBrand_url ,'">', navBrand_html ,'</a>');}return __p.join('');}});

define('navBrand',['jquery', 'component', 'tpl!templates/navBrand.html'
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


define('tpl!templates/navItem.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<li class="nav-item '); if (pullright){ ; __p.push('pull-right'); } ; __p.push(' '); if (active && activeOn === 'item'){ ; __p.push('active'); } ; __p.push('">    <a class="nav-link '); if (active && activeOn === 'link'){ ; __p.push('active'); } ; __p.push('" href="', navItem_url ,'">        <span class="label label-danger label-pill pull-right">'); if ( badge > 0 ){ ; __p.push('', badge ,''); } ; __p.push('</span>        ', navItem_html ,'    </a></li>');}return __p.join('');}});

define('navItem',['jquery', 'component', 'tpl!templates/navItem.html'
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


define('tpl!templates/navDropdownItem.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<li class="nav-item dropdown '); if (pullright){ ; __p.push('pull-right'); } ; __p.push(' '); if (active && activeOn === 'item'){ ; __p.push('active'); } ; __p.push('">    <span class="label label-danger label-pill pull-right">'); if ( badge > 0 ){ ; __p.push('', badge ,''); } ; __p.push('</span>    <a class="nav-link dropdown-toggle '); if (active && activeOn === 'link'){ ; __p.push('active'); } ; __p.push('" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">', navItem_html ,'</a>    <div class="dropdown-menu">    </div></li>');}return __p.join('');}});

define('navDropdownItem',['jquery', 'navItem', 'tpl!templates/navDropdownItem.html'
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


define('tpl!templates/navUserItem.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<li class="nav-item '); if (pullright){ ; __p.push('pull-right'); } ; __p.push(' '); if (active && activeOn === 'item'){ ; __p.push('active'); } ; __p.push('">    '); if (!navUserItem_user) { ; __p.push('        <a class="btn btn-secondary left" href="', navUserItem_signinUrl ,'" role="button">', navUserItem_signText ,'</a>        <a class="btn btn-success left" href="', navUserItem_signupUrl ,'" role="button">', navUserItem_signupText ,'</a>    '); } else { ; __p.push('      <li class="nav-item dropdown pull-right">          <span class="label label-danger label-pill pull-right">'); if ( badge > 0 ){ ; __p.push('', badge ,''); } ; __p.push('</span>          <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="', navItem_url ,'" role="button" aria-haspopup="true" aria-expanded="false"><img class="img-rounded profile_image" src="', navUserItem_user.profile_img ,'"/>', navUserItem_user.name ,'</a>          <div class="dropdown-menu">          </div>      </li>    '); } ; __p.push('</li>');}return __p.join('');}});

define('navUserItem',['jquery', 'navDropdownItem', 'tpl!templates/navUserItem.html'
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



define('tpl!templates/dropdownItem.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<a class="dropdown-item '); if (pullright){ ; __p.push('pull-right'); } ; __p.push('" href="', dropdownItem_url ,'">', dropdownItem_html ,'</a>');}return __p.join('');}});

define('dropdownItem',['jquery', 'component', 'tpl!templates/dropdownItem.html'
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


define('tpl!templates/dropdownDivider.html', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="dropdown-divider"></div>');}return __p.join('');}});

define('dropdownDivider',['jquery', 'component', 'tpl!templates/dropdownDivider.html'
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

