eglhapplication_module.controller('eGLHAppFormPersonController', ['$scope', 'eGLHAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$interval', '$filter', '$q',
    function ($scope, eGLHAppService, $timeout, $http, appConstant, $window, $interval, $filter, $q) {

        var chkClientFlg = true;

        //声明通用变量
        $scope.globalSPScopeKeys = [];
        $scope.globalPAScopeKeys = [];
        $scope.fullCheck = false;
        $scope.isLoading = false;
        $scope.peronsFieldModifiedInd = 'Y';
        $scope.duplicatedPersonName = '';
        $scope.insuredList = [];
        $scope.ErrorSummary = new ErrorSummaryHelper($scope, this);

        //begin Warning
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

        //姓名
        $scope.CheckNameWanings = function () {

            var target = "Person.Insured.Insured.Name";
            var value = $scope.Person.Insured.Insured.Name;

            if (value != '') {

                $scope.Warning.removeMessage(target);
                var insured = $scope.Person.Insured.Insured;
                var _msg = "";

                var isContainBlank = $scope.isFieldContainBlank(value);
                if (isContainBlank) {
                    //姓名首尾有空格
                    //姓名中含有空格则提示警告信息，警告信息：“（警告|客户：xxxxxx）姓名中含有空格符，请确认”。
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_NAME_WHITE_BLANK_WARRING');
                    _msg = _msg.format(value ? value : "");
                    $scope.Warning.addMessage(target, _msg);

                    return null;
                }

                var isNameValid = $scope.isOwnerNameValid(value);
                if (!isNameValid) {
                    //姓名中含有除了中文、英文、空格以外的其他字符时都提示警告信息，警告信息：“（警告|客户：xxxxxx）姓名中含有除中文、英文外其他字符，请确认”
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_NAME_WARRING');
                    _msg = _msg.format(value ? value : "");
                    $scope.Warning.addMessage(target, _msg);

                    return null;
                }

            }
            else {
                $scope.Warning.removeMessage(target);
            }
        }

        //16岁到18岁
        $scope.CheckDOBWanings = function () {
            var target = "Person.Insured.Insured.DOB";
            if ($scope.Person.Insured.Insured.Age >= 16 && $scope.Person.Insured.Insured.Age < 18) {
                $scope.Warning.removeMessage(target);
                var insured = $scope.Person.Insured.Insured;
                var _msg = "";
                var value = $scope.Person.Insured.Insured.Name;

                //主被保险人***为未成年人，请注意是否可以投保
                var _msg = $filter('translate')('MESSAGE_INSURED_LESS_THAN_16_18');
                _msg = _msg.format(value ? value : "");
                $scope.Warning.addMessage(target, _msg);
                return null;
            }
            else {
                $scope.Warning.removeMessage(target);
            }
        }

        //其他被保人年龄和主被保人年龄关系
        $scope.CheckOtherDobWanings = function (orgIndex) {
            var otherInsured = $scope.Person.OtherInsured[orgIndex];

            var target = "Person.OtherInsured.DOB_" + orgIndex;
            var value = otherInsured.Age;
            var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_AGE');
            _msg = _msg.format((orgIndex + 1), otherInsured.Name);


            var mainAge = $scope.Person.Insured.Insured.Age;
            $scope.Warning.removeMessage(target);

            if ((otherInsured.Relationship == "P" && (value <= mainAge || value - mainAge < 18 || value - mainAge > 60)) ||
                (otherInsured.Relationship == "C" && (mainAge <= value || mainAge - value < 18 || mainAge - value > 60))) {

                $scope.Warning.addMessage(target, _msg);
                return null;
            }
            else {
                $scope.Warning.removeMessage(target);
            }
        }


        //国籍
        $scope.CheckNationalityWanings = function () {
            var target = "Person.Insured.Insured.Nationality";
            var value = $scope.Person.Insured.Insured.Nationality;
            var name = $scope.Person.Insured.Insured.Name;
            $scope.Warning.removeMessage(target);
            var insured = $scope.Person.Insured.Insured;
            var _msg = "";

            //客户证件类型选择“护照”时，国籍选择“中国”时，系统提示Warning Message
            //（包括主被保险人、被保险人的证件类型与国籍校验）
            var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_CHINA_IDENTITY_DOCUMENT_TYPE');
            _msg = _msg.format("主被保险人", (name ? name : ""));

            if (insured.IDType && insured.IDType == "2" && value == "CHN") {
                $scope.Warning.addMessage(target, _msg);

                return null;
            }
        }

        //姓名
        $scope.CheckOtherNameWanings = function (orgIndex) {

            var target = "Person.OtherInsured.Name_" + orgIndex;
            var value = $scope.Person.OtherInsured[orgIndex].Name;

            if (value != '') {
                $scope.Warning.removeMessage(target);
                var otherInsured = $scope.Person.OtherInsured[orgIndex];
                var _msg = "";

                var isContainBlank = $scope.isFieldContainBlank(value);
                if (isContainBlank) {
                    //姓名首尾有空格
                    //姓名中含有空格则提示警告信息，警告信息：“（警告|客户：xxxxxx）姓名中含有空格符，请确认”。
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_NAME_WHITE_BLANK_WARRING');
                    var name = $scope.Person.OtherInsured[orgIndex].Name;
                    _msg = _msg.format((orgIndex + 1), name);
                    $scope.Warning.addMessage(target, _msg);

                    return null;
                }

                var isNameValid = $scope.isOwnerNameValid(value);
                if (!isNameValid) {
                    //姓名中含有除了中文、英文、空格以外的其他字符时都提示警告信息，警告信息：“（警告|客户：xxxxxx）姓名中含有除中文、英文外其他字符，请确认”
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_NAME_WARRING');
                    var name = $scope.Person.OtherInsured[orgIndex].Name;
                    _msg = _msg.format((orgIndex + 1), name);
                    $scope.Warning.addMessage(target, _msg);

                    return null;
                }
            }
            else {
                $scope.Warning.removeMessage(target);
            }
        }

        //国籍
        $scope.CheckOtherNationalityWanings = function (orgIndex) {

            var target = "Person.OtherInsured.Nationality_" + orgIndex;
            var value = $scope.Person.OtherInsured[orgIndex].Nationality;
            $scope.Warning.removeMessage(target);
            var otherInsured = $scope.Person.OtherInsured[orgIndex];
            var _msg = "";

            //客户证件类型选择“护照”时，国籍选择“中国”时，系统提示Warning Message
            //（包括主被保险人、被保险人的证件类型与国籍校验）
            var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_CHINA_IDENTITY_DOCUMENT_TYPE');
            var name = $scope.Person.OtherInsured[orgIndex].Name;    
            //20190540 jira         
            _msg = _msg.format((orgIndex + 1), name ? name : "");
//            _msg = _msg.format("其他被保险人", (name ? name : ""));

            if (otherInsured.IDType && otherInsured.IDType == "2" && value == "CHN") {
                $scope.Warning.addMessage(target, _msg);
                return null;
            }
        }

        //其他被保险人与主被保险人关系
        /*        $scope.CheckOtherRelationshipWanings = function (orgIndex) {

        var target = "Person.OtherInsured.Relationship_" + orgIndex;
        var value = $scope.Person.OtherInsured[orgIndex].Relationship;
        $scope.Warning.removeMessage(target);
        var otherInsured = $scope.Person.OtherInsured[orgIndex];
        var _msg = "";

        //若被保险人资料区域录入的 [与主被保险人关系]选择的 配偶 的关系的被保险人不止一个
        if (otherInsured.Relationship == 'S') {
        _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_SPOUSE_MORE_THAN_ONE');
        var name = $scope.Person.OtherInsured[orgIndex].Name;
        _msg = _msg.format(name ? name : "");

        var spCount = 0;
        for (var i = 0; i < $scope.Person.OtherInsured.length; i++) {
        var sp = $scope.Person.OtherInsured[i].Relationship;
        if (sp == 'S')
        { spCount += 1; }
        }
        if (spCount > 1) {
        $scope.Warning.addMessage(target, _msg);
        return null;
        }
        }

        //若被保险人资料区域录入的 [与主被保险人关系]选择的 父母 的关系的被保险人不止一个
        if (otherInsured.Relationship == 'P') {
        _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_PARENT_MORE_THAN_ONE');
        var name = $scope.Person.OtherInsured[orgIndex].Name;
        _msg = _msg.format(name ? name : "");

        var paCount = 0;
        for (var i = 0; i < $scope.Person.OtherInsured.length; i++) {
        var pa = $scope.Person.OtherInsured[i].Relationship;
        if (pa == 'P')
        { paCount += 1; }
        }
        if (paCount > 1) {
        $scope.Warning.addMessage(target, _msg);
        return null;
        }
        }
        }
        */
        //end Warning

        $scope.otherInsuredAddressList = [];
        $scope.SpouseCount = 0;

        //加载通用信息 
        $scope.nationalityList = eGLHAppService.loadCommonResourceList('nationality_options');
        $scope.identityDocumentTypeList = eGLHAppService.loadCommonResourceList('id_document_types');
        $scope.relationshipList = eGLHAppService.loadCommonResourceList('relationship_options_to_insured');
        $scope.occupationCodeList = eGLHAppService.loadOccupation();
        $scope.provinceList = eGLHAppService.loadProvinceList();
        $scope.provinceRegList = eGLHAppService.loadProvinceRegList();
        $scope.areaCodeList = eGLHAppService.loadAreaCodes();

        //初始化Scope Person
        $scope.Person = {};
        $scope.Person.Insured = {};
        $scope.Person.Insured.Insured = {};
        $scope.Person.Insured.Insured.ClassName = "Manulife.Cn.AWS.GLHAdmin.Interface.EGLHInsuredContract";

        $scope.getClientFromCAS = function (index, existData) {
            if (existData != null && existData != "") {
                var paras = existData.split(";");

                if (index == 99) {
                    $scope.Person.Insured.Insured.OccCD = paras[0];
                    $scope.Person.Insured.Insured.Mailbox = paras[1];
                    $scope.Person.Insured.Insured.Mobile = paras[2];
                    $scope.Person.Insured.Insured.ResidencePhoneNumber = paras[3];
                    $scope.Person.Insured.Insured.OfficePhoneNumber = paras[4];
                    $scope.Person.Insured.Insured.ResidenceAddressZipCode = paras[5];
                    $scope.Person.Insured.Insured.ResidenceAddressLine1 = paras[6];
                    $scope.Person.Insured.Insured.Name = paras[7];
                    $scope.Person.Insured.Insured.DOB = paras[9];
                    $scope.Person.Insured.Insured.Sex = paras[10];
                    $scope.Person.Insured.Insured.IDType = paras[11];
                    $scope.Person.Insured.Insured.ID = paras[12];
                    $scope.Person.Insured.Insured.Age = paras[13];

                    $scope.Person.Insured.Insured.ResidenceAddressProvince = paras[14];
                    $scope.onInsuredResidenceAddressProvinceChanged(paras[14]);
                    $scope.Person.Insured.Insured.ResidenceAddressTerritory = paras[15];
                    $scope.onInsuredResidenceAddressTerritoryChanged(paras[14], paras[15]);
                    $scope.Person.Insured.Insured.ResidenceAddressCounty = paras[16];
                    $scope.Person.Insured.Insured.ResidenceAddressLine1 = paras[17];

                    $scope.Person.Insured.Insured.ResidenceDistrictCode = paras[18];
                    $scope.Person.Insured.Insured.OfficeDistrictCode = paras[19];

                    $scope.GetInsuredOccupationClass();
                } else {
                    var otherInsured = $scope.Person.OtherInsured[index];
                    otherInsured.OccCD = paras[0];
                    otherInsured.Mobile = paras[2];

                    otherInsured.Name = paras[7];
                    otherInsured.DOB = paras[9];
                    otherInsured.Sex = paras[10];
                    otherInsured.IDType = paras[11];
                    otherInsured.ID = paras[12];
                    otherInsured.Age = paras[13];

                    otherInsured.SameAddress = 'N'

                    otherInsured.ResidenceAddressProvince = paras[14];
                    $scope.onOtherInsuredResidenceAddressProvinceChanged(paras[14], index);
                    otherInsured.ResidenceAddressTerritory = paras[15];
                    $scope.onOtherInsuredResidenceAddressTerritoryChanged(paras[14], paras[15], index);
                    otherInsured.ResidenceAddressCounty = paras[16];
                    otherInsured.ResidenceAddressLine1 = paras[17];

                    $scope.GetOtherInsuredOccupationClass(index);
                }

                $scope.$apply()
            }
        }

        $scope.initialPerson = function () {
            var appNum = eGLHAppService.getAppNum(); // 'SH40969066630';
            $scope.Person = eGLHAppService.loadPerson(appNum);

            $scope.selectIdentityDocumentIsPermanent($scope.Person.Insured.Insured);

            //其他被保人省市区三级联动 准备数据
            if ($scope.Person.OtherInsured.length > 0) {
                var result = [];
                for (var i = 0; i <= $scope.Person.OtherInsured.length - 1; i++) {
                    var o = $scope.Person.OtherInsured[i];
                    var tmpOtherInsuredResidenceAddressTerritoryList = eGLHAppService.loadTerritoryList(o.ResidenceAddressProvince);
                    var tmpOtherInsuredResidenceAddressCountyList = eGLHAppService.loadCountyList(o.ResidenceAddressProvince, o.ResidenceAddressTerritory);

                    result.push({
                        "otherInsuredResidenceAddressTerritoryList": tmpOtherInsuredResidenceAddressTerritoryList,
                        "otherInsuredResidenceAddressCountyList": tmpOtherInsuredResidenceAddressCountyList
                    });

                    $scope.selectIdentityDocumentIsPermanent(o);
                }

                $scope.otherInsuredAddressList = result;
            }
        }

        $scope.GetInsuredOccupationClass = function () {
            if ($scope.occupationCodeList.length > 0) {
                var occCode = $scope.Person.Insured.Insured.OccCD;

                for (i = 0; i < $scope.occupationCodeList.length; i++) {
                    if ($scope.occupationCodeList[i].Value == occCode) {
                        $scope.Person.Insured.Insured.OccClass = $scope.occupationCodeList[i].CalsType;
                        break;
                    }
                }
            }
        }

        $scope.Initial = function () {
            return true;
        }

        $scope.Submit = function () {
            var data = $scope.Person;
            var flag = true;

            var result = eGLHAppService.SavePersonData(data);

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

        $scope.insuredPlaceOfCensusTerritoryList = eGLHAppService.loadTerritoryRegList($scope.Person.Insured.Insured.PlaceOfCensusProvince);

        //------------------------Person--------------------------------------
        //页面Chnage事件
        $scope.onInsuredPlaceOfCensusProvinceChanged = function (provCd) {
            $scope.insuredPlaceOfCensusTerritoryList = eGLHAppService.loadTerritoryRegList(provCd);
            $scope.Person.Insured.Insured.PlaceOfCensusTerritory = null;
        };

        $scope.InitialInsuredPlaceOfCensusTerritory = function (provCd) {
            $scope.insuredPlaceOfCensusTerritoryList = eGLHAppService.loadTerritoryRegList(provCd);
        };

        $scope.onInsuredResidenceAddressProvinceChanged = function (provCd) {
            var insured = $scope.Person.Insured.Insured;

            $scope.insuredResidenceAddressTerritoryList = eGLHAppService.loadTerritoryList(provCd);
            $scope.insuredResidenceAddressCountyList = null;
            insured.ResidenceAddressTerritory = null;
            insured.ResidenceAddressCounty = null;
        };

        $scope.onInsuredResidenceAddressTerritoryChanged = function (provCd, terrCd) {
            $scope.insuredResidenceAddressCountyList = eGLHAppService.loadCountyList(provCd, terrCd);
            $scope.Person.Insured.Insured.ResidenceAddressCounty = null;
        };

        $scope.InitialResidenceAddressTerritoryList = function (provCd) {
            var insured = $scope.Person.Insured.Insured;
            $scope.insuredResidenceAddressTerritoryList = eGLHAppService.loadTerritoryList(provCd);
        };

        $scope.IntitalResidenceAddressCountyList = function (provCd, terrCd) {
            $scope.insuredResidenceAddressCountyList = eGLHAppService.loadCountyList(provCd, terrCd);
        };

        $scope.onInsuredOfficeOrSchoolAddressProvinceChanged = function (provCd) {
            var insured = $scope.Person.Insured.Insured;

            $scope.insuredOfficeOrSchoolAddressTerritoryList = eGLHAppService.loadTerritoryList(provCd);
            $scope.insuredOfficeOrSchoolAddressCountyList = null;
            insured.OfficeOrSchoolAddressTerritory = null;
            insured.OfficeOrSchoolAddressCounty = null;
        };

        $scope.onInsuredOfficeOrSchoolAddressTerritoryChanged = function (provCd, terrCd) {
            $scope.insuredOfficeOrSchoolAddressCountyList = eGLHAppService.loadCountyList(provCd, terrCd);
            $scope.Person.Insured.Insured.OfficeOrSchoolAddressCounty = null;
        };

        $scope.InitialOfficeOrSchoolAddressTerritoryList = function (provCd) {
            var insured = $scope.Person.Insured.Insured;
            $scope.insuredOfficeOrSchoolAddressTerritoryList = eGLHAppService.loadTerritoryList(provCd);
        };

        $scope.InitialOfficeOrSchoolAddressCountyList = function (provCd, terrCd) {
            $scope.insuredOfficeOrSchoolAddressCountyList = eGLHAppService.loadCountyList(provCd, terrCd);
        };

        $scope.onInsuredResidenceDistrictCodeChanged = function () {
            var insured = $scope.Person.Insured.Insured;
            if (insured.ResidenceDistrictCode && !insured.ResidencePhoneNumber) {
                $scope.ErrorSummary.clearDirty("$scope.Person.Insured.Insured.ResidencePhoneNumber", undefined, undefined);
            }
        };

        $scope.onInsuredOfficeDistrictCodeChanged = function () {
            var insured = $scope.Person.Insured.Insured;
            if (insured.OfficeDistrictCode && !insured.OfficePhoneNumber) {
                $scope.ErrorSummary.clearDirty("$scope.Person.Insured.Insured.OfficePhoneNumber", undefined, undefined);
            }
        };

        $scope.CalculateInsuredInfo = function (insured) {
            var age = 0;
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();

            if (insured.DOB != null) {
                var dobStr = (insured.DOB).substring(0, 10).replace(/-/g, "");
                var dobYear = dobStr.substring(0, 4);
                var dobMonth = dobStr.substring(4, 6);
                var dobDate = dobStr.substring(6, 8);

                age = year - dobYear;
                if (dobMonth > month) {
                    age = age - 1;
                }
                else if (dobMonth == month) {
                    if (dobDate >= date) {
                        age = age - 1;
                    }
                }
                else {
                    ;
                }
            }
            else {
                //基于身份证来判定年龄
                age = $scope.GetAgeFromID(insured);
            }

            if (age >= 0) {
                insured.Age = age;
            }
        }


        //根据证件号码取性别和出生日期
        $scope.GetAgeFromID = function (insured) {
            var age = 0;
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();

            if ((insured.IDType == '1' || insured.IDType == 'A' || insured.IDType == 'B' || insured.IDType == 'C') && insured.ID.length == 18) {

                var dobStr = insured.ID.substring(6, 14);
                var dobYear = dobStr.substring(0, 4);
                var dobMonth = dobStr.substring(4, 6);
                var dobDate = dobStr.substring(6, 8);

                //自动填充出生日期
                insured.DOB = dobYear + '-' + dobMonth + '-' + dobDate + 'T00:00:00';

                //自动填充性别
                var sexNumber = 1; //用男性来对比
                var chkResult = $scope.chkIdNumberMatchSex(insured.ID, sexNumber);

                if (!chkResult) {
                    insured.Sex = "F"; //性别为女
                }
                else {
                    insured.Sex = "M"; //性别为男
                }

                age = year - dobYear;
                if (dobMonth > month) {
                    age = age - 1;
                }
                else if (dobMonth == month) {
                    if (dobDate >= date) {
                        age = age - 1;
                    }
                }
                else {
                    ;
                }
            }

            //20190786 根据外国人居留身份证号获取生日和年龄
            if (insured.IDType == 'D' && insured.ID.length == 15) {
                var res = $scope.GetDobAndAgeFromForeignId(insured.ID)
                insured.DOB = res.dob;
                age = res.age;
            }

            return age;
        }

        //20190786 外国永久居留身份证
        $scope.GetDobAndAgeFromForeignId = function (idNum) {
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();

            var dobStr = idNum.substring(7, 13);
            var dobYear = dobStr.substring(0, 2);
            var dobMonth = dobStr.substring(2, 4);
            var dobDate = dobStr.substring(4, 6);

            if (dobYear > year.toString().substring(2, 4)) {
                dobYear = "19" + dobYear;
            } else {
                dobYear = "20" + dobYear;
            }

            var dob = dobYear + '-' + dobMonth + '-' + dobDate + 'T00:00:00';
            var age = year - dobYear;
            if (dobMonth > month) {
                age = age - 1;
            }
            else if (dobMonth == month) {
                if (dobDate >= date) {
                    age = age - 1;
                }
            }
            else {
                ;
            }


            return {
                dob: dob,
                age: age
            };

        }


        $scope.GetExistClientListByID = function () {
            if (chkClientFlg) {
                var insured = $scope.Person.Insured.Insured;
                if (insured.ID != undefined && insured.ID != '') {
                    getClientsByID(99, insured.ID);
                }
            }
        }

        $scope.GetExistClientList = function () {
            if (chkClientFlg) {
                var insured = $scope.Person.Insured.Insured;
                if (insured.Name != undefined && insured.Name != ''
					&& insured.Sex != null && insured.Sex != undefined
					&& insured.DOB != null && insured.DOB != undefined) {
                    getClientsByName(99, insured.Name, insured.Sex, insured.DOB);
                }
            }
        }

        $scope.GetOtherInsuredClientListByID = function (index) {
            if (chkClientFlg) {
                var otherInsured = $scope.Person.OtherInsured[index];
                if (otherInsured.ID != undefined && otherInsured.ID != '') {
                    getClientsByID(index, otherInsured.ID);
                }
            }
        }

        $scope.GetOtherInsuredClientList = function (index) {
            if (chkClientFlg) {
                var otherInsured = $scope.Person.OtherInsured[index];
                if (otherInsured.Name != undefined && otherInsured.Name != ''
					&& otherInsured.Sex != null && otherInsured.Sex != undefined
					&& otherInsured.DOB != null && otherInsured.DOB != undefined) {
                    getClientsByName(index, otherInsured.Name, otherInsured.Sex, otherInsured.DOB);
                }
            }
        }

        //证件号码， 出生日期， 性别， 姓名四要素判别是否为同一个人
        $scope.checkDuplicatedInsured = function (index) {
            var sameCounter = 0;
            $scope.insuredList = [];

            //主被保险人
            var mainInsuredPerson = {
                "Name": $scope.Person.Insured.Insured.Name,
                "ID": $scope.Person.Insured.Insured.ID,
                "Sex": $scope.Person.Insured.Insured.Sex,
                "DOB": $scope.Person.Insured.Insured.DOB
            }

            var targetInsuredPerson = {};
            //99表示验证的是投保人
            if (index == 99) {
                targetInsuredPerson = mainInsuredPerson;
            }
            else {
                targetInsuredPerson =
                    {
                        "Name": $scope.Person.OtherInsured[index].Name,
                        "ID": $scope.Person.OtherInsured[index].ID,
                        "Sex": $scope.Person.OtherInsured[index].Sex,
                        "DOB": $scope.Person.OtherInsured[index].DOB
                    }
            }
            //将主被保险人加入对比列表
            $scope.insuredList.push(mainInsuredPerson);

            //所有其他被保险人
            if ($scope.Person.OtherInsured.length > 0) {
                for (var i = 0; i <= $scope.Person.OtherInsured.length - 1; i++) {
                    var otherInsured = $scope.Person.OtherInsured[i];
                    var otherInsurePerson = {
                        "Name": otherInsured.Name,
                        "ID": otherInsured.ID,
                        "Sex": otherInsured.Sex,
                        "DOB": otherInsured.DOB
                    }
                    //将其他被保险人加入对比列表
                    $scope.insuredList.push(otherInsurePerson);
                }
            }
            //遍历列表中所有的人员，并与目标人员进行对比
            //如果对比结果相同人数超过1人，即存在四要素相同的客户
            if ($scope.insuredList.length > 0) {
                for (var i = 0; i < $scope.insuredList.length; i++) {
                    var targetInsuredA = $scope.insuredList[i];
                    var sameValue = $scope.isObjectValueEqual(targetInsuredA, targetInsuredPerson)
                    if (sameValue == true && (targetInsuredA.Name != '' && targetInsuredA.ID != '' && targetInsuredA.Sex != '' && targetInsuredA.DOB != '')) {
                        sameCounter += 1;
                        if (sameCounter > 1) {
                            break;
                        }
                    }
                }
            }

            //有两个重复才能算作重复， 因自己会与自己比较
            if (sameCounter > 1) {
                return true;
            }
            else
            { return false; }
        }

        $scope.isObjectValueEqual = function (a, b) {
            var aProps = Object.getOwnPropertyNames(a);
            var bProps = Object.getOwnPropertyNames(b);

            if (aProps.length != bProps.length) {
                return false;
            }

            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i];
                var valueA = a[propName];
                var valueB = b[propName];

                if (!(valueA == '' || valueA == null || valueB == '' || valueB == null)) {
                    //如果是日期类型， 只需要比较前10位即可， 即yyyy-mm-dd
                    if (valueA.indexOf("T00") > -1 || valueA.indexOf("T12") > -1) {
                        valueA = valueA.substring(0, 10);
                        valueB = valueB.substring(0, 10);
                    }

                    if (valueA !== valueB) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }

            return true;
        }

        //前台校验规则
        //证件类型
        $scope.insuredDocumentTypeRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_IDENTITY_DOCUMENT_TYPE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var insured = $scope.Person.Insured.Insured;
                        if ((!value || value == '') && (insured.Age > 2 || insured.ID != '' || insured.IDExpired != null)) {
                            return true;
                        }

                        if (value) {
                            $scope.Person.Insured.Insured.IDType = value;
                            $scope.CheckNationalityWanings();
                        }

                        var nationality = $scope.Person.Insured.Insured.Nationality;
                        if (nationality != '') {
                            insured.IDType = value;
                            $scope.doValidator("Person.Insured.Insured.Nationality", null);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_CHINA_IDENTITY_DOCUMENT_TYPE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.Insured.Insured;
                        var nationality = insured.Nationality;
                        if (nationality != '') {
                            var isInvalidID = (value == '1' || value == '3') && (nationality != "CHN");
                            var isInvalidPP = (value == '2') && (nationality == "TWN" || nationality == "HKG" || nationality == "MAC");
                            var isInvalidHK = (value == '4') && (nationality != "TWN" && nationality != "HKG" && nationality != "MAC");
                            if (isInvalidID || isInvalidPP || isInvalidHK) {
                                return true;
                            }


                            //新增四种证件类型
                            if (nationality == "CHN" && (value == "A" || value == "B" || value == "C" || value == "D")) {
                                return true;
                            }
                            //新增四种证件类型
                            if ((nationality == "HKG" && value != "A") ||
                            (nationality == "MAC" && value != "B") ||
                            (nationality == "TWN" && value != "C") ||
                            (nationality && nationality != "CHN" && nationality != "HKG" && nationality != "MAC" && nationality != "TWN" && value != "2" && value != "D")) {
                                return true;
                            }
                        }

                        return false;
                    }
                }
            })
        ]);

        //证件号码
        $scope.insuredIdentityNumberRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_IDENTITY_NUMBER');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.Insured.Insured;
                        if ((!value || value == '') && (insured.Age > 2 || insured.IDType != '' || insured.IDExpired != null)) {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.Insured.Insured;
                        if (value) {
                            insured.ID = value;
                            return $scope.checkDuplicatedInsured(99);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_IDENTITY_CARD_NUMBER_BOOKLET');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.Insured.Insured;
                        //20190786  AWS 在线递交新增证件类型
                        if (value && (!$scope.chkValidIdNumberInput(value) || value.length != 18 || !/^[0-9]{17}([0-9]|X){1}$/.test(value)) 
                        && (insured.IDType == "1" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C")) {
                            return true;
                        }
                        //20190786  AWS 在线递交新增证件类型
                        if (value && ((insured.IDType == "A" && value.indexOf("810000") != 0) ||
                                    (insured.IDType == "B" && value.indexOf("820000") != 0) ||
                                    (insured.IDType == "C" && value.indexOf("830000") != 0))) {
                            return true;
                        }
                        //20190786  AWS 在线递交新增证件类型
                        if (value && insured.IDType == "D" && !/^[A-Z]{3}[0-9]{12}$/.test(value)) {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                //message: "投保人 - 性别与身份证不符，请核实!",
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_GENDER_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var insured = $scope.Person.Insured.Insured;
                            if (insured.IDType == "1" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C") {
                                var defaultSex = "M";
                                var sexNumber = $scope.getSexNumber(defaultSex);
                                var chkResult = $scope.chkIdNumberMatchSex(value, sexNumber);
                                if (!chkResult) {
                                    insured.Sex = "F";
                                }
                                else {
                                    insured.Sex = "M";
                                }
                            }
                        }

                        return false;
                    }
                }
            }),
            new Rule({
                //message: "投保人 - 出生日期与身份证不符，请核实!",
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_DOB_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var insured = $scope.Person.Insured.Insured;
                            insured.ID = value;
                            if (insured.IDType == "1" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C" || insured.IDType == "D") {
                                var defaultDOB = "1900-01-01";
                                var birthdayNumber = $scope.getBirthdayNumber(defaultDOB);
                                var chkResult = $scope.chkIdNumberMatchBirthday(value, birthdayNumber);
                                if (!chkResult) {
                                    //return true;
                                    var age = $scope.GetAgeFromID(insured);
                                    if (age >= 0) {
                                        insured.Age = age;
                                    }
                                }
                            }

                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_IDENTITY_NUMBER_FORMAT');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var insured = $scope.Person.Insured.Insured;
                            if (insured.IDType == "2" && value.length <= 3) {
                                return true;
                            } else if (insured.IDType == "3" && ($scope.countLength(value) < 10 || $scope.countLength(value) > 18)) {
                                return true;
                            }
                        }
                        return false;
                    }
                }
            })
        ]);

        //证件有效期
        $scope.insuredIdentityDocumentExpiryDateRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_IDENTITY_DOCUMENT_EXPIRY_DATE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.Insured.Insured;
                        if (!value || value == '') {
                            if (insured.Age < 17) {
                                //对于0<= and<=16周岁未成年人非必填项
                                return false;
                            }
                            else {
                                //如果大于16岁且证件类型、证件号码任一已选择则为必填项
                                if (insured.ID != '' || insured.IDType != '') {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_IDENTITY_DOCUMENT_EXPIRY_DATE_LESS_THAN_TODAY');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value)
                            return $scope.compareDateToToday(value, 1);
                        return false;
                    }
                }
            })
        ]);

        //点击长期有效复选框
        $scope.changeIdentityDocumentIsPermanent = function (clientSection) {
            if (clientSection) {
                if (clientSection.IDIsPermanent == "Y") {
                    clientSection.IDExpired = "2099-12-31T00:00:00"; //ISO format
                } else {
                    clientSection.IDExpired = null;
                }
            }

            if (clientSection.IDExpired != "2099-12-31T00:00:00") {
                clientSection.IDIsPermanent = null;
            }
        };
        //手动修改长期有效的日期后，复选框不选中
        $scope.selectIdentityDocumentIsPermanent = function (clientSection) {
            if (clientSection.IDExpired != "2099-12-31T00:00:00") {
                clientSection.IDIsPermanent = null;
            } else {
                clientSection.IDIsPermanent = "Y";
            }

            if (clientSection.IDExpired == null || clientSection.IDExpired == "") {
                clientSection.IDExpired = null;
            }

        };

        //主被保人姓名
        $scope.insuredNameRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_NAME');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        $scope.Person.Insured.Insured.Name = value;
                        $scope.CheckNameWanings();
                        $scope.CheckNationalityWanings();

                        if (!value || value == '') {
                            return true;
                        }
                        else {
                            $scope.GetExistClientList();
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                }, performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.Insured.Insured.Name = value;
                            return $scope.checkDuplicatedInsured(99);
                        }

                        $scope.doValidator("Person.Insured.Insured.ID", null);
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_NAME_EXCESS_MAXIMUM_LENGTH');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name, NAME_MAXIMUM_LENGTH, NAME_MAXIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) > NAME_MAXIMUM_LENGTH) {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        //主被保险人性别
        $scope.insuredSexRules = new BusinessRules([
            new Rule({
                //message: "投保人 - 性别未填",
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_EMPTY_GENDER');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
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
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                }, performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.Insured.Insured.Sex = value;
                            return $scope.checkDuplicatedInsured(99);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                //message: "投保人 - 性别与身份证不符，请核实!",
                message: function (value, target, scopeKey, scope, controller, me) {
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.Insured.Insured.IDType });
                    var _msg = $filter('translate')('MESSAGE_INSURED_GENDER_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "", idtype ? idtype[0].value : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var insured = $scope.Person.Insured.Insured;
                            if (insured.IDType == "1" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C") {
                                var sexNumber = $scope.getSexNumber(value);
                                var chkResult = $scope.chkIdNumberMatchSex(insured.ID, sexNumber);
                                if (!chkResult) {
                                    return true;
                                }
                            }
                        }

                        //$scope.doValidator("Person.Insured.Insured.ID", null);
                        return false;
                    }
                }
            })
        ]);

        //出生日期
        $scope.insuredDOBRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_DOB_IS_EMPTY');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value) {
                            //出生日期字段为必填项
                            return true;
                        }

                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                }, performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.Insured.Insured.DOB = value;
                            return $scope.checkDuplicatedInsured(99);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_LESS_THAN_16');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.Insured.Insured.DOB = value;
                            $scope.CalculateInsuredInfo($scope.Person.Insured.Insured);
                            $scope.CheckDOBWanings();

                            //回退20186892修改内容
                            if ($scope.Person.Insured.Insured.Age < 16 || $scope.Person.Insured.Insured.Age > 60) {
                                //主被保险人至少要为成年人
                                return true;
                            }
                        }

                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.Insured.Insured.IDType });
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_BIRTHDAY');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "", idtype ? idtype[0].value : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            if (($scope.Person.Insured.Insured.IDType == '1' ||
                            $scope.Person.Insured.Insured.IDType == 'A' ||
                            $scope.Person.Insured.Insured.IDType == 'B' ||
                            $scope.Person.Insured.Insured.IDType == 'C') && $scope.Person.Insured.Insured.ID.length == 18) {
                                var dob = value.substring(0, 10).replace(/-/g, "");
                                var dobStr = ($scope.Person.Insured.Insured.ID).substring(6, 14);
                                if (dobStr != dob) {
                                    return true;
                                }
                            }

                            //20190786 外国永久居留身份证
                            if ($scope.Person.Insured.Insured.IDType == 'D' && $scope.Person.Insured.Insured.ID.length == 15) {
                                var dob = value.substring(2, 10).replace(/-/g, "");
                                var dobStr = ($scope.Person.Insured.Insured.ID).substring(7, 13);
                                if (dobStr != dob) {
                                    return true;
                                }
                            }

                        }

                        $scope.doValidator("Person.Insured.Insured.ID", null);

                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_FUTURE_BIRTHDAY');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : '');
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            return $scope.compareDateToToday(value, 0);
                        }
                        return false;
                    }
                }
            })
        ]);

        //社保
        $scope.insuredSocialSecRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_SOCIAL_CODE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : '');
                },
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

        //职业代码
        $scope.insuredOccCDRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_OCCUPATION_CODE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
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

        //国籍
        $scope.insuredNationalityRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_NATIONALITY');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value) {
                            return true;
                        }
                        else {
                            //20190786  AWS 在线递交新增证件类型
                            //$scope.Person.Insured.Insured.Nationality = value;
                            $scope.CheckNationalityWanings();
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_NON_CHINA_IDENTITY_DOCUMENT_TYPE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var insured = $scope.Person.Insured.Insured;
                        if (insured.IDType && insured.IDType != "2" && insured.IDType != "D" && value != "CHN" && value != "TWN" && value != "HKG" && value != "MAC") {//20190786  AWS 在线递交新增证件类型
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_IDENTITY_DOCUMENT_TYPE_NATIONALITY');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var insured = $scope.Person.Insured.Insured;
                        if (insured.IDType && insured.IDType == "4" && value != "" && value == "CHN") {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_CHINA_IDENTITY_DOCUMENT_TYPE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var insured = $scope.Person.Insured.Insured;
                        //20190786  AWS 在线递交新增证件类型
//                        if ((value == "TWN" || value == "HKG" || value == "MAC") && insured.IDType != "4") {
//                            return true;
//                        }
                        //20190786  AWS 在线递交新增证件类型
                        if ((value == "HKG" && insured.IDType != "A") ||
                            (value == "MAC" && insured.IDType != "B") ||
                            (value == "TWN" && insured.IDType != "C") ||
                            (value != "CHN" && value != "HKG" && value != "MAC" && value != "TWN" && insured.IDType && insured.IDType != '2' && insured.IDType != "D")) {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        //户籍所在地
        $scope.insuredCensusProvinceRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_PLACE_OF_CENSUS_PROVINCE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.Insured.Insured.Nationality == "CHN") {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.insuredCensusTerritoryRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_PLACE_OF_CENSUS_TERRITORY');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.Insured.Insured.Nationality == "CHN" && $scope.Person.Insured.Insured.PlaceOfCensusTerritory != "") {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        //住址区号
        $scope.insuredResidenceDistrictCodeRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_RESIDENCE_DISTRICT_CODE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.Insured.Insured.ResidencePhoneNumber)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_RESIDENCE_DISTRICT_CODE_INCOMPLETE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        if (value) {
                            for (k in $scope.areaCodeList) {
                                if (value == $scope.areaCodeList[k]) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    }
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        //住址电话号码
        $scope.insuredResidencePhoneNumberRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_RESIDENCE_PHONE_NUMBER');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.Insured.Insured.ResidenceDistrictCode)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_RESIDENCE_PHONE_NUMBER_INCOMPLETE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && !$scope.chkValidPhoneNumberInput(value))
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_RESIDENCE_PHONE_NUMBER_INVALID');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var count = value.match(/\//g);
                            if (count && count.length > 1)
                                return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        //单位区号
        $scope.insuredOfficeDistrictCodeRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_OFFICE_DISTRICT_CODE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.Insured.Insured.OfficePhoneNumber)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_OFFICE_DISTRICT_CODE_INCOMPLETE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        if (value) {
                            for (k in $scope.areaCodeList) {
                                if (value == $scope.areaCodeList[k]) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    }
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        //单位电话号码
        $scope.insuredOfficePhoneNumberRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_OFFICE_PHONE_NUMBER');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.Insured.Insured.OfficeDistrictCode)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_OFFICE_PHONE_NUMBER_INCOMPLETE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && !$scope.chkValidPhoneNumberInput(value))
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_OFFICE_PHONE_NUMBER_INVALID');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var count = value.match(/\//g);
                            if (count && count.length > 1)
                                return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        //移动电话
        $scope.insuredMobilePhoneNumberRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_MOBILE_PHONE_NUMBER');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && !scope.isValidMobilePhoneNumber(value))
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_PHONE_NUMBER');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
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

        //邮箱
        $scope.insuredMailboxRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_EMAIL_ADDRESS_INVALID');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        if (value) {
                            return $scope.chkValidEmailAddressInput(value);
                        }
                        return false;
                    }
                }
            })
        ]);

        //通讯地址
        $scope.insuredResidenceAddressProvinceRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_RESIDENCE_ADDRESS_PROVINCE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.insuredResidenceAddressTerritoryRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_RESIDENCE_ADDRESS_TERRITORY');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.insuredResidenceAddressCountyRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_RESIDENCE_ADDRESS_COUNTY');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value) {
                            var insured = $scope.Person.Insured.Insured;
                            if (insured.ResidenceAddressProvince == "110000" || insured.ResidenceAddressProvince == "440000") {
                                if (insured.ResidenceAddressTerritory != "441900" && insured.ResidenceAddressTerritory != "442000") {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.insuredResidenceAddressLine1Rules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_RESIDENCE_ADDRESS_LINE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
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
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_RESIDENCE_ADDRESS_LINE_EXCESS_MAXIMUM_LENGTH');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name, ADDRESS_MAXIMUM_LENGTH, ADDRESS_MAXIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) > ADDRESS_MAXIMUM_LENGTH) {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_RESIDENCE_ADDRESS_LINE_EXCESS_MINIMUM_LENGTH');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name, ADDRESS_MINIMUM_LENGTH, ADDRESS_MINIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) < ADDRESS_MINIMUM_LENGTH) {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_RESIDENCE_ADDRESS_LINE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            return $scope.chkValidAddressInput(value);
                        }
                        return false;
                    }
                }
            })
        ]);

        //邮政编码
        $scope.insuredResidencePostCDRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_RESIDENCE_ZIP_CODE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
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
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_RESIDENCE_ADDRESS_ZIP_CODE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && value.length != 6)
                            return true;
                        return false;
                    }
                }
            })
        ]);

        //单位或学校名称
        $scope.insuredOfficeOrSchoolNameRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_NAME');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value) {
                            return true;
                        }

                        $scope.Person.Insured.Insured.OfficeOrSchool = value;
                        $scope.doValidator("Person.Insured.Insured.OfficeOrSchoolAddressProvince", null);
                        $scope.doValidator("Person.Insured.Insured.OfficeOrSchoolAddressTerritory", null);
                        $scope.doValidator("Person.Insured.Insured.OfficeOrSchoolAddressCounty", null);
                        $scope.doValidator("Person.Insured.Insured.OfficeOrSchoolAddressLine1", null);
                        $scope.doValidator("Person.Insured.Insured.OfficeOrSchoolAddressZipCode", null);
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_COMPANY_OR_SCHOOL_NAME_EXCESS_MAXIMUM_LENGTH');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name, COMPANY_OR_SCHOOL_NAME_MAXIMUM_LENGTH, COMPANY_OR_SCHOOL_NAME_MAXIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) > COMPANY_OR_SCHOOL_NAME_MAXIMUM_LENGTH) {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_COMPANY_OR_SCHOOL_NAME_LESS_THAN_MINIMUM_LENGTH');
                    var name = $scope.Person.Insured.Insured.Name;
                    //return _msg.format(name, ADDRESS_MINIMUM_LENGTH, ADDRESS_MINIMUM_LENGTH / 2);
                    return _msg.format(name, 4, 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && (value.indexOf("无") != 0) && $scope.countLength(value) < 4) {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_COMPANY_OR_SCHOOL_NAME_INVALID');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var firstChar = value.substring(0, 1);
                            var isChinese = $scope.containsChineseCharacter(firstChar);
                            if (!isChinese) {
                                return true;
                            }
                        }
                        return false;
                    }
                }
            })
        ]);

        //单位或学校地址
        $scope.insuredOfficeOrSchoolAddressProvinceRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_PROVINCE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.Insured.Insured;
                        //学校名称第一个不是"无"，则剩下关于学校信息字段都必须填写
                        if (!value && insured.OfficeOrSchool.indexOf('无') != 0)
                            return true;
                        return false;
                    }
                }
            })
        ]);

        $scope.insuredOfficeOrSchoolAddressTerritoryRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_TERRITORY');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.Insured.Insured;
                        if (!value && insured.OfficeOrSchool.indexOf('无') != 0)
                            return true;
                        return false;
                    }
                }
            })
        ]);

        $scope.insuredOfficeOrSchoolAddressCountyRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_COUNTY');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.Insured.Insured;
                        if (!value && insured.OfficeOrSchool.indexOf('无') != 0) {
                            var insured = $scope.Person.Insured.Insured;
                            if (insured.OfficeOrSchoolAddressProvince == "110000" || insured.OfficeOrSchoolAddressProvince == "440000") {
                                //ignore special cases in Territory, Copied From EAPS
                                if (insured.OfficeOrSchoolAddressTerritory != "441900" && insured.OfficeOrSchoolAddressTerritory != "442000") {
                                    return true;
                                }
                            }
                        }

                        return false;
                    }
                }
            })
        ]);

        $scope.insuredOfficeOrSchoolAddressLine1Rules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_ADDRESS_LINE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.Insured.Insured;
                        if (!value && insured.OfficeOrSchool.indexOf('无') != 0)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_COMPANY_OR_SCHOOL_ADDRESS_LINE_EXCESS_MAXIMUM_LENGTH');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name, ADDRESS_MAXIMUM_LENGTH, ADDRESS_MAXIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) > ADDRESS_MAXIMUM_LENGTH) {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_COMPANY_OR_SCHOOL_ADDRESS_LINE_EXCESS_MINIMUM_LENGTH');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name, ADDRESS_MINIMUM_LENGTH, ADDRESS_MINIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) < ADDRESS_MINIMUM_LENGTH) {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_COMPANY_OR_SCHOOL_ADDRESS_LINE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            return $scope.chkValidAddressInput(value);
                        }
                        return false;
                    }
                }
            })
        ]);

        //学校邮编
        $scope.insuredOfficeOrSchoolAddressZipCodeRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_ZIP_CODE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.Insured.Insured;
                        if (!value && insured.OfficeOrSchool.indexOf('无') != 0)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_COMPANY_OR_SCHOOL_ADDRESS_ZIP_CODE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && value.length != 6)
                            return true;
                        return false;
                    }
                }
            })
        ]);

        //其他被保险人
        $scope.Person.OtherInsured = {};
        //与主被保人的关系
        $scope.otherInsuredRelationshipRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_RELATIONSHIP');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
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
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_SPOUSE_MORE_THAN_ONE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg = _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        $scope.Person.OtherInsured[scope.$orgIndex].Relationship = value;
                        var spCount = 0;
                        for (var i = 0; i < $scope.Person.OtherInsured.length; i++) {
                            var sp = $scope.Person.OtherInsured[i].Relationship;
                            if (sp == 'S') {
                                spCount += 1;
                                $scope.globalSPScopeKeys.push(scopeKey);
                            }
                        }
                        if (spCount > 1) {
                            if (value == 'S') {
                                return true;
                            }
                            else {
                                $scope.ErrorSummary.remove("otherInsured.Relationship", scopeKey);
                            }
                        }
                        else {
                            for (var i = 0; i < $scope.globalSPScopeKeys.length; i++) {
                                var cnrtKey = $scope.globalSPScopeKeys.pop();

                                if (cnrtKey != '') {
                                    $scope.ErrorSummary.remove("otherInsured.Relationship", cnrtKey);
                                }
                            }
                        }
                        return false;
                    }
                }
            }),
			new Rule({
			    message: function (value, target, scopeKey, scope, controller, me) {
			        var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_PARENT_MORE_THAN_ONE');
			        var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
			        return _msg = _msg.format(name ? name : "");
			    },
			    performCheck: function () {
			        return $scope.fullCheck;
			    },
			    isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
			        if (me.isDirty(isDirty)) {
			            $scope.Person.OtherInsured[scope.$orgIndex].Relationship = value;
			            var paCount = 0;
			            for (var i = 0; i < $scope.Person.OtherInsured.length; i++) {
			                var pa = $scope.Person.OtherInsured[i].Relationship;
			                if (pa == 'P') {
			                    paCount += 1;
			                    $scope.globalPAScopeKeys.push(scopeKey);
			                }
			            }
			            //if (paCount > 1) {20184045
			            if (paCount > 2) {//20184045
			                if (value == 'P') {
			                    return true;
			                }
			                else {
			                    $scope.ErrorSummary.remove("otherInsured.Relationship", scopeKey);
			                }
			            }
			            else {
			                for (var i = 0; i < $scope.globalPAScopeKeys.length; i++) {
			                    var cnrtKey = $scope.globalPAScopeKeys.pop();

			                    if (cnrtKey != '') {
			                        $scope.ErrorSummary.remove("otherInsured.Relationship", cnrtKey);
			                    }
			                }
			            }

			            return false;
			        }
			    }
			})
        ]);

        //证件类型
        $scope.otherInsuredIdentityDocumentTypeRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_IDENTITY_DOCUMENT_TYPE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (!value || value == '') {
                            return true;
                        }

                        var nationality = otherInsured.Nationality;
                        if (nationality != '') {
                            otherInsured.IDType = value;
                            $scope.doValidator("otherInsured.Nationality", scopeKey);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_UNMATCHED_IDENTITY_DOCUMENT_TYPE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        var nationality = otherInsured.Nationality;
                        if (nationality != '') {
                            var isInvalidID = (value == '1' || value == '3') && (nationality != "CHN");
                            var isInvalidPP = (value == '2') && (nationality == "TWN" || nationality == "HKG" || nationality == "MAC");
                            var isInvalidHK = (value == '4') && ((nationality != "TWN" && nationality != "HKG" && nationality != "MAC") && !(nationality == "CHN" && otherInsured.Age <= 2));
                            if (isInvalidID || isInvalidPP || isInvalidHK) {
                                return true;
                            }


                            //20190786  AWS 在线递交新增证件类型
                            if (nationality == "CHN" && (value == "A" || value == "B" || value == "C" || value == "D")) {
                                return true;
                            }
                            //20190786  AWS 在线递交新增证件类型
                            if ((nationality == "HKG" && value != "A") ||
                            (nationality == "MAC" && value != "B") ||
                            (nationality == "TWN" && value != "C")||
                            (nationality != "CHN" && nationality != "HKG" && nationality != "MAC" && nationality != "TWN" && value != "2" && value != "D")) {
                                return true;
                            }
                        }

                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_CHN_BABY_FOBID_CARDTYPE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        var nationality = otherInsured.Nationality;
                        //2岁以下中国籍未成年人，只可选身份证或其他
                        if (value != '1' && value != '4' && nationality == 'CHN' && otherInsured.Age <= 2) {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        //证件号码
        $scope.otherInsuredIdentityNumberRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_IDENTITY_NUMBER');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (!value || value == '') {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format(name ? name : "");
                }, performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.OtherInsured[scope.$orgIndex].ID = value;
                            return $scope.checkDuplicatedInsured(scope.$orgIndex);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_IDENTITY_CARD_NUMBER');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.OtherInsured[scope.$orgIndex];
                        //20190786  AWS 在线递交新增证件类型
                        if (value && (!$scope.chkValidIdNumberInput(value) || value.length != 18 || !/^[0-9]{17}([0-9]|X){1}$/.test(value)) 
                        && (insured.IDType == "1" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C")) {
                            return true;
                        }
                        //20190786  AWS 在线递交新增证件类型
                        if (value && ((insured.IDType == "A" && value.indexOf("810000") != 0) ||
                                    (insured.IDType == "B" && value.indexOf("820000") != 0) ||
                                    (insured.IDType == "C" && value.indexOf("830000") != 0))) {
                            return true;
                        }
                        //20190786  AWS 在线递交新增证件类型
                        if (value && insured.IDType == "D" && !/^[A-Z]{3}[0-9]{12}$/.test(value)) {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_GENDER_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var insured = $scope.Person.OtherInsured[scope.$orgIndex];
                            if (insured.IDType == "1" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C") {
                                var defaultSex = "M";
                                var sexNumber = $scope.getSexNumber(defaultSex);
                                var chkResult = $scope.chkIdNumberMatchSex(value, sexNumber);
                                if (!chkResult) {
                                    insured.Sex = "F";
                                }
                                else {
                                    insured.Sex = "M";
                                }

                                //return true;
                            }
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DOB_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var insured = $scope.Person.OtherInsured[scope.$orgIndex];
                            insured.ID = value;
                            if (insured.IDType == "1" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C" || insured.IDType == "D") {
                                var defaultDOB = "1900-01-01";
                                var birthdayNumber = $scope.getBirthdayNumber(defaultDOB);
                                var chkResult = $scope.chkIdNumberMatchBirthday(value, birthdayNumber);
                                if (!chkResult) {
                                    var age = $scope.GetAgeFromID(insured);
                                    if (age >= 0) {
                                        insured.Age = age;
                                    }
                                }
                                //return true;
                            }



                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_IDENTITY_NUMBER_FORMAT');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);

                }, performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var insured = $scope.Person.OtherInsured[scope.$orgIndex];
                            if (insured.IDType == "2" && value.length <= 3) {
                                return true;
                            } else if (insured.IDType == "3" && ($scope.countLength(value) < 10 || $scope.countLength(value) > 18)) {
                                return true;
                            }
                        }
                        return false;
                    }
                }
            })
        ]);

        //证件期满日
        $scope.otherInsuredIdentityDocumentExpiryDateRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_IDENTITY_DOCUMENT_EXPIRY_DATE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (!value || value == '') {
                            if (insured.Age < 17) {
                                //对于0<= and<=16周岁未成年人非必填项
                                return false;
                            }
                            else {
                                //如果大于16岁且证件类型、证件号码任一已选择则为必填项
                                if (insured.ID != '' || insured.IDType != '') {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_IDENTITY_DOCUMENT_EXPIRY_DATE_LESS_THAN_TODAY');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value)
                            return $scope.compareDateToToday(value, 1);
                        return false;
                    }
                }
            })
        ]);

        //姓名
        $scope.otherInsuredNameRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_NAME');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        $scope.Person.OtherInsured[scope.$orgIndex].Name = value;
                        $scope.CheckOtherNameWanings(scope.$orgIndex);

                        if (!value || value == '') {
                            return true;
                        }
                        else {
                            $scope.GetOtherInsuredClientList(scope.$orgIndex);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format(name ? name : "");
                }, performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.OtherInsured[scope.$orgIndex].Name = value;
                            return $scope.checkDuplicatedInsured(scope.$orgIndex);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_NAME_EXCESS_MAXIMUM_LENGTH');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format(name, NAME_MAXIMUM_LENGTH, NAME_MAXIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) > NAME_MAXIMUM_LENGTH) {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        //性别
        $scope.otherInsuredSexRules = new BusinessRules([
            new Rule({
                //message: "其他被保险人 - 性别未填",
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_EMPTY_GENDER');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
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
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format(name ? name : "");
                }, performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.OtherInsured[scope.$orgIndex].Sex = value;
                            return $scope.checkDuplicatedInsured(scope.$orgIndex);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.OtherInsured[scope.$orgIndex].IDType });
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_GENDER_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name, idtype ? idtype[0].value : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                            if (otherInsured.IDType == "1" || otherInsured.IDType == "A" || otherInsured.IDType == "B" || otherInsured.IDType == "C") {
                                var sexNumber = $scope.getSexNumber(value);
                                var chkResult = $scope.chkIdNumberMatchSex(otherInsured.ID, sexNumber);
                                if (!chkResult)
                                    return true;
                            }
                        }

                        $scope.doValidator("otherInsured.ID", scopeKey);
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_SEX_SAME');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (value) {
                            if (otherInsured.Relationship == "S" && $scope.Person.Insured.Insured.Sex == value) {
                                return true;
                            }
                        }

                        otherInsured.Sex = value;
                        $scope.doValidator("otherInsured.ID", scopeKey);
                        $scope.doValidator("otherInsured.Relationship", scopeKey);
                        return false;
                    }
                }
            })
        ]);

        //出生日期
        $scope.otherInsuredDOBRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_DATE_OF_BIRTH');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value) {
                            return true;
                        }
                        $scope.Person.OtherInsured[scope.$orgIndex].DOB = value;
                        $scope.CalculateOtherInsuredAge(scope.$orgIndex);
                        //20190540 GMMW在线递交
                        $scope.CheckOtherDobWanings(scope.$orgIndex)
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format(name ? name : "");
                }, performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.OtherInsured[scope.$orgIndex].DOB = value;
                            return $scope.checkDuplicatedInsured(scope.$orgIndex);
                        }
                        return false;
                    }
                }
            }),
            new Rule({//如果当前客户“和被保人关系”为“配偶”，且其年龄小于20周岁或大于60周岁
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INVALID_MARRIAGE_INSURED_DATE_OF_BIRTH');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var relationship = $scope.Person.OtherInsured[scope.$orgIndex].Relationship;
                        if (value && relationship == 'S') {
                            if ($scope.Person.OtherInsured[scope.$orgIndex].Age < 20 || $scope.Person.OtherInsured[scope.$orgIndex].Age > 60) {
                                return true;
                            }
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.OtherInsured[scope.$orgIndex].IDType });
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_BIRTHDAY');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name, idtype ? idtype[0].value : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.OtherInsured[scope.$orgIndex].DOB = value;
                            if (($scope.Person.OtherInsured[scope.$orgIndex].IDType == '1' ||
                            $scope.Person.OtherInsured[scope.$orgIndex].IDType == 'A' ||
                            $scope.Person.OtherInsured[scope.$orgIndex].IDType == 'B' ||
                            $scope.Person.OtherInsured[scope.$orgIndex].IDType == 'C')
                         && $scope.Person.OtherInsured[scope.$orgIndex].ID.length == 18) {
                                var dob = value.substring(0, 10).replace(/-/g, "");
                                var dobStr = ($scope.Person.OtherInsured[scope.$orgIndex].ID).substring(6, 14);
                                if (dobStr != dob) {
                                    return true;
                                }
                            }

                            //20190786 外国永久居留身份证
                            if ($scope.Person.OtherInsured[scope.$orgIndex].IDType == 'D' && $scope.Person.OtherInsured[scope.$orgIndex].ID.length == 15) {
                                var dob = value.substring(2, 10).replace(/-/g, "");
                                var dobStr = ($scope.Person.OtherInsured[scope.$orgIndex].ID).substring(7, 13);
                                if (dobStr != dob) {
                                    return true;
                                }
                            }
                        }
                        if ($scope.Person.OtherInsured[scope.$orgIndex].ID != '') {
                            $scope.doValidator("otherInsured.ID", scopeKey);
                        }

                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_FUTURE_BIRTHDAY');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.OtherInsured[scope.$orgIndex].DOB = value;
                            return $scope.compareDateToToday(value, 0);
                        }
                        return false;
                    }
                }
            })
