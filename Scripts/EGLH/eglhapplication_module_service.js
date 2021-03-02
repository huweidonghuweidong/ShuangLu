// //////////////////////////////
// Service
// //////////////////////////////
eglhapplication_module.service('eGLHAppService', ['$q', '$filter',
    function ($q, $filter) {
        var handleHttpError = function (description, jqXHR, textStatus, errorThrown) {
            var _errMsg = description;
            ShowErrorDialog(_errMsg);
        };

        var checkError = function (description, result, isErrorShown) {
            if (isErrorShown == undefined) isErrorShown = true;
            var _hasError = false;
            if (result && result[JSON_ERROR] && result[JSON_ERROR].length > 0) {
                _hasError = true;
                if (isErrorShown) {
                    var _errMsg = description + "<br/>";
                    for (var idx in result[JSON_ERROR]) {
                        _errMsg = _errMsg + result[JSON_ERROR][idx].errorCode + ":" + result[JSON_ERROR][idx].errorMessage + '<br/>';
                    }
                    displayError(_errMsg);
                }
            }

            return _hasError;
        };

        var displayError = function (s) {
            ShowErrorDialog(s);
        };

        this.save = function (eAppData, showErrorMsg) {
            var deferred = $q.defer();
            $.ajax({
                url: '../eGLHApplication/REST/SaveData',
                data: eAppData,
                method: 'post',
                async: true,
                timeout: 240000
            }).success(function (data) {
                if (!checkError($filter('translate')('MESSAGE_FAIL_SAVE_EAPP'), data, showErrorMsg)) {
                    deferred.resolve(data[JSON_RESULT]);
                } else {
                    deferred.reject(data[JSON_ERROR]);
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError($filter('translate')('MESSAGE_FAIL_SAVE_EAPP'), jqXHR, textStatus, errorThrown);
                deferred.reject(errorThrown);
            });

            return deferred.promise;
        };

        this.loadCommonResourceList = function (resourceId) {

            var result = [];
            $.ajax({
                type: 'get',
                url: 'GetCommonResourceList?resourceId=' + resourceId,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
                if (result.JSON_RESULT_ERROR.length > 0) {
                    handleHttpError("unable to read resource list (" + resourceId + ")", null, null, null);
                    throw new Error("unable to read resource list (" + resourceId + ") - ");
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError("unable to read resource list (" + resourceId + ")", jqXHR, textStatus, errorThrown);
                throw new Error("unable to read resource list (" + resourceId + ")");
            });
            return result.JSON_RESULT_DATA;
        };

        this.availablePlanList = this.loadCommonResourceList('available_plan');
        this.deductiblesList = this.loadCommonResourceList('eglh_deductibles');
        this.loadAvailablePlanList = function (prodCode) {

            var result = [];

            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/LoadAvailablePlanList?ProdCode=' + prodCode,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {

            });

            return result.JSON_RESULT_DATA;
        };

        //this.loadDeductiblesList = function () {
        //
        //    var result = [];
        //
        //    $.ajax({
        //        type: 'get',
        //        url: '../eGLHApplication/REST/LoadDeductiblesList',
        //        dataType: 'json',
        //        async: false
        //    }).done(function (data) {
        //        result = data;
        //    }).error(function (jqXHR, textStatus, errorThrown) {
        //
        //    });
        //
        //    return result.JSON_RESULT_DATA;
        //};			

        //this.deductiblesList = this.loadDeductiblesList();

        this.bankList = this.loadCommonResourceList('bank_options');
        this.idDocumentTypes = this.loadCommonResourceList('id_document_types');
        this.addressFullList = this.loadCommonResourceList('admin_division_options');
        this.addressFullRegList = this.loadCommonResourceList('admin_division_options_reg');
        this.loadProvinceList = function () {
            var result = [];
            var data = this.addressFullList;
            for (p in data) {
                var r = data[p];
                result.push({
                    key: r.ProvCd,
                    value: r.ProvNm
                })
            }
            return result;
        }

        this.loadProvinceRegList = function () {
            var result = [];
            var data = this.addressFullRegList;
            for (p in data) {
                var r = data[p];
                result.push({
                    key: r.ProvCd,
                    value: r.ProvNm
                })
            }
            return result;
        }
        this.loadTerritoryRegList = function (provCd) {
            var result = []
            var data = this.addressFullRegList;
            for (p in data) {
                var r = data[p];
                if (provCd == r.ProvCd) {
                    for (q in r.TerrStacker) {
                        var s = r.TerrStacker[q];
                        result.push({
                            key: s.TerrCd,
                            value: s.TerrNm
                        })
                    }
                    break;
                }
            }
            return result;
        }
        this.loadTerritoryList = function (provCd) {
            var result = []
            var data = this.addressFullList;
            for (p in data) {
                var r = data[p];
                if (provCd == r.ProvCd) {
                    for (q in r.TerrStacker) {
                        var s = r.TerrStacker[q];
                        result.push({
                            key: s.TerrCd,
                            value: s.TerrNm
                        })
                    }
                    break;
                }
            }
            return result;
        }

        this.loadCountyList = function (provCd, terrCd) {
            var result = []
            var data = this.addressFullList;
            for (p in data) {
                var r = data[p];
                if (provCd == r.ProvCd) {
                    for (q in r.TerrStacker) {
                        var s = r.TerrStacker[q];
                        if (terrCd == s.TerrCd) {
                            for (l in s.CountyStacker) {
                                var t = s.CountyStacker[l];
                                result.push({
                                    key: t.CountyCd,
                                    value: t.CountyNm
                                })
                            }
                            break;
                        }
                    }
                    break;
                }
            }
            return result;
        }

        this.deleteApp = function (eAppNumber) {
            var deferred = $q.defer();
            $.ajax({
                url: 'PendingApplications?eappNumber=' + eAppNumber,
                method: 'DELETE',
                async: true,
                timeout: 240000
            }).success(function (data) {
                if (!checkError($filter('translate')('MESSAGE_FAIL_DELETE_EAPP'), data)) {
                    deferred.resolve(data[JSON_RESULT]);
                } else {
                    deferred.reject(data[JSON_ERROR]);
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError($filter('translate')('MESSAGE_FAIL_DELETE_EAPP'), jqXHR, textStatus, errorThrown);
                deferred.reject(errorThrown);
            });

            return deferred.promise;
        };

        this.loadPlanCvgDesc = function (code) {
            var output = {};
            for (a in this.availablePlanList) {
                var b = this.availablePlanList[a];
                if (b.PlanId == code) {
                    output = b.PlanName;
                    break;
                }
            };
            return output;
        };

        this.loadDeductDesc = function (code) {
            var output = {};
            if (!code) {
                output = '';
            }
            for (a in this.deductiblesList) {
                var b = this.deductiblesList[a];
                if (b.DeductId == code) {
                    output = b.DeductDesc;
                    break;
                }
            };
            return output;
        };

        this.loadIdDocumentType = function (code) {
            var output = {};
            for (a in this.idDocumentTypes) {
                var b = this.idDocumentTypes[a];
                if (b.key == code) {
                    output = b;
                    break;
                }
            };
            return output;
        };

        this.loadBank = function (code) {
            var output = {};
            for (a in this.bankList) {
                var b = this.bankList[a];
                if (b.key == code) {
                    output = b;
                    break;
                }
            };
            return output;
        };

        this.loadAreaCodes = function () {
            var result = null;
            $.ajax({
                type: 'get',
                dataType: 'json',
                url: 'AreaCodes',
                async: false,
                success: function (data) {
                    result = data[JSON_RESULT];
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleHttpError('unable to load area codes', jqXHR, textStatus, errorThrown);
                    throw new Error('unable to load area codes: ' + errorThrown);
                }
            });

            return result;
        };


        this.loadApplicationData = function (appNum) {
            var result = [];
            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/GetApplicationData?appNum=' + appNum,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
                if (result.JSON_RESULT_ERROR.length > 0) {
                    handleHttpError("unable to read Application Data (" + appNum + ")", null, null, null);
                    throw new Error("unable to read Application Data (" + appNum + ") - ");
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError("unable to read Application Data (" + appNum + ")", jqXHR, textStatus, errorThrown);
                throw new Error("unable to read Application Data (" + appNum + ")");
            });
            return result.JSON_RESULT_DATA;

        };

        this.loadApplicationSummary = function (appNum) {
            var result = [];
            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/GetApplicationSummary?appNum=' + appNum,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
                if (result.JSON_RESULT_ERROR.length > 0) {
                    handleHttpError("unable to read Application Data (" + appNum + ")", null, null, null);
                    throw new Error("unable to read Application Data (" + appNum + ") - ");
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError("unable to read Application Data (" + appNum + ")", jqXHR, textStatus, errorThrown);
                throw new Error("unable to read Application Data (" + appNum + ")");
            });
            return result.JSON_RESULT_DATA;

        };

        this.loadSignTerrCdList = function (resourceId) {
            var result = [];
            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/GetSignTerrCdList?resourceId=' + resourceId,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
                if (result.JSON_RESULT_ERROR.length > 0) {
                    handleHttpError("unable to read SignTerrCd list (" + resourceId + ")", null, null, null);
                    throw new Error("unable to read SignTerrCd list (" + resourceId + ") - ");
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError("unable to read SignTerrCd list (" + resourceId + ")", jqXHR, textStatus, errorThrown);
                throw new Error("unable to read SignTerrCd list (" + resourceId + ")");
            });
            return result.JSON_RESULT_DATA;

        };

        this.loadProductPlanInfo = function (obj, result) {
            var prodCode = $("#" + obj).val();

            $.ajax({
                type: 'POST',
                data: {
                    prodCode: prodCode
                },
                url: 'GetPlanInfo',
                dataType: 'html',
                async: false
            }).done(function (data) {
                $("#" + result).html(data);
            }).error(function (jqXHR, textStatus, errorThrown) {
                $("#" + result).html('');
            });
        };

        this.getAppNum = function () {
            var result = {};

            $.ajax({
                type: 'get',
                url: 'GetAppNum',
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {

            });

            return result.JSON_RESULT_DATA;
        };

        this.loadProductPlanDetail = function (obj, result) {
            var prodCode = $("#" + obj).val();

            $.ajax({
                type: 'POST',
                data: {
                    prodCode: prodCode
                },
                url: 'GetPlanDetail',
                dataType: 'html',
                async: false
            }).done(function (data) {
                return data;

            }).error(function (jqXHR, textStatus, errorThrown) {
                $("#" + result).html('');
            });
        };

        this.GetClientPlanSummary = function (AppNum) {
            var result = [];

            $.ajax({
                type: 'get',
                url: 'GetClientPlanSummary?AppNum=' + AppNum,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {
                result = null;
            });

            return result.JSON_RESULT_DATA;
        };

        this.GetInsurabilityQuestion = function (AppNum) {
            var result = [];

            $.ajax({
                type: 'get',
                url: 'GetInsurabilityQuestion?appNum=' + AppNum,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {
                result = null;
            });

            return result.JSON_RESULT_DATA;
        };

        this.GetClientPlanDetail = function (appNum) {
            var result = [];

            $.ajax({
                type: 'get',
                url: 'GetClientPlanDetail?AppNum=' + appNum,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {
                result = null;
            });

            return result.JSON_RESULT_DATA;
        };

        this.loadPerson = function (appNum) {
            var result = [];

            $.ajax({
                type: 'get',
                url: "GetPersonByAppNum?appNum=" + appNum,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {
                result = null;
            });
            return result.JSON_RESULT_DATA;
        };

        this.GetInsurabilityQuestionResult = function (appNum, type) {

            var result = [];
            $.ajax({
                url: 'GetInsurabilityQuestionResult?appNum=' + appNum + "&type" + type,
                method: 'get',
                async: false,
                timeout: 240000
            }).done(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {
                result = null;
            });

            return result.JSON_RESULT_DATA;
        };

//        this.SaveInsurabilityQuestion = function (eAppData) {

//            var deferred = $q.defer();
//            $.ajax({
//                url: 'SaveInsurabilityQuestion',
//                method: 'post',
//                async: false,
//                data: eAppData,
//                timeout: 240000
//            }).success(function (data) {
//                if (data == null || data.JSON_RESULT_ERROR.length > 0) {
//                    deferred.reject(data[JSON_ERROR]);
//                }
//                else {
//                    deferred.resolve(data[JSON_RESULT]);
//                }
//            }).error(function (jqXHR, textStatus, errorThrown) {
//                handleHttpError("问卷保存失败", jqXHR, textStatus, errorThrown);
//                deferred.reject(errorThrown);
//            });

//            return deferred.promise;
        //        };

        this.SaveInsurabilityQuestion = function (eAppData) {
            var result = {};
                    $.ajax({
                        url: 'SaveInsurabilityQuestion',
                        method: 'post',
                        async: false,
                        data: eAppData,
                        timeout: 240000
                    }).success(function (data) {
                        result = data;
                    }).error(function (jqXHR, textStatus, errorThrown) {
                        handleHttpError("问卷保存失败", jqXHR, textStatus, errorThrown);
                    });
                    return result;
                };

        this.SavePlanDetail = function (eAppData) {
            var result = {};

            $.ajax({
                url: 'SavePlanDetail',
                data: eAppData,
                method: 'post',
                async: false,
                timeout: 240000
            }).success(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {
                result = null;
            });

            return result;
        };

        this.SavePersonData = function (eAppData) {
            var result = {};
            $.ajax({
                url: 'SavePersonData',
                data: eAppData,
                method: 'post',
                async: false,
                timeout: 240000
            }).success(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {
                result = null;
            });

            return result;
        };

        this.getApplicationPreview = function () {
            return 'GetEAppPreviewDocument';
        };

        this.getApplicationPreviewPageCount = function (eGLHAppData) {
            var deferred = $q.defer();
            $.ajax({
                method: 'get',
                url: 'GetEAppPreviewPageCount',
                data: eGLHAppData,
                async: true,
                timeout: 240000,
                success: function (data) {
                    if (data[JSON_ERROR] && data[JSON_ERROR].length > 0) {
                        deferred.reject(data[JSON_ERROR]);
                    } else {
                        deferred.resolve(data[JSON_RESULT]);
                    }
                },
                error: function (errMsg) {
                    var errorObj = [{ 'errorMessage': 'cannot count application preview pages.'}]; //errMsg.responseText
                    deferred.reject(errorObj);
                    //throw new Error(errMsg);
                }
            });
            return deferred.promise;
        };

        this.loadPaymentDataList = function (appNum) {
            var result = [];
            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/GetPaymentDataList?appNum=' + appNum,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
                if (result.JSON_RESULT_ERROR.length > 0) {
                    handleHttpError("unable to read PaymentData list (" + appNum + ")", null, null, null);
                    throw new Error("unable to read PaymentData list (" + appNum + ") - ");
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError("unable to read PaymentData list (" + appNum + ")", jqXHR, textStatus, errorThrown);
                throw new Error("unable to read PaymentData list (" + appNum + ")");
            });

            return result.JSON_RESULT_DATA;

        };

        //        this.AvailablePlanList = function (ProdCode) {
        //            var result = [];
        //
        //            $.ajax({
        //                type: 'get',
        //                url: 'GetAvailablePlan?ProdCode=' + ProdCode,
        //                dataType: 'json',
        //                async: false
        //            }).done(function (data) {
        //                result = data;
        //                if (result.JSON_RESULT_ERROR.length > 0) {
        //                    handleHttpError("unable to read AvailablePlanList list (" + ProdCode + ")", null, null, null);
        //                    throw new Error("unable to read AvailablePlanList list (" + ProdCode + ") - ");
        //                }
        //            }).error(function (jqXHR, textStatus, errorThrown) {
        //                handleHttpError("unable to read AvailablePlanList list (" + ProdCode + ")", jqXHR, textStatus, errorThrown);
        //                throw new Error("unable to read AvailablePlanList list (" + ProdCode + ")");
        //            });
        //
        //            return result.JSON_RESULT_DATA;
        //        };

        this.loadOtherInsuredDataList = function (appNum) {
            var result = [];
            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/GetOtherInsuredDataList?appNum=' + appNum,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
                if (result.JSON_RESULT_ERROR.length > 0) {
                    handleHttpError("unable to read OtherInsuredData list (" + appNum + ")", null, null, null);
                    throw new Error("unable to read OtherInsuredData list (" + appNum + ") - ");
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError("unable to read OtherInsuredData list (" + appNum + ")", jqXHR, textStatus, errorThrown);
                throw new Error("unable to read OtherInsuredData list (" + appNum + ")");
            });
            return result.JSON_RESULT_DATA;

        };

//        this.initialSave = function (eAppData, showErrorMsg) {
//            var deferred = $q.defer();
//            $.ajax({
//                url: '../eGLHApplication/REST/InitialSave',
//                data: eAppData,
//                method: 'post',
//                async: true,
//                timeout: 240000
//            }).success(function (data) {
//                if (!checkError($filter('translate')('MESSAGE_FAIL_SAVE_EAPP'), data, showErrorMsg)) {
//                    deferred.resolve(data[JSON_RESULT]);
//                } else {
//                    deferred.reject(data[JSON_ERROR]);
//                }
//            }).error(function (jqXHR, textStatus, errorThrown) {
//                handleHttpError($filter('translate')('MESSAGE_FAIL_SAVE_EAPP'), jqXHR, textStatus, errorThrown);
//                deferred.reject(errorThrown);
//            });

//            return deferred.promise;
        //        };

        this.initialSave = function (eAppData, showErrorMsg) {
            var result = {};
              $.ajax({
                url: '../eGLHApplication/REST/InitialSave',
                data: eAppData,
                method: 'post',
                async: false,
                timeout: 240000
            }).success(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError($filter('translate')('MESSAGE_FAIL_SAVE_EAPP'), jqXHR, textStatus, errorThrown);
            });
            return result;
        };

//        this.savePaymentData = function (eGLHAppData) {
//            var deferred = $q.defer();
//            $.ajax({
//                url: '../eGLHApplication/REST/SavePaymentData',
//                data: eGLHAppData,
//                method: 'post',
//                async: true,
//                timeout: 240000
//            }).success(function (data) {
//                if (!checkError($filter('translate')('MESSAGE_FAIL_SUBMIT_EAPP'), data)) {
//                    deferred.resolve(data[JSON_RESULT]);
//                } else {
//                    deferred.reject(data[JSON_ERROR]);
//                }
//            }).error(function (jqXHR, textStatus, errorThrown) {
//                handleHttpError($filter('translate')('MESSAGE_FAIL_SUBMIT_EAPP'), jqXHR, textStatus, errorThrown);
//                deferred.reject(errorThrown);
//            });

//            return deferred.promise;
        //        };

        this.savePaymentData = function (eGLHAppData) {
            var result = {};
            $.ajax({
                url: '../eGLHApplication/REST/SavePaymentData',
                data: eGLHAppData,
                method: 'post',
                async: false,
                timeout: 240000
            }).success(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError($filter('translate')('MESSAGE_FAIL_SUBMIT_EAPP'), jqXHR, textStatus, errorThrown);

            });
            return result;
        };

        this.UpdateApplication = function (eGLHAppData) {
            var result = {};
            $.ajax({
                url: 'UpdateApplication',
                data: eGLHAppData,
                method: 'post',
                async: false,
                timeout: 240000
            }).success(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {
                result = null;
            });

            return result;
        };

        this.confirm = function (eGLHAppData) {
            var deferred = $q.defer();
            $.ajax({
                url: 'ConfirmApplications',
                data: eGLHAppData,
                method: 'post',
                async: true,
                timeout: 240000
            }).success(function (data) {
                if (!checkError($filter('translate')('MESSAGE_FAIL_CONFIRM_EAPP'), data)) {
                    deferred.resolve(data[JSON_RESULT]);
                } else {
                    deferred.reject(data[JSON_ERROR]);
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError($filter('translate')('MESSAGE_FAIL_CONFIRM_EAPP'), jqXHR, textStatus, errorThrown);
                deferred.reject(errorThrown);
                //return null;
            });

            return deferred.promise;
        };

        this.getDocumentList = function (result) {
            var msg = "<pre>恭喜您！您提交的保单：" + result.PolicyNum + "已进入核心系统，在线投保流程已完成！";
            msg = msg + "<br/> " + "温馨提示：请您在3个工作日内将以下材料交回公司：";
            for (var idx in result.DocList) {
                msg = msg + "<br/> -" + result.DocList[idx];
            }
            msg = msg + "<br/><br/>*我们将人工核保您的投保申请，如果有需要，<br/>&nbsp;烦请您配合再次递交相关资料*";

            msg = msg + "<br/>带*标记的资料可以在" + result.ImageUploadEndDate + " 24:00前通过影像上传的方式递交。";

            msg = msg + "</pre>";

            return msg;
        };


        this.loadApplicationListData = function (rqstData) {
            var result = null;
            $.ajax({
                method: 'get',
                url: '../eGLHApplication/REST/GetApplicationList',
                data: rqstData,
                dataType: 'json',
                async: false
            }).success(function (data) {
                if (!checkError($filter('translate')('MESSAGE_FAIL_GET_EAPP_DATA'), data)) {
                    var pendingList = data[JSON_RESULT];
                    result = [];
                    for (p in pendingList) {
                        result.push(pendingList[p]);
                    }
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError("unable to read pending applications", jqXHR, textStatus, errorThrown);
                throw new Error("unable to read pending applications");
            });

            return result;
        };

        this.initialPremiumMethods = this.loadCommonResourceList('initial_premium_methods');
        this.loadInitialPremiumMethod = function (method) {
            var output = {};
            for (a in this.initialPremiumMethods) {
                var b = this.initialPremiumMethods[a];
                if (b.Key == method) {
                    output = b;
                    break;
                }
            };
            return output;
        };

        this.calculateDay = function (dob) {
            var today = new Date();
            var birthDate = parseDateWithISOFormat(dob);
            var day = null;
            if (birthDate != null) {
                var total = (today - birthDate) / 1000;
                day = parseInt(total / (24 * 60 * 60));
            }

            return day;
        };

        this.applicationStatusSummary = this.loadCommonResourceList('application_status_summary');
        this.loadApplicationStatusSummary = function (status, underwritingResult, initialPaymentMethod, policyStatus) {
            var s = {};
            var isSpecialPolicyStatus = (policyStatus == "1" || policyStatus == "3" || policyStatus == "N" || policyStatus == "R" || policyStatus == "X");

            for (k in this.applicationStatusSummary) {
                var p = this.applicationStatusSummary[k];
                if (p.status == status) {
                    if (status == "04") {
                        if (p.policyStatus && policyStatus) {
                            if (p.policyStatus == policyStatus) {
                                s = p;
                                break;
                            }
                        } else if (!isSpecialPolicyStatus && p.underwritingResult == underwritingResult && p.initialPaymentMethod == initialPaymentMethod) {
                            s = p;
                            break;
                        }
                    } else {
                        s = p;
                        break;
                    }
                }
            }
            return s;
        };

        this.documentDefinitions = this.loadCommonResourceList('document_definitions');
        this.loadDocumentDefinitions = function (planCode) {
            var doc = {};
            for (a in this.documentDefinitions) {
                var b = this.documentDefinitions[a];
                if (b.PlanCode == planCode) {
                    doc = b.Definitions;
                    break;
                }
            };
            return doc;
        };

        this.getAllDocuments = function (eAppNumber) {
            var result = {};

            $.ajax({
                type: 'post',
                url: '../eGLHApplication/REST/Documents/' + eAppNumber,
                dataType: "json",
                async: false,
                success: function (data) {
                    if (!checkError($filter('translate')('MESSAGE_FAIL_READ_DOCUMENTS_LIST'), data)) {
                        result = data[JSON_RESULT];
                    }
                },
                error: function (errMsg) {
                    handleHttpError('unable to load documents', null, null, null);
                    throw new Error('unable to load documents: ' + errMsg.responseText);
                }
            });

            return result;
        };

        this.getAllProducts = function (appNum) {

            var result = [];

            $.ajax({
                type: 'get',
                url: 'GetAppProdcut?AppNum=' + appNum,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {

            });

            return result.JSON_RESULT_DATA;
        };

        this.loadAvailablePlanList = function (prodCode) {

            var result = [];

            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/LoadAvailablePlanList?ProdCode=' + prodCode,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {

            });

            return result.JSON_RESULT_DATA;
        };

        this.loadDeductiblesList = function (prodCode) {

            var result = [];

            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/LoadDeductiblesList?ProdCode=' + prodCode,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
            }).error(function (jqXHR, textStatus, errorThrown) {

            });

            return result.JSON_RESULT_DATA;
        };

        this.callMsleHomeImageUpload = function (eAppNumber) {
            var result = null;
            $.ajax({
                url: '../eGLHApplication/REST/ImageUpload',
                method: 'POST',
                data: {
                    eAppNumber: eAppNumber
                },
                dataType: 'json',
                async: false
            }).done(function (data) {
                if (!checkError("无法连接到影像系统，请重新登陆或稍后再试！", data)) {
                    result = data[JSON_RESULT];
                    if (result.CanUpload) {
                        var ehomeurl = result.AppLinkUrl;
                        //window.location = ehomeurl;
                    }
                    else {
                        ShowErrorDialog("<pre>" + result.RejectReason + "</pre>", null);
                    }
                }
            }).error(function () {
                handleHttpError("无法连接到影像系统，请重新登陆或稍后再试！", null, null, null);
                throw new Error("无法连接到影像系统，请重新登陆或稍后再试！");
            });
            return result;
        };

        this.getStepDefinition = function () {
            var result = [];

            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/GetStepDefinition/',
                dataType: "json",
                async: false,
                success: function (data) {
                    result = data;
                    if (result.JSON_RESULT_ERROR.length > 0) {
                        handleHttpError("unable to load StepDefinition ", null, null, null);
                        throw new Error("unable to load StepDefinition - ");
                    }
                },
                error: function (errMsg) {
                    handleHttpError('unable to load StepDefinition', null, null, null);
                    throw new Error('unable to load StepDefinition: ' + errMsg.responseText);
                }
            });

            return result.JSON_RESULT_DATA;
        };

        this.loadPendingEGLHAppData = function (appNum) {
            var result = [];
            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/LoadPendingEGLHAppData?appNum=' + appNum,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
                //if (result.JSON_RESULT_ERROR.length > 0) {
                //    handleHttpError("unable to read Application Step Detail Data (" + appNum + ")", null, null, null);
                //    throw new Error("unable to read Application Step Detail Data (" + appNum + ") - ");
                //}
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError("unable to read Application Step Detail Data (" + appNum + ")", jqXHR, textStatus, errorThrown);
                throw new Error("unable to read Application Step Detail Data (" + appNum + ")");
            });
            return result.JSON_RESULT_DATA;

        };

        this.loadOccupation = function () {
            var result = [];
            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/LoadOccpationData',
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
                //if (result.JSON_RESULT_ERROR.length > 0) {
                //    handleHttpError("unable to read Application Step Detail Data (" + appNum + ")", null, null, null);
                //    throw new Error("unable to read Application Step Detail Data (" + appNum + ") - ");
                //}
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError("unable to read Application Step Detail Data (" + appNum + ")", jqXHR, textStatus, errorThrown);
                throw new Error("unable to read Application Step Detail Data (" + appNum + ")");
            });

            return result.JSON_RESULT_DATA;

        };

        this.loadDuplicateConfirmNumber = function (code) {
            var result = [];
            $.ajax({
                type: 'get',
                url: '../eGLHApplication/REST/LoadConfirmNumber?confirmNum=' + code,
                dataType: 'json',
                async: false
            }).done(function (data) {
                result = data;
                if (result.JSON_RESULT_ERROR.length > 0) {
                    handleHttpError("unable to check DuplicateConfirmNumber (" + code + ")", null, null, null);
                    throw new Error("unable to check DuplicateConfirmNumber (" + code + ") - ");
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                handleHttpError("unable to check DuplicateConfirmNumber (" + code + ")", jqXHR, textStatus, errorThrown);
                throw new Error("unable to check DuplicateConfirmNumber (" + code + ")");
            });

            return result.JSON_RESULT_DATA;

        };

        //--check request device
        this.IsMobileBrowser = function () {
//            var isiPad = navigator.userAgent.match(/iPad/i) != null;
//            if (isiPad) {
//                return true;
            //            }
            var ua = navigator.userAgent.toLowerCase();
            if (ua.match(/iPad/i) == "ipad" ||
            ua.match(/mac os x/i) == "mac os x")    //check ipad 13 and mac
            {
                return true;
            }

            var check = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
            })(navigator.userAgent || navigator.vendor || window.opera);

            return check;
        }

        this.callImageUpload = function (AppNum) {
            var result = null;
            $.ajax({
                url: 'ImageUpload',
                method: 'POST',
                data: { AppNum: AppNum },
                dataType: 'json',
                async: false
            }).done(function (data) {
                if (!checkError("无法连接到影像系统，请重新登陆或稍后再试！", data)) {
                    result = data[JSON_RESULT];
                    if (result.CanUpload) {
                        var ehomeurl = result.AppLinkUrl;
                        //alert(ehomeurl);
                        window.location = ehomeurl;
                    }
                    else {
                        ShowErrorDialog("<pre>" + result.RejectReason + "</pre>", null);
                    }
                }
            }).error(function () {
                handleHttpError("无法连接到影像系统，请重新登陆或稍后再试！", null, null, null);
                throw new Error("无法连接到影像系统，请重新登陆或稍后再试！");
            });
            return result;
        };

    }
]);

    ShowEGLHImageDialog = function (urls, loadStartCallback, loadCompleteCallback, loadFailCallback, closeCallBack, viewAllCallback) {
        if (!urls || urls.length == 0) {
            return;
        }
        if (loadStartCallback) {
            loadStartCallback();
        }
        var _imgContainer = $("<div class='touchScrollable' style='text-align:center;min-width:300px;max-height:520px;overflow-x:hidden;overflow-y:auto'></div>");
        //var _img = $("<img onclick='window.open(this.src)' style='cursor:pointer;max-width:900px;' src='" + url + "' />");
        var url = urls[0];
        if (url.indexOf("?") > -1) {
            url = url + "&timestamp=" + (new Date()).getTime().toString();
        }
        else {
            url = url + "?timestamp=" + (new Date()).getTime().toString();
        }
        var _img = $("<img style='max-width:900px' src='" + url + "'/>");
        _imgContainer.append(_img);
        $('#images-dialog-content').empty();
        $('#images-dialog-content').append(_imgContainer);

        var _dialog_id = "images-dialog";
        var _dialog = $('#' + _dialog_id);
        _dialog.data("pageNumber", 0);

        var refreshButtons = function () {
            $('#images-dialog-prev').hide();
            $('#images-dialog-next').hide();
            $('#images-dialog-close').hide();
            var _pageNumber = _dialog.data("pageNumber");
            if (_pageNumber > 0) {
                $('#images-dialog-prev').show();
            }
            if (_pageNumber < urls.length - 1) {
                $('#images-dialog-next').show();
            }
            else {
                $('#images-dialog-close').show();
            }
            $('#images-dialog-page-counter').text('Page ' + (_pageNumber + 1) + ' of ' + urls.length);
        }
        refreshButtons();

        var showLoading = function (isShow) {
            if (isShow) {
                _dialog.addClass("loading");
            }
            else {
                _dialog.removeClass("loading");
            }
        };

        var resizeContainer = function () {
            _dialog.data("dialog").option("height", $(window).height() - 100);
            _imgContainer.css('max-height', $(window).height() - 100 - 70);
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };

        $('body').css('overflow-y', 'hidden');
        _img.bind('load', function () {
            setTimeout(function () {
                if (_img.width() >= 900) {
                    _dialog.data("dialog").option("width", '900');
                    //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
                    _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
                }
            }, 0);

            var setting = {};
            setting.open = function (event, ui) {
                _img.off('load');
                _img.bind('load', function () {
                    _imgContainer.scrollTop(0);
                    showLoading(false);
                    _img.show();
                });

                disableTouchMove();
                $(this).siblings('.ui-dialog-titlebar').remove();
                $('div.ui-widget-overlay').click(function (e) {
//                    _dialog.dialog('close');
//                    if (closeCallBack) {
//                        closeCallBack();
//                    }
                });
                $('#images-dialog-prev').click(function (e) {
                    var _pageNumber = _dialog.data("pageNumber");
                    if (_pageNumber > 0) {
                        _pageNumber--;
                        _dialog.data("pageNumber", _pageNumber);
                        var url = urls[_pageNumber];
                        if (url.indexOf("?") > -1) {
                            url = url + "&timestamp=" + (new Date()).getTime().toString();
                        }
                        else {
                            url = url + "?timestamp=" + (new Date()).getTime().toString();
                        }
                        _img.hide();
                        showLoading(true);
                        _img.attr('src', url);
                    }
                    refreshButtons();
                });

                $('#images-dialog-next').click(function (e) {
                    var _pageNumber = _dialog.data("pageNumber");
                    if (_pageNumber < urls.length - 1) {
                        _pageNumber++;
                        _dialog.data("pageNumber", _pageNumber);
                        var url = urls[_pageNumber];
                        if (url.indexOf("?") > -1) {
                            url = url + "&timestamp=" + (new Date()).getTime().toString();
                        }
                        else {
                            url = url + "?timestamp=" + (new Date()).getTime().toString();
                        }
                        _img.hide();
                        showLoading(true);
                        _img.attr('src', url);
                    }
                    if (_pageNumber == urls.length - 1) {
                        if (viewAllCallback) {
                            viewAllCallback();
                        }
                    }
                    refreshButtons();
                });

                $('#images-dialog-close').click(function (e) {
                    _dialog.dialog('close');
                    if (closeCallBack) {
                        closeCallBack();
                    }
                    if (viewAllCallback) {
                        viewAllCallback();
                    }
                });
                _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
                resizeContainer();
                $(window).on('resize', resizeContainer);
            };
            setting.close = function (event, ui) {
                $('#content-dialog-content').html('');
                if (closeCallBack) {
                    closeCallBack();
                }
                enableTouchMove();
                $(window).off('resize', resizeContainer);
                $('body').css('overflow-y', 'auto');
                $('div.ui-widget-overlay').off('click');
                $('#images-dialog-close').off('click');
                $('#images-dialog-prev').off('click');
                $('#images-dialog-next').off('click');
            };

            setting.width = 'auto';
            setting.closeOnEscape = true;
            setting.position = ['center', 'center'];
            setting.modal = true;
            setting.draggable = false;
            setting.resizable = false;
            setting.closable = false;
            setting.dialogClass = 'ui-dialog-images';
            setting.minHeight = 300;
            setting.minWidth = 300;

            _dialog.dialog(setting);
            if (loadCompleteCallback) {
                loadCompleteCallback();
            }
        });
        _img.bind('error', function () {
            if (loadFailCallback) {
                loadFailCallback();
            } else {
                alert('Image cannot be loaded.');
            }
        });
    };


    eglhapplication_module.config(['$translateProvider',
    function ($translateProvider) {
        var result = null;

        $.ajax({
            type: 'get',
            url: '../eGLHApplication/REST/ValidationMessages',
            dataType: "json",
            async: false,
            success: function (data) {
                result = data.JSON_RESULT_DATA;
            },
            error: function (errMsg) {
                alert('unable to load validation message \n' + errMsg.responseText);
                throw new Error('unable to load validation message' + errMsg.responseText);
            }
        });

        var validationMessageTable = result;
        var defaultKey = null;
        for (var langKey in validationMessageTable) {
            if (!defaultKey) defaultKey = langKey;
            $translateProvider.translations(langKey, validationMessageTable[langKey]);
        }
        //set default language
        $translateProvider.preferredLanguage('zh');
    }
]);

// ------------------------------
