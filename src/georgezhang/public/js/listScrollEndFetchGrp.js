define(['jquery', 'group', 'listItemGrp', 'collectionGrp', 'fetcher'], function ($, Grp, ListItemGrp, CollectionGrp, Fetcher) {
    var ListScrollEndFetchGrp = Grp.group.create('ListScrollEndFetchGrp');
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
            if (opt) $.extend(opt_, this.initOpt, opt);
            this.setListScrollEndFetch(opt_);
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