//            new Rule({
//                message: function (value, target, scopeKey, scope, controller, me) {
//                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_AGE');
//                    //var relationShip = $scope.Person.OtherInsured[scope.$orgIndex].Relationship;
//                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
//                    //return _msg.format((relationShip ? relationShip : (scope.$orgIndex + 1)), name);
//                    return _msg.format("其他被保险人" + (scope.$orgIndex + 1), name);

//                }, performCheck: function () {
//                    return $scope.fullCheck;
//                },
//                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
//                    if (me.isDirty(isDirty)) {
//                        if (value) {
//                            $scope.Person.OtherInsured[scope.$orgIndex].DOB = value;
//                            var relationship = $scope.Person.OtherInsured[scope.$orgIndex].Relationship;
//                            var mainAge = $scope.Person.Insured.Insured.Age;
//                            //var otherAge = $scope.Person.OtherInsured[scope.$orgIndex].Age;
//                            var otherAge = $scope.CalculateAge(value);
//                            if (relationship == "P" && (otherAge <= mainAge || otherAge - mainAge < 18 || otherAge - mainAge > 60)) {
//                                return true;
//                            }

//                            if (relationship == "C" && (mainAge <= otherAge || mainAge - otherAge < 18 || mainAge - otherAge > 60)) {
//                                return true;
//                            }

