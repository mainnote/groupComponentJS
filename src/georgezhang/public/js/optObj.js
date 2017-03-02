define(['jquery', 'group', 'opt'], function($, Grp, Opt) {
    var OptObj = Grp.obj.create('OptObj');
    OptObj.extend(Opt);
    return OptObj;
});
