eglhapplication_module.controller('eGLHAppFormPlanController', ['$scope', 'eGLHAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$interval', '$filter', '$q',
    function ($scope, eGLHAppService, $timeout, $http, appConstant, $window, $interval, $filter, $q) {

        //声明通用变量
        $scope.fullCheck = false;
        $scope.isLoading = false;
        $scope.ErrorSummary = new ErrorSummaryHelper($scope, this);

        $scope.AppNum = eGLHAppService.getAppNum();
        $scope.PlanDetail = {};
        $scope.PlanDetail.SharePremium = "";
        $scope.PlanDetail.ClientPlan = [];
        $scope.PlanDetail = eGLHAppService.GetClientPlanSummary($scope.AppNum);

        $scope.showLoading = function (isShown) {
            $timeout(function () {
                $scope.isLoading = isShown;
            }, 0);
        };

        $scope.getDeductDesc = function (code) {
            return eGLHAppService.loadDeductDesc(code);
        };		
		
        $scope.GetWarningMsg = function () {
            var msg = [];
            angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
                //                if ((value.PlanId == 'A001' || value.PlanId == 'A002') && value.Age >= 51) { 20184045
                if ((value.PlanId == 'A001' || value.PlanId == 'A002') && value.Age >= 60) {//20184045
                    msg.push("*被保险人" + value.ClientName + "参保须进行体检！");
                }

//                if ((value.PlanId == 'A003' || value.PlanId == 'A004') && value.Age >= 46) { 20184045
                if ((value.PlanId == 'A003' || value.PlanId == 'A004') && value.Age >= 50) {//20184045
                    msg.push("*被保险人" + value.ClientName + "参保须进行体检！");
                }
            });

            return msg;
        }

        $scope.WarningMsg = $scope.GetWarningMsg();

        $scope.Initial = function () {
            return true;
        }

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
]);