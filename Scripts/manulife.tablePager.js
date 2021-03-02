; (function ($) {

    var TablePagerPlugin = function (element, options) {
        var currentPage = 1;
        var currentPagerIdx = 1;
        var totalPage = 1;
        var $table, $headers, $footer, $rows, $pageButtons, $divPageButtons, $divPageStatus, $firstButton, $lastButton, $prevButton, $nextButton;
        $table = $(element);
        $headers = $table.children("thead").children("tr:first").children("th");
        var obj = this;
        var _defaultSettings = {
            initPage: 1,
            pageSize: 10,
            pagerSize: 20,
            rowUnit: 1,
            prevText: '...',
            nextText: '...',
            firstText: '|<<',
            lastText: '>>|',
            pageButtonsDivCss: 'PageButtons',
            pageStatusDivCss: 'PageStatus',
            ignoreAttribute: 'ignore',
            displayRowAttribute: '',
            pageButtonsDivId:'',
            pageStatusDivId:''
        };
        var config = $.extend(
			_defaultSettings, options || {});

        assignPage();
        buildPageButtons();
        goToPage(config.initPage);

        // Public method
        //this.publicMethod = function(){};

        // Private method
        //var privateMethod = function(){};
        this.refresh = function () {
            assignPage();
            buildPageButtons();
            goToPage(currentPage);
        }

        function getPagerIdx(page) {
            return Math.floor((page - 1) / config.pagerSize) + 1;
        }

        function buildPageButtons() {
            $divPageButtons = $('#' + config.pageButtonsDivId).removeAttr("class");
            $divPageStatus = $('#' + config.pageStatusDivId).removeAttr("class");
            
            $divPageButtons.empty();
            $divPageStatus.empty();
            $divPageButtons.addClass(config.pageButtonsDivCss);
            $divPageStatus.addClass(config.pageStatusDivCss);
            if (totalPage > 0) {
                //first button
                var pageButton;
                $firstButton = $("<a href=''>" + config.firstText + "</a>&nbsp;&nbsp;&nbsp;").bind('click', function () {
                    if (currentPage == 1)
                        return false;
                    else
                        return goToPage(1);
                });
                
                $divPageButtons.append($firstButton);
                //prev pager
                $prevButton = $("<a href=''>" + config.prevText + "</a>").bind('click', function () {
                    return goToPage(currentPage - config.pagerSize);
                });
                if (totalPage <= config.pagerSize)
                    $prevButton.css('display', 'none');
                $divPageButtons.append($prevButton);
                //page buttons
                var currentPager = getPagerIdx(currentPage);
                for (var i = 1; i <= totalPage; i++) {
                    var pager = getPagerIdx(i);
                    if (pager == currentPager)
                        pageButton = $("<a style='' pagerIdx='" + pager + "' page='" + i + "' href=''>" + i + "</a>");
                    else
                        pageButton = $("<a style='display:none' pagerIdx='" + pager + "' page='" + i + "' href=''>" + i + "</a>");
                    $divPageButtons.append(pageButton);
                    pageButton.bind('click', function () {
                        return goToPage(parseInt($(this).attr('page')));
                    });
                }
                //next pager
                $nextButton = $("<a href=''>" + config.nextText + "</a>").bind('click', function () {
                    return goToPage(currentPage + config.pagerSize);
                });
                if (totalPage <= config.pagerSize)
                    $nextButton.css('display', 'none');
                $divPageButtons.append($nextButton);
                //last button
                $lastButton = $("&nbsp;&nbsp;&nbsp;<a href=''>" + config.lastText + "</a>").bind('click', function () {
                    if (currentPage == totalPage)
                        return false;
                    else
                        return goToPage(totalPage);
                });
                $divPageButtons.append($lastButton);
            }
            $pageButtons =  $divPageButtons.find('a');
            $pageButtons = $pageButtons.slice(2, $pageButtons.length - 2);
        }

        function assignPage() {
            var curPage = 0;
            $rows = $table.children("tbody").children("tr").each(function (index) {
                if ($(this).attr(config.ignoreAttribute) == undefined) {
                    if (index % (config.pageSize * config.rowUnit) == 0)
                        curPage++;
                    $(this).attr("page", curPage)
                }
            });
            totalPage = curPage;
            if (currentPage > totalPage)
                currentPage = totalPage;
        }

        function goToPage(page) {
            var earlierdate = new Date();
            if (totalPage > 0) {
                //hide all prager button
                $prevButton.css("display", "none");
                $nextButton.css("display", "none");
                $firstButton.css("display", "none");
                $lastButton.css("display", "none");

                if (page < 1)
                    page = 1;
                if (page > totalPage)
                    page = totalPage;
                //show/hide page buttons
                currentPage = page;
                $rows.css("display", "none");
                $rows.filter("[page='" + page + "']").each(function (index) {
                    if ($(this).attr(config.displayRowAttribute) != undefined || config.displayRowAttribute == '')
                        $(this).css("display", "");
                });
                $pageButtons.removeClass("current");
                $pageButtons.filter('[page="' + page + '"]').addClass("current");
                //navigate to pager
                currentPagerIdx = getPagerIdx(currentPage);
                $pageButtons.css("display", "none");
                $pageButtons.filter("[pagerIdx='" + currentPagerIdx + "']").css("display", "");
                //update page status
                var totalRecords = $rows.length / config.rowUnit;
                var s1 = (page - 1) * config.pageSize + 1;
                var s2 = (page * config.pageSize > totalRecords) ? totalRecords : page * config.pageSize;
                $divPageStatus.text("记录 " + s1 + "-" + s2 + " 条 / 总计 " + totalRecords + " 条");
                //show or hide page buttons
                if (currentPagerIdx > 1) {
                    $prevButton.css("display", "");
                    $firstButton.css("display", "");
                }
                if (currentPagerIdx < getPagerIdx(totalPage)) {
                    $nextButton.css("display", "");
                    $lastButton.css("display", "");
                }
            }

            return false;
        }

    };

    $.fn.tablePager = function (options) {
        return this.each(function () {
            var element = $(this);

            // Return early if this element already has a plugin instance
            //if (element.data('pager')) return;

            // pass options to plugin constructor
            var tablePagerPlugin = new TablePagerPlugin(this, options);

            // Store plugin object in this element's data
            element.data('pager', tablePagerPlugin);

        });
    };

})(jQuery);

