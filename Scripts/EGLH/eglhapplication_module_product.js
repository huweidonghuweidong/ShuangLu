eglhapplication_module.controller('eGLHAppFormProductController', ['$scope', 'eGLHAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$interval', '$filter', '$q', '$compile',
    function ($scope, eGLHAppService, $timeout, $http, appConstant, $window, $interval, $filter, $q, $compile) {

        //声明通用变量
        $scope.fullCheck = false;
        $scope.isLoading = false;
        $scope.ErrorSummary = new ErrorSummaryHelper($scope, this);
        $scope.otherInsuredAddressList = [];

        $scope.PlanDetail = {};
        $scope.AppNum = eGLHAppService.getAppNum();
        $scope.PlanDetail.SharePremium = "N";
        $scope.SharePremiumFlag = "Y";
        $scope.PlanDetail.ProdCode = "GMMU";
        $scope.AvailablePlan = [];
        $scope.DeductiblesList = [];
        $scope.PlanDetail.ClientPlan = [];
        $scope.ProdList = eGLHAppService.getAllProducts($scope.AppNum);
        angular.forEach($scope.ProdList, function (data, index, array) {
            data.ProductName = data.ProductCode + "—" + data.ProductName;
        });

        //Begin Warning
        $scope.WarningList = [];
        $scope.WarningTempList = [];
        $scope.Warning = {};
        $scope.Warning.addMessage = function (key, msg) {
            var index = $scope.getIndexByKey(key);
            if (index < 0) {
                var Warning = {};
                Warning.Key = key;
                Warning.Value = msg;
                $scope.WarningList.push(Warning);
            }
        }

        $scope.Warning.removeMessage = function (key) {
            var copyList = [];
            var copy = {};
            var target = {};
            var removedIndex = $scope.getIndexByKey(key);

            $scope.WarningTempList = $scope.WarningList;
            $scope.WarningList = [];

            for (var i = 0; i < $scope.WarningTempList.length; i++) {
                if (i != removedIndex) {
                    var warning = $scope.WarningTempList[i];
                    $scope.WarningList.push(warning);
                }
            }
        }

        $scope.Warning.getMessage = function (key) {
            var index = $scope.getIndexByKey(key);
            var msg = '';
            if (index > -1) {
                try {
                    msg = $scope.WarningList[index];
                } catch (e) {
                    alert(e);
                }
            }

            return msg;
        }

        $scope.getIndexByKey = function (key) {
            var index = -1;

            for (var i = 0; i < $scope.WarningList.length; i++) {
                var warning = $scope.WarningList[i];
                if (warning.Key == key) {
                    index = i;
                    break;
                }
            }

            return index;
        }


        //16岁到18岁
        $scope.CheckDOBWanings = function (scopeKey) {
            var target = "Owner.PlanId";
            var clients = $scope.PlanDetail.ClientPlan;
            var owner = {};

            angular.forEach(clients, function (data, index, array) {
                if (data.ReleationType == "E") {
                    owner = data;
                }
            });

            //check owner
            if (owner.$$hashKey == scopeKey) {
                if (owner.Age < 18 && owner.Age >= 16) {
                    $scope.Warning.removeMessage(target);
                    var _msg = "";
                    var value = owner.ClientName;

                    //主被保险人***为未成年人，请注意是否可以投保
                    var _msg = $filter('translate')('MESSAGE_INSURED_LESS_THAN_16_18');
                    _msg = _msg.format(value ? value : "");
                    $scope.Warning.addMessage(target, _msg);
                    return null;
                }


            } else {
                $scope.Warning.removeMessage(target);
            }
        }
        //End Warning


        $scope.onProductCodeChanged = function (obj, result, dtl) {
            $scope.getAvailablePlan();
            //$scope.onProductSelected(obj, result, dtl);
        };

        $scope.showLoading = function (isShown) {
            $timeout(function () {
                $scope.isLoading = isShown;
            }, 0);
        };

        $scope.CheckSharePremium = function (model, val) {
            var _isMatch = true;

            if (model == "cli.PlanId") {
                _isMatch = $scope.checkSameVal("cli.DedClass");
            } else {
                _isMatch = $scope.checkSameVal("cli.PlanId");
            }

            angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
                if (model == "cli.PlanId") {
                    if (value.PlanId != val && _isMatch != false) {
                        _isMatch = false;
                    }
                } else {
                    if (value.DedClass != val && _isMatch != false) {
                        _isMatch = false;
                    }
                }

                $scope.doValidator(model, value.$$hashKey);
            });

            if (_isMatch == true) {
                $scope.SharePremiumFlag = "Y";
            } else {
                $scope.SharePremiumFlag = "N";
                $scope.PlanDetail.SharePremium = "N";
                if (model == "cli.PlanId") {
                    angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
                        $scope.doValidator("cli.DedClass", value.$$hashKey);
                    });
                }
            }

            return _isMatch;
        }

        $scope.getReleationDesc = function (value) {
            var desc = "";
            if (value == "E") { desc = "本人"; }
            else if (value == "C") { desc = "子女"; }
            else if (value == "S") { desc = "配偶"; }
            else if (value == "P") { desc = "父母"; }
            else if (value == "T") { desc = "其他"; }
            return desc;
        };

        $scope.doValidator = function (model, key) {
            var controller = $scope.ErrorSummary.getFieldSet(model, key).controller;

            if (controller != null) {
                doValidator(controller);
            }
        };

        $scope.checkSameVal = function (obj) {
            var _isMatch = true;
            var val = "";

            if (obj == "cli.PlanId") {
                angular.forEach($scope.PlanDetail.ClientPlan, function (value, index) {
                    if (value.PlanId != val) {
                        val = value.PlanId;
                    }
                });

                angular.forEach($scope.PlanDetail.ClientPlan, function (value, index) {
                    if (value.PlanId != val && _isMatch != false) {
                        _isMatch = false;
                    }
                });

            } else {
                angular.forEach($scope.PlanDetail.ClientPlan, function (value, index) {
                    if (value.DedClass != val) {
                        val = value.DedClass;
                    }
                });

                angular.forEach($scope.PlanDetail.ClientPlan, function (value, index) {
                    if (value.DedClass != val && _isMatch != false) {
                        _isMatch = false;
                    }
                });
            }

            return _isMatch;
        }

        $scope.onProductSelected = function (obj, result, dtl) {
            eGLHAppService.loadProductPlanInfo(obj, result);

        };

        $scope.getProdData = function () {
            $scope.PlanDetail = eGLHAppService.GetClientPlanDetail($scope.AppNum);
            //if ($scope.PlanDetail.ProdCode != '*') {
            $scope.getAvailablePlan();
            if (!$scope.checkSameVal("cli.PlanId")) {
                $scope.SharePremiumFlag = "N";
            } else if (!$scope.checkSameVal("cli.DedClass")) {
                $scope.SharePremiumFlag = "N";
            }
            //}
        }

        $scope.getAvailablePlan = function () {
            var prodCode = $scope.PlanDetail.ProdCode;
            $scope.AvailablePlan = eGLHAppService.loadAvailablePlanList(prodCode);
            //$scope.AvailablePlan = eGLHAppService.availablePlanList;
            //$scope.DeductiblesList = eGLHAppService.loadDeductiblesList(prodCode);
            $scope.DeductiblesList = eGLHAppService.deductiblesList;
        }

        $scope.Initial = function () {
            return true;
        }

        $scope.Submit = function () {
            var flag = true;
            var data = $scope.PlanDetail;

            var result = eGLHAppService.SavePlanDetail(data);

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

        $scope.ClientFilter = function (type) {
            var result = [];
            angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
                if (value.LinkType == type) {
                    result.push(value);
                }
            });

            return result;
        };

        $scope.planSelectedRules = new BusinessRules([
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        if (!value || value == '*') {
                            this.message = $filter('translate')('MESSAGE_EMPTY_PLAN_SELECTED_TYPE')
                            return true;
                        }
                        else {
                            this.message = $scope.doPlanClientRuleCheck(scopeKey);
                            if (this.message == '') {
                                if (scope.cli.LinkType != 'O') {
                                    this.message = $scope.doPlanCoverRuleCheck(value);
                                } else {
                                    $scope.CheckDOBWanings(scopeKey);
                                }
                            }

                            if (this.message != '') {
                                return true;
                            }

                            return false;
                        }
                    }
                }
            })
         ]);

        $scope.deductiblesSelectedRules = new BusinessRules([
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        if (!value || value == '*') {
                            this.message = $filter('translate')('MESSAGE_EMPTY_DEDUCTIBLES_SELECTED_TYPE')
                            return true;
                        }
                        else {
                            this.message = "";
                            //this.message = $scope.doPlanClientRuleCheck(scopeKey); //20186893
                            if (scope.cli.LinkType != 'O') {
                                this.message = $scope.doDedLvlCheck(value, scopeKey);
                            }

                            if (this.message != '') {
                                return true;
                            }

                            return false;
                        }
                    }
                }
            })
         ]);

        //rules
        //前台校验规则
        //证件类型
        $scope.productCodeSelectedRules = new BusinessRules([
            new Rule({
                message: $filter('translate')('MESSAGE_EMPTY_PRODUCT_SELECTED_TYPE'),
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        if (!value || value == '*') {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);


        $scope.doPlanClientRuleCheck = function (scopeKey) {

            var spouseCount = 0;
            var parentCount = 0;
            var msg = "";
            var clients = $scope.PlanDetail.ClientPlan;
            var owner = {};
            var insueredSp = new Array();
            var insueredCh = new Array();
            var insueredPa = new Array();

            angular.forEach(clients, function (data, index, array) {
                //若主被保险人、被保险人的职业类别有大于3的情况，则提交时不允许提交
                //if (data.OccpClass > 3 && data.$$hashKey == scopeKey) {20184045
                if (data.OccpClass > 4 && data.$$hashKey == scopeKey) {//20184045 若主被保险人、被保险人的职业类别有大于4的情况，则提交时不允许提交
                    msg = "客户" + data.ClientName + "的职业类别不在参保的范围内!";
                }

                if (data.ReleationType == "E") {
                    owner = data;
                }
                else if (data.ReleationType == "C") {
                    insueredCh.push(data);
                }
                else if (data.ReleationType == "P") {
                    parentCount = parentCount + 1;

                    //if (parentCount > 1 && data.$$hashKey == scopeKey) { 20182045
                    if (parentCount > 2 && data.$$hashKey == scopeKey) {//20182045
                        //msg = "参保的客户与主被保险人的关系为父母的被保险人只能有一个!";20184045
                        msg = "参保的客户与主被保险人的关系为父母的被保险人不得超过2人!"; //20184045参保的客户与主被保险人的关系为父母的被保险人不得超过2人。
                        //parentCount = 0;//20191604
                    }

                    insueredPa.push(data);
                }
                else if (data.ReleationType == "S") {
                    spouseCount = spouseCount + 1;
                    if (spouseCount > 1 && data.$$hashKey == scopeKey) {
                        msg = "参保的客户与主被保险人的关系为配偶的被保险人只能有一个!";
                        spouseCount = 0;
                    }

                    insueredSp.push(data);
                }
            });
            //20191604
            if (msg == '' && spouseCount < 1 && parentCount >= 2) {
                msg = "夫妻均投保的情况下，父母人数可以为2人!";
            }



            if (msg != '') {
                return msg;
            }

            //check owner
            if (owner.$$hashKey == scopeKey) {
                if (owner.Age < 16 || owner.Age > 60) {
                    msg = "主被保险人" + owner.ClientName + "的年龄不在规定范围内！";
                }
            }

            // check insuerd
            //if (insueredSp.length > 1) {
            //    msg = "参保的客户与主被保险人的关系为配偶的被保险人只能有一个！";
            //}
            //else {
            //若被保险人资料区域录入的 [与主被保险人关系]选择的 配偶 的关系的被保险人不止一个，则提交时不允许提交
            angular.forEach(insueredSp, function (data) {
                if (data.$$hashKey == scopeKey) {
                    //if (data.Sex == "F") {
                    if (data.ReleationType == "S") {

                        //20186892 zheng  判断免赔额选择是否是 1W 或 2W  是则年龄扩大到65   （D002 1W     D003 2W）
                        //                        if (data.DedClass == "D002" || data.DedClass == "D003") {
                        //                            if (data.Age < 20 || data.Age > 65) {
                        //                                msg = "被保险人" + data.ClientName + "的年龄不在规定范围内！";
                        //                            }
                        //                        }
                        //                        else if (data.Age < 20 || data.Age > 60) {
                        //                            msg = "被保险人" + data.ClientName + "的年龄不在规定范围内！";
                        //                        }

                        //回退20186892修改内容
                        if (data.Age < 20 || data.Age > 60) {
                            msg = "被保险人" + data.ClientName + "的年龄不在规定范围内！";
                        }

                    }
                }
            });

            //check children
            angular.forEach(insueredCh, function (data) {
                if (data.$$hashKey == scopeKey) {
                    //var dayNum = eGLHAppService.calculateDay(data.BirthDay);
                    if (data.ReleationType == "C") {
                        // if (data.Age > 23 || data.DayNumber < 30) {20184045
                        if (data.Age > 30 || data.DayNumber < 30) {//20184045
                            msg = "被保险人" + data.ClientName + "的年龄不在规定范围内！";
                        }
                    }
                }
            });

            // check parents
            //if (insueredPa.length > 1) {
            //    msg = "参保的客户与主被保险人的关系为父母的被保险人只能有一个！";
            //}
            //else {
            angular.forEach(insueredPa, function (data) {
                if (data.$$hashKey == scopeKey) {
                    if (data.ReleationType == "P") {
                        //20186892 zheng  判断免赔额选择是否是 1W 或 2W  是则年龄扩大到65   （D002 1W     D003 2W）
                        //                        if (data.DedClass == "D002" || data.DedClass == "D003") {
                        //                            if (data.Age > 65) {
                        //                                msg = "被保险人" + data.ClientName + "的年龄不在规定范围内！";
                        //                            }
                        //                        }
                        //                        else if (data.Age > 60) {
                        //                            msg = "被保险人" + data.ClientName + "的年龄不在规定范围内！";
                        //                        }

                        //回退20186892修改内容
                        if (data.Age > 60) {
                            msg = "被保险人" + data.ClientName + "的年龄不在规定范围内！";
                        }
                    }
                }
            });

            return msg;
        };

        $scope.doPlanCoverRuleCheck = function (value) {
            var msg = "";
            var clients = $scope.PlanDetail.ClientPlan;
            var owner = {};
            angular.forEach(clients, function (data, index, array) {

                if (data.ReleationType == "E") {
                    owner = data;
                }
            });

            //check owner
            //若有被保险人选择的计划方案高于主被保险人的计划方案，则提交时不允许提交
            if (owner.PlanId < value) {
                msg = "其他被保险人的计划方案不能高于主被保险人的计划方案!";
            }

            return msg;
        };

        $scope.doDedLvlCheck = function (value, scopeKey) {
            var msg = "";
            var needChk = false;
            var clients = $scope.PlanDetail.ClientPlan;
            var owner = {};
            var tmpinsured = {};
            angular.forEach(clients, function (data, index, array) {
                if (data.ReleationType == "E") {
                    owner = data;
                }
                if (data.$$hashKey == scopeKey) {
                    tmpinsured = data;
                }
            });

            //check owner
            //若有被保险人选择的计划方案高于主被保险人的计划方案，则提交时不允许提交
            if (owner.PlanId == tmpinsured.PlanId) {
                needChk = true;
            }

            if (needChk) {
                //若有被保险人选择的免赔额金额低于主被保险人的免赔额金额，则提交时不允许提交
                if (owner.DedClass > value) {
                    msg = "其他被保险人的免赔额金额不能低于主被保险人的免赔额金额!";
                }
            }

            //回退20186892修改内容
            //            //20186892 zheng  判断免赔额选择是否是 1W 或 2W  是则年龄扩大到65   （D002 1W     D003 2W）
            //            if (tmpinsured.DedClass == "D002" || tmpinsured.DedClass == "D003") {
            //                if (tmpinsured.Age > 65) {
            //                    msg = "被保险人" + tmpinsured.ClientName + "的年龄不在规定范围内！";
            //                }
            //            }
            //            else if (tmpinsured.Age > 60) {
            //                msg = "被保险人" + tmpinsured.ClientName + "的年龄不在规定范围内！";
            //            }
            return msg;
        };

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

            spouseCount = 0;
            parentCount = 0;

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
