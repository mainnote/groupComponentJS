define(['jquery', 'optGrp', 'listItemGrp', 'collectionRequestGrp', 'fetcher'], function ($, OptGrp, ListItemGrp, CollectionRequestGrp, Fetcher) {
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
            };
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
