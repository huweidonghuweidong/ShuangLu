nglh_app_module.controller('nglhAppFormProductController', ['$scope', 'nglhAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$interval', '$filter', '$q', '$compile',
    function ($scope, nglhAppService, $timeout, $http, appConstant, $window, $interval, $filter, $q, $compile) {

        //声明通用变量
        $scope.fullCheck = false;
        $scope.isLoading = false;
        //        $scope.SharePremiumFlag = "N"
        $scope.ErrorSummary = new ErrorSummaryHelper($scope, this);
        $scope.otherInsuredAddressList = [];

        $scope.PlanDetail = {};
        $scope.AppNum = nglhAppService.getAppNum();
        $scope.PlanDetail.ProdCode = "*";
        $scope.AvailablePlan = [];
        $scope.PlanDetail.ClientPlan = [];
        $scope.ProdList = nglhAppService.getAllProducts($scope.AppNum);


        $scope.fourCatagoryNationalityList = nglhAppService.loadCommonResourceList('four_catagory_nationality_options');

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





        $scope.onProductCodeChanged = function (obj, result, dtl) {

            //产品被更改后，方案变成请选择
            angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
                value.PlanId = "*"
            })


            // $scope.getAvailablePlan();
            $scope.showProductSection();
            $scope.showProductPlanInfo();




        };

        $scope.showProductSection = function () {
            var prodCode = $scope.PlanDetail.ProdCode;

            var result = "";

            if (prodCode != "*") {
                result = nglhAppService.getProductSection(prodCode, "s");
            }

            //            if (!result) {
            //                //deferred.reject();
            //                return;
            //            }

            $scope.ShowProductSection(result, $scope, $compile);
        };

        $scope.showProductPlanInfo = function () {
            var prodCode = $scope.PlanDetail.ProdCode;

            var result = "";

            if (prodCode != "*") {
                result = nglhAppService.getProductPlanInfo(prodCode, "p");
            }


            //            if (!result) {
            //                //deferred.reject();
            //                return;
            //            }

            //alert(result);
            $scope.ShowProductPlanInfo(result, $scope, $compile);
        };

        $scope.ShowProductPlanInfo = function (result, scope, compile) {
            var _dialog_id = "app-planinfo-dialog";
            var _dialog = $('#' + _dialog_id);
            $('body').css('display', '');
            _dialog.empty();
            _dialog.append(result);

            compile(_dialog.parent())(scope);

            $('body').css('display', 'inline');
        };

        $scope.ShowProductSection = function (result, scope, compile) {
            var _dialog_id = "app-section-dialog";
            var _dialog = $('#' + _dialog_id);
            $('body').css('display', '');
            _dialog.empty();
            _dialog.append(result);

            compile(_dialog.parent())(scope);

            $('body').css('display', 'inline');
        };

        $scope.showLoading = function (isShown) {
            $timeout(function () {
                $scope.isLoading = isShown;
            }, 0);
        };


        $scope.GetPlanByName = function (planName) {
            var plan = {};

            angular.forEach($scope.AvailablePlan, function (value, key) {
                if (value.PlanName == planName && $.isEmptyObject(plan)) {
                    plan = value;
                }
            })
            return plan;
        };



        $scope.IsWsmCheckProd = function (prodCode) {
            var isWsmCheck = false;

            angular.forEach($scope.ProdList, function (value, key) {
                if (value.ProductCode == prodCode && value.IsCheckWsm == "Y") {
                    isWsmCheck = true;
                }
            })
            return isWsmCheck;
        };


        //        $scope.getReleationDesc = function (value) {
        //            var desc = "";
        //            if (value == "E") { desc = "本人"; }
        //            else if (value == "C") { desc = "子女"; }
        //            else if (value == "S") { desc = "配偶"; }
        //            else if (value == "P") { desc = "父母"; }
        //            else if (value == "T") { desc = "其他"; }
        //            return desc;
        //        };



        $scope.getReleation = function (relation, phRelation) {
            var desc = "";
            if (relation == "E") {
                if (phRelation == "I") { desc = "本人"; }
                else if (phRelation == "S") { desc = "配偶"; }
                return desc;
            }

            if (relation == "I") { desc = "本人"; }
            else if (relation == "C") { desc = "子女"; }
            else if (relation == "S") { desc = "配偶"; }
            else if (relation == "P") { desc = "父母"; }
            else if (relation == "T") { desc = "其他"; }
            else if (relation == "R") { desc = "投保人旁系亲属"; }
            else if (relation == "U") { desc = "投保人配偶旁系亲属"; }
            else if (relation == "V") { desc = "旁系亲属的配偶"; }
            return desc;
        }

        $scope.doValidator = function (model, key) {
            var controller = $scope.ErrorSummary.getFieldSet(model, key).controller;

            if (controller != null) {
                doValidator(controller);
            }
        };

        $scope.isBelongToFourCatagoryNations = function (nationCode) {
            var isBelong = false;
            if ($scope.fourCatagoryNationalityList == null || $scope.fourCatagoryNationalityList.count <= 0) {
                isBelong = true;
                return isBelong;
            }
            angular.forEach($scope.fourCatagoryNationalityList, function (value, key) {
                if (value.key == nationCode) {
                    isBelong = true;
                }
            })
            return isBelong;
        };


        $scope.CheckSharePremium = function (model, val, hashkey) {
            //            var _isMatch = true;

            //            if (model == "cli.PlanId") {
            //                _isMatch = $scope.checkSameVal("cli.DedClass");
            //            } else {
            //                _isMatch = $scope.checkSameVal("cli.PlanId");
            //            }

            //            angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
            //                if (model == "cli.PlanId") {
            //                    if (value.PlanId != val && _isMatch != false) {
            //                        _isMatch = false;
            //                    }
            //                } else {
            //                    if (value.DedClass != val && _isMatch != false) {
            //                        _isMatch = false;
            //                    }
            //                }

            //                $scope.doValidator(model, value.$$hashKey);
            //            });

            //            if (_isMatch == true) {
            //                $scope.SharePremiumFlag = "Y";
            //            } else {
            //                $scope.SharePremiumFlag = "N";
            //                $scope.PlanDetail.SharePremium = "N";
            //                if (model == "cli.PlanId") {
            //                    angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
            //                        $scope.doValidator("cli.DedClass", value.$$hashKey);
            //                    });
            //                }
            //            }

            //            return _isMatch;
            var _isMatch = true;
            angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
                if (val != value.PlanId) {
                    _isMatch = false;
                }
            });
            if (_isMatch != true) {
                $scope.SharePremiumFlag = "N";
                $scope.PlanDetail.SharePremium = "N";
            } else {
                $scope.SharePremiumFlag = "Y";
            }
            $scope.doValidator(model, hashkey);
        }


        $scope.checkSamePlan = function () {
            var _isMatch = true;
            var planId;
            angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
                if (planId && planId != value.PlanId) {
                    _isMatch = false;
                }
                planId = value.PlanId;
            });
            return _isMatch;
        }


        $scope.onProductSelected = function (obj, result, dtl) {
            nglhAppService.loadProductPlanInfo(obj, result);

        };

        $scope.getProdData = function () {
            $scope.PlanDetail = nglhAppService.GetClientPlanDetail($scope.AppNum);
            //$scope.SharePremiumFlag = $scope.PlanDetail.SharePremium;
            $scope.SharePremiumFlag = $scope.checkSamePlan() == true ? 'Y' : 'N';
            if ($scope.PlanDetail.ProdCode != '*') {
                $scope.showProductSection();
                $scope.showProductPlanInfo();

                // $scope.getAvailablePlan();
            }
        }



        $scope.getAvailablePlan = function () {
            var prodCode = $scope.PlanDetail.ProdCode;
            $scope.AvailablePlan = nglhAppService.loadAvailablePlanList(prodCode);
            //$scope.AvailablePlan = nglhAppService.availablePlanList;
            //$scope.DeductiblesList = nglhAppService.loadDeductiblesList(prodCode);
            //$scope.DeductiblesList = nglhAppService.deductiblesList;
        }

        $scope.Initial = function () {
            return true;
        }

        $scope.Submit = function () {
            var flag = true;
            var data = $scope.PlanDetail;

            var result = nglhAppService.SavePlanDetail(data);

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




        //Jack Li 筛选主从被保险人
        $scope.ClientFilter = function (type) {
            var result = [];
            angular.forEach($scope.PlanDetail.ClientPlan, function (value, key) {
                if (type == "P") {
                    if (value.ReleationType == "E") {//主被保人
                        result.push(value);
                    }
                } else {//去掉投保人和主被保人
                    if (value.ReleationType != "E") {
                        //                    if (value.InsuredOrder != 0 && value.InsuredOrder != 1) {
                        result.push(value);
                    }
                }
            });

            return result;
        };
        //initRules for GACPA,GAHPA,GAOPA
        $scope.initRules = new BusinessRules([
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {

                    //console.info(JSON.stringify(value.OwnerPlan));
                    //No18
                    if (["IRN", "PRK", "SYR"].indexOf(value.OwnerPlan.Nationality) > -1) {
                        this.message = "投保人国籍为我司禁止交易国家/地区（伊朗、朝鲜、叙利亚），无法承保";
                        return true;
                    }
                    return false;
                }
            }),
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    var clientNames = [];
                    angular.forEach(value.ClientPlan, function (data, index, array) {
                        //No12
                        //主被保险人、被保险人的职业类别有大于4的情况，则提交时不允许提交
                        if (data.OccpClass > 4) {
                            clientNames.push(data.ClientName);
                        }
                    })

                    if (clientNames.length > 0) {
                        this.message = "被保险人(" + clientNames.join(",") + ")职业类别超过4级，请检查";
                        return true;
                    }
                    return false;
                }
            }),
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    var clientNames = [];
                    angular.forEach(value.ClientPlan, function (data, index, array) {
                        //No19
                        if ($scope.isBelongToFourCatagoryNations(data.Nationality) == true) {
                            clientNames.push(data.ClientName);

                        }
                    })

                    if (clientNames.length > 0) {
                        this.message = "被保险人(" + clientNames.join(",") + ")国籍为我司禁止交易国家/地区（伊朗、朝鲜、叙利亚）或四类国家，无法承保";
                        return true;
                    }
                    return false;
                }
            }),
             new Rule({
                 message: '',
                 performCheck: function () {
                     return $scope.fullCheck;
                 },
                 isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                     var isExistWsmCus = false;
                     var clientNames = [];
                     angular.forEach(value.ClientPlan, function (data, index, array) {
                         //No20
                         if (data.IsWSM != "N") {
                             isExistWsmCus = true;
                         } else {
                             clientNames.push(data.ClientName);
                         }
                     })
                     if (value.OwnerPlan.IsWSM != "N") {
                         isExistWsmCus = true;
                     } else {
                         clientNames.push(value.OwnerPlan.ClientName);
                     }


                     if (isExistWsmCus == false && $scope.IsWsmCheckProd(value.ProdCode)) {
                         this.message = "(" + clientNames.join(",") + ")非WSM客户，不满足投保条件";
                         return true;
                     }
                     return false;
                 }
             }),
             new Rule({
                 message: '',
                 performCheck: function () {
                     return $scope.fullCheck;
                 },
                 isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                     var insueredE = new Array();
                     angular.forEach(value.ClientPlan, function (data, index, array) {
                         if ((data.ReleationType == "E" && data.PHRelationship == "I") || data.ReleationType == "I") {
                             insueredE.push(data);
                         }
                     });
                     //本人人数>1
                     if (insueredE.length > 1) {
                         this.message = "参保的客户与主被保险人的关系为本人的被保险人只能有一个;";
                         return true;
                     }
                     return false;
                 }
             }),
			    new Rule({
			        message: '',
			        performCheck: function () {
			            return $scope.fullCheck;
			        },
			        isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
			            var insueredSp = new Array();
			            angular.forEach(value.ClientPlan, function (data, index, array) {
			                if (data.ReleationType == "S" || (data.ReleationType == "E" && data.PHRelationship == "S")) {
			                    insueredSp.push(data);
			                }
			            });
			            //配偶人数>1
			            if (insueredSp.length > 1) {
			                this.message = "参保的客户与主被保险人的关系为配偶的被保险人只能有一个!";
			                return true;
			            }
			            return false;
			        }
			    }),
             new Rule({
                 message: '',
                 performCheck: function () {
                     return $scope.fullCheck;
                 },
                 isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                     var insuredCount = 0;
                     angular.forEach(value.ClientPlan, function (data, index, array) {
                         insuredCount++;
                     });
                     //No1
                     if (insuredCount < 3) {
                         this.message = "参保总人数小于3,不能投保";
                         return true;
                     }
                     return false;
                 }
             }),
               new Rule({
                   message: '',
                   performCheck: function () {
                       return $scope.fullCheck;
                   },
                   isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                       var insueredSp = new Array();
                       var insueredE = new Array();
                       angular.forEach(value.ClientPlan, function (data, index, array) {
                           if ((data.ReleationType == "E" && data.PHRelationship == "I") || data.ReleationType == "I") {
                               insueredE.push(data);
                           }
                           else if (data.ReleationType == "S" || (data.ReleationType == "E" && data.PHRelationship == "S")) {
                               insueredSp.push(data);
                           }
                       });

                       //No2
                       if (insueredE.length < 1 && insueredSp.length < 1) {
                           this.message = "不满足夫妻至少一人参保，投保人为夫妻双方其中一人的规则，请检查投保方案";
                           return true;
                       }
                       return false;
                   }
               }),
			   new Rule({
			       message: '',
			       performCheck: function () {
			           return $scope.fullCheck;
			       },
			       isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
			           var insueredSp = new Array();
			           var insueredE = new Array();
			           var insueredPa = new Array();
			           angular.forEach(value.ClientPlan, function (data, index, array) {
			               if ((data.ReleationType == "E" && data.PHRelationship == "I") || data.ReleationType == "I") {
			                   insueredE.push(data);
			               }
			               else if (data.ReleationType == "S" || (data.ReleationType == "E" && data.PHRelationship == "S")) {
			                   insueredSp.push(data);

			               }
			               else if (data.ReleationType == "P") {
			                   insueredPa.push(data);
			               }
			           });
			           //No3
			           if (((insueredE.length + insueredSp.length < 2) && insueredPa.length > 1) ||
					   (insueredE.length == 1 && insueredSp.length == 1 && insueredPa.length > 2)) {
			               this.message = "夫妻均投保的情况下，父母人数可以为2人";
			               return true;
			           }
			           return false;
			       }
			   }),
            new Rule({//主被保人
                message: "",
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    var clientNames = [];
                    if (value.ProdCode == "GACPA" || value.ProdCode == "GAHPA") {
                        //No5
                        angular.forEach(value.ClientPlan, function (data, index, array) {
                            if ((((data.ReleationType == "E" && data.PHRelationship == "I") || data.ReleationType == "I") || //本人
                                 (data.ReleationType == "S" || (data.ReleationType == "E" && data.PHRelationship == "S")) || //配偶
                                 (data.ReleationType == "T"))      //其它
                                 && data.Age > 65) {
                                clientNames.push(data.ClientName);
                            }
                        });
                        this.message = "被保险人({0})投保年龄大于65周岁，应为20-65周岁,不符合投保年龄要求";
                    } else if (value.ProdCode == "GAOPA") {
                        //No5
                        angular.forEach(value.ClientPlan, function (data, index, array) {
                            if ((((data.ReleationType == "E" && data.PHRelationship == "I") || data.ReleationType == "I") || //本人
                                 (data.ReleationType == "S" || (data.ReleationType == "E" && data.PHRelationship == "S")) || //配偶
                                 (data.ReleationType == "T"))      //其它
                                 && data.Age > 60) {
                                clientNames.push(data.ClientName);
                            }
                        });
                        this.message = "被保险人({0})投保年龄大于60周岁，应为20-60周岁,不符合投保年龄要求";
                    } else { }


                    if (clientNames.length > 0) {
                        this.message = this.message.format(clientNames.join(","));
                        return true;
                    }
                    return false;
                }
            }),
             new Rule({
                 message: "",
                 performCheck: function () {
                     return $scope.fullCheck;
                 },
                 isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                     var clientNames = [];

                     if (value.ProdCode == "GACPA" || value.ProdCode == "GAHPA") {
                         //No5
                         angular.forEach(value.ClientPlan, function (data, index, array) {
                             if ((((data.ReleationType == "E" && data.PHRelationship == "I") || data.ReleationType == "I") || //本人
                                 (data.ReleationType == "S" || (data.ReleationType == "E" && data.PHRelationship == "S")))//配偶
                                 && data.Age < 20) {
                                 clientNames.push(data.ClientName);
                             }
                         });
                         this.message = "被保险人({0})投保年龄小于20周岁，应为20-65周岁,不符合投保年龄要求";
                     } else if (value.ProdCode == "GAOPA") {
                         //No5
                         angular.forEach(value.ClientPlan, function (data, index, array) {
                             if ((((data.ReleationType == "E" && data.PHRelationship == "I") || data.ReleationType == "I") || //本人
                                 (data.ReleationType == "S" || (data.ReleationType == "E" && data.PHRelationship == "S")))//配偶
                                 && data.Age < 20) {
                                 clientNames.push(data.ClientName);
                             }
                         });
                         this.message = "被保险人({0})投保年龄小于20周岁，应为20-60周岁,不符合投保年龄要求";
                     } else { }


                     if (clientNames.length > 0) {
                         this.message = this.message.format(clientNames.join(","));
                         return true;
                     }
                     return false;
                 }
             }),
             new Rule({
                 message: "",
                 performCheck: function () {
                     return $scope.fullCheck;
                 },
                 isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                     var clientNames = [];

                     if (value.ProdCode == "GACPA" || value.ProdCode == "GAHPA" || value.ProdCode == "GAOPA") {
                         //No9
                         angular.forEach(value.ClientPlan, function (data, index, array) {
                             if (data.DayNumber < 30 && data.ReleationType == "C") {
                                 clientNames.push(data.ClientName);
                             }
                         });
                         this.message = "被保险人({0})投保年龄小于30天，应为30天-30周岁，不符合投保年龄要求";
                     } else { }


                     if (clientNames.length > 0) {
                         this.message = this.message.format(clientNames.join(","));
                         return true;
                     }
                     return false;
                 }
             }),
            new Rule({
                message: "",
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    var clientNames = [];

                    if (value.ProdCode == "GACPA" || value.ProdCode == "GAHPA" || value.ProdCode == "GAOPA") {
                        //No10
                        angular.forEach(value.ClientPlan, function (data, index, array) {
                            if (data.Age > 30 && data.ReleationType == "C") {
                                clientNames.push(data.ClientName);
                            }
                        });
                        this.message = "被保险人({0})投保年龄大于30周岁，应为30天-30周岁，不符合投保年龄要求";
                    } else { }


                    if (clientNames.length > 0) {
                        this.message = this.message.format(clientNames.join(","));
                        return true;
                    }
                    return false;
                }
            }),
              new Rule({
                  message: "",
                  performCheck: function () {
                      return $scope.fullCheck;
                  },
                  isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                      var clientNames = [];

                      if (value.ProdCode == "GACPA" || value.ProdCode == "GAHPA") {
                          //No5
                          angular.forEach(value.ClientPlan, function (data, index, array) {
                              if (data.Age > 70 && data.ReleationType == "P") {
                                  clientNames.push(data.ClientName);
                              }
                          });
                          this.message = "被保险人({0})投保年龄大于70周岁，应不超过70周岁，不符合投保年龄要求";
                      } else if (value.ProdCode == "GAOPA") {
                          //No5
                          angular.forEach(value.ClientPlan, function (data, index, array) {
                              if (data.Age > 60 && data.ReleationType == "P") {
                                  clientNames.push(data.ClientName);
                              }
                          });
                          this.message = "被保险人({0})投保年龄大于60周岁，应不超过60周岁，不符合投保年龄要求";
                      } else { }


                      if (clientNames.length > 0) {
                          this.message = this.message.format(clientNames.join(","));
                          return true;
                      }
                      return false;
                  }
              })
         ]);
        //initRules for GACPA,GAHPA,GAOPA

        $scope.planSelectedRules = new BusinessRules([
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        if (!value || value == '*') {
                            this.message = "请为" + scope.cli.ClientName + "选择方案";
                            return true;
                        }
                        else {
                            this.message = $scope.doSimpleCheck(scopeKey, scope.cli);
                            if (this.message != '') {
                                return true;
                            }
                            return false;
                        }
                    }
                }
            }),
             new Rule({
                 message: '',
                 performCheck: function () {
                     return $scope.fullCheck;
                 },
                 isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                     if (me.isDirty(isDirty, hasError)) {
                         if (!value || value == '*') {
                             this.message = "请为" + scope.cli.ClientName + "选择方案";
                             return true;
                         }
                         else {
                             //No13
                             var plan1Code = $scope.GetPlanByName("方案一").PlanId;
                             var plan2Code = $scope.GetPlanByName("方案二").PlanId;
                             var plan3Code = $scope.GetPlanByName("方案三").PlanId;
                             var insuredPPlanId = ""; //主被保人方案
                             var msg = "";
                             angular.forEach($scope.PlanDetail.ClientPlan, function (data, index, array) {
                                 if (data.ReleationType == "E") {
                                     insuredPPlanId = data.PlanId;

                                 }
                             });
                             if (insuredPPlanId == plan1Code && (value == plan2Code || value == plan3Code)) {
                                 msg = "主被保人所选方案对应的保额低于连带被保人，请检查，姓名" + scope.cli.ClientName;
                             }
                             if (insuredPPlanId == plan2Code && value == plan3Code) {
                                 msg = "主被保人所选方案对应的保额低于连带被保人，请检查，姓名" + scope.cli.ClientName;
                             }
                             this.message = msg;
                             if (this.message != '') {
                                 return true;
                             }
                             return false;
                         }
                     }
                 }
             })
         ]);

        $scope.primaryPlanSelectedRules = new BusinessRules([
            new Rule({
                message: '',
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        if (!value || value == '*') {
                            this.message = "请为" + scope.cli.ClientName + "选择方案";
                            return true;
                        }
                        else {
                            this.message = $scope.doSimpleCheck(scopeKey, scope.cli);
                            if (this.message != '') {
                                return true;
                            }
                            return false;
                        }
                    }
                }
            }),
             new Rule({
                 message: '',
                 performCheck: function () {
                     return $scope.fullCheck;
                 },
                 isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                     if (me.isDirty(isDirty, hasError)) {
                         if (!value || value == '*') {
                             this.message = "请为" + scope.cli.ClientName + "选择方案";
                             return true;
                         }
                         else {
                             //No13
                             var plan1Code = $scope.GetPlanByName("方案一").PlanId;
                             var plan2Code = $scope.GetPlanByName("方案二").PlanId;
                             var plan3Code = $scope.GetPlanByName("方案三").PlanId;
                             var insuredPPlanId = value; //主被保人方案
                             var msg = "";
                             angular.forEach($scope.PlanDetail.ClientPlan, function (data, index, array) {
                                 if (data.ReleationType != "E") {
                                     if (value == plan1Code && (data.PlanId == plan2Code || data.PlanId == plan3Code)) {
                                         msg = "主被保人所选方案对应的保额低于连带被保人，请检查，姓名" + scope.cli.ClientName;
                                     }
                                     if (value == plan2Code && data.PlanId == plan3Code) {
                                         msg = "主被保人所选方案对应的保额低于连带被保人，请检查，姓名" + scope.cli.ClientName;
                                     }
                                 }
                             })
                             this.message = msg;
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


        $scope.doSimpleCheck = function (scopeKey, cli) {

            //No14
            if (cli.DayNumber >= 30 && cli.Age < 10
                 && $scope.GetPlanByName("方案四").PlanId != cli.PlanId
                  ) {
                msg = "30天-10周岁（不含）被保险人仅限投保方案四，请检查";
                return msg;
            }

            //No15
            if (cli.Age >= 10 && cli.Age < 18
                 && $scope.GetPlanByName("方案四").PlanId != cli.PlanId && $scope.GetPlanByName("方案五").PlanId != cli.PlanId
                  ) {
                msg = "10周岁-18周岁被保险人仅限投保方案四或方案五，请检查";
                return msg;
            }

            //No16
            if (cli.Age >= 18
                 && $scope.GetPlanByName("方案一").PlanId != cli.PlanId && $scope.GetPlanByName("方案二").PlanId != cli.PlanId && $scope.GetPlanByName("方案三").PlanId != cli.PlanId
                  ) {
                msg = "18周岁以上（含18周岁）被保险人仅限投保方案一、方案二或方案三，请检查";
                return msg;
            }

            //No17
            if (cli.Age > 60
                 && $scope.GetPlanByName("方案一").PlanId != cli.PlanId && $scope.GetPlanByName("方案二").PlanId != cli.PlanId
                  ) {
                msg = "60周岁以上被保险人仅限投保方案一或方案二，请检查";
                return msg;
            }
            return "";
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
