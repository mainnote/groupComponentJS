define(['jquery', 'group', 'opt'
	], function ($, Grp, Opt) {
    var OptGrp = Grp.group.create('OptGrp');
    OptGrp.extend(Opt);
    return OptGrp;
});