define(['jquery', 'optGrp', '../../debug/debugGroup', '../../debug/debugMember'
	], function ($, OptGrp, DebugGroup, DebugMember) {
    var DebugGroupGrp = OptGrp.create('DebugGroupGrp');
    var debugGroup = DebugGroup.create('debugGroup');
    var debugMember = DebugMember.create('debugMember');

    debugGroup.extend({
        setup: function (opt) {
            DebugGroup.setup.call(this, opt);
            buildBlock({
                container: this.comp.find('.debugGroupMembers'),
                debug_member_map: opt.debug_member_map
            });
        }
    });

    function getAllMembers() {
        function _getMember(thisGroup) {
            var memberList = thisGroup._memberList;
            var ms = [];
            for (var key in memberList) {
                var member = {
                    _id: key,
                };
                var memberObj = memberList[key];
                member.obj = memberObj;
                if (memberObj.hasOwnProperty('_memberList')) {
                    member['members'] = _getMember(memberObj);
                }
                ms.push(member);
            }
            return ms;
        }
        return _getMember(this);
    }

    function buildBlock(opt) {
        if (opt.debug_member_map && $.isArray(opt.debug_member_map) && opt.debug_member_map.length > 0) {
            $.each(opt.debug_member_map, function (index, value) {
                if (value && value.hasOwnProperty('members') && $.isArray(value.members) && value.members.length > 0) {
                    debugGroup.create('debugGroup_' + value._id).render({
                        container: opt.container,
                        debug_group_name: value._id,
                        debug_obj: value.obj,
                        debug_member_map: value.members
                    });
                } else {
                    debugMember.create('debugMember_' + value._id).render({
                        container: opt.container,
                        debug_obj: value.obj,
                        debug_member_name: value._id
                    });
                }
            });
        } else {
            //first round only one object
            debugMember.create('debugMember_' + opt.module._id || 'noname').render({
                container: opt.container,
                debug_obj: opt.module,
                debug_member_name: opt.module._id || 'noID'
            });
        }
    }

    DebugGroupGrp.extend({
        set: function (opt) {
            if (opt.module && opt.module._memberList) {
                opt.debug_member_map = getAllMembers.call(opt.module);
            } else if (opt.members) {
                opt.debug_member_map = opt.members;
            }

            buildBlock(opt);
        },
    });

    DebugGroupGrp.join(debugGroup, debugMember);

    return DebugGroupGrp;
});
