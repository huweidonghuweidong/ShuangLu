
nglh_app_module.controller('nglhAppFormInsurabilityController', ['$scope', '$rootScope', 'nglhAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$interval', '$filter', '$q',
    function ($scope, $rootScope, nglhAppService, $timeout, $http, appConstant, $window, $interval, $filter, $q) {

        //声明通用变量
        $scope.fullCheck = false;
        $scope.isLoading = false;
        $scope.ErrorSummary = new ErrorSummaryHelper($scope, this);
        $scope.otherInsuredAddressList = [];
        $scope.AppNum = nglhAppService.getAppNum();

        //告之事项和健康问卷
        $scope.Insurability = {};
        $scope.Insurability.Sections = {};
        $scope.Insurability.AppNum = $scope.AppNum;
        $scope.initInsurability = function () {
            $scope.Insurability = nglhAppService.GetInsurabilityQuestion($scope.AppNum);
            $scope.Insurability.AppNum = $scope.AppNum;
        }

        //<< Larry 20186222
        $scope.changeAllI = function () {
            var data = $scope.Insurability;

            if ($scope.chkAllI == 'Y') {
                angular.forEach(data.Sections.I.Questions, function (value, key, array) {
                    value.Answers[$scope.AppNum].Answer = 'N';
                });
            } else {
                angular.forEach(data.Sections.I.Questions, function (value, key, array) {
                    value.Answers[$scope.AppNum].Answer = '';
                });
            }
        }
        //>> Larry 20186222


        $scope.changeAllH = function () {
            var data = $scope.Insurability;

            if ($scope.chkAllH == 'Y') {
                angular.forEach(data.Sections.H.Questions, function (value, key, array) {
                    angular.forEach(value.Answers, function (value, key, array) {
                        value.Answer = 'N';
                    });
                });
            } else {
                angular.forEach(data.Sections.H.Questions, function (value, key, array) {
                    angular.forEach(value.Answers, function (value, key, array) {
                        value.Answer = '';
                    });
                });
            }


        }

        $scope.showLoading = function (isShown) {
            $timeout(function () {
                $scope.isLoading = isShown;
            }, 0);
        };

        $scope.Initial = function () {
            return true;
        }

        $scope.Submit = function () {
            var flag = true;
            var data = $scope.Insurability;
            var result = nglhAppService.SaveInsurabilityQuestion(data);
//            var result = nglhAppService.GetInsurabilityQuestionResult($scope.AppNum, 5);
//            if (result == "2") {
//                flag = true;
//            }
            if (result == null || result.JSON_RESULT_ERROR.length > 0) {
                flag = false;
                $scope.$apply(function () {
                    angular.forEach(result.JSON_RESULT_ERROR, function (value, key) {
                        $scope.ErrorSummary.add(value.errorCode, value.errorCode, value.errorMessage);
                    });
                });
            }

            return flag;
        }

        $scope.totalNum = '1';

        $scope.CommonInsurabilityDetails = new BusinessRules([
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var flag = false;
                        var answer = scope.value.Answer;
                        if ((!value || value == '') && answer == 'Y') {
                            flag = true;
                        }

                        if (flag) {
                            var msg = $filter('translate')('MESSAGE_EMPTY_INSURABILITY_CLIENT');
                            this.message = msg.format(scope.value.ClientName, scope.value.Sequence);
                        }

                        return flag;
                    }
                }
            })
         ]);

        $scope.CommonInsurabilityAnswers = new BusinessRules([
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var flag = false;
                        if (!value || value == '') {
                            flag = true;
                        }

                        if (flag) {
                            var msg = $filter('translate')('MESSAGE_EMPTY_COMMON_INSURABILITY');
                            this.message = msg.format(scope.value.Sequence);
                        }

                        return flag;
                    }
                }
            })
         ]);

        $scope.insurabilityDetailsRules = new BusinessRules([
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var flag = false;


                        if (!value || value == '') {
                            flag = true;
                        }

                        if (flag) {
                            var msg = $filter('translate')('MESSAGE_EMPTY_INSURABILITY_CLIENT');
                            this.message = msg.format(scope.value.ClientName, scope.value.Sequence);
                        }

                        return flag;
                    }
                }
            })
         ]);

        $scope.InsurabilityWeightRule = new BusinessRules([
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var flag = false;
                        var msg = '';
                        if (!value || value == '') {
                            msg = $filter('translate')('MESSAGE_EMPTY_INSURABILITY_WEIGHT');
                            flag = true;
                        }
                        else {
                            if (value < 1 || value > 200) {
                                msg = $filter('translate')('MESSAGE_INVALID_INSURABILITY_WEIGHT');
                                flag = true;
                            }
                        }

                        if (flag) {
                            this.message = scope.value.ClientName + msg.format('', scope.value.Sequence);
                        }

                        return flag;
                    }
                }
            })
         ]);

        $scope.InsurabilityHeightRule = new BusinessRules([
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var flag = false;
                        var msg = '';
                        if (!value || value == '') {
                            msg = $filter('translate')('MESSAGE_EMPTY_INSURABILITY_HEIGHT');
                            flag = true;
                        }
                        else {
                            if (value < 20 || value > 250) {
                                msg = $filter('translate')('MESSAGE_INVALID_INSURABILITY_HEIGHT');
                                flag = true;
                            }
                        }

                        if (flag) {
                            this.message = scope.value.ClientName + msg.format('', scope.value.Sequence);
                        }

                        return flag;
                    }
                }
            })
         ]);

        $scope.insurabilityForeignInsuredRules = new BusinessRules([
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var flag = false;
                        if (!value || value == '') {
                            flag = true;
                        }

                        if (flag) {
                            var msg = $filter('translate')('MESSAGE_EMPTY_COMMON_INSURABILITY');
                            this.message = msg.format(scope.value.Sequence);
                        }

                        return flag;
                    }
                }
            })
         ]);

        $scope.getInsurabilityAnswers = function (answers) {
            var result = [];
            angular.forEach(answers, function (value, key) {
                result.push(value);
            });

            return result;
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

                return _errorCount;
            }

            return -1;
        }
    }
]);