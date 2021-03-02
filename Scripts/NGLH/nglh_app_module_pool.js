nglh_app_module.controller('nglhAppFormPoolController', ['$scope', 'nglhAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$filter',
    function ($scope, nglhAppService, $timeout, $http, appConstant, $window, $filter) {
        $scope.pendingRecords = [];
        $scope.filteredPendingRecords = [];
        $scope.submittedRecords = [];
        $scope.documentList = [];
        $scope.isLoading = false;
        $scope.isOpenDocumentList = false;
        $scope.filteredSubmittedRecords = [];
        $scope.selectedSubmittedRecord = {};
        $scope.requestData = {};
        $scope.planList = new Array();
        $scope.submittedStatus = nglhAppService.loadCommonResourceList('submitted_eapp_status');
        $scope.getApplicationStatus = function (code) {
            var output = "";
            for (a in this.submittedStatus) {
                var b = this.submittedStatus[a];
                if (b.key == code) {
                    output = b.value;
                    break;
                }
            };
            return output;
        };

        $scope.homeCurrency = appConstant.HOME_CURRENCY;
        $scope.sortedColumn = null;

        $scope.selectPending = function (record) {
            $scope.selectedPendingRecord = record;
        };

        $scope.steps = [];
        $scope.steps = nglhAppService.getStepDefinition();

        $scope.$watch("selectedPendingRecord", function (record) {
            if (record) {
                $scope.selectedPendingRecordProgress = nglhAppService.loadPendingEGLHAppData(record.eAppNumber);
            }
        });

        $scope.select = function (record, $event) {
            $scope.verifyEAppBackDate(record, $event,
                function (record, $event) {
                    //<<20200558
                    var salesCode = $('#SalesCode').val();
                    var flag = nglhAppService.checkAppAgent(salesCode);
                    if (flag == "N") {
                        ShowMessageDialog("所选信息已经更新，请刷新后再试", "", function () {
                            window.location.href = "./PendingList";
                        });
                    } //>>20200558
                    else {
                        var _url = "Edit";
                        //todo check onglh
                        if (record.IsNglhFlag == "N") {
                            _url = "../EGLHApplication/Edit";
                        }

                        var form = $('<form action="' + _url + '" method="post">' +
                        '<input type="hidden" name="ApplicationNumber" value="' + record.eAppNumber + '" />' +
                        '</form>');
                        $('body').append(form);
                        $(form).submit();
                        if ($event.stopPropagation) $event.stopPropagation();
                        if ($event.preventDefault) $event.preventDefault();
                        $event.cancelBubble = true;
                        $event.returnValue = false;
                    }
                });

        };

        //<<King_GMMW 复制保单
        $scope.copyPolicy = function (record, $event) {
            //<<20200558
            var salesCode = $('#SalesCode').val();
            var flag = nglhAppService.checkAppAgent(salesCode);
            if (flag == "N") {
                $scope.showLoading(true);
                ShowMessageDialog("所选信息已经更新，请刷新后再试", "", function () {
                    window.location.href = "./PendingList";
                });
            } //>>20200558
            else {
                ShowConfirmationDialog($filter('translate')('MESSAGE_COPY_POLICY'), $filter('translate')('MESSAGE_YES'), $filter('translate')('MESSAGE_NO'), function () {
                    if (record) {
                        var newAppNum = nglhAppService.copyPolicy(record.eAppNumber);
                        if (newAppNum) {
                            var msg = $filter('translate')('MESSAGE_COPY_SUCCEED') + newAppNum;
                            ShowMessageDialog(msg, "", function () {
                                $scope.verifyEAppBackDate(record, $event,
                                        function (record, $event) {
                                            var _url = "Edit";
                                            var form = $('<form action="' + _url + '" method="post">' +
                                                '<input type="hidden" name="ApplicationNumber" value="' + newAppNum + '" />' +
                                                '</form>');
                                            $('body').append(form);
                                            $(form).submit();
                                            //                                            if ($event.stopPropagation) $event.stopPropagation();
                                            //                                            if ($event.preventDefault) $event.preventDefault();
                                            //                                            $event.cancelBubble = true;
                                            //                                            $event.returnValue = false;
                                        });
                            });
                        }
                    }
                });
            }
        };
        //>>King_GMMW

        $scope.verifyEAppBackDate = function (record, $event, callbackFunc) {
            $scope.showLoading(true);
            callbackFunc(record, $event);
        };

        //--check request device
        $scope.IsMobileBrowser = function () {
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

        $scope.isImageUploadShow = function () {
            if ($scope.selectedSubmittedRecord == null) {
                return false;
            }

            if ($scope.selectedSubmittedRecord.Status == "06") {
                return false;
            }

            var _date = parseDateWithISOFormat($scope.selectedSubmittedRecord.Modified);
            if (_date) {
                var diff = Math.abs(Math.floor((new Date()).getTime() - _date.getTime()));
                var day = 1000 * 60 * 60 * 24;
                var days = Math.floor(diff / day);
                _isShow = (days <= 3);
            }

            return _isShow && $scope.selectedSubmittedRecord.CanImageUpload;

            ///var enableStatusArr = ['02']; //04
            //var currentAppStatus = $scope.selectedSubmittedRecord.Status;
            //return ($.inArray(currentAppStatus, enableStatusArr) != -1 && $scope.selectedSubmittedRecord.CanImageUpload);
        };

        $scope.confirmImageUploadMethod = function () {
            //<<20200558
            var salesCode = $('#SalesCode').val();
            var flag = nglhAppService.checkAppAgent(salesCode);
            if (flag == "N") {
                $scope.showLoading(true);
                ShowMessageDialog("所选信息已经更新，请刷新后再试", "", function () {
                    window.location.href = "./PendingList";
                });
            } //>>20200558
            else {
                nglhAppService.callImageUpload($scope.selectedSubmittedRecord.eAppNumber);
            }
        };

        $scope.deleteRecord = function (record) {
            if (record && record.eAppNumber) {
                //<<20200558
                $scope.showLoading(true);
                var salesCode = $('#SalesCode').val();
                var flag = nglhAppService.checkAppAgent(salesCode);
                if (flag == "N") {
                    ShowMessageDialog("所选信息已经更新，请刷新后再试", "", function () {
                        window.location.href = "./PendingList";
                    });
                } //>>20200558
                else {
                    ShowConfirmationDialog($filter('translate')('MESSAGE_DELETE_CONFORM'), $filter('translate')('MESSAGE_YES'), $filter('translate')('MESSAGE_NO'), function () {
                        //$scope.showLoading(true);20200558
                        nglhAppService.deleteApp(record.eAppNumber).then(function (result) {
                            ShowErrorDialog($filter('translate')('MESSAGE_DELETE_SUCCEED'), null);
                            $scope.initPending();
                            $scope.showLoading(false);
                        }, function (error) {
                            $scope.showLoading(false);
                        });
                    });
                }
            }
        };

        $scope.initPending = function () {
            $scope.requestData.SearchType = 'pending';

            $scope.pendingRecords = nglhAppService.loadApplicationListData($scope.requestData);
            $scope.filteredPendingRecords = $scope.applySearchFilter($scope.pendingRecords);

            if ($scope.filteredPendingRecords && $scope.filteredPendingRecords.length > 0) {
                $scope.selectedPendingRecord = $scope.filteredPendingRecords[0];
            }

            //create plan name list for search
            if ($scope.pendingRecords) {
                angular.forEach($scope.pendingRecords, function (value, key) {
                    if (value.PlanName && $.inArray(value.PlanName, $scope.planList) < 0) {
                        $scope.planList.push(value.PlanName);
                    }
                });

                $scope.planList.sort();
            }
        };

        $scope.initSubmitted = function () {
            $scope.requestData.SearchType = 'submitted';

            $scope.submittedRecords = nglhAppService.loadApplicationListData($scope.requestData);
            $scope.sortedColumn = "modifiedDateSortOrder";
            $scope.filteredSubmittedRecords = $scope.applySearchFilter($scope.submittedRecords);

            if ($scope.filteredSubmittedRecords && $scope.filteredSubmittedRecords.length > 0) {
                $scope.selectedSubmittedRecord = $scope.filteredSubmittedRecords[0];
            }

            if ($scope.submittedRecords) {
                angular.forEach($scope.submittedRecords, function (value, key) {
                    if (value.PlanName && $.inArray(value.PlanName, $scope.planList) < 0) {
                        $scope.planList.push(value.PlanName);
                    }
                });

                $scope.planList.sort();
            }
        };

        $scope.resetSortOrder = function (column) {
            $timeout(function () {
                if (column != 'eAppNumberSortOrder') $scope.eAppNumberSortOrder = 0;
                if (column != 'policyOwnerSortOrder') $scope.policyOwnerSortOrder = 0;
                if (column != 'planNameSortOrder') $scope.planNameSortOrder = 0;
                if (column != 'modifiedDateSortOrder') $scope.modifiedDateSortOrder = 0;
                if (column != 'statusSortOrder') $scope.statusSortOrder = 0;
                if (column != 'policyNumberSortOrder') $scope.policyNumberSortOrder = 0;
                if (column != 'submissionDateSortOrder') $scope.submissionDateSortOrder = 0;
            });
        };

        $scope.applySorting = function (source, column) {
            $scope.sortedColumn = column;
            $scope.resetSortOrder(column);
            var sortString = '';
            if (column == "eAppNumberSortOrder") {
                sortString = (($scope[column] == 0) ? '' : (($scope[column] < 0) ? '-eAppNumber' : 'eAppNumber')) + ' ';
            } else if (column == "policyOwnerSortOrder") {
                sortString = (($scope[column] == 0) ? '' : (($scope[column] < 0) ? '-Owner.Name' : 'Owner.Name')) + ' ';
            } else if (column == "planNameSortOrder") {
                sortString = (($scope[column] == 0) ? '' : (($scope[column] < 0) ? '-PlanName' : 'PlanName')) + ' ';
            } else if (column == "modifiedDateSortOrder") {
                sortString = (($scope[column] == 0) ? '' : (($scope[column] < 0) ? 'Modified' : '-Modified')) + ' ';
            } else if (column == "statusSortOrder") {
                sortString = (($scope[column] == 0) ? '' : (($scope[column] < 0) ? '-Status' : 'Status')) + ' ';
            } else if (column == "policyNumberSortOrder") {
                sortString = (($scope[column] == 0) ? '' : (($scope[column] < 0) ? '-PolicyNumber' : 'PolicyNumber')) + ' ';
            } else if (column == "submissionDateSortOrder") {
                sortString = (($scope[column] == 0) ? '' : (($scope[column] < 0) ? 'SubmissionDate' : '-SubmissionDate')) + ' ';
            }
            return $filter('orderBy')(source, sortString);
        };

        $scope.toggleSearchRow = function (name, isVisible) {
            $scope.searchRowsVisibility[name] = isVisible;
            if (!isVisible) {
                $scope.searchCriteriaTemp[name] = null;
            }
            $scope.refreshSearchButtonRowVisibility();
        };

        $scope.refreshSearchButtonRowVisibility = function () {
            var _isShown = false;
            angular.forEach($scope.searchRowsVisibility, function (value, key) {
                _isShown = _isShown || !value;
            });
            $scope.isSearchButtonRowShown = _isShown;
        };

        $scope.applySearchFilter = function (source) {
            $scope.searchCriteria = angular.copy($scope.searchCriteriaTemp);

            var isSelectedPendingRecordAlive = false;
            var isSelectedSubmittedRecordAlive = false;
            var result = [];
            for (var idx in source) {
                var record = source[idx];
                if ($scope.searchFilter(record)) {
                    result.push(record);
                    if ($scope.selectedPendingRecord && $scope.selectedPendingRecord.eAppNumber == record.eAppNumber) {
                        isSelectedPendingRecordAlive = true;
                    }
                    if ($scope.selectedSubmittedRecord && $scope.selectedSubmittedRecord.eAppNumber == record.eAppNumber) {
                        isSelectedSubmittedRecordAlive = true;
                    }
                }
            }

            if (!$scope.isSelectedPendingRecordAlive) {
                $scope.selectedPendingRecord = null;
            }

            if (!$scope.isSelectedSubmittedRecordAlive) {
                $scope.selectedSubmittedRecord = null;
            }

            result = $scope.applySorting(result, $scope.sortedColumn);

            return result;
        };

        $scope.searchFilter = function (client) {
            var _isMatch = true;
            var _isShowAll = true;
            var _criteria = ['eAppNumber', 'PlanName'];

            angular.forEach(_criteria, function (value, key) {
                //alert(key + ' - ' + value)
                var filterVal = $scope.searchCriteria[value];
                if (filterVal && filterVal.length > 0) {
                    _isShowAll = false;

                    var client_val = client[value];
                    if (client_val) {
                        _isMatch = _isMatch && client[value].toLowerCase().indexOf(filterVal.toLowerCase()) > -1;
                    } else {
                        _isMatch = false;
                    }

                }
            });

            // Handle status name filter
            var statusFilterVal = $scope.searchCriteria.Status;
            if (statusFilterVal && statusFilterVal.length > 0) {
                _isShowAll = false;
                _isMatch = _isMatch && client['Status'] == statusFilterVal;
            }
            //                // alert(client['UnderwritingResultCode']);
            //                var isSpecialPolicyStatus = (client['PolicyStatus'] == "1" || client['PolicyStatus'] == "3" || client['PolicyStatus'] == "N" || client['PolicyStatus'] == "R" || client['PolicyStatus'] == "X");
            //
            //                _isShowAll = false;
            //                if (statusFilterVal == "WFS") //等待提交核保
            //                    _isMatch = _isMatch && client['Status'] == "02";
            //                else if (statusFilterVal == "WFPS") //等待缴费安排
            //                    _isMatch = _isMatch && (client['Status'] == "03");
            //                else if (statusFilterVal == "WFP") //等待保费
            //                    _isMatch = _isMatch && (!isSpecialPolicyStatus && client['Status'] == "04" && client['UnderwritingResultCode'] != null && client['InitialPaymentMethod'] == "2");
            //                else if (statusFilterVal == "CI") //合同签发
            //                    _isMatch = _isMatch && (client['PolicyStatus'] == "1" || client['PolicyStatus'] == "3" || (!isSpecialPolicyStatus && client['Status'] == "04" && client['UnderwritingResultCode'] == 'UY' && client['InitialPaymentMethod'] == "3"));
            //                else if (statusFilterVal == "WFU") //人工核保
            //                    _isMatch = _isMatch && (!isSpecialPolicyStatus && client['Status'] == "04" && client['UnderwritingResultCode'] == 'UN' && client['InitialPaymentMethod'] == "3");
            //                else if (statusFilterVal == "UC") //人工核保
            //                    _isMatch = _isMatch && ((client['PolicyStatus'] == "N" || client['PolicyStatus'] == "R" || client['PolicyStatus'] == "X") && client['Status'] == "04");
            //                else if (statusFilterVal == "C") //关闭
            //                    _isMatch = _isMatch && (client['Status'] == "05" || client['Status'] == "06");


            // Handle owner name filter
            var ownerNameFilterVal = $scope.searchCriteria.OwnerFullName;
            if (ownerNameFilterVal && ownerNameFilterVal.length > 0) {
                _isShowAll = false;
                _isMatch = _isMatch && (client.Owner.Name.toLowerCase().indexOf(ownerNameFilterVal.toLowerCase()) > -1);
            }

            // Handle insured name filter
            // TO DO - Since insured object is not yet appear in the result set, filter owner now temporary.
            var insuredNameFilterVal = $scope.searchCriteria.InsuredFullName;
            if (insuredNameFilterVal && insuredNameFilterVal.length > 0) {
                _isShowAll = false;
                _isMatch = _isMatch && (client.InsuredNames.toLowerCase().indexOf(insuredNameFilterVal.toLowerCase()) > -1);
            }

            // Handle Modified Date filter
            if ($scope.searchCriteria.Modified) {
                _isShowAll = false;
                var daysFilterVal = parseInt($scope.searchCriteria.Modified);
                //var _date = new Date(client.Modified);
                var _date = parseDateWithISOFormat(client.Modified);
                if (_date) {
                    var diff = Math.abs(Math.floor((new Date()).getTime() - _date.getTime()));
                    var day = 1000 * 60 * 60 * 24;
                    var days = Math.floor(diff / day);
                    _isMatch = _isMatch && (days <= daysFilterVal);
                }
            }

            // Handle Submission Date filter
            if ($scope.searchCriteria.SubmissionDate) {
                _isShowAll = false;
                var daysFilterVal = parseInt($scope.searchCriteria.SubmissionDate);
                //var _date = new Date(client.SubmissionDate);
                var _date = parseDateWithISOFormat(client.SubmissionDate);
                if (_date) {
                    var diff = Math.abs(Math.floor((new Date()).getTime() - _date.getTime()));
                    var day = 1000 * 60 * 60 * 24;
                    var days = Math.floor(diff / day);
                    _isMatch = _isMatch && (days <= daysFilterVal);
                }
            }


            return _isMatch || _isShowAll;
        };

        $scope.showLoading = function (isShown) {
            //trigger digest to refresh UI
            $timeout(function () {
                $scope.isLoading = isShown;
            }, 0);
        };

        $scope.notSorted = function (obj) {
            if (!obj) {
                return [];
            }
            return Object.keys(obj);
        };

        $scope.documentDefinitions = [];
        $scope.isDocumentListShown = true;


        $scope.documentSubListFilter = function (doc) {
            var _isMatch = false;
            angular.forEach($scope.selectedSubmittedRecord.Documents, function (value, key) {
                if (value.DocCatCode == doc.DocCatCode) {
                    _isMatch = true;
                    return;
                }
            });
            return _isMatch;
        };

        $scope.isSearchPanelShown = false;
        $scope.searchRowsVisibility = {
            'OwnerFullName': true,
            'InsuredFullName': false,
            'eAppNumber': false,
            'PlanName': false,
            'Status': false,
            'Modified': false
        };
        $scope.searchCriteriaTemp = {};
        $scope.searchCriteria = {};

        $scope.toggleSearchPanel = function () {
            $scope.isSearchPanelShown = !$scope.isSearchPanelShown;
        };

        $scope.isSearchButtonRowShown = true;

        $scope.trim = function (s, maxLength) {
            if (s && s.length > maxLength) {
                return s.substr(0, maxLength) + "..";
            }

            return s;
        };

        $scope.getPlanCvgDesc = function (cvgcode) {
            return nglhAppService.loadPlanCvgDesc(cvgcode);
        };

        $scope.getDeductDesc = function (dedcode) {
            return nglhAppService.loadDeductDesc(dedcode);
        };

        $scope.getApplicationStatusSummary = function (statusCode, underwritingResult, initialPaymentMethod, policyStatus) {
            if (!statusCode) {
                return null;
            }

            return nglhAppService.loadApplicationStatusSummary(statusCode, underwritingResult, initialPaymentMethod, policyStatus);
        };

        $scope.selectSubmitted = function (record) {
            $scope.selectedSubmittedRecord = record;
            $scope.documentDefinitions = nglhAppService.loadDocumentDefinitions(record.PlanCode);
        };

        $scope.imageUploadEndDate = "";
        $scope.$watch("selectedSubmittedRecord", function (record) {
            if (record) {
                $scope.documentList = nglhAppService.getAllDocuments(record.eAppNumber);

                $scope.requestData = {};
                $scope.requestData.SearchType = 'submitted';
                $scope.requestData.AppNum = record.eAppNumber;
                var result = nglhAppService.loadApplicationListData($scope.requestData);
                if (result.length > 0) {
                    $scope.selectedSubmittedRecordDetail = result[0];
                    $scope.imageUploadEndDate = $scope.documentList.ImageUploadEndDate;
                    $scope.documentList = $scope.documentList.DocList;
                }
                else {
                    $scope.selectedSubmittedRecord = null;
                    $scope.selectedSubmittedRecordDetail = null;
                    $scope.documentList = [];
                }
            }
        });

        $scope.getInitialPremiumMethod = function (code) {
            if (!code) {
                code = '';
            }

            return nglhAppService.loadInitialPremiumMethod(code);
        };
    }
]);
