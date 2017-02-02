define(['jquery', 'listItemGrp'], function($, ListItemGrp) {

    var MyListItemGrp = ListItemGrp.create('MyListItemGrp');
    var item = MyListItemGrp.getMember('item');
    

    return MyListItemGrp;
});
