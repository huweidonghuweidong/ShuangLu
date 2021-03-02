eglhapplication_module.controller('eGLHAppFormNoticeController', ['$scope', 'eGLHAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$interval', '$filter', '$q',
    function ($scope, eGLHAppService, $timeout, $http, appConstant, $window, $interval, $filter, $q) {

        //声明通用变量
        $scope.fullCheck = false;
        $scope.isLoading = false;
        $scope.ErrorSummary = new ErrorSummaryHelper($scope, this);

        //显示错误信息和确保GeneralNotice复选框必选
        //--------------------------------Notice--------------------------------
        //投保须知
        $scope.GeneralNotice = {};
        $scope.GeneralNotice.AppNum = eGLHAppService.getAppNum();
        $scope.GeneralNotice.DclType = '1';
        $scope.GeneralNotice.VerNum = '01';
        $scope.GeneralNotice.VerReleaseDt = '2016-11-01';
        $scope.GeneralNotice.IsAccepted = '';

        $scope.updateSectionIndicator = function () {
            var isAccpted = $scope.GeneralNotice.IsAccepted;
            if (isAccpted == '') {
                $("#divGeneralNoticeErr").css('display', 'none');
                $("#divErrSummary").css('display', 'none');
            }
            else {
                $("#divGeneralNoticeErr").css('display', 'block');
                $("#divErrSummary").css('display', 'block');
            }
        };


        $scope.Initial = function () {
            return true;
        }

        //        $scope.Submit = function () {

        //            $scope.showLoading(true);

        //            eGLHAppService.initialSave($scope.GeneralNotice).then(function (result) {

        //                //Submission result message
        //                var _msg = "";
        //                if (result != undefined) {
        //                    if (result.SubmissionResult != null) {
        //                        _msg = result.SubmissionResult.ErrorMessage;
        //                        //ShowErrorDialog(_msg, null);					
        //                    }
        //                }


        //                $scope.showLoading(false);
        //                return false;
        //            }, function (error) {
        //                if ((error) && error.length > 0) {
        //                    presentErrors(error, $scope, this);
        //                }


        //                $scope.showLoading(false);
        //            });

        //            return true;
        //        };

        $scope.Submit = function () {
            var flag = true;
            var result = eGLHAppService.initialSave($scope.GeneralNotice);
            if (result == null || result.JSON_RESULT_ERROR.length > 0) {
                flag = false;
                $scope.$apply(function () {
                    angular.forEach(result.JSON_RESULT_ERROR, function (value, key) {
                        $scope.ErrorSummary.add(value.errorCode, value.errorCode, value.errorMessage);
                    });
                });
                $("#divErrSummary").css("display", "block");
            }
            return flag;
        };

        $scope.readGeneralNoticeRules = new BusinessRules([
            new Rule({
                message: $filter('translate')('MESSAGE_EMPTY_GENERAL_NOTICE_ACCEPT_INDICATOR'),
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value) {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.showLoading = function (isShown) {
            $timeout(function () {
                $scope.isLoading = isShown;
            }, 0);
        };

        $scope.doValidator = function (model, key) {
            var controller = $scope.ErrorSummary.getFieldSet(model, key).controller;

            if (controller != null) {
                doValidator(controller);
            }
        };

        $scope._doValidation = function (type) {
            var _errorCount = 0;

            $scope.fullCheck = true;

            $scope.ErrorSummary.errors = {};

            var errSummaryBak = $scope.ErrorSummary;
            $scope.ErrorSummary = new ErrorSummaryHelper($scope, this, errSummaryBak.getFieldSets());
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
                $scope.showLoading(false);
                return _errorCount;
            }
            $scope.showLoading(false);
            return -1;
        }
    }
]);