//                        }
//                        return false;
//                    }
//                }
//            })
        ]);

        //社保
        $scope.otherInsuredSocialSecRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_SOCIAL_CD');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
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

        //职业代码
        $scope.otherInsuredOccCDRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_OCCUPATION_CODE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
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

        //国籍
        $scope.otherInsuredNationalityRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_NATIONALITY');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value) {
                            return true;
                        }
                        else {
                            ////20190786  AWS 在线递交新增证件类型
                            //$scope.Person.OtherInsured[scope.$orgIndex].Nationality = value;
                            $scope.CheckOtherNationalityWanings(scope.$orgIndex);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_OTHERS_IDENTITY_DOCUMENT_TYPE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (otherInsured.IDType && otherInsured.IDType != "2" && otherInsured.IDType != "D" && value != "CHN" && value != "TWN" && value != "HKG" && value != "MAC") {//20190786  AWS 在线递交新增证件类型
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INVALID_OTHER_INSURED_IDENTITY_DOCUMENT_TYPE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var insured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (insured.IDType && insured.Age >2 && insured.IDType == "4" && value != "" && value == "CHN") {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        //移动电话
        $scope.otherInsuredMobilePhoneNumberRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_MOBILE_PHONE_NUMBER');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && !scope.isValidMobilePhoneNumber(value))
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_PHONE_NUMBER');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
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

        //家庭住址
        $scope.otherInsuredResidenceAddressProvinceRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_RESIDENCE_ADDRESS_PROVINCE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (!value && otherInsured.SameAddress != "Y") {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.otherInsuredResidenceAddressTerritoryRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_RESIDENCE_ADDRESS_TERRITORY');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (!value && otherInsured.SameAddress != "Y") {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.otherInsuredResidenceAddressCountyRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_RESIDENCE_ADDRESS_COUNTY');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (!value && otherInsured.SameAddress != "Y") {
                            if (otherInsured.ResidenceAddressProvince == "110000" || otherInsured.ResidenceAddressProvince == "440000") {
                                if (otherInsured.ResidenceAddressTerritory != "441900" && otherInsured.ResidenceAddressTerritory != "442000") {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.otherInsuredResidenceAddressLine1Rules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_RESIDENCE_ADDRESS_LINE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (!value && otherInsured.SameAddress != "Y") {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_RESIDENCE_ADDRESS_LINE_EXCESS_MAXIMUM_LENGTH');
                    return _msg.format((scope.$orgIndex + 1), $scope.Person.OtherInsured[scope.$orgIndex].Name, ADDRESS_MAXIMUM_LENGTH, ADDRESS_MAXIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (value && $scope.countLength(value) > ADDRESS_MAXIMUM_LENGTH && otherInsured.SameAddress != "Y") {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_RESIDENCE_ADDRESS_LINE_EXCESS_MINIMUM_LENGTH');
                    return _msg.format((scope.$orgIndex + 1), $scope.Person.OtherInsured[scope.$orgIndex].Name, ADDRESS_MINIMUM_LENGTH, ADDRESS_MINIMUM_LENGTH / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (value && $scope.countLength(value) <= ADDRESS_MINIMUM_LENGTH && otherInsured.SameAddress != "Y") {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_RESIDENCE_ADDRESS_LINE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (value && otherInsured.SameAddress != "Y") {
                            return $scope.chkValidAddressInput(value);
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.SameAddressTrueRules = new BusinessRules([
            new Rule({
                message: "",
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                            if (value == 'Y') {
                                otherInsured.SameAddress = value;
                                $scope.doValidator("otherInsured.ResidenceAddressProvince", scopeKey);
                                $scope.doValidator("otherInsured.ResidenceAddressTerritory", scopeKey);
                                $scope.doValidator("otherInsured.ResidenceAddressCounty", scopeKey);
                                $scope.doValidator("otherInsured.ResidenceAddressLine1", scopeKey);
                            }
                        }

                        return false;
                    }
                }
            })
        ]);


        $scope.initialOtherInsured = function (count) {
            if (count < 1) {
                for (i = 0; i < 2; i++) {
                    $scope.addOtherInsured();
                }
            }
            else {
                $scope.addOtherInsured();
            }

            //其他被保人省市区三级联动 准备数据
            if ($scope.Person.OtherInsured.length > 0) {
                var result = [];
                for (var i = 0; i <= $scope.Person.OtherInsured.length - 1; i++) {
                    var o = $scope.Person.OtherInsured[i];
                    var tmpOtherInsuredResidenceAddressTerritoryList = eGLHAppService.loadTerritoryList(o.ResidenceAddressProvince);
                    var tmpOtherInsuredResidenceAddressCountyList = eGLHAppService.loadCountyList(o.ResidenceAddressProvince, o.ResidenceAddressTerritory);

                    result.push({
                        "otherInsuredResidenceAddressTerritoryList": tmpOtherInsuredResidenceAddressTerritoryList,
                        "otherInsuredResidenceAddressCountyList": tmpOtherInsuredResidenceAddressCountyList
                    });
                }

                $scope.otherInsuredAddressList = result;
            }
        };

        $scope.CalculateOtherInsuredAge = function (index) {
            var age = 0;
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();
            if ($scope.Person.OtherInsured[index].DOB != null) {
                var dobStr = ($scope.Person.OtherInsured[index].DOB).substring(0, 10).replace(/-/g, "");
                var dobYear = dobStr.substring(0, 4);
                var dobMonth = dobStr.substring(4, 6);
                var dobDate = dobStr.substring(6, 8);

                age = year - dobYear;
                if (dobMonth > month) {
                    age = age - 1;
                }
                else if (dobMonth == month) {
                    if (dobDate >= date) {
                        age = age - 1;
                    }
                }
                else {
                    ;
                }
            }
            else {

                //基于身份证来判定年龄
                if ($scope.Person.OtherInsured[index].IDType == '1' && $scope.Person.OtherInsured[index].ID.length == 18) {
                    var dobStr = $scope.Person.OtherInsured[index].ID.substring(6, 14);
                    var dobYear = dobStr.substring(0, 4);
                    var dobMonth = dobStr.substring(4, 6);
                    var dobDate = dobStr.substring(6, 8);

                    age = year - dobYear;
                    if (dobMonth > month) {
                        age = age - 1;
                    }
                    else if (dobMonth == month) {
                        if (dobDate >= date) {
                            age = age - 1;
                        }
                    }
                    else {
                        ;
                    }
                }
            }

            if (age >= 0) {
                $scope.Person.OtherInsured[index].Age = age;
            }
        }

        $scope.GetOtherInsuredOccupationClass = function (index) {
            if ($scope.occupationCodeList.length > 0) {
                var occCode = $scope.Person.OtherInsured[index].OccCD;

                for (i = 0; i < $scope.occupationCodeList.length; i++) {
                    if ($scope.occupationCodeList[i].Value == occCode) {
                        $scope.Person.OtherInsured[index].OccClass = $scope.occupationCodeList[i].CalsType;
                        break;
                    }
                }
            }
        }

        $scope.addOtherInsured = function () {

            $scope.Person.OtherInsured.push({
                "ClassName": "Manulife.Cn.AWS.GLHAdmin.Interface.EGLHInsuredContract",
                "Relationship": "",
                "IDType": "",
                "ID": "",
                "Name": "",
                "Age": "",
                "Sex": "M",
                "OccCD": "",
                "SocialSecFlag": "",
                "Nationality": "",
                "Mobile": "",
                "SameAddress": "Y",
                "ResidenceAddressProvince": "",
                "ResidenceAddressTerritory": "",
                "ResidenceAddressCounty": "",
                "ResidenceAddressLine1": ""
            });
        };

        $scope.deleteOtherInsured = function (item) {
            item.canDelete
            $scope.showLoading(true);
            item.canDelete = true;
            ShowConfirmationDialog("删除该被保险人会同时删除相关账户信息,是否继续?", "是", "否", function () {
                var m = [];
                var list = $scope.Person.OtherInsured;

                for (var a in list) {
                    if (list[a].canDelete != true) {
                        m.push(list[a]);
                    }
                }
                angular.copy(m, $scope.Person.OtherInsured);
                $scope.showLoading(false);
            }, function () {
                item.canDelete = false;
                $scope.showLoading(false);
            });
        };

        $scope.getIdDocumentType = function (code) {
            return eGLHAppService.loadIdDocumentType(code).value;
        };

        $scope.onOtherInsuredResidenceAddressProvinceChanged = function (provCd, idx) {
            var otherInsured = $scope.Person.OtherInsured[idx];

            $scope.otherInsuredAddressList[idx].otherInsuredResidenceAddressTerritoryList = eGLHAppService.loadTerritoryList(provCd);
            $scope.otherInsuredAddressList[idx].otherInsuredResidenceAddressCountyList = null;
            otherInsured.ResidenceAddressTerritory = null;
            otherInsured.ResidenceAddressCounty = null;
        };

        $scope.onOtherInsuredResidenceAddressTerritoryChanged = function (provCd, terrCd, idx) {
            $scope.otherInsuredAddressList[idx].otherInsuredResidenceAddressCountyList = eGLHAppService.loadCountyList(provCd, terrCd);
            $scope.Person.OtherInsured[idx].ResidenceAddressCounty = null;
        };

        //通用方法
        $scope.chkValidIdNumberInput = function (idNum) {
            var WeightingFactor = new Array("7", "9", "10", "5", "8", "4", "2", "1", "6", "3", "7", "9", "10", "5", "8", "4", "2");
            var CheckCode = new Array("1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2");
            var regExp = /^(^\d{18}$|^\d{17}(\d|X|x))$/;
            var isValid = regExp.test(idNum);
            var SumWeighting = 0;

            if (idNum) {
                if (isValid) {
                    //前17位本体码加权求和
                    for (i = 0; i < 17; i++) {
                        SumWeighting += idNum[i] * WeightingFactor[i];
                    }
                    //检查计算后的检验码和输入的校验码是否一致
                    return (CheckCode[SumWeighting % 11] == idNum[17].toUpperCase());
                } else {
                    return false;
                }
            }

            return true;
        }

        $scope.getSexNumber = function (Sex) {
            //return 性别　1：Male　0：Female
            if (Sex) {
                if (Sex == "M")
                    return 1;
                else
                    return 0;
            }
        };

        $scope.getBirthdayNumber = function (Birthday) {
            //return 生日　19811010
            if (Birthday && Birthday.length >= 10) {
                return Birthday.substr(0, 4) + Birthday.substr(5, 2) + Birthday.substr(8, 2)
            }
        };

        $scope.CalculateAge = function (newDOB) {
            var age = 0;
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();
            if (newDOB != null) {
                var dobStr = newDOB.substring(0, 10).replace(/-/g, "");
                var dobYear = dobStr.substring(0, 4);
                var dobMonth = dobStr.substring(4, 6);
                var dobDate = dobStr.substring(6, 8);

                age = year - dobYear;
                if (dobMonth > month) {
                    age = age - 1;
                }
                else if (dobMonth == month) {
                    if (dobDate >= date) {
                        age = age - 1;
                    }
                }
                else {
                    ;
                }
            }
            return age;
        };

        $scope.chkIdNumberMatchSex = function (CardNo, Sex) {
            //性别　1：Male　0：Female
            if (Sex == 1 || Sex == 0) {
                if (CardNo != "" && CardNo.length == 15) {
                    if (Sex != null && Sex != undefined && CardNo.charAt(14) % 2 != Sex) {
                        return false;
                    }
                }
                if (CardNo != "" && CardNo.length == 18) {
                    if (Sex != null && Sex != undefined && CardNo.charAt(16) % 2 != Sex) {
                        return false;
                    }
                }
            }
            return true;
        };

        $scope.chkIdNumberMatchBirthday = function (CardNo, Birthday) {
            //生日　19811010
            if (Birthday) {
                if (CardNo != "" && CardNo.length == 15) {
                    if (Birthday != "" && (CardNo.substr(6, 6)) != Birthday.substr(2, 6)) {
                        return false;
                    }
                }
                if (CardNo != "" && CardNo.length == 18) {
                    if (Birthday != "" && CardNo.substr(6, 8) != Birthday) {
                        return false;
                    }
                }
            }
            return true;
        };

        $scope.isValidMobilePhoneNumber = function (phoneNo) {
//log20191420
//            if (phoneNo) {
//                if (phoneNo.length != 11) {
//                    return false;
//                } else {
//                    var validPrefix = ["13", "14", "15", "18", "17"];
//                    var isValid = false;
//                    for (i = 0; i < validPrefix.length; i++) {
//                        if (phoneNo.indexOf(validPrefix[i]) == 0) {
//                            isValid = true;
//                            break;
//                        }
//                    }
//                    return isValid;
//                }
//            }
//            return true; 

            return /^1\d{10}$/.test(phoneNo);
        };

        $scope.chkValidEmailAddressInput = function (email) {
            var regExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return !regExp.test(email);
        }

        $scope.compareDateToToday = function (value, type) {
            var q = new Date();
            var y = q.getFullYear();
            var m = q.getMonth() + 1;
            var d = q.getDate();

            var date = parseDateWithISOFormat(value);
            if (type == 1) //return 1：chk small than today　0：chk larger than today
                return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate()) < new Date(y, m, d);
            else
                return new Date(y, m, d) < new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
        };

        $scope.enableIdentityDocumentExpiryDate = function (client) {
            if (client.IdentityDocumentIsPermanent == 'Y') {
                return false;
            }

            return true;
            //return false;
        };
        $scope.saveDataWithVaildation = function () {
            $scope.showLoading(true);

            var errorCount = 0; // $scope._doValidation();  // $scope._doValidation(); //save with limited validation
            if (errorCount <= 0) {
                //var deferred = $q.defer();
                $scope.saveEApp(true).then(function () {
                    $scope.showLoading(false);
                    //deferred.resolve();
                }, function () {
                    $scope.showLoading(false);
                    // deferred.reject();
                });
            } else {
                $scope.showLoading(false);
            }
        };

        $scope.saveEApp = function (boolShowMsg) {
            var deferred = $q.defer();

            $timeout(function () {
                eGLHAppService.save($scope.Person, boolShowMsg).then(function () {
                    if (boolShowMsg) {
                        ShowErrorDialog('存储成功。', null);
                    }
                    deferred.resolve();
                }, function () {
                    deferred.reject();
                });

            }, 100);

            return deferred.promise;
        };

        $scope.chkValidAddressInput = function (address) {
            var str1 = address;
            var str2 = "-";
            var str3 = "#";
            var str4 = "/";

            var r1 = str1.indexOf(str2);
            var r2 = str1.indexOf(str3);
            var r3 = str1.indexOf(str4);
            if (($scope.countLength(address) < 3) || (r1 >= 0 || r2 >= 0 || r3 >= 0)) {
                return true; //have error
            }
            return false;
        }

        $scope.isoFormatDateToDisplayFormat = function (isoFormatDateStr, yearSeparator, monthSeparator, daySeparator) {

            if (yearSeparator) {
                var thisDate = parseDateWithISOFormat(isoFormatDateStr);
                return $.datepicker.formatDate('yy' + yearSeparator + 'mm' + monthSeparator + 'dd' + daySeparator, thisDate);
            } else {
                return isoFormatDateToDisplayFormat(isoFormatDateStr);
            }
        };

        $scope.chkValidPhoneNumberInput = function (phoneNo) {
            var isAllValid = true;
            var regExp = /^\d+[\d\/]{6,}$/;

            isAllValid = regExp.test(phoneNo);

            if (isAllValid) {
                if (phoneNo.length == 10) {
                    if (phoneNo.indexOf("400") != 0 && phoneNo.indexOf("800") != 0) {
                        isAllValid = false;
                    }
                }

                if (phoneNo.length > 10) {
                    isAllValid = false;
                }
            }

            return isAllValid;
        };

        $scope.loadPlaceOfCensusTerritory = function (province) {
            $scope.insuredPlaceOfCensusTerritoryList = eGLHAppService.loadTerritoryRegList(province);
        }

        $scope.loadResidenceAddressProvinceTerritory = function (province) {
            $scope.insuredResidenceAddressTerritoryList = eGLHAppService.loadTerritoryRegList(province);
        }

        $scope.loadOfficeOrSchoolAddressProvinceTerritory = function (province) {
            $scope.insuredOfficeOrSchoolAddressTerritoryList = eGLHAppService.loadTerritoryRegList(province);
        }

        $scope.enableIdentityDocumentIsPermanent = function (client) {
            if (client.DocumentType == "6" || client.DocumentType == "7") {
                client.IDIsPermanent = '';
                return false;
            }
            return true;
        }

        $scope.countLength = function (stringToCount) {
            var c = stringToCount.match(/[^ -~]/g);
            return stringToCount.length + (c ? c.length : 0);
        };

        $scope.showLoading = function (isShown) {
            $timeout(function () {
                $scope.isLoading = isShown;
            }, 0);
        };

        $scope.containsChineseCharacter = function (str) {
            var containChinese = /[\u3400-\u9FBF]+/.test(str);
            var containOtherCharacter = /[\W\S]+/.test(str);

            return (containChinese && containOtherCharacter);
        };

        $scope.containsEnglishCharacter = function (str) {
            return /[A-Za-z]+/.test(str);
        };

        $scope.containsNumbers = function (str) {
            return /[0-9]+/.test(str);
        };

        //验证用户名中是否只包含中文， 英文或者数字
        $scope.isOwnerNameValid = function (str) {
            var isChineseCharacter = false;
            var isEnglishCharacter = false;
            var isNumber = false;
            var curStr;

            for (var i = 0; i < str.length; i++) {
                curStr = str.substring(i, i + 1);
                curStr = curStr.replace(" ", "");
                if (curStr != "") {
                    isChineseCharacter = $scope.containsChineseCharacter(curStr);
                    isEnglishCharacter = $scope.containsEnglishCharacter(curStr);
                    isNumber = $scope.containsNumbers(curStr);

                    if (!(isChineseCharacter || isEnglishCharacter || isNumber)) {
                        return false;
                    }
                }

                isChineseCharacter = false;
                isEnglishCharacter = false;
                isNumber = false;
            }

            return true;
        };

        //检查字段中是否包含空格
        $scope.isFieldContainBlank = function (str) {
            var newStr = "";
            var curStr = "";

            for (var i = 0; i < str.length; i++) {
                curStr = str.substring(i, i + 1);
                curStr = curStr.replace(" ", "");
                newStr = newStr + curStr;
            }

            if (newStr == str) {
                return false;
            }

            return true;
        };

        $scope.startWithNumberCharacter = function (str) {
            return /^[0-9]*$/.test(str);
        };

        $scope.startWithEnglishCharacter = function (str) {
            return /^[A-Za-z]*$/.test(str);
        };

        $scope._doValidation = function (type) {
            var _errorCount = 0;

            chkClientFlg = false;

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

        $scope.isValidated = function (dependencyRules) {
            //validator.execute(value, scope, controller);
            try {
                var gv = new GroupValidator($scope, this, dependencyRules.rules, dependencyRules.targetId);
                //$scope.updateStepLock();
                return gv.isValid();
            } catch (err) {
                //alert(err.message);
                return false;
            }
        };

        $scope.doValidator = function (model, key) {
            var controller = $scope.ErrorSummary.getFieldSet(model, key).controller;

            if (controller != null) {
                doValidator(controller);
            }
        };

        $scope.trim = function (str) { //删除左右两端的空格
            return str.replace(/(^s*)|(s*$)/g, "");
        }

        $scope.ltrim = function (str) { //删除左边的空格
            return str.replace(/(^s*)/g, "");
        }
        $scope.rtrim = function (str) { //删除右边的空格
            return str.replace(/(s*$)/g, "");
        }

    }
]);