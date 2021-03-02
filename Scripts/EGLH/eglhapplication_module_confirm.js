eglhapplication_module.controller('eGLHAppFormConfirmController', ['$scope', 'eGLHAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$interval', '$filter', '$q',
    function ($scope, eGLHAppService, $timeout, $http, appConstant, $window, $interval, $filter, $q) {

        //声明通用变量
        $scope.homeCurrency = "元";
        $scope.fullCheck = false;
        $scope.isLoading = false;
        $scope.ErrorSummary = new ErrorSummaryHelper($scope, this);
        $scope.AppNum = eGLHAppService.getAppNum();
        $scope.IsMobileFlag = IsMobileBrowser();

        $scope.AppNum = eGLHAppService.getAppNum();
        $scope.PlanDetail = {};
        $scope.PlanDetail.ClientPlan = [];
        $scope.PlanDetail = eGLHAppService.GetClientPlanSummary($scope.AppNum);
        //$scope.AppNum = '0000091988';


        $scope.Submit = function () {
            if ($scope.ApplicationForm.DoneFlag != undefined && $scope.ApplicationForm.DoneFlag == 'Y') {
                return false;
            }

            var flag = true;
            var result = eGLHAppService.UpdateApplication($scope.ApplicationForm)

            if (result == null || result.JSON_RESULT_ERROR.length > 0) {
                flag = false;
            }

            return flag;
        }

        $scope.Initial = function () {
            if ($scope.ApplicationForm.DoneFlag != undefined && $scope.ApplicationForm.DoneFlag == 'Y') {
				navigateToForm(this,'div-4', true, 0);
				SetActiveTrackerColumnClass("投保单信息概要");
            }			
            return true;
        }

        $scope.GetWarningMsg = function () {
            var msg = [];
            angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
               // if ((value.PlanId == 'A001' || value.PlanId == 'A002') && value.Age >= 51) {//20184045
                if ((value.PlanId == 'A001' || value.PlanId == 'A002') && value.Age >= 60) {//20184045
                    msg.push("*被保险人" + value.ClientName + "参保须进行体检！");
                }

                // if ((value.PlanId == 'A003' || value.PlanId == 'A004') && value.Age >= 46) {//20184045
                if ((value.PlanId == 'A003' || value.PlanId == 'A004') && value.Age >= 50) {//20184045
                    msg.push("*被保险人" + value.ClientName + "参保须进行体检！");
                }
            });

            return msg;
        }

        $scope.WarningMsg = $scope.GetWarningMsg();

        $scope.paymentDataList = {};

        //Page 7 投保信息确认
        $scope.ApplicationForm = {};
        $scope.ApplicationForm.ViewedProposal = "N";
        $scope.ApplicationForm.DoneFlag = "N";		
        $scope.ApplicationForm.HasCfmNumFlg = "N";
        $scope.ApplicationForm.AppNum = $scope.AppNum;
        $scope.ApplicationForm.InitialPaymentMethod = '';
        $scope.ApplicationForm.ConfirmNum = '';
        $scope.ApplicationForm.ConfirmNumConfirm = '';
        $scope.ApplicationForm.TerritoryCode = '';
        $scope.ApplicationForm.InitialPaymentAmount = "";
        $scope.ApplicationForm.IsAccepted = "";

        $scope.GLHApp = {};
        $scope.GLHApp = eGLHAppService.loadApplicationData($scope.AppNum);
        $scope.ApplicationForm.TerritoryCode = $scope.GLHApp.AgentInfo.TerritoryCode;

        if ($scope.GLHApp.ConfirmNum != undefined && $scope.GLHApp.ConfirmNum != '') {
			$scope.ApplicationForm.HasCfmNumFlg = "Y";
			$scope.ApplicationForm.ConfirmNum = $scope.GLHApp.ConfirmNum;
		}
			
		if ($scope.GLHApp.Status != undefined && $scope.GLHApp.Status == '02') {
            $scope.ApplicationForm.DoneFlag = "Y";
            $scope.ApplicationForm.InitialPaymentMethod = $scope.GLHApp.InitialPaymentMethod;
            $scope.ApplicationForm.IsAccepted = "Y";
        } else {
            $scope.ApplicationForm.DoneFlag = "N";
            $scope.ApplicationForm.IsAccepted = "N";
            if ($scope.GLHApp.InitialPaymentMethod != undefined && $scope.GLHApp.InitialPaymentMethod != '') {
                $scope.ApplicationForm.InitialPaymentMethod = $scope.GLHApp.InitialPaymentMethod;
            } else {
                $scope.ApplicationForm.InitialPaymentMethod = "2";
            }

        }

        $scope.ApplicationSummary = {};
        $scope.ApplicationSummary = eGLHAppService.loadApplicationSummary($scope.AppNum);

        $scope.paymentDataList = {};

        $scope.initInitialPayment = function () {
            //Load Bank Account List			
            $scope.paymentDataList = eGLHAppService.loadPaymentDataList($scope.AppNum);

            if ($scope.paymentDataList.length > 0) {
                var debitAcc = $scope.paymentDataList[0];
                if (debitAcc.AccountType == 'DDA') {
                    $scope.ApplicationForm.AccountHolderClientId = debitAcc.AccountHolderClientId;
                    $scope.ApplicationForm.AccountHolderName = debitAcc.AccountHolderName;
                    $scope.ApplicationForm.AccountHolderIdType = debitAcc.AccountHolderIdType;
                    $scope.ApplicationForm.AccountHolderIdNumber = debitAcc.AccountHolderIdNumber;
                    $scope.ApplicationForm.BankCode = debitAcc.BankCode;
                    $scope.ApplicationForm.OpeningBranchName = debitAcc.OpeningBranchName;
                    $scope.ApplicationForm.OpeningBranchLocation = debitAcc.OpeningBranchLocation;
                    $scope.ApplicationForm.BankAccountNumber = debitAcc.BankAccountNumber;
                    $scope.ApplicationForm.BankAccountNumberConfirm = debitAcc.BankAccountNumber;
                }
            }
        }

        $scope.getIdDocumentType = function (code) {
            return eGLHAppService.loadIdDocumentType(code).value;
        };

        $scope.getBank = function (code) {
            return eGLHAppService.loadBank(code).value;
        };

        $scope.getPlanCvgDesc = function (cvgcode) {
            return eGLHAppService.loadPlanCvgDesc(cvgcode);
        };

        $scope.getDeductDesc = function (dedcode) {
            return eGLHAppService.loadDeductDesc(dedcode);
        };

        $scope.showPOSPay = function () {
            //辽宁、湖南等地区不出现“POS机刷卡缴费”
            var isValid = true;
            //CS=长沙, DU=大连, AS/SY=辽宁
            var inValidTerritoryArr = ["AS", "CS", "DU", "SY"];
            for (i = 0; i < inValidTerritoryArr.length; i++) {
                if ($scope.ApplicationForm.TerritoryCode == inValidTerritoryArr[i]) {
                    isValid = false;
                    break;
                }
            }
            return isValid;
        };

        $scope.disableChkPreview = function () {

            if (($scope.ApplicationForm.ViewedProposal != undefined && $scope.ApplicationForm.ViewedProposal == 'N') || ($scope.ApplicationForm.DoneFlag != undefined && $scope.ApplicationForm.DoneFlag == 'Y')) {
                return true;
            }
            return false;

        };

        $scope.submitEApp = function () {

        };


        $scope.doValidator = function (model, key) {
            var controller = $scope.ErrorSummary.getFieldSet(model, key).controller;

            if (controller != null) {
                doValidator(controller);
            }
        };

        $scope.doCheck = function () {
            
			return $scope._doValidation(1);
			
        };

        $scope.confirmEApp = function () {
            var flag = $scope.doCheck();
            if (flag == -1) {

                $scope.showLoading(true);
                eGLHAppService.confirm($scope.ApplicationForm).then(function (result) {
                    var msg = eGLHAppService.getDocumentList(result);
                    ShowMessageDialog(msg, "确定", function () {
                        confirmAppSubmit();
                    });
                    $scope.showLoading(false);
                }, function (error) {
                    if ((error) && error.length > 0) {
                        //ShowErrorDialog("确认失败:" + error[0].errorMessage);
                    }
                    $scope.showLoading(false);
                });

            }
        };


        $scope.ImageUpload = function () {
            eGLHAppService.callImageUpload($scope.AppNum);
        };


        $scope.setViewProposal = function () {
            $timeout(function () {
                $scope.ApplicationForm.ViewedProposal = "Y";
            });
        };

        $scope.openApplicationPreview = function (eAppNumber, revieCompleteCallback) {
            var url = eGLHAppService.getApplicationPreview();
            var loadStartCallback = function () {
                $scope.showLoading(true);
            };
            var loadCompleteCallback = function () {
                $scope.showLoading(false);
            };
            var loadFailCallback = function () {
                alert('Image cannot be loaded.');
                $scope.showLoading(false);
            };
            var viewAllCallback = function () {
                if (revieCompleteCallback) {
                    revieCompleteCallback();
                }
            };

            loadStartCallback();
            eGLHAppService.getApplicationPreviewPageCount($scope.ApplicationForm).then(function (result) {
                loadCompleteCallback();
                var pageCount = parseInt(result.CacheFiles.length);
                var urls = [];
                for (var i = 0; i < pageCount; i++) {
                    urls.push(url + "?PageNumber=" + i + '&AppNum=' + result.AppNum);
                }
                ShowEGLHImageDialog(urls, loadStartCallback, loadCompleteCallback, loadFailCallback, null, viewAllCallback);
            }, function (error) {
                ShowErrorDialog("无法获取投保单:" + error[0].errorMessage);
                $scope.showLoading(false);
            });
        };


        // -------------------------------
        // Confirmation validation rules
        // -------------------------------

        $scope.proposalInfoConfirmedProposalRules = new BusinessRules([
            new Rule({
                message: $filter('translate')('MESSAGE_APP_NOT_ACCEPTED'),
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && value != 'Y') {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.confirmationFormNumberRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_CONFIRM_CONFIRMATION_FORM_NUMBER'),
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
            new Rule({
                message: $filter('translate')('MESSAGE_CONFIRM_CONFIRMATION_FORM_NUMBER_WRONG'),
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var regDigi = /^[0-9]*$/;
                            var regUpper = /^([A-Z])+$/;
                            if ((value.length == 10) && (value.substr(0, 2) == "GA")
								&& regUpper.test(value.substr(2, 1))
								&& regDigi.test(value.substr(3, 7))) {
                                return false;
                            } else {
                                return true;
                            }
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: $filter('translate')('MESSAGE_CONFIRM_CONFIRMATION_FORM_NUMBER_DUPLICATE'),
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            return eGLHAppService.loadDuplicateConfirmNumber(value);
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.confirmationFormNumberConfirmRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_CONFIRM_CONFIRMATION_FORM_NUMBER_CONFIRM'),
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
            new Rule({
                message: $filter('translate')('MESSAGE_CONFIRM_CONFIRMATION_FORM_NUMBER_CONFIRM_NOT_EQUAL_TO_CONFIRMATION_FORM_NUMBER'),
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        if (value) {
                            var confirmationFormNumber = $scope.ApplicationForm.ConfirmNum;
                            if (confirmationFormNumber && value != confirmationFormNumber)
                                return true;
                        }
                        return false;
                    }
                }
            })
        ]);


        $scope.showLoading = function (isShown) {
            //trigger digest to refresh UI
            $timeout(function () {
                $scope.isLoading = isShown;
            }, 0);
        };

        $scope.navigateToStep = function (step) {

            $scope.showLoading(true);
            var deferred = $q.defer();
            var isLoadCompleted = $scope.isLoadItemCompleted();

            // Do not navigate if the step is still locked. and all async items are completely loaded 
            if (step.locked) {
                $scope.showLoading(false);
                deferred.reject();
            } else {
                //give little delay for UI to refresh before performing heavy loading
                var errorCount = 0;
                try {
                    alert(errorCount);
                    errorCount = $scope._doValidation(1);

                    if (errorCount > 0) {
                        var msg = "在这一页中发现" + errorCount + "个错误。";
                        ShowConfirmErrorDialog(msg, function () {
                            $scope._navigateToStep(step).then(function () {
                                $scope.showLoading(false);
                                deferred.resolve();
                            }, function () {
                                $scope.showLoading(false);
                                deferred.reject();
                            });
                        }, function () {
                            $scope.navigateToForm($scope.lastStep.stepTracker[0], false);
                            $scope.showLoading(false);
                            deferred.resolve();
                        });
                    } else {
                        if ($scope.lastStep) { //do not save when first time go into Edit eApp
                            $scope.saveEApp(false);
                        }
                        $scope._navigateToStep(step).then(function () {
                            $scope.showLoading(false);
                            deferred.resolve();
                        }, function () {
                            $scope.showLoading(false);
                            deferred.reject();
                        });
                    }
                }
                catch (ex) {
                    alert(ex);
                }
            }
            return deferred.promise;
        };

        $scope._doValidation = function (type) {
            if ($scope.ApplicationForm.DoneFlag != undefined && $scope.ApplicationForm.DoneFlag == 'Y') {
                return false;
            }

            var _errorCount = 0;

            $scope.fullCheck = true;

            $scope.ErrorSummary.errors = {};

            var errSummaryBak = $scope.ErrorSummary;
            //$scope.ErrorSummary = ErrorSummaryHelper.init($scope, this);
            $scope.ErrorSummary = new ErrorSummaryHelper($scope, this, errSummaryBak.getFieldSets());
            //var inputs = $('input');
            //recursiveCheck($scope[$('form')[0].name]);
			
            if ($scope.ApplicationForm.HasCfmNumFlg != undefined && $scope.ApplicationForm.HasCfmNumFlg == 'Y') {
				$scope.ErrorSummary.removeFieldSet("ApplicationForm.ConfirmNum",null);
				$scope.ErrorSummary.removeFieldSet("ApplicationForm.ConfirmNumConfirm",null);
            }			
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