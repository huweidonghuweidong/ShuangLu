nglh_app_module.controller('nglhAppFormPaymentController', ['$scope', 'nglhAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$interval', '$filter', '$q',
    function ($scope, nglhAppService, $timeout, $http, appConstant, $window, $interval, $filter, $q) {

        //声明通用变量
        $scope.fullCheck = false;
        $scope.isLoading = false;
        $scope.ErrorSummary = new ErrorSummaryHelper($scope, this);
        $scope.policyHolderOfficeOrSchoolAddressTerritoryList1 = [];

        //声明页面变量 
        $scope.paymentDataList = {};
        $scope.OtherInsuredDataList = {};
        $scope.AllInsuredDataList = [];
        $scope.clientsForPaymentAccountArray = [];


        $scope.GLHApp = {};
        $scope.GLHApp.AgentInfo = {};
        $scope.GLHApp.AgentInfo.TerritoryCode = '';
        $scope.GLHApp.AgentInfo.Terr_nm = '';
        $scope.GLHApp.AgentInfo.Terr_nm_with_prov = '';

        //转账及其他
        $scope.Payment = {};
        $scope.Payment.ClassName = "Manulife.Cn.AWS.GLHAdmin.Interface.EGLHPaymentStepData";
        $scope.Payment.AppNum = nglhAppService.getAppNum();

        $scope.Payment.DebitAccount = {};
        $scope.Payment.DebitAccount.Debit = {};
        $scope.Payment.DebitAccount.Debit.AccountHolderClientId = '';
        $scope.Payment.DebitAccount.Debit.AccountHolderName = '';
        $scope.Payment.DebitAccount.Debit.AccountHolderIdType = '';
        $scope.Payment.DebitAccount.Debit.AccountHolderIdNumber = '';
        $scope.Payment.DebitAccount.Debit.BankCode = '';
        $scope.Payment.DebitAccount.Debit.BankAccountNumber = '';
        $scope.Payment.DebitAccount.Debit.ClassName = "Manulife.Cn.AWS.GLHAdmin.Interface.EGLHAccountDetail";
        $scope.Payment.BankAccountInfoList = [];
        $scope.Payment.SigningPlaceDesc = "";
        if ($scope.Payment.AppNum != undefined && $scope.Payment.AppNum != '') {

            $scope.GLHApp = nglhAppService.loadApplicationData($scope.Payment.AppNum);

            $scope.signTerrCdList = nglhAppService.loadSignTerrCdList($scope.Payment.AppNum);
            $scope.Payment.SigningPlace = $scope.GLHApp.AgentInfo.TerritoryCode;

            angular.forEach($scope.signTerrCdList, function (name) {
                if ($scope.GLHApp.AgentInfo.TerritoryCode == name.key) {
                    $scope.Payment.SigningPlaceDesc = name.value;
                    $scope.Payment.SigningPlace = name.key;
                }
            });
            //			if ($scope.GLHApp.SignedArea != undefined && $scope.GLHApp.SignedArea != '') {
            //				$scope.Payment.SigningPlace = $scope.GLHApp.SignedArea;
            //			}else{
            //				$scope.Payment.SigningPlace = $scope.GLHApp.AgentInfo.TerritoryCode;
            //			}

            //Load Bank Account List
            $scope.paymentDataList = nglhAppService.loadPaymentDataList($scope.Payment.AppNum);
            //Load Other Insured List			
            $scope.OtherInsuredDataList = nglhAppService.loadOtherInsuredDataList($scope.Payment.AppNum);

            if ($scope.paymentDataList.length > 0) {
                var debitAcc = $scope.paymentDataList[0];
                if (debitAcc.AccountType == 'DDA') {
                    $scope.Payment.DebitAccount.Debit.AccountHolderClientId = debitAcc.AccountHolderClientId;
                    $scope.Payment.DebitAccount.Debit.AccountHolderName = debitAcc.AccountHolderName;
                    $scope.Payment.DebitAccount.Debit.AccountHolderIdType = debitAcc.AccountHolderIdType;
                    $scope.Payment.DebitAccount.Debit.AccountHolderIdNumber = debitAcc.AccountHolderIdNumber;
                    $scope.Payment.DebitAccount.Debit.BankCode = debitAcc.BankCode;
                    $scope.Payment.DebitAccount.Debit.OpeningBranchName = debitAcc.OpeningBranchName;
                    $scope.Payment.DebitAccount.Debit.OpeningBranchLocation = debitAcc.OpeningBranchLocation;
                    $scope.Payment.DebitAccount.Debit.BankAccountNumber = debitAcc.BankAccountNumber;
                    $scope.Payment.DebitAccount.Debit.BankAccountNumberConfirm = debitAcc.BankAccountNumber;

                    $scope.Payment.DebitAccount.Debit.IsDefaultPaymentAccount = debitAcc.IsDefaultPaymentAccount;
                }

            }

        }

        //加载通用信息 
        $scope.bankList = nglhAppService.loadCommonResourceList('bank_options');
        $scope.provinceList = nglhAppService.loadProvinceList();
        $scope.onPolicyHolderOfficeOrSchoolAddressProvinceChanged = function (provCd) {
            var policyholder = $scope.Payment.DebitAccount.Debit.OpeningBranchName;

            $scope.policyHolderOfficeOrSchoolAddressTerritoryList = nglhAppService.loadTerritoryList(provCd);
            $scope.Payment.DebitAccount.Debit.OpeningBranchLocation = null
            //policyholder.OfficeOrSchoolAddressCounty = null;

            var debitAccount = $scope.Payment.DebitAccount.Debit;
            if (debitAccount.OpeningBranchName == debitAccount.OpeningBranchName)
                $scope.ErrorSummary.remove("Payment.DebitAccount.Debit.OpeningBranchName", undefined);
        };

        $scope.InitialPolicyHolderOfficeOrSchoolAddressTerritoryList = function (provCd) {
            var policyholder = $scope.Payment.DebitAccount.Debit.OpeningBranchLocation;
            $scope.policyHolderOfficeOrSchoolAddressTerritoryList = nglhAppService.loadTerritoryList(provCd);
        };

        //----------------------------------------------------------------
        $scope.initDebitAccount = function () {

            if ($scope.paymentDataList.length > 0) {
                var debitAcc = $scope.paymentDataList[0];
                if (debitAcc.AccountType == 'DDA') {
                    $scope.Payment.DebitAccount.Debit.AccountHolderClientId = debitAcc.AccountHolderClientId;
                    $scope.Payment.DebitAccount.Debit.AccountHolderName = debitAcc.AccountHolderName;
                    $scope.Payment.DebitAccount.Debit.AccountHolderIdType = debitAcc.AccountHolderIdType;
                    $scope.Payment.DebitAccount.Debit.AccountHolderIdNumber = debitAcc.AccountHolderIdNumber;
                    $scope.Payment.DebitAccount.Debit.BankCode = debitAcc.BankCode;
                    $scope.Payment.DebitAccount.Debit.OpeningBranchName = debitAcc.OpeningBranchName;
                    $scope.Payment.DebitAccount.Debit.OpeningBranchLocation = debitAcc.OpeningBranchLocation;
                    $scope.Payment.DebitAccount.Debit.BankAccountNumber = debitAcc.BankAccountNumber;
                    $scope.Payment.DebitAccount.Debit.BankAccountNumberConfirm = debitAcc.BankAccountNumber;

                    $scope.Payment.DebitAccount.Debit.IsDefaultPaymentAccount = debitAcc.IsDefaultPaymentAccount;
                    $scope.Payment.DebitAccount.Debit.ClassName = "Manulife.Cn.AWS.GLHAdmin.Interface.EGLHAccountDetail";
                }
            }

            //set default value
            //            if (!$scope.Payment.DebitAccount.Debit.OpeningBranchName) {
            //                $scope.Payment.DebitAccount.Debit.OpeningBranchName = $scope.GLHApp.AgentInfo.Terr_nm + "分行";
            //            }
            //            if (!$scope.Payment.DebitAccount.Debit.OpeningBranchLocation) {
            //                $scope.Payment.DebitAccount.Debit.OpeningBranchLocation = $scope.GLHApp.AgentInfo.Terr_nm_with_prov;
            //            }

            $scope.AllInsuredDataList = $scope.getClientsForPaymentAccount();
            //$scope.matchPaymentAccountWithClient();			

        }

        $scope.getIdDocumentType = function (code) {
            return nglhAppService.loadIdDocumentType(code).value;
        };

        $scope.getBank = function (code) {
            return nglhAppService.loadBank(code).value;
        };

        //zheng 获取省 20186222
        $scope.getProvince = function (code) {
            var result = nglhAppService.loadProvince(code);
            return result;
        };
        //zheng 获取市 20186222
        $scope.getCity = function (proviceCode, cityCode) {
            var result = nglhAppService.loadCity(proviceCode, cityCode);
            return result;
        }



        // -------------------------
        // 转账及其他 start
        // -------------------------

        $scope.debitAccountHolderClientIdRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_DEBIT_ACCOUNT_HOLDER'),
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.debitBankCodeRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_DEBIT_ACCOUNT_BANK_CODE'),
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.DebitOpeningBranchNameRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_DEBIT_ACCOUNT_OPENINGBRANCH_NAME'),
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.debitOpeningBranchLocationCityRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_DEBIT_ACCOUNT_OPENING_BRANCH_LOCATION_CITY'),
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.debitOpeningBranchNameRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_DEBIT_ACCOUNT_OPENING_BRANCH_NAME'),
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_PAYMENT_DEBIT_ACCOUNT_OPENING_BRANCH_NAME_EXCESS_MAXIMUM_VALUE');
                    return _msg.format(OPENING_BRANCH_NAME_MAXIMUM_LENGTH, OPENING_BRANCH_NAME_MAXIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) > OPENING_BRANCH_NAME_MAXIMUM_LENGTH) {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.debitOpeningBranchLocationRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_DEBIT_ACCOUNT_OPENING_BRANCH_LOCATION'),
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_PAYMENT_DEBIT_ACCOUNT_OPENING_BRANCH_LOCATION_EXCESS_MAXIMUM_VALUE');
                    return _msg.format(OPENING_BRANCH_LOCATION_MAXIMUM_LENGTH, OPENING_BRANCH_LOCATION_MAXIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) > OPENING_BRANCH_LOCATION_MAXIMUM_LENGTH) {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.debitBankAccountNumberRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_DEBIT_ACCOUNT_BANK_ACCOUNT_NUMBER'),
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
            new Rule({
                message: $filter('translate')('MESSAGE_PAYMENT_DEBIT_ACCOUNT_BANK_ACCOUNT_NUMBER_NOT_MATCH_BANK_CODE'),
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var bankCode = $scope.Payment.DebitAccount.Debit.BankCode;
                            var accountNumber = value;

                            //<<20193011
                            //return $scope.chkBankCodeMatchBankAccountNumber(bankCode, accountNumber);

                            var checkRes = $scope.chkBankCodeMatchBankAccountNumber(bankCode, accountNumber);
                            if (bankCode == "004" && checkRes) {
                                this.message = "农行个人账号为19位，请您确认后重新输入，谢谢！"
                            }
                            return checkRes;
                            //>>20193011
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.debitBankAccountNumberConfirmRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_DEBIT_ACCOUNT_BANK_ACCOUNT_NUMBER_CONFIRM'),
                performCheck: function () {
                    return $scope.fullCheck;
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
            new Rule({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_DEBIT_ACCOUNT_BANK_ACCOUNT_NUMBER_CONFIRM_NOT_EQUAL_TO_BANK_ACCOUNT_NUMBER'),
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value != $scope.Payment.DebitAccount.Debit.BankAccountNumber)
                            return true;
                        return false;
                    }
                }
            })
        ]);

        // debit account holder id onChanged
        $scope.onDebitAccountHolderIDChanged = function () {
            var debitAccount = $scope.Payment.DebitAccount.Debit;
            $scope.clearBankAccount(debitAccount);
            var optList = $scope.getClientsForPaymentAccount();
            for (i = 0; i < optList.length; i++) {
                if (debitAccount.AccountHolderClientId == optList[i].ClientId) {
                    debitAccount.AccountHolderName = optList[i].Name;
                    debitAccount.AccountHolderIdType = optList[i].IdentityDocumentType;
                    debitAccount.AccountHolderIdNumber = optList[i].IdentityNumber;
                    break;
                }
            }
        };

        // debit account onChanged
        $scope.onDebitBankCodeChanged = function () {
            var debitAccount = $scope.Payment.DebitAccount.Debit;
            if (!$scope.chkBankCodeMatchBankAccountNumber(debitAccount.BankCode, debitAccount.BankAccountNumber))
                $scope.ErrorSummary.remove("Payment.DebitAccount.Debit.BankAccountNumber", undefined);
        };

        $scope.onDebitBankAccountNumberChanged = function () {
            var debitAccount = $scope.Payment.DebitAccount.Debit;
            if (debitAccount.BankAccountNumber == debitAccount.BankAccountNumberConfirm)
                $scope.ErrorSummary.remove("Payment.DebitAccount.Debit.BankAccountNumberConfirm", undefined);
        };

        $scope.chkBankCodeMatchBankAccountNumber = function (bankCode, bankAccountNo) {
            if (bankCode && bankAccountNo) {
                //<<20193011
                if (bankCode == "004" && bankAccountNo.length != 19) {
                    return true;
                }
                //>>20193011
                if (bankAccountNo.length > 19) {
                    //if (bankCode == "002" || bankCode == "004" || bankCode == "006") //20172276
                    //if (bankCode == "002" || bankCode == "004") //20172276 20193011
                    if (bankCode == "002") //20193011
                    //002 - 建设银行, 004 - 农业银行, 006 - 招商银行
                        return true;
                } else {
                    if (bankCode == "001") { //工商银行
                        if (bankAccountNo.length == 15 && (bankAccountNo.substr(0, 6) == "370246" || bankAccountNo.substr(0, 6) == "370247"))
                            return true;
                        if (bankAccountNo.length == 16 && (bankAccountNo.substr(0, 6) == "427020" || bankAccountNo.substr(0, 6) == "427030" || bankAccountNo.substr(0, 6) == "530970" || bankAccountNo.substr(0, 6) == "530990"))
                            return true;
                    } else if (bankCode == "003") { //中国银行
                        if (bankAccountNo.length == 15 || bankAccountNo.length == 16)
                            return true;
                    }
                    else if (bankCode == "006") {//招商银行 20172276
                        if (bankAccountNo.length != 12 && bankAccountNo.length != 14 && bankAccountNo.length != 15 && bankAccountNo.length != 16) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        $scope.initPaymentAccount = function () {

            if ($scope.paymentDataList.length > 1) {
                // Load Client List Data				
                for (var i = 1; i < $scope.paymentDataList.length; i++) {
                    var payAcc = $scope.paymentDataList[i];

                    if (payAcc.AccountType == 'DCA') {

                        $scope.Payment.BankAccountInfoList.push({
                            "ClassName": "Manulife.Cn.AWS.GLHAdmin.Interface.EGLHAccountDetail",
                            "AccountHolderClientId": payAcc.AccountHolderClientId,
                            "BankCode": payAcc.BankCode,
                            "OpeningBranchName": payAcc.OpeningBranchName,
                            "OpeningBranchLocation": payAcc.OpeningBranchLocation,
                            "BankAccountNumber": payAcc.BankAccountNumber,
                            "BankAccountNumberConfirm": payAcc.BankAccountNumber,
                            "AccountHolderName": payAcc.AccountHolderName,
                            "AccountHolderIdType": payAcc.AccountHolderIdType,
                            "AccountHolderIdNumber": payAcc.AccountHolderIdNumber
                        });
                    }
                }
            }

            if (!$scope.Payment.DebitAccount.Debit.IsDefaultPaymentAccount) {
                $scope.Payment.DebitAccount.Debit.IsDefaultPaymentAccount = "Y"; // set default value
            }

            $scope.clientsForPaymentAccountArray = $scope.getClientsForPaymentAccount();
            $scope.matchPaymentAccountWithClient();
        }

        $scope.showOtherPayAcct = function () {
            //辽宁、大连以及长沙地区中宏E家在线投保的账户设立中，扣款账户只能选择投保人，并且扣款账号同时设立为给付账号，默认为是，且不可修改。
            var isValid = true;

            //CS=长沙, DU=大连, AS/SY=辽宁
            var inValidTerritoryArr = ["AS", "CS", "DU", "SY"];
            for (i = 0; i < inValidTerritoryArr.length; i++) {
                if ($scope.GLHApp.AgentInfo.TerritoryCode == inValidTerritoryArr[i]) {
                    isValid = false;
                    break;
                }
            }
            return isValid;
        };

        $scope.matchPaymentAccountWithClient = function () {

            var optList = $scope.clientsForPaymentAccountArray;
            var bankAccList = $scope.Payment.BankAccountInfoList;
            if (bankAccList != null && bankAccList != undefined && bankAccList.length > 0) {
                for (j = 0; j < bankAccList.length; j++) {
                    //alert(j);
                    var clientFound = false;

                    for (i = 0; i < optList.length; i++) {
                        //update all client information
                        if (bankAccList[j].AccountHolderClientId == optList[i].ClientId) {
                            bankAccList[j].AccountHolderName = optList[i].Name;
                            bankAccList[j].AccountHolderIdType = optList[i].IdentityDocumentType;
                            bankAccList[j].AccountHolderIdNumber = optList[i].IdentityNumber;
                            //bankAccList[j].AccountHolderRelationshipToInsured = optList[i].RelationshipToInsured;

                            clientFound = true;

                            break;
                        }
                    }

                    if (!clientFound && bankAccList.length > 0) {
                        //remove this account
                        bankAccList.splice(j, 1);
                    }
                }
            }
        };

        $scope.addPaymentAccount = function () {
            $scope.Payment.BankAccountInfoList.push({
                "AccountHolderClientId": "",
                "BankCode": "",
                "OpeningBranchName": "",
                "OpeningBranchLocation": "",
                "BankAccountNumber": "",
                "BankAccountNumberConfirm": "",
                "AccountHolderName": "",
                "AccountHolderIdType": "",
                "AccountHolderIdNumber": ""
            });
        };

        $scope.deletePaymentAccount = function (account) {
            account.canDelete = true;

            var m = [];
            var list = $scope.Payment.BankAccountInfoList;

            for (var a in list) {
                if (list[a].canDelete != true) {
                    m.push(list[a]);
                }
            }

            angular.copy(m, $scope.Payment.BankAccountInfoList);
        };

        // 给付账户
        $scope.getClientsForPaymentAccount = function () {
            var m = [];


            //				m.push({
            //					"ClientId": $scope.Payment.DebitAccount.Debit.AccountHolderClientId,
            //					"Name": $scope.Payment.DebitAccount.Debit.AccountHolderName,
            //					"IdentityDocumentType": $scope.Payment.DebitAccount.Debit.AccountHolderIdType,
            //					"IdentityNumber": $scope.Payment.DebitAccount.Debit.AccountHolderIdNumber,
            //					"BankCode": $scope.Payment.DebitAccount.Debit.BankCode,
            //					"OpeningBranchName": $scope.Payment.DebitAccount.Debit.OpeningBranchName,
            //					"OpeningBranchLocation": $scope.Payment.DebitAccount.Debit.OpeningBranchLocation,
            //					"BankAccountNumber": $scope.Payment.DebitAccount.Debit.BankAccountNumber,
            //					"BankAccountNumberConfirm": $scope.Payment.DebitAccount.Debit.BankAccountNumberConfirm					
            //				});				

            //            var onlyOwner = $scope.showOtherPayAcct();

            if ($scope.OtherInsuredDataList.length > 0) {
                for (var i = 0; i < $scope.OtherInsuredDataList.length; i++) {
                    var client = $scope.OtherInsuredDataList[i];

                    //if(client.OpeningBranchName == undefined || client.OpeningBranchName == ''){	
                    //	client.OpeningBranchName = $scope.GLHApp.AgentInfo.Terr_nm + "分行";
                    //	client.OpeningBranchLocation = $scope.GLHApp.AgentInfo.Terr_nm_with_prov;
                    //}					

                    //                    if (onlyOwner || client.Relationship == "E") {
                    m.push({
                        "ClientId": client.AccountHolderClientId,
                        "Name": client.AccountHolderName,
                        "IdentityDocumentType": client.AccountHolderIdType,
                        "IdentityNumber": client.AccountHolderIdNumber,
                        "Relationship": client.Relationship
                        //						"BankCode": client.BankCode,
                        //						"OpeningBranchName": client.OpeningBranchName,
                        //						"OpeningBranchLocation": client.OpeningBranchLocation,
                        //						"BankAccountNumber": client.BankAccountNumber,
                        //						"BankAccountNumberConfirm": client.BankAccountNumberConfirm					
                    });
                    //                    }

                }
            }


            return m;
        };

        $scope.myFilter = function (item) {
            return item.Relationship === 'O';
        }

        $scope.clearBankAccount = function (account) {
            account.AccountHolderName = "";
            account.AccountHolderIdType = "";
            account.AccountHolderIdNumber = "";
            account.AccountHolderRelationshipToInsured = "";
            account.BankCode = "";
            account.OpeningBranchName = "";  //reset as default value
            account.OpeningBranchLocation = ""; //reset as default value
            account.BankAccountNumber = "";
            account.BankAccountNumberConfirm = "";
        }

        $scope.updateClientInfoForPaymentAccount = function (account) {
            $scope.clearBankAccount(account);
            var optList = $scope.getClientsForPaymentAccount();
            var bankAccList = $scope.Payment.BankAccountInfoList;
            for (i = 0; i < optList.length; i++) {
                for (j = 0; j < bankAccList.length; j++) {
                    if (account.AccountHolderClientId == optList[i].ClientId && account.AccountHolderClientId == bankAccList[j].AccountHolderClientId) {
                        bankAccList[j].AccountHolderName = optList[i].Name;
                        bankAccList[j].AccountHolderIdType = optList[i].IdentityDocumentType;
                        bankAccList[j].AccountHolderIdNumber = optList[i].IdentityNumber;
                        //                      bankAccList[j].BankCode = optList[i].BankCode;
                        //						bankAccList[j].OpeningBranchName = optList[i].OpeningBranchName;
                        //						bankAccList[j].OpeningBranchLocation = optList[i].OpeningBranchLocation;
                        //						bankAccList[j].BankAccountNumber = optList[i].BankAccountNumber;
                        //						bankAccList[j].BankAccountNumberConfirm = optList[i].BankAccountNumberConfirm;
                        break;
                    }
                }
            }
        };

        $scope.onDefaultPaymentAccountChanged = function () {
            var debitAccountHolderId = $scope.Payment.DebitAccount.Debit.AccountHolderClientId;
            if (debitAccountHolderId) {
                angular.forEach($scope.Payment.BankAccountInfoList, function (account) {
                    if (debitAccountHolderId == account.AccountHolderClientId) {
                        $scope.showLoading(true);
                        ShowConfirmationDialog("每位授权人仅可设立一个给付账号，原给付账号将被删除，是否继续?", "是", "否", function () {
                            var m = [];
                            var list = $scope.Payment.BankAccountInfoList;

                            for (var a in list) {
                                if (list[a].AccountHolderClientId != account.AccountHolderClientId) {
                                    m.push(list[a]);
                                }
                            }
                            angular.copy(m, $scope.Payment.BankAccountInfoList);
                            $scope.showLoading(false);
                        }, function () {
                            $scope.Payment.DebitAccount.Debit.IsDefaultPaymentAccount = "N";
                            $scope.showLoading(false);
                        });
                    }
                });
            }
        }

        // payment account validation rules

        $scope.onPaymentBankCodeChanged = function (idx) {
            var paymentAccount = $scope.Payment.BankAccountInfoList[idx];
            if (!$scope.chkBankCodeMatchBankAccountNumber(paymentAccount.BankCode, paymentAccount.BankAccountNumber))
                $scope.ErrorSummary.remove("account.BankAccountNumber", paymentAccount.$$hashKey);
        };

        //zheng
        $scope.onPolicyHolderOfficeOrSchoolAddressProvinceChanged1 = function (provCd, index) {
            var otherInsured = $scope.Payment.BankAccountInfoList
            $scope.policyHolderOfficeOrSchoolAddressTerritoryList1[index] = nglhAppService.loadTerritoryList(provCd);
            otherInsured[index].OpeningBranchLocation = null;
            var debitAccount = $scope.account;
            if (debitAccount.OpeningBranchName == debitAccount.OpeningBranchName)
                $scope.ErrorSummary.remove("account.OpeningBranchName", undefined);
        };

        $scope.InitialPolicyHolderOfficeOrSchoolAddressTerritoryList1 = function (provCd, index) {
            // var policyholder = $scope.Payment.DebitAccount.Debit.OpeningBranchLocation;
            $scope.policyHolderOfficeOrSchoolAddressTerritoryList1[index] = nglhAppService.loadTerritoryList(provCd);
        };

        $scope.onPaymentBankAccountNumberChanged = function (idx) {
            var paymentAccount = $scope.Payment.BankAccountInfoList[idx];
            if (paymentAccount.BankAccountNumber == paymentAccount.BankAccountNumberConfirm)
                $scope.ErrorSummary.remove("account.BankAccountNumberConfirm", paymentAccount.$$hashKey);
        };

        $scope.paymentAccountHolderClientIdRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_PAYMENT_ACCOUNT_HOLDER'),
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    return $filter('translate')('MESSAGE_REPEATED_PAYMENT_PAYMENT_ACCOUNT_HOLDER');
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var isRepeated = false;
                            if ($scope.Payment.DebitAccount.Debit.IsDefaultPaymentAccount == "Y") {
                                if ($scope.Payment.DebitAccount.Debit.AccountHolderClientId == value) {
                                    isRepeated = true;
                                }
                            }
                            if (!isRepeated) {
                                for (i = 0; i < scope.Payment.BankAccountInfoList.length; i++) {
                                    if (i != scope.$index && scope.Payment.BankAccountInfoList[i].AccountHolderClientId == value) {
                                        isRepeated = true;
                                    }
                                }
                            }
                            return isRepeated;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.paymentBankCodeRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_PAYMENT_PAYMENT_ACCOUNT_BANK_CODE');
                    var name = $scope.Payment.BankAccountInfoList[scope.$index].AccountHolderName;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.paymentOpeningBranchNameRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_PAYMENT_PAYMENT_ACCOUNT_OPENING_BRANCH_NAME');
                    var name = $scope.Payment.BankAccountInfoList[scope.$index].AccountHolderName;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_PAYMENT_PAYMENT_ACCOUNT_OPENING_BRANCH_NAME_EXCESS_MAXIMUM_VALUE');
                    var name = $scope.Payment.BankAccountInfoList[scope.$index].AccountHolderName;
                    var displayName = name ? name : "";
                    return _msg.format(displayName, OPENING_BRANCH_NAME_MAXIMUM_LENGTH, OPENING_BRANCH_NAME_MAXIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) > OPENING_BRANCH_NAME_MAXIMUM_LENGTH) {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.paymentOpeningBranchLocationRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_PAYMENT_PAYMENT_ACCOUNT_OPENING_BRANCH_LOCATION');
                    var name = $scope.Payment.BankAccountInfoList[scope.$index].AccountHolderName;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_PAYMENT_PAYMENT_ACCOUNT_OPENING_BRANCH_LOCATION_EXCESS_MAXIMUM_VALUE');
                    var name = $scope.Payment.BankAccountInfoList[scope.$index].AccountHolderName;
                    var displayName = name ? name : "";
                    return _msg.format(displayName, OPENING_BRANCH_LOCATION_MAXIMUM_LENGTH, OPENING_BRANCH_LOCATION_MAXIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) > OPENING_BRANCH_LOCATION_MAXIMUM_LENGTH) {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.paymentBankAccountNumberRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_PAYMENT_PAYMENT_ACCOUNT_BANK_ACCOUNT_NUMBER');
                    var name = $scope.Payment.BankAccountInfoList[scope.$index].AccountHolderName;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_PAYMENT_PAYMENT_ACCOUNT_BANK_ACCOUNT_NUMBER_NOT_MATCH_BANK_CODE');
                    var name = $scope.Payment.BankAccountInfoList[scope.$index].AccountHolderName;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var bankCode = $scope.Payment.BankAccountInfoList[scope.$index].BankCode;
                            var accountNumber = value;

                            //<<20193011
                            //return $scope.chkBankCodeMatchBankAccountNumber(bankCode, accountNumber);

                            var checkRes = $scope.chkBankCodeMatchBankAccountNumber(bankCode, accountNumber);
                            if (bankCode == "004" && checkRes) {
                                this.message = "农行个人账号为19位，请您确认后重新输入，谢谢！"
                            }
                            return checkRes;
                            //>>20193011
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.paymentBankAccountNumberConfirmRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_PAYMENT_PAYMENT_ACCOUNT_BANK_ACCOUNT_NUMBER_CONFIRM');
                    var name = $scope.Payment.BankAccountInfoList[scope.$index].AccountHolderName;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
            new Rule({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_PAYMENT_ACCOUNT_BANK_ACCOUNT_NUMBER_CONFIRM_NOT_EQUAL_TO_BANK_ACCOUNT_NUMBER'),
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value != $scope.Payment.BankAccountInfoList[scope.$index].BankAccountNumber)
                            return true;
                        return false;
                    }
                }
            })
        ]);

        // payment otherinfo validation
        $scope.otherInfoSignTerrCdRules = new BusinessRules([
            new Required({
                message: $filter('translate')('MESSAGE_EMPTY_PAYMENT_OTHER_INFO_SIGN_TERR_CD'),
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        // -------------------------
        // 转账及其他 end
        // -------------------------

        $scope.countLength = function (stringToCount) {
            //計算有幾個全型字、中文字...  
            var c = stringToCount.match(/[^ -~]/g);
            return stringToCount.length + (c ? c.length : 0);
        };

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
                $scope.showLoading(false);
                return _errorCount;
            }
            $scope.showLoading(false);
            return -1;
        };
        $scope.Initial = function () {
            return true;
        };

        //        $scope.Submit = function () {
        //            var flag = true;
        //            $scope.showLoading(true);

        //            nglhAppService.savePaymentData($scope.Payment).then(function (result) {

        //                //Submission result message
        //                var _msg = "";
        //                if (result.SubmissionResult != null) {
        //                    _msg = result.SubmissionResult.ErrorMessage;
        //                    ShowErrorDialog(_msg, null);
        //                    flag = false;
        //                }

        //                $scope.showLoading(false);
        //                return false;
        //            }, function (error) {
        //                if ((error) && error.length > 0) {
        //                    presentErrors(error, $scope, this);
        //                    flag = false;
        //                }

        //                $scope.showLoading(false);
        //            });

        //            return flag;
        //        };

        $scope.Submit = function () {
            var flag = true;
            var result = nglhAppService.savePaymentData($scope.Payment);
            if (result == null || result.JSON_RESULT_ERROR.length > 0) {
                flag = false;
                $scope.$apply(function () {
                    angular.forEach(result.JSON_RESULT_ERROR, function (value, key) {
                        $scope.ErrorSummary.add(value.errorCode, value.errorCode, value.errorMessage);
                    });
                });
            }

            return flag;
        };


    }
]);