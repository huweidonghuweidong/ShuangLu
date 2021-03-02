nglh_app_module.controller('nglhAppFormPlanController', ['$scope', '$compile', 'nglhAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$interval', '$filter', '$q',
    function ($scope, compile, nglhAppService, $timeout, $http, appConstant, $window, $interval, $filter, $q) {

        //声明通用变量
        $scope.fullCheck = false;
        $scope.isLoading = false;
        $scope.ErrorSummary = new ErrorSummaryHelper($scope, this);

        $scope.AppNum = nglhAppService.getAppNum();
        $scope.ProCode = nglhAppService.getCurrenProdCode();
        $scope.PlanDetail = {};
        $scope.PlanDetail.SharePremium = "";
        $scope.PlanDetail.ClientPlan = [];
        $scope.PlanDetail = nglhAppService.GetClientPlanSummary($scope.AppNum, $scope.ProCode);
        $scope.RenewInfo = nglhAppService.getRenewInfo(); //20191394获取续保信息  
        $scope.showLoading = function (isShown) {
            $timeout(function () {
                $scope.isLoading = isShown;
            }, 0);
        };

        $scope.getDeductDesc = function (code) {
            return nglhAppService.loadDeductDesc(code);
        };

        $scope.getDeductibleDesc = function (planId, type) {
            if (type === '00') {
                //免赔额 
                if (planId === '01' || planId === '03') {
                    return '0';
                } else if (planId === '02' || planId === '04') {
                    return '10000';
                }

            } else if (type === '01') {
                //公共保额 
                if (planId === '01' || planId === '02') {
                    return '50万';
                } else if (planId === '03' || planId === '04') {
                    return '100万';
                }
            }
            return "";
        };


        $scope.GetWarningMsg = function () {
            var msg = [];
            if ($scope.ProCode == 'GMMW') {
                angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
                    if ((value.PlanId == '01' || value.PlanId == '02') && value.Age >= 60) {
                        msg.push("*被保险人" + value.ClientName + "参保须进行体检！");
                    }

                    if ((value.PlanId == '03' || value.PlanId == '04') && value.Age >= 50) {
                        msg.push("*被保险人" + value.ClientName + "参保须进行体检！");
                    }
                });

            }
            return msg;
        }

        $scope.WarningMsg = $scope.GetWarningMsg();

        $scope.Initial = function () {
            return true;
        }


        $scope.openFreePreview = function () {

            var result = $('#freeIntro').html();
            var title = '免赔额';
            if (!result) {
                return;
            }
            var yesButton = function (dialog) {
                return {
                    text: "确定",
                    class: "buttonOrange buttonSmall",
                    click: function () {
                        $scope.ApplicationForm.IsAccepted = "Y";
                        $scope.$apply();
                        dialog.dialog('close');
                    },
                    style: "float:right;margin-right:50px"
                };
            };
            var noButton = function (dialog) {
                return {
                    text: "关闭",
                    class: "buttonOrange buttonSmall",
                    click: function () {
                        dialog.dialog('close');
                    },
                    style: "float:right;margin-right:20px"
                };
            };
            $scope.ShowPreview(result, title, $scope, yesButton, noButton);
        };


        $scope.openCommPreview = function () {

            var result = $('#commIntro').html(); ;
            var title = '公共保额';
            if (!result) {
                return;
            }
            var yesButton = function (dialog) {
                return {
                    text: "确定",
                    class: "buttonOrange buttonSmall",
                    click: function () {
                        $scope.ApplicationForm.IsAccepted = "Y";
                        $scope.$apply();
                        dialog.dialog('close');
                    },
                    style: "float:right;margin-right:50px"
                };
            };
            var noButton = function (dialog) {
                return {
                    text: "关闭",
                    class: "buttonOrange buttonSmall",
                    click: function () {
                        dialog.dialog('close');
                    },
                    style: "float:right;margin-right:20px"
                };
            };
            $scope.ShowPreview(result, title, $scope, yesButton, noButton);
        };


        $scope.openPlan = function (index) {

            var title = '保障计划一';
            if (index === '1') {
                title = '保障计划一';
            } else if (index === '2') {
                title = '保障计划二';
            } else if (index === '3') {
                title = '保障计划三';
            } else if (index === '4') {
                title = '保障计划四';
            }
            $scope.selectPlanIndex = index;
            var result = nglhAppService.getProductPlanDesc($scope.selectPlanIndex);
            if (!result) {
                return;
            }
            var yesButton = function (dialog) {
                return {
                    text: "确定",
                    class: "buttonOrange buttonSmall",
                    click: function () {
                        $scope.ApplicationForm.IsAccepted = "Y";
                        $scope.$apply();
                        dialog.dialog('close');
                    },
                    style: "float:right;margin-right:50px"
                };
            };
            var noButton = function (dialog) {
                return {
                    text: "关闭",
                    class: "buttonOrange buttonSmall",
                    click: function () {
                        dialog.dialog('close');
                    },
                    style: "float:right;margin-right:20px"
                };
            };
            $scope.ShowPreview(result, title, $scope, yesButton, noButton);
        };

        $scope.openRenew = function () {
            var parms = { "policyNum": $scope.RenewInfo.RenewContNo };
            var url = "../GroupCustomerSearch/GLHOverView";
            nglhAppService.postCurrent(url, parms);
        }

        $scope.showRenew = function (renewFlag, renewContNo) {
            var yesButton = function (dialog) {
                return {
                    text: "确认",
                    class: "buttonOrange buttonSmall",
                    click: function () {
                        dialog.dialog('close');
                    }
                    //                    style: "float:right;margin-right:50px"
                };
            };
            var _msg = "本次递交的保单为续保保单！";
            if (renewFlag=="3"){
                _msg = "已存在类似新单（" + renewContNo + "）递交，请确认是否继续本次投保！";
            }else if(renewFlag=="4") 
            {
                _msg = "已存在类似保单(" + renewContNo + ")正在续期中，请确认是否继续本次投保！";
            }
            var result = "<font style='font-size:18px;color:#00693c;font-weight:bold;'>"+_msg+"<font>";
            var _dialog_id = "app-notice-dialog-renew";
            var _dialog = $('#' + _dialog_id);
            var setting = {}
            setting.open = function (event, ui) {
                //$(this).siblings('.ui-dialog-titlebar').class = "ui-dialog-title";
                $(this).siblings('.ui-dialog-titlebar').remove();
                _dialog.empty();
                _dialog.append(result);
                _dialog.dialog("option", "position", _dialog.dialog("option", "position"));
            };
            setting.close = function (event, ui) {
                $('body').css('overflow-y', 'auto');
                enableTouchMove();
                $('div.ui-widget-overlay').off('click');
            };
            var buttons = {}
            if (yesButton) {
                buttons["Yes"] = yesButton(_dialog);
            }
            setting.buttons = buttons;
            setting.width = '400';
            setting.height = '200';
            setting.closeOnEscape = false;
            setting.position = 'center';
            setting.modal = true;
            setting.draggable = true;
            setting.resizable = false;
            setting.closable = false;
            setting.dialogClass = 'ui-dialog-custom';
            setting.minHeight = 150
            _dialog.dialog(setting);
        };

        $scope.ShowPreview = function (result, title, scope, yesButton, noButton) {
            var _dialog_id = "app-notice-dialog";
            var _dialog = $('#' + _dialog_id);

            $('body').css('overflow-y', 'hidden');

            var setting = {}
            setting.open = function (event, ui) {
                $(this).siblings('.ui-dialog-titlebar').class = "ui-dialog-title";

                _dialog.empty();
                _dialog.append(result);
                compile(_dialog.parent())(scope);
                _dialog.dialog("option", "position", _dialog.dialog("option", "position"));
            };

            setting.close = function (event, ui) {
                $('body').css('overflow-y', 'auto');
                enableTouchMove();
                $('div.ui-widget-overlay').off('click');
            };

            var buttons = {}
            //            if (yesButton) {
            //                buttons["Yes"] = yesButton(_dialog);
            //            }

            if (noButton) {
                buttons["No"] = noButton(_dialog);
            }
            setting.buttons = buttons;
            setting.width = '600';
            setting.height = '540';
            setting.closeOnEscape = false;
            setting.position = 'center';
            setting.modal = true;
            setting.draggable = true;
            setting.resizable = false;
            setting.closable = false;
            setting.dialogClass = 'ui-dialog-custom';
            setting.title = title;
            setting.minHeight = 150
            _dialog.dialog(setting);
            //            $('body').css('display', 'inline');    
        };


        $scope.Submit = function () {
            return true;
        }

        $scope._doValidation = function (type) {
            var _errorCount = 0;

            $scope.fullCheck = true;

            $scope.ErrorSummary.errors = {};

            var errSummaryBak = $scope.ErrorSummary;
            //$scope.ErrorSummary = ErrorSummaryHelper.init($scope, this);
            $scope.ErrorSummary = new ErrorSummaryHelper($scope, this, errSummaryBak.getFieldSets());
            //var inputs = $('input');
            //recursiveCheck($scope[$('form')[0].name]);

            $scope.ErrorSummary.checkFieldSets();

            _errorCount = $scope.ErrorSummary.errMessages.length;
            $scope.fullCheck = false;

            var errSummaryThisPage = $scope.ErrorSummary;
            $scope.ErrorSummary = errSummaryBak;
            $scope.ErrorSummary.merge(errSummaryThisPage);

            if (_errorCount > 0) {
                if (type > 0) {
                    var msg = "在这一页中发现" + _errorCount + "个错误。";
                    ShowConfirmErrorDialog(msg, function () {
                        $scope._navigateToStep(step).then(function () {
                            $scope.showLoading(false);
                            deferred.resolve();
                        }, function () {
                            $scope.showLoading(false);
                            deferred.reject();
                        });
                    }, function () {
                    });
                }

                return _errorCount;
            }
            return -1;
        }
    }
]).filter('transformIDType', function () {


    var IDTypeJson = [
         { "key": "11", "value": "居民身份证" },
         { "key": "14", "value": "军人证" },
         { "key": "17", "value": "中国护照" },
         { "key": "18", "value": "外国护照" },
         { "key": "19", "value": "港澳居民居住证" },
         { "key": "20", "value": "港澳居民居住证" },
         { "key": "21", "value": "台湾居民居住证" },
         { "key": "22", "value": "外国人永久居留证" },
         { "key": "23", "value": "港澳居民来往内地通行证" },
         { "key": "24", "value": "台湾居民来往大陆通行证" },
         { "key": "25", "value": "居民户口簿" },
         { "key": "26", "value": "出生医学证明" },
         { "key": "28", "value": "其他" }
    ]

    return function (item) {
        for (var i = 0; i < IDTypeJson.length; i++) {
            if (IDTypeJson[i].key === item) {
                return IDTypeJson[i].value;
            }
        }
    }

});