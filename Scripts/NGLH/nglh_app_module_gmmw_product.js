nglh_app_module.controller('nglhAppFormProductGMMWController', ['$scope', 'nglhAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$interval', '$filter', '$q', '$compile',
    function ($scope, nglhAppService, $timeout, $http, appConstant, $window, $interval, $filter, $q, $compile) {
        $scope.primaryPlanSelectedRules_GMMW = new BusinessRules([
                     new Rule({
                         message: '',
                         performCheck: function () {
                             return $scope.fullCheck;
                         },
                         isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                             if (me.isDirty(isDirty, hasError)) {
                                 if (!value || value == '*') {
                                     this.message = "请为" + scope.cli.ClientName + "选择保障计划";
                                     return true;
                                 }
                                 else {
                                     //No13
                                     var plan1Code = $scope.GetPlanByName("保障计划一").PlanId;
                                     var plan2Code = $scope.GetPlanByName("保障计划二").PlanId;
                                     var plan3Code = $scope.GetPlanByName("保障计划三").PlanId;
                                     var plan4Code = $scope.GetPlanByName("保障计划四").PlanId;
                                     var insuredPPlanId = value; //主被保人方案
                                     var msg = "";
                                     angular.forEach($scope.PlanDetail.ClientPlan, function (data, index, array) {
                                         if (data.ReleationType != "E") {
                                             //20191583
                                             //if ((value == plan1Code || value == plan2Code) && (data.PlanId == plan3Code || data.PlanId == plan4Code)) {
                                             //    msg = "主被保人的保额低于连带被保人，请检查，姓名(" + scope.cli.ClientName + ")";
                                             //}
                                             if (value == plan1Code && data.PlanId != plan1Code && data.PlanId != plan2Code) {
                                                 msg = "主被保人的保额低于连带被保人，请检查。";
                                             }
                                             if (value == plan2Code  && data.PlanId != plan2Code) {
                                                 msg = "主被保人的保额低于连带被保人，请检查。";
                                             }
                                             if (value == plan1Code && data.PlanId != plan1Code && data.PlanId != plan2Code && data.PlanId != plan3Code && data.PlanId != plan4Code) {
                                                 msg = "主被保人的保额低于连带被保人，请检查。";
                                             }
                                             if (value == plan4Code && data.PlanId != plan1Code && data.PlanId != plan2Code  && data.PlanId != plan4Code) {
                                                 msg = "主被保人的保额低于连带被保人，请检查。";
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
        //initRules for GMMW
        $scope.initRules_GMMW = new BusinessRules([
                     new Rule({ //No1
                         message: '',
                         performCheck: function () {
                             return $scope.fullCheck;
                         },
                         isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                             var insuredCount = 0;
                             angular.forEach(value.ClientPlan, function (data, index, array) {
                                 insuredCount++;
                             });
                             if (insuredCount < 3) {
                                 this.message = "参保总人数小于3,不能投保";
                                 return true;
                             }
                             return false;
                         }
                     }),
                    new Rule({// //No2
                        message: "",
                        performCheck: function () {
                            return $scope.fullCheck;
                        },
                        isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                            var clientNames = [];
                            angular.forEach(value.ClientPlan, function (data, index, array) {
                                if (((data.ReleationType == "E" && data.PHRelationship == "I") || //本人
                                    (data.ReleationType == "E" && data.PHRelationship == "S") //配偶
                                    ) && data.Age < 16) {
                                    clientNames.push(data.ClientName);
                                }
                            });
                            this.message = "被保险人({0})投保年龄小于16周岁，应为16-65周岁,不符合投保年龄要求";

                            if (clientNames.length > 0) {
                                this.message = this.message.format(clientNames.join(","));
                                return true;
                            }
                            return false;
                        }
                    }),
                    new Rule({// //No3
                        message: "",
                        performCheck: function () {
                            return $scope.fullCheck;
                        },
                        isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                            var clientNames = [];
                            angular.forEach(value.ClientPlan, function (data, index, array) {
                                if (((data.ReleationType == "E" && data.PHRelationship == "I") || //本人
                                    (data.ReleationType == "E" && data.PHRelationship == "S") //配偶
                                    ) && data.Age > 65) {
                                    clientNames.push(data.ClientName);
                                }
                            });
                            this.message = "被保险人({0})投保年龄大于65周岁，应为16-65周岁,不符合投保年龄要求";

                            if (clientNames.length > 0) {
                                this.message = this.message.format(clientNames.join(","));
                                return true;
                            }
                            return false;
                        }
                    }),
                    new Rule({// //No4
                        message: "",
                        performCheck: function () {
                            return $scope.fullCheck;
                        },
                        isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                            var clientNames = [];
                            angular.forEach(value.ClientPlan, function (data, index, array) {
                                if (data.ReleationType == "S" && data.Age > 65) {
                                    clientNames.push(data.ClientName);
                                }
                            });
                            this.message = "被保险人({0})投保年龄大于65周岁，应为20-65周岁，不符合投保年龄要求";

                            if (clientNames.length > 0) {
                                this.message = this.message.format(clientNames.join(","));
                                return true;
                            }
                            return false;
                        }
                    }),
                       new Rule({// //No5
                           message: "",
                           performCheck: function () {
                               return $scope.fullCheck;
                           },
                           isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                               var clientNames = [];
                               angular.forEach(value.ClientPlan, function (data, index, array) {
                                   if (data.ReleationType == "S" && data.Age < 20) {
                                       clientNames.push(data.ClientName);
                                   }
                               });
                               this.message = "被保险人({0})投保年龄小于20周岁，应为20-65周岁,不符合投保年龄要求";

                               if (clientNames.length > 0) {
                                   this.message = this.message.format(clientNames.join(","));
                                   return true;
                               }
                               return false;
                           }
                       }),
                    new Rule({// //No6
                        message: "",
                        performCheck: function () {
                            return $scope.fullCheck;
                        },
                        isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                            var clientNames = [];
                            angular.forEach(value.ClientPlan, function (data, index, array) {
                                if (data.ReleationType == "C" && data.DayNumber < 30) {
                                    clientNames.push(data.ClientName);
                                }
                            });
                            this.message = "被保险人({0})投保年龄小于30天，应为30天-30周岁，不符合投保年龄要求";

                            if (clientNames.length > 0) {
                                this.message = this.message.format(clientNames.join(","));
                                return true;
                            }
                            return false;
                        }
                    }),
                    new Rule({// //No7
                        message: "",
                        performCheck: function () {
                            return $scope.fullCheck;
                        },
                        isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                            var clientNames = [];
                            angular.forEach(value.ClientPlan, function (data, index, array) {
                                if (data.ReleationType == "C" && data.Age > 30) {
                                    clientNames.push(data.ClientName);
                                }
                            });
                            this.message = "被保险人({0})投保年龄大于30周岁，应为30天-30周岁，不符合投保年龄要求";

                            if (clientNames.length > 0) {
                                this.message = this.message.format(clientNames.join(","));
                                return true;
                            }
                            return false;
                        }
                    }),
                    new Rule({//No8
                        message: "",
                        performCheck: function () {
                            return $scope.fullCheck;
                        },
                        isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                            var clientNames = [];
                            angular.forEach(value.ClientPlan, function (data, index, array) {
                                if (data.ReleationType == "P" && data.Age > 65) {
                                    clientNames.push(data.ClientName);
                                }
                            });
                            this.message = "被保险人({0})投保年龄大于65周岁，应不超过65周岁，不符合投保年龄要求";

                            if (clientNames.length > 0) {
                                this.message = this.message.format(clientNames.join(","));
                                return true;
                            }
                            return false;
                        }
                    }),
                    new Rule({//No9
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
                    new Rule({//No12
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
                                this.message = "被保险人中必须有投保人或其配偶参保";
                                return true;
                            }
                            return false;
                        }
                    }),
                     new Rule({//No13
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
                             if (insueredE.length == 1 && insueredSp.length == 1 && insueredPa.length > 4) {
                                 this.message = "被保险人中夫妻双方参保时方可带父母4人";
                                 return true;
                             }
                             return false;
                         }
                     }),
                        new Rule({//No14
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
                                if (insueredE.length + insueredSp.length < 2 && insueredPa.length > 2) {
                                    this.message = "被保险人中夫妻双方一方参保时方可带父母2人";
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
        		    })
                 ]);
        //initRules for GMMW

        $scope.planSelectedRules_GMMW = new BusinessRules([
                     new Rule({
                         message: '',
                         performCheck: function () {
                             return $scope.fullCheck;
                         },
                         isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                             if (me.isDirty(isDirty, hasError)) {
                                 if (!value || value == '*') {
                                     this.message = "请为" + scope.cli.ClientName + "选择保障计划";
                                     return true;
                                 }
                                 else {
                                     //No13
                                     var plan1Code = $scope.GetPlanByName("保障计划一").PlanId;
                                     var plan2Code = $scope.GetPlanByName("保障计划二").PlanId;
                                     var plan3Code = $scope.GetPlanByName("保障计划三").PlanId;
                                     var plan4Code = $scope.GetPlanByName("保障计划四").PlanId;
                                     var insuredPPlanId = ""; //主被保人方案
                                     var msg = "";
                                     angular.forEach($scope.PlanDetail.ClientPlan, function (data, index, array) {
                                         if (data.ReleationType == "E") {
                                             insuredPPlanId = data.PlanId;

                                         }
                                     });
                                     //20191583
                                     //if ((insuredPPlanId == plan1Code || insuredPPlanId == plan2Code) && (value == plan3Code || value == plan4Code)) {
                                     //    msg = "主被保人的保额低于连带被保人，请检查，姓名(" + scope.cli.ClientName + ")";
                                     //}
                                     if (insuredPPlanId == plan1Code && value != plan1Code && value != plan2Code) {
                                         msg = "主被保人的保额低于连带被保人，请检查。";
                                     }
                                     if (insuredPPlanId == plan2Code && value != plan2Code) {
                                         msg = "主被保人的保额低于连带被保人，请检查。";
                                     }
                                     if (insuredPPlanId == plan1Code && value != plan1Code && value != plan2Code && value != plan3Code && value != plan4Code) {
                                         msg = "主被保人的保额低于连带被保人，请检查。";
                                     }
                                     if (insuredPPlanId == plan4Code && value != plan1Code && value != plan2Code && value != plan4Code) {
                                         msg = "主被保人的保额低于连带被保人，请检查。";
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
    }
]);
