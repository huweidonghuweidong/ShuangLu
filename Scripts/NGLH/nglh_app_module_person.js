nglh_app_module.controller('nglhAppFormPersonController', ['$scope', '$compile', 'nglhAppService', '$timeout', '$http', 'APP_CONSTANT', '$window', '$interval', '$filter', '$q',
    function ($scope, compile, nglhAppService, $timeout, $http, appConstant, $window, $interval, $filter, $q) {

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
        //<<20194653
        $scope.showAgreement = false
        $scope.agreementIsAccept = ""
        //>>20194653

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


        /****************************定时warning信息***************************************<<20203337*/
        //以下为定时warning信息，提示信息会在定义时间后消失

        $scope.TimeoutWarning = {};
        $scope.TimeoutWarning.WarningList = [];
        $scope.TimeoutWarning.add = function (target, text, time) {
            if (parseInt(time) == NaN) {
                time = 2000;
            }
            var msg = {
                // key: target + "_" + Math.ceil(Math.random() * 1000),
                target: target,
                text: text,
                time: Date.parse(new Date()) + time
            };

            for (var i = 0; i < $scope.TimeoutWarning.WarningList.length; i++) {
                var curMsg = $scope.TimeoutWarning.WarningList[i];
                if (curMsg.target == target && curMsg.text == text) {
                    return;
                }
            }
            $scope.TimeoutWarning.WarningList.push(msg);
            $scope.TimeoutWarning.WarningList.sort(function (msg1, msg2) {
                return msg1.time - msg2.time;
            });
        }

        $scope.TimeoutWarning.get = function (target) {
            return $scope.TimeoutWarning.WarningList.filter(function (item) {
                return (item.target == target)
            });
        }

        setInterval(function () {
            var count = $scope.TimeoutWarning.WarningList.length;
            if (count > 0) {
                var toDelMsg = $scope.TimeoutWarning.WarningList[0];
                if (toDelMsg.time < Date.parse(new Date())) {
                    $scope.TimeoutWarning.WarningList.shift();
                    $scope.$apply();
                }

            }
        }, 100)

        /********************************************************************>>20203337*/

        //<<Larry 20186222
        //投保人国籍
        $scope.CheckPolicyHolderNationalityWanings = function () {
            var target = "Person.PolicyHolder.PolicyHolder.Nationality";
            var value = $scope.Person.PolicyHolder.PolicyHolder.Nationality;
            var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
            $scope.Warning.removeMessage(target);
            var insured = $scope.Person.PolicyHolder.PolicyHolder;
            var _msg = "";

            //客户证件类型选择“护照”时，国籍选择“中国”时，系统提示Warning Message
            //（包括主被保险人、被保险人的证件类型与国籍校验）
            var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_CHINA_IDENTITY_DOCUMENT_TYPE');
            _msg = _msg.format("主被保险人", (name ? name : ""));

            if (insured.IDType && insured.IDType == "2" && value == "CHN") {
                $scope.Warning.addMessage(target, _msg);

                return null;
            }
        }

        $scope.CheckPolicyHolderNameWanings = function () {

            var target = "Person.PolicyHolder.PolicyHolder.Name";
            var value = $scope.Person.PolicyHolder.PolicyHolder.Name;

            if (value != '') {

                $scope.Warning.removeMessage(target);
                //var insured = $scope.Person.Insured.Insured;
                var _msg = "";

                var isContainBlank = $scope.isFieldContainBlank(value);
                if (isContainBlank) {
                    //姓名首尾有空格
                    //姓名中含有空格则提示警告信息，警告信息：“（警告|客户：xxxxxx）姓名中含有空格符，请确认”。
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_NAME_WHITE_BLANK_WARRING');
                    _msg = _msg.format(value ? value : "");
                    $scope.Warning.addMessage(target, _msg);

                    return null;
                }

                var isNameValid = $scope.isOwnerNameValid(value);
                if (!isNameValid) {
                    //姓名中含有除了中文、英文、空格以外的其他字符时都提示警告信息，警告信息：“（警告|客户：xxxxxx）姓名中含有除中文、英文外其他字符，请确认”
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_NAME_WARRING');
                    _msg = _msg.format(value ? value : "");
                    $scope.Warning.addMessage(target, _msg);

                    return null;
                }

            }
            else {
                $scope.Warning.removeMessage(target);
            }
        }

        //>>Larry 20186222

        //姓名
        $scope.CheckNameWanings = function () {

            var target = "Person.Insured.Insured.Name";
            var value = $scope.Person.Insured.Insured.Name;

            if (value != '') {

                $scope.Warning.removeMessage(target);
                //var insured = $scope.Person.Insured.Insured;
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


            var mainAge = $scope.Person.PolicyHolder.PolicyHolder.Age;
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
        $scope.otherInsuredOccupationClassList = [];

        $scope.SpouseCount = 0;

        //加载通用信息 
        $scope.nationalityList = nglhAppService.loadCommonResourceList('nationality_options');
        $scope.identityDocumentTypeList = nglhAppService.loadCommonResourceList('id_document_types');
        $scope.relationshipList = nglhAppService.loadCommonResourceList('relationship_options_to_insured');
        $scope.relationguardianList = nglhAppService.loadCommonResourceList('relation_guardian');
        //加载总的职业代码
        $scope.occupationCodeList = nglhAppService.loadOccupation();
        $scope.provinceList = nglhAppService.loadProvinceList();
        $scope.provinceRegList = nglhAppService.loadProvinceRegList();
        $scope.areaCodeList = nglhAppService.loadAreaCodes();

        //初始化Scope Person
        $scope.Person = {};
        $scope.Person.Insured = {};
        $scope.Person.Insured.Insured = {};
        $scope.Person.Insured.Insured.ClassName = "Manulife.Cn.AWS.GLHAdmin.Interface.EGLHInsuredContract";

        //King_GACP
        $scope.oldPhIDExpired = ""; //用来保存证件有效期满日改变之前的值
        $scope.oldPhDOB = ""; //用来保存出生日期改变之前的值
        $scope.oldPhResidenceAddressZipCode = ""; //用来保存邮政编码改变之前的值
        $scope.oldPhOfficeOrSchool = ""; //用来保存单位或学校名称改变之前的值
        $scope.oldPhOfficeOrSchoolAddressLine1 = ""; //用来保存单位或学校名称具体地址改变之前的值
        $scope.oldPhOfficeOrSchoolAddressZipCode = ""; //用来保存邮政编码改变之前的值 
        $scope.oldIsCopyInsured = ""; //用来保存投保人即为主被保险人改变之前的值

        $scope.oldTelArea = ""; //区号
        $scope.oldTelNumber = "";   //电话
        $scope.oldCompTelArea = ""; //单位区号
        $scope.oldCompTelNumber = ""; //单位电话
        $scope.oldPhone = ""; //移动电话

        $scope.Person.PolicyHolder = {};
        $scope.Person.PolicyHolder.PolicyHolder = {};
        $scope.Person.PolicyHolder.PolicyHolder.ClassName = "Manulife.Cn.AWS.GLHAdmin.Interface.EGLHInsuredContract";

        $scope.getClientFromCAS = function (index, existData) {
            if (existData != null && existData != "") {
                var paras = existData.split(";");
                if (index == 88) {
                    $scope.Person.PolicyHolder.PolicyHolder.OccCD = paras[0];
                    $scope.Person.PolicyHolder.PolicyHolder.Mailbox = paras[1];
                    $scope.Person.PolicyHolder.PolicyHolder.Mobile = paras[2];
                    $scope.Person.PolicyHolder.PolicyHolder.ResidencePhoneNumber = paras[3];
                    $scope.Person.PolicyHolder.PolicyHolder.OfficePhoneNumber = paras[4];
                    $scope.Person.PolicyHolder.PolicyHolder.ResidenceAddressZipCode = paras[5];
                    $scope.Person.PolicyHolder.PolicyHolder.ResidenceAddressLine1 = paras[6];
                    $scope.Person.PolicyHolder.PolicyHolder.Name = paras[7];
                    $scope.Person.PolicyHolder.PolicyHolder.DOB = paras[9];
                    $scope.Person.PolicyHolder.PolicyHolder.Sex = paras[10];
                    $scope.Person.PolicyHolder.PolicyHolder.IDType = paras[11];
                    $scope.Person.PolicyHolder.PolicyHolder.ID = paras[12];
                    $scope.Person.PolicyHolder.PolicyHolder.Age = paras[13];

                    $scope.Person.PolicyHolder.PolicyHolder.ResidenceAddressProvince = paras[14];
                    $scope.onPolicyHolderResidenceAddressProvinceChanged(paras[14]);
                    $scope.Person.PolicyHolder.PolicyHolder.ResidenceAddressTerritory = paras[15];
                    $scope.onPolicyHolderResidenceAddressTerritoryChanged(paras[14], paras[15]);
                    $scope.Person.PolicyHolder.PolicyHolder.ResidenceAddressCounty = paras[16];
                    $scope.Person.PolicyHolder.PolicyHolder.ResidenceAddressLine1 = paras[17];

                    $scope.Person.PolicyHolder.PolicyHolder.ResidenceDistrictCode = paras[18];
                    $scope.Person.PolicyHolder.PolicyHolder.OfficeDistrictCode = paras[19];

                    $scope.GetPolicyHolderOccupationClass();
                } else if (index == 99) {
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
            var appNum = nglhAppService.getAppNum(); // 'SH40969066630';
            $scope.Person = nglhAppService.loadPerson(appNum);
            $scope.selectIdentityDocumentIsPermanent($scope.Person.PolicyHolder.PolicyHolder); //King_GACP
            $scope.selectIdentityDocumentIsPermanent($scope.Person.Insured.Insured);
            $scope.getRelativesGuardian(); //加载监护人数据
            $scope.getRelativesExceptSopuse(); //旁系
            //其他被保人省市区三级联动 准备数据
            if ($scope.Person.OtherInsured.length > 0) {
                var result = [];
                var resultIndustry = [];
                for (var i = 0; i <= $scope.Person.OtherInsured.length - 1; i++) {
                    var o = $scope.Person.OtherInsured[i];
                    var tmpOtherInsuredResidenceAddressTerritoryList = nglhAppService.loadTerritoryList(o.ResidenceAddressProvince);
                    var tmpOtherInsuredResidenceAddressCountyList = nglhAppService.loadCountyList(o.ResidenceAddressProvince, o.ResidenceAddressTerritory);

                    result.push({
                        "otherInsuredResidenceAddressTerritoryList": tmpOtherInsuredResidenceAddressTerritoryList,
                        "otherInsuredResidenceAddressCountyList": tmpOtherInsuredResidenceAddressCountyList
                    });

                    $scope.selectIdentityDocumentIsPermanent(o);
                    //设置监护人初始数据
                    if (o.GuardianTypeMode == 'select') {
                        var relativesGuardian = $scope.RelativesGuardian.filter(function (item) {
                            return (item.ID == o.GuardianIdNo && item.Name == o.GuardianName && item.Mobile == o.GuardianMobile)
                        });
                        o.GuardianKey = relativesGuardian[0];
                    }

                    //设置旁系亲属配偶对应的旁系亲属初始数据
                    var relativesSupose = $scope.RelativesExceptSopuse.filter(function (item) {
                        return (item.ID == o.RelativesIdNum && item.Name == o.RelativesCliNm)
                    });
                    o.RelativeSupose = relativesSupose[0];


                    //准备 职能/职业代码初始数据
                    var tmpotherInsuredIndustryCode2List = $scope.occupationCodeList.filter(function (item) {
                        return item.IndustryCode1 == o.IndustryCode1
                    });

                    var tmpotherInsuredOccupationCodeList = $scope.occupationCodeList.filter(function (item) {
                        return (item.IndustryCode1 == o.IndustryCode1 && item.IndustryCode2 == o.IndustryCode2)
                    });

                    resultIndustry.push({
                        "otherInsuredIndustryCode2List": tmpotherInsuredIndustryCode2List,
                        "otherInsuredOccupationCodeList": tmpotherInsuredOccupationCodeList
                    });

                }

                $scope.otherInsuredAddressList = result;
                $scope.otherInsuredOccupationClassList = resultIndustry;
            }

            //<<20194653
            var result = $scope.isNotHasChildren()
            if (result) {
                $scope.showAgreement = false
                $scope.agreementIsAccept = ""
            } else {
                $scope.showAgreement = true
            }
            //>>20194653
        }

        //<<King_GACP 投保人
        $scope.policyHolderPlaceOfCensusTerritoryList = nglhAppService.loadTerritoryRegList($scope.Person.PolicyHolder.PolicyHolder.PlaceOfCensusProvince);
        //----------------------------------------------------------------------------页面Chnage事情------------------------------------------------------------------------------
        $scope.test = function () {
            //            var PolicyHolder = $scope.Person.PolicyHolder.PolicyHolder;
            //            alert("begin="+PolicyHolder.DOB)
        }

        //<<监控值的改变
        $scope.$watch('Person.PolicyHolder.PolicyHolder.IDExpired', function (newVal, oldVal) {
            var newDate = newVal == null ? "" : newVal.replace("年", "-").replace("月", "-").replace("日", ""); //20193965 
            if (newDate == "2099-12-31T12:00:00" || newDate == "2099-12-31T00:00:00") {
                $scope.oldPhIDExpired = "2099-12-31T";
            }
            else {
                $scope.oldPhIDExpired = oldVal == null ? "" : oldVal.replace("年", "-").replace("月", "-").replace("日", ""); //20193965 
            }

        });

        $scope.$watch('Person.PolicyHolder.PolicyHolder.DOB', function (newVal, oldVal) {
            //<<20193965 
            if (oldVal) {
                $scope.oldPhDOB = oldVal.replace("年", "-").replace("月", "-").replace("日", "");
            }
            //>>20193965 
        });

        $scope.$watch('Person.PolicyHolder.PolicyHolder.OfficeOrSchool', function (newVal, oldVal) {
            $scope.oldPhOfficeOrSchool = oldVal;
        });

        $scope.$watch('Person.PolicyHolder.PolicyHolder.OfficeOrSchoolAddressLine1', function (newVal, oldVal) {
            $scope.oldPhOfficeOrSchoolAddressLine1 = oldVal;
        });

        $scope.$watch('Person.PolicyHolder.PolicyHolder.OfficeOrSchoolAddressZipCode', function (newVal, oldVal) {
            $scope.oldPhOfficeOrSchoolAddressZipCode = oldVal;
        });

        $scope.$watch('Person.PolicyHolder.PolicyHolder.ResidenceAddressZipCode', function (newVal, oldVal) {
            $scope.oldPhResidenceAddressZipCode = oldVal;
        });

        $scope.$watch('Person.PolicyHolder.PolicyHolder.ResidenceDistrictCode', function (newVal, oldVal) {
            $scope.oldTelArea = oldVal;
        });

        $scope.$watch('Person.PolicyHolder.PolicyHolder.ResidencePhoneNumber', function (newVal, oldVal) {
            $scope.oldTelNumber = oldVal;
        });

        $scope.$watch('Person.PolicyHolder.PolicyHolder.OfficeDistrictCode', function (newVal, oldVal) {
            $scope.oldCompTelArea = oldVal;
        });

        $scope.$watch('Person.PolicyHolder.PolicyHolder.OfficePhoneNumber', function (newVal, oldVal) {
            $scope.oldCompTelNumber = oldVal;
        });

        $scope.$watch('Person.PolicyHolder.PolicyHolder.Mobile', function (newVal, oldVal) {
            $scope.oldPhone = oldVal;
        });
        $scope.$watch('Person.Insured.Insured.IsCopyInsured', function (newVal, oldVal) {
            $scope.oldIsCopyInsured = oldVal;
        });

        //<<20194653
        $scope.$watch('Person.Insured.Insured.Age', function (newVal, oldVal) {

            if ($scope.showAgreement == false && parseInt(newVal) < 14) {
                $scope.showAgreement = true
            }
            var result = $scope.isNotHasChildren()
            if (result) {
                $scope.showAgreement = false
                $scope.agreementIsAccept = ""
            }
        });
        //>>20194653

        //>>

        //<<20194653
        $scope.openAgreementDialog = function () {

            var title = '告知内容：'
            var result = $('#dialogHtml').html()

            var yesButton = function (dialog) {
                return {
                    text: "接受",
                    class: "buttonOrange buttonSmall",
                    click: function () {
                        $scope.agreementIsAccept = "Y";
                        $scope.$apply();
                        dialog.dialog('close');
                    },
                    style: "float:right;margin-right:50px"
                };
            };
            var noButton = function (dialog) {
                return {
                    text: "拒绝",
                    class: "buttonOrange buttonSmall",
                    click: function () {
                        $scope.agreementIsAccept = "";
                        $scope.$apply();
                        dialog.dialog('close');
                        ShowMessageDialog('拒绝本公司收集本次投保必要的未成年人信息，本次投保将无法继续，请再次确认！')
                    },
                    style: "float:right;margin-right:20px"
                };
            };
            $scope.ShowPreview(result, title, $scope, yesButton, noButton);

        }

        $scope.ShowPreview = function (result, title, scope, yesButton, noButton) {
            var _dialog_id = "app-notice-dialog";
            var _dialog = $('#' + _dialog_id);

            $('body').css('overflow-y', 'hidden');

            var setting = {}
            setting.open = function (event, ui) {
                $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                $(this).siblings('.ui-dialog-titlebar').class = "ui-dialog-title";

                _dialog.empty();
                _dialog.append(result);
                //compile(_dialog.parent())(scope);
                _dialog.dialog("option", "position", _dialog.dialog("option", "position"));
            };

            setting.close = function (event, ui) {
                $('body').css('overflow-y', 'auto');
                enableTouchMove();
                $('div.ui-widget-overlay').off('click');
            };

            var buttons = {}
            if (yesButton) {
                buttons["Yes"] = yesButton(_dialog);
            }

            if (noButton) {
                buttons["No"] = noButton(_dialog);
            }
            setting.buttons = buttons;
            setting.width = '840';
            setting.height = '600';
            setting.closeOnEscape = false;
            setting.position = 'center';
            setting.modal = true;
            setting.draggable = true;
            setting.resizable = false;
            setting.closable = false;
            setting.dialogClass = 'ui-dialog-custom';
            setting.title = title;
            setting.minHeight = 150
            _dialog.dialog(setting);
        };

        $scope.isNotHasChildren = function () {

            var childrenCount = 0
            if ($scope.Person.Insured.Insured.Age != undefined && $scope.Person.Insured.Insured.Age < 14) {
                childrenCount += 1
            }
            for (var i = 0; i <= $scope.Person.OtherInsured.length - 1; i++) {
                if ($scope.Person.OtherInsured[i].Age != undefined && $scope.Person.OtherInsured[i].Age < 14) {
                    childrenCount += 1
                }
            }
            return childrenCount == 0 ? true : false
        }
        //<<20194653
        //<<20203337
        $scope.onPlicyHolderMobileChage = function (person, mobile) {
            $scope.ChangeInsuredIsCopyInsuredStatus('Mobile');


            var pGuardians = [];
            var minorChildren = [];

            angular.forEach($scope.Person.OtherInsured, function (item, index) {
                //如果投保人是旁系的监护人且旁系移动电话为空，将旁系移动电话更新为投保人移动电话
                if (item.GuardianKey && item.GuardianKey.ID == person.ID) {
                    if (!item.Mobile) {
                        item.Mobile = person.Mobile;
                    }
                    else if (item.Mobile == mobile) {
                        item.Mobile = person.Mobile;
                        if (item.Name) {
                            pGuardians.push("其他被保险人" + (index + 1) + "(" + item.Name + ")");
                        } else {
                            pGuardians.push("其他被保险人" + (index + 1));
                        }
                    }
                }

                //参保人为子女，且手机号为空或手机号与投保人更新前手机号一致
                if (item.Relationship == "C" && item.Age < 18) {
                    if (!item.Mobile) {
                        item.Mobile = person.Mobile;
                    } else if (item.Mobile == mobile) {
                        item.Mobile = person.Mobile;
                        if (item.Name) {
                            minorChildren.push("其他被保险人" + (index + 1) + "(" + item.Name + ")");
                        } else {
                            minorChildren.push("其他被保险人" + (index + 1));
                        }
                    }
                }
            });
            if (pGuardians.length > 0) {
                $scope.TimeoutWarning.add("Person.PolicyHolder.PolicyHolder.Mobile", pGuardians.join(",") + "的监护人为" + person.Name + "，其对应的移动电话将同步更新！", 7000)
            }
            if (minorChildren.length > 0) {
                $scope.TimeoutWarning.add("Person.PolicyHolder.PolicyHolder.Mobile", minorChildren.join(",") + "为投保人(" + person.Name + ")的未成年子女，其对应的移动电话将同步更新！", 7000)
            }

            
        }


        $scope.onInsuredMobileChage = function (person, mobile) {
            var pGuardians = [];
            angular.forEach($scope.Person.OtherInsured, function (item, index) {
                //如果投保人是旁系的监护人且旁系移动电话为空，将旁系移动电话更新为主被保险人移动电话
                if (item.GuardianKey && item.GuardianKey.ID == person.ID) {

                    if (!item.Mobile) {
                        item.Mobile = person.Mobile;
                    } else if (item.Mobile == mobile) {
                        item.Mobile = person.Mobile;
                        if (item.Name) {
                            pGuardians.push("其他被保险人" + (index + 1) + "(" + item.Name + ")");
                        } else {
                            pGuardians.push("其他被保险人" + (index + 1));
                        }
                    }
                }

            });
            if (pGuardians.length > 0) {
                $scope.TimeoutWarning.add("Person.Insured.Insured.Mobile", pGuardians.join(",") + "的监护人为" + person.Name + "，其对应的移动电话将同步更新！", 7000)
            }
        }

        $scope.onOtherInsuredMobileChage = function (person, mobile, orgIndex) {
            var pGuardians = [];
            angular.forEach($scope.Person.OtherInsured, function (item, index) {
                //如果投保人是旁系的监护人且旁系移动电话为空，将旁系移动电话更新为主被保险人移动电话
                if (item.GuardianKey && item.GuardianKey.ID == person.ID) {
                    if (!item.Mobile) {
                        item.Mobile = person.Mobile;
                    } else if (item.Mobile == mobile) {
                        item.Mobile = person.Mobile;
                        if (item.Name) {
                            pGuardians.push("其他被保险人" + (index + 1) + "(" + item.Name + ")");
                        } else {
                            pGuardians.push("其他被保险人" + (index + 1));
                        }
                    }
                }
            });
            if (pGuardians.length > 0) {
                $scope.TimeoutWarning.add("Person.OtherInsured.Mobile_" + orgIndex, pGuardians.join(",") + "的监护人为" + person.Name + "，其对应的移动电话将同步更新！", 7000)
            }
        }
        //>>20203337
        $scope.ChangeInsuredIsCopyInsuredStatus = function (i) {

            if (i == "IDExpired") {
                var IDExpired = $scope.Person.PolicyHolder.PolicyHolder.IDExpired;
                IDExpired = IDExpired.replace("年", "-").replace("月", "-").replace("日", "");
                var oldIDExpired = $scope.oldPhIDExpired;
                if (IDExpired.substring(0, 10) == oldIDExpired.substring(0, 10)) {
                    return false;
                }
            }
            else if (i == "DOB") {
                var DOB = $scope.Person.PolicyHolder.PolicyHolder.DOB;
                DOB = DOB.replace("年", "-").replace("月", "-").replace("日", "");
                var oldDOB = $scope.oldPhDOB;
                if (DOB.substring(0, 10) == oldDOB.substring(0, 10)) {
                    return false;
                }
                return false;
            }
            else if (i == "OfficeOrSchool" && $scope.oldPhOfficeOrSchool == null && $scope.Person.PolicyHolder.PolicyHolder.OfficeOrSchool == "") {
                return false;
            }
            else if (i == "OfficeOrSchoolAddressLine1" && $scope.oldPhOfficeOrSchoolAddressLine1 == null && $scope.Person.PolicyHolder.PolicyHolder.oldPhOfficeOrSchoolAddressLine1 == "") {
                return false;
            }
            else if (i == "OfficeOrSchoolAddressZipCode" && $scope.oldPhOfficeOrSchoolAddressZipCode == "" && $scope.Person.PolicyHolder.PolicyHolder.OfficeOrSchoolAddressZipCode == null) {
                return false;
            }
            else if (i == "ResidenceAddressZipCode" && $scope.oldPhResidenceAddressZipCode == "" && $scope.Person.PolicyHolder.PolicyHolder.ResidenceAddressZipCode == null) {
                return false;
            }
            else if (i == 'ResidenceDistrictCode' && $scope.oldTelArea == "" && $scope.Person.PolicyHolder.PolicyHolder.ResidenceDistrictCode == null) {
                return false;
            }
            else if (i == 'ResidencePhoneNumber' && $scope.oldTelNumber == "" && $scope.Person.PolicyHolder.PolicyHolder.ResidencePhoneNumber == null) {
                return false;
            }
            else if (i == 'OfficeDistrictCode' && $scope.oldCompTelArea == "" && $scope.Person.PolicyHolder.PolicyHolder.OfficeDistrictCode == null) {
                return false;
            }
            else if (i == 'OfficePhoneNumber' && $scope.oldCompTelNumber == "" && $scope.Person.PolicyHolder.PolicyHolder.OfficePhoneNumber == null) {
                return false;
            }
            else if (i == 'Mobile' && $scope.oldPhone == "" && $scope.Person.PolicyHolder.PolicyHolder.Mobile == null) {
                return false;
            }

            var Insured = $scope.Person.Insured.Insured;

            Insured.IsCopyInsured = "N"
            //            if ($scope.oldIsCopyInsured == "Y") {
            //                Insured.IDIsPermanent = $scope.Person.PolicyHolder.PolicyHolder.IDIsPermanent
            //            }
        }

        $scope.GetPolicyHolderExistClientListByID = function () {
            if (chkClientFlg) {
                var policyholder = $scope.Person.PolicyHolder.PolicyHolder;
                if (policyholder.ID != undefined && policyholder.ID != '') {
                    getClientsByID(88, policyholder.ID);
                }
            }
        }

        $scope.GetPolicyHolderExistClientList = function () {
            if (chkClientFlg) {
                var policyholder = $scope.Person.PolicyHolder.PolicyHolder;
                if (policyholder.Name != undefined && policyholder.Name != ''
					&& policyholder.Sex != null && policyholder.Sex != undefined
					&& policyholder.DOB != null && policyholder.DOB != undefined) {
                    getClientsByName(88, policyholder.Name, policyholder.Sex, policyholder.DOB);
                }
            }
        }

        $scope.GetPolicyHolderOccupationClass = function () {
            if ($scope.occupationCodeList.length > 0) {
                var occCode = $scope.Person.PolicyHolder.PolicyHolder.OccCD;
                $scope.Person.PolicyHolder.PolicyHolder.OccClass = null;
                for (i = 0; i < $scope.occupationCodeList.length; i++) {
                    if ($scope.occupationCodeList[i].Value == occCode) {
                        $scope.Person.PolicyHolder.PolicyHolder.OccClass = $scope.occupationCodeList[i].CalsType;
                        break;
                    }
                }
            }
        }


        $scope.onPolicyHolderPlaceOfCensusProvinceChanged = function (provCd) {
            $scope.policyHolderPlaceOfCensusTerritoryList = nglhAppService.loadTerritoryRegList(provCd);
            $scope.Person.PolicyHolder.PolicyHolder.PlaceOfCensusTerritory = null;
        };

        $scope.InitialPolicyHolderPlaceOfCensusTerritory = function (provCd) {
            $scope.policyHolderPlaceOfCensusTerritoryList = nglhAppService.loadTerritoryRegList(provCd);
        };
        $scope.onPolicyHolderResidenceDistrictCodeChanged = function () {
            var policyholder = $scope.Person.PolicyHolder.PolicyHolder;
            if (policyholder.ResidenceDistrictCode && !policyholder.ResidencePhoneNumber) {
                $scope.ErrorSummary.clearDirty("$scope.Person.PolicyHolder.PolicyHolder.ResidencePhoneNumber", undefined, undefined);
            }
        };
        $scope.onPolicyHolderOfficeDistrictCodeChanged = function () {
            var policyholder = $scope.Person.PolicyHolder.PolicyHolder;
            if (policyholder.OfficeDistrictCode && !policyholder.OfficePhoneNumber) {
                $scope.ErrorSummary.clearDirty("$scope.Person.PolicyHolder.PolicyHolder.OfficePhoneNumber", undefined, undefined);
            }
        };
        $scope.onPolicyHolderResidenceAddressProvinceChanged = function (provCd) {
            var policyholder = $scope.Person.PolicyHolder.PolicyHolder;

            $scope.policyHolderResidenceAddressTerritoryList = nglhAppService.loadTerritoryList(provCd);
            $scope.policyHolderResidenceAddressCountyList = null;
            policyholder.ResidenceAddressTerritory = null;
            policyholder.ResidenceAddressCounty = null;
        };

        $scope.InitialPolicyHolderResidenceAddressTerritoryList = function (provCd) {
            var policyholder = $scope.Person.PolicyHolder.PolicyHolder;
            $scope.policyHolderResidenceAddressTerritoryList = nglhAppService.loadTerritoryList(provCd);
        };

        $scope.onPolicyHolderResidenceAddressTerritoryChanged = function (provCd, terrCd) {
            $scope.policyHolderResidenceAddressCountyList = nglhAppService.loadCountyList(provCd, terrCd);
            $scope.Person.PolicyHolder.PolicyHolder.ResidenceAddressCounty = null;
        };

        $scope.IntitalPolicyHolderResidenceAddressCountyList = function (provCd, terrCd) {
            $scope.policyHolderResidenceAddressCountyList = nglhAppService.loadCountyList(provCd, terrCd);
        };

        $scope.onPolicyHolderOfficeOrSchoolAddressProvinceChanged = function (provCd) {
            var policyholder = $scope.Person.PolicyHolder.PolicyHolder;

            $scope.policyHolderOfficeOrSchoolAddressTerritoryList = nglhAppService.loadTerritoryList(provCd);
            $scope.policyHolderOfficeOrSchoolAddressCountyList = null;
            policyholder.OfficeOrSchoolAddressTerritory = null;
            policyholder.OfficeOrSchoolAddressCounty = null;
        };

        $scope.InitialPolicyHolderOfficeOrSchoolAddressTerritoryList = function (provCd) {
            var policyholder = $scope.Person.PolicyHolder.PolicyHolder;
            $scope.policyHolderOfficeOrSchoolAddressTerritoryList = nglhAppService.loadTerritoryList(provCd);
        };

        $scope.onPolicyHolderOfficeOrSchoolAddressTerritoryChanged = function (provCd, terrCd) {
            $scope.policyHolderOfficeOrSchoolAddressCountyList = nglhAppService.loadCountyList(provCd, terrCd);
            $scope.Person.PolicyHolder.PolicyHolder.OfficeOrSchoolAddressCounty = null;
        };

        $scope.InitialPolicyHolderOfficeOrSchoolAddressCountyList = function (provCd, terrCd) {
            $scope.policyHolderOfficeOrSchoolAddressCountyList = nglhAppService.loadCountyList(provCd, terrCd);
        };

        //----------------------------------------------------------------------------前端校验------------------------------------------------------------------------------
        //证件类型
        $scope.policyHolderDocumentTypeRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_IDENTITY_DOCUMENT_TYPE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                        if (!value || value == '') {
                            return true;
                        }

                        if (value) {
                            $scope.Person.PolicyHolder.PolicyHolder.IDType = value;
                            $scope.CheckPolicyHolderNationalityWanings();
                        }

                        var nationality = $scope.Person.PolicyHolder.PolicyHolder.Nationality;
                        if (nationality != '') {
                            policyHolder.IDType = value;
                            $scope.doValidator("Person.PolicyHolder.PolicyHolder.Nationality", null);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_CHINA_IDENTITY_DOCUMENT_TYPE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                        var nationality = policyHolder.Nationality;
                        if (nationality != '') {
                            var isInvalidID = (value == '1' || value == '3' || value == '6' || value == '7') && (nationality != "CHN");
                            var isInvalidPP = (value == '2') && (nationality == "TWN" || nationality == "HKG" || nationality == "MAC");
                            var isInvalidHK = (value == '4') && (nationality != "TWN" && nationality != "HKG" && nationality != "MAC");
                            if (isInvalidID || isInvalidPP || isInvalidHK) {
                                return true;
                            }

                            //20190786  AWS 在线递交新增证件类型
                            if (nationality == "CHN" && (value == "A" || value == "B" || value == "C" || value == "D")) {
                                return true;
                            }
                            //<<20193965
                            //20190786  AWS 在线递交新增证件类型
                            if ((nationality == "HKG" && value != "A" && value != "Y") ||
                            (nationality == "MAC" && value != "A" && value != "Y") ||
                            (nationality == "TWN" && value != "C" && value != "Z") ||
                            (nationality && nationality != "CHN" && nationality != "HKG" && nationality != "MAC" && nationality != "TWN" && value != "2" && value != "D")) {
                                return true;
                            }
                            //>>20193965
                        }

                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "";
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                        var nationality = policyHolder.Nationality;

                        if (policyHolder.Age && policyHolder.Age >= 16 && value == '6') {
                            this.message = "投保人 -" + policyHolder.Name + "年龄大于等于16周岁，不能选择居民户口簿。";
                            return true;
                        }
                        if (policyHolder.Age && policyHolder.Age > 15 && value == '7') {
                            this.message = "投保人 -" + policyHolder.Name + "年龄大于15周岁，不能选择出生医学证明";
                            return true;
                        }

                        return false;
                    }
                }
            })
        ]);

        //证件号码
        $scope.policyHolderIdentityNumberRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_IDENTITY_NUMBER');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                        if (!value || value == '') {
                            //                            policyHolder.Sex = "";
                            //                            policyHolder.Age = "";
                            //                            policyHolder.DOB = null;
                            return true;
                        }
                        return false;
                    }
                }
            }),
        //            new Rule({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
        //                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
        //                        if (value) {
        //                            policyHolder.ID = value;
        //                            return $scope.checkDuplicatedInsured(99);
        //                        }
        //                        return false;
        //                    }
        //                }
        //            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    //<<20193965 
                    //var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_IDENTITY_CARD_NUMBER_BOOKLET');
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.PolicyHolder.PolicyHolder.IDType });
                    var _msg = "投保人 - {0}{1}号码有误，请核实!";
                    //>>20193965                  
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "", idtype ? idtype[0].value : "证件"); //20193965

                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                        //非空证件号码（身份证|香港居民居住证|澳门居民居住证|台湾居民居住证），核对校验位、生日、位数
                        if (value && (!$scope.chkValidIdNumberInput(value) || !$scope.chkBirthdayNumber(value) || value.length != 18 || !/^[0-9]{17}([0-9]|X){1}$/.test(value))
                        && (policyHolder.IDType == "1" || policyHolder.IDType == "6" || policyHolder.IDType == "A" || policyHolder.IDType == "B" || policyHolder.IDType == "C")) {
                            //                            policyHolder.Sex = "";
                            //                            policyHolder.Age = "";
                            //                            policyHolder.DOB = null;
                            return true;
                        }


                        // <<20193965
                        ////20190786  AWS 在线递交新增证件类型
                        // if (value && ((policyHolder.IDType == "A" && value.indexOf("810000") != 0) ||
                        //             (policyHolder.IDType == "B" && value.indexOf("820000") != 0) ||
                        //             (policyHolder.IDType == "C" && value.indexOf("830000") != 0))) {
                        //     //                            policyHolder.Sex = "";
                        //     //                            policyHolder.Age = "";
                        //     //                            policyHolder.DOB = null;
                        //     return true;
                        // }
                        if (value && ((policyHolder.Nationality == "HKG" && policyHolder.IDType == "A" && value.indexOf("810000") != 0) ||
                                    (policyHolder.Nationality == "MAC" && policyHolder.IDType == "A" && value.indexOf("820000") != 0) ||
                                    (policyHolder.Nationality == "TWN" && policyHolder.IDType == "C" && value.indexOf("830000") != 0))) {
                            return true;
                        }
                        //>>20193965

                        //20190786  AWS 在线递交新增证件类型
                        if (value && policyHolder.IDType == "D" && !/^[A-Z]{3}[0-9]{12}$/.test(value)) {
                            return true;
                        }


                        return false;
                    }
                }
            }),
            new Rule({
                //message: "投保人 - 性别与身份证不符，请核实!",
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_GENDER_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                            //20190786  AWS 在线递交新增证件类型
                            if (policyHolder.IDType == "1" || policyHolder.IDType == "6" || policyHolder.IDType == "A" || policyHolder.IDType == "B" || policyHolder.IDType == "C") {
                                var defaultSex = "M";
                                var sexNumber = $scope.getSexNumber(defaultSex);
                                var chkResult = $scope.chkIdNumberMatchSex(value, sexNumber);
                                if (!chkResult) {
                                    policyHolder.Sex = "F";
                                }
                                else {
                                    policyHolder.Sex = "M";
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
                    //<<20193965
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.PolicyHolder.PolicyHolder.IDType });
                    var _msg = "投保人 - {0}出生日期与{1}不符，请核实"
                    //var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_DOB_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    //>>20193965

                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "", idtype ? idtype[0].value : "证件号码"); //20193965
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                            policyHolder.ID = value;
                            //20190786  AWS 在线递交新增证件类型
                            if (policyHolder.IDType == "1" || policyHolder.IDType == "6" || policyHolder.IDType == "A" || policyHolder.IDType == "B" || policyHolder.IDType == "C" || policyHolder.IDType == "D") {
                                var defaultDOB = "1900-01-01";
                                var birthdayNumber = $scope.getBirthdayNumber(defaultDOB);
                                var chkResult = $scope.chkIdNumberMatchBirthday(value, birthdayNumber);
                                if (!chkResult) {
                                    //return true;
                                    var age = $scope.GetAgeFromID(policyHolder);
                                    if (age >= 0) {
                                        policyHolder.Age = age;
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
                    //                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_IDENTITY_NUMBER_FORMAT');
                    var _msg = "投保人 - {0}证件格式有误，请核实!";
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                            if (policyHolder.IDType == "2" && value.length <= 3) {
                                return true;
                            } else if (policyHolder.IDType == "3" && ($scope.countLength(value) < 10 || $scope.countLength(value) > 18)) {
                                return true;
                            } else if (policyHolder.IDType == "7" && ($scope.countLength(value) <= 9)) {
                                this.message = "投保人 - " + policyHolder.Name + "出生医学证明号码错误，请输入大于9个字符的号码";
                                return true;
                            }
                        }
                        return false;
                    }
                }
            })
        ]);

        //证件有效期
        $scope.policyHolderIdentityDocumentExpiryDateRules = new BusinessRules([
                    new Rule({
                        message: function (value, target, scopeKey, scope, controller, me) {
                            var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_IDENTITY_DOCUMENT_EXPIRY_DATE');
                            var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                            return _msg.format(name ? name : "");
                        },
                        performCheck: function () {
                            return $scope.fullCheck;
                        },
                        isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                            if (me.isDirty(isDirty)) {
                                var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                                if (!value || value == '') {
                                    if (policyHolder.Age < 17) {
                                        //对于0<= and<=16周岁未成年人非必填项
                                        return false;
                                    }
                                    else {
                                        //如果大于16岁且证件类型、证件号码任一已选择则为必填项
                                        if (policyHolder.ID != '' || (policyHolder.IDType != '' && policyHolder.IDType != null)) {
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
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_IDENTITY_DOCUMENT_EXPIRY_DATE_LESS_THAN_TODAY');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        //<<Larry 20186222
            , new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_DATE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var val = formatDate(value.substring(0, 10).replace(/-/g, ""));
                            var val1 = formatDate($('#PolicyHolderIDExpired').val().substring(0, 10).replace(/\//g, ""));
                            if (val != val1 && val1 != '') {
                                $scope.Person.PolicyHolder.PolicyHolder.Age = "";
                                return true;
                            }
                        }
                        return false;
                    }
                }
            })
        //>>Larry 20186222
        ]);

        //投保人姓名
        $scope.policyHolderNameRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_NAME');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        $scope.Person.PolicyHolder.PolicyHolder.Name = value;
                        $scope.CheckPolicyHolderNameWanings();
                        $scope.CheckPolicyHolderNationalityWanings();

                        if (!value || value == '') {
                            return true;
                        }
                        else {
                            $scope.GetPolicyHolderExistClientList();
                        }
                        return false;
                    }
                }
            }),
        //            new Rule({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
        //                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
        //                    return _msg.format(name ? name : "");
        //                }, performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        if (value) {
        //                            $scope.Person.PolicyHolder.PolicyHolder.Name = value;
        //                            return $scope.checkDuplicatedInsured(99);
        //                        }

        //                        $scope.doValidator("Person.PolicyHolder.PolicyHolder.ID", null);
        //                        return false;
        //                    }
        //                }
        //            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_NAME_EXCESS_MAXIMUM_LENGTH');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderSexRules = new BusinessRules([
            new Rule({
                //message: "投保人 - 性别未填",
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_EMPTY_GENDER');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        //            new Rule({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
        //                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
        //                    return _msg.format(name ? name : "");
        //                }, performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        if (value) {
        //                            $scope.Person.PolicyHolder.PolicyHolder.Sex = value;
        //                            return $scope.checkDuplicatedInsured(99);
        //                        }
        //                        return false;
        //                    }
        //                }
        //            }),
            new Rule({
                //message: "投保人 - 性别与身份证不符，请核实!",
                message: function (value, target, scopeKey, scope, controller, me) {
                    //20190786  AWS 在线递交新增证件类型
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.PolicyHolder.PolicyHolder.IDType });
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_GENDER_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    //20190786  AWS 在线递交新增证件类型
                    return _msg.format(name ? name : "", idtype ? idtype[0].value : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                            //20190786  AWS 在线递交新增证件类型
                            if (policyHolder.IDType == "1" || policyHolder.IDType == "6" || policyHolder.IDType == "A" || policyHolder.IDType == "B" || policyHolder.IDType == "C") {
                                var sexNumber = $scope.getSexNumber(value);
                                var chkResult = $scope.chkIdNumberMatchSex(policyHolder.ID, sexNumber);
                                if (!chkResult) {
                                    return true;
                                }
                            }
                        }

                        //$scope.doValidator("Person.PolicyHolder.PolicyHolder.ID", null);
                        return false;
                    }
                }
            }),

        ]);

        //出生日期
        $scope.policyHolderDOBRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_DOB_IS_EMPTY');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        //            new Rule({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DUPLICATED');
        //                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
        //                    return _msg.format(name ? name : "");
        //                }, performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        if (value) {
        //                            $scope.Person.PolicyHolder.PolicyHolder.DOB = value;
        //                            return $scope.checkDuplicatedInsured(99);
        //                        }
        //                        return false;
        //                    }
        //                }
        //            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_LESS_THAN_16');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.PolicyHolder.PolicyHolder.DOB = value;
                            $scope.CalculateInsuredInfo($scope.Person.PolicyHolder.PolicyHolder);
                            $scope.CheckDOBWanings();

                            //                            if ($scope.Person.PolicyHolder.PolicyHolder.Age < 16 || $scope.Person.PolicyHolder.PolicyHolder.Age > 60) {
                            //                                //主被保险人至少要为成年人
                            //                                return true;
                            //                            }
                        }

                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    //20190786  AWS 在线递交新增证件类型
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.PolicyHolder.PolicyHolder.IDType });
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_BIRTHDAY');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    //20190786  AWS 在线递交新增证件类型
                    return _msg.format(name ? name : "", idtype ? idtype[0].value : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            //20190786  AWS 在线递交新增证件类型
                            if (($scope.Person.PolicyHolder.PolicyHolder.IDType == '1' ||
                                 $scope.Person.PolicyHolder.PolicyHolder.IDType == 'A' ||
                                 $scope.Person.PolicyHolder.PolicyHolder.IDType == 'B' ||
                                 $scope.Person.PolicyHolder.PolicyHolder.IDType == 'C') && $scope.Person.PolicyHolder.PolicyHolder.ID.length == 18) {
                                var dob = formatDate(value.substring(0, 10).replace(/-/g, ""));
                                var dobStr = ($scope.Person.PolicyHolder.PolicyHolder.ID).substring(6, 14);
                                if (dobStr != dob) {
                                    return true;
                                }
                            }

                            //20190786 外国永久居留身份证
                            if ($scope.Person.PolicyHolder.PolicyHolder.IDType == 'D' && $scope.Person.PolicyHolder.PolicyHolder.ID.length == 15) {
                                var dob = value.substring(2, 10).replace(/-/g, "");
                                var dobStr = ($scope.Person.PolicyHolder.PolicyHolder.ID).substring(7, 13);
                                if (dobStr != dob) {
                                    return true;
                                }
                            }
                        }

                        $scope.doValidator("Person.PolicyHolder.PolicyHolder.ID", null);

                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_FUTURE_BIRTHDAY');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        //<<Larry 20186222  验证日期是否合法
            , new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_DATE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : '');
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            //<<20193965 
                            $timeout(function () {
                                var val = formatDate(value.substring(0, 10).replace(/-/g, ""));
                                var val1 = formatDate($('#policyHolderDOB').val().substring(0, 10).replace(/\//g, ""));
                                if (val != val1 && val1 != '') {

                                    $scope.Person.PolicyHolder.PolicyHolder.Age = "";
                                    return true;
                                }
                            });
                            //>>20193965  
                        }
                        return false;
                    }
                }
            })
        //>>Larry 20186222
        ]);

        //社保
        $scope.policyHolderSocialSecRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_SOCIAL_CODE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderOccCDRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_OCCUPATION_CODE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderNationalityRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_NATIONALITY');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                            //$scope.Person.PolicyHolder.PolicyHolder.Nationality = value;
                            $scope.CheckPolicyHolderNationalityWanings();
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    //var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_NON_CHINA_IDENTITY_DOCUMENT_TYPE');//20193965
                    var _msg = "投保人 - {0}外籍人士请递交护照或外国人永久居留证!"; //20193965
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;

                        if (policyHolder.IDType && (policyHolder.IDType == "6" || policyHolder.IDType == "7") && value != "CHN") {//非中国籍客户不能选择居民户口簿、出生医学证明
                            this.message = "投保人 - " + policyHolder.Name + "非中国籍客户不能选择居民户口簿、出生医学证明";
                            return true;
                        }

                        //20190786  AWS 在线递交新增证件类型
                        if (policyHolder.IDType && policyHolder.IDType != "2" && policyHolder.IDType != "D" && value != "CHN" && value != "TWN" && value != "HKG" && value != "MAC") {
                            return true;
                        }

                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_IDENTITY_DOCUMENT_TYPE_NATIONALITY');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                        if (policyHolder.IDType && policyHolder.IDType == "4" && value != "" && value == "CHN") {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_CHINA_IDENTITY_DOCUMENT_TYPE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;

                        //20190786 新增证件类型
                        //                        if ((value == "TWN" || value == "HKG" || value == "MAC") && policyHolder.IDType != "4") {
                        //                            return true;
                        //                        }
                        //<<20193965
                        //20190786  AWS 在线递交新增证件类型
                        if ((value == "HKG" && policyHolder.IDType != "A" && policyHolder.IDType != "Y") ||
                            (value == "MAC" && policyHolder.IDType != "A" && policyHolder.IDType != "Y") ||
                            (value == "TWN" && policyHolder.IDType != "C" && policyHolder.IDType != "Z") ||
                            (value != "CHN" && value != "HKG" && value != "MAC" && value != "TWN" && policyHolder.IDType && policyHolder.IDType != '2' && policyHolder.IDType != "D")) {
                            return true;
                        }
                        //>>20193965
                        return false;
                    }
                }
            })
        ]);

        //户籍所在地
        $scope.policyHolderCensusProvinceRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_PLACE_OF_CENSUS_PROVINCE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.PolicyHolder.PolicyHolder.Nationality == "CHN") {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.policyHolderCensusTerritoryRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_PLACE_OF_CENSUS_TERRITORY');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.PolicyHolder.PolicyHolder.Nationality == "CHN" && $scope.Person.PolicyHolder.PolicyHolder.PlaceOfCensusTerritory != "") {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        //住址区号
        $scope.policyHolderResidenceDistrictCodeRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_RESIDENCE_DISTRICT_CODE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.PolicyHolder.PolicyHolder.ResidencePhoneNumber)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_RESIDENCE_DISTRICT_CODE_INCOMPLETE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderResidencePhoneNumberRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_RESIDENCE_PHONE_NUMBER');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.PolicyHolder.PolicyHolder.ResidenceDistrictCode)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_RESIDENCE_PHONE_NUMBER_INCOMPLETE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_RESIDENCE_PHONE_NUMBER_INVALID');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderOfficeDistrictCodeRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_OFFICE_DISTRICT_CODE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.PolicyHolder.PolicyHolder.OfficePhoneNumber)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_OFFICE_DISTRICT_CODE_INCOMPLETE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderOfficePhoneNumberRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_OFFICE_PHONE_NUMBER');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value && $scope.Person.PolicyHolder.PolicyHolder.OfficeDistrictCode)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_OFFICE_PHONE_NUMBER_INCOMPLETE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_OFFICE_PHONE_NUMBER_INVALID');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderMobilePhoneNumberRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_MOBILE_PHONE_NUMBER');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_PHONE_NUMBER');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderMailboxRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_EMAIL_ADDRESS_INVALID');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderResidenceAddressProvinceRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_RESIDENCE_ADDRESS_PROVINCE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.policyHolderResidenceAddressTerritoryRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_RESIDENCE_ADDRESS_TERRITORY');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.policyHolderResidenceAddressCountyRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_RESIDENCE_ADDRESS_COUNTY');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value) {
                            //20190214 将该下拉框设为必填
                            //                            var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
                            //                            if (policyHolder.ResidenceAddressProvince == "110000" || policyHolder.ResidenceAddressProvince == "440000") {
                            //                                if (policyHolder.ResidenceAddressTerritory != "441900" && policyHolder.ResidenceAddressTerritory != "442000") {
                            //                                    return true;
                            //                                }
                            //                            }
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);

        $scope.policyHolderResidenceAddressLine1Rules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_RESIDENCE_ADDRESS_LINE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_RESIDENCE_ADDRESS_LINE_EXCESS_MAXIMUM_LENGTH');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_RESIDENCE_ADDRESS_LINE_EXCESS_MINIMUM_LENGTH');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_RESIDENCE_ADDRESS_LINE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderResidencePostCDRules = new BusinessRules([
        //            new Rule({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_RESIDENCE_ZIP_CODE');
        //                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        if (!value) {
        //                            return true;
        //                        }
        //                        return false;
        //                    }
        //                }
        //            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_RESIDENCE_ADDRESS_ZIP_CODE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderOfficeOrSchoolNameRules = new BusinessRules([
        //            new Required({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_COMPANY_OR_SCHOOL_NAME');
        //                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        if (!value) {
        //                            return true;
        //                        }

        //                        $scope.Person.PolicyHolder.PolicyHolder.OfficeOrSchool = value;
        //                        $scope.doValidator("Person.PolicyHolder.PolicyHolder.OfficeOrSchoolAddressProvince", null);
        //                        $scope.doValidator("Person.PolicyHolder.PolicyHolder.OfficeOrSchoolAddressTerritory", null);
        //                        $scope.doValidator("Person.PolicyHolder.PolicyHolder.OfficeOrSchoolAddressCounty", null);
        //                        $scope.doValidator("Person.PolicyHolder.PolicyHolder.OfficeOrSchoolAddressLine1", null);
        //                        $scope.doValidator("Person.PolicyHolder.PolicyHolder.OfficeOrSchoolAddressZipCode", null);
        //                        return false;
        //                    }
        //                }
        //            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_COMPANY_OR_SCHOOL_NAME_EXCESS_MAXIMUM_LENGTH');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_COMPANY_OR_SCHOOL_NAME_LESS_THAN_MINIMUM_LENGTH');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_COMPANY_OR_SCHOOL_NAME_INVALID');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        //        $scope.policyHolderOfficeOrSchoolAddressProvinceRules = new BusinessRules([
        //            new Required({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_COMPANY_OR_SCHOOL_PROVINCE');
        //                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
        //                        //学校名称第一个不是"无"，则剩下关于学校信息字段都必须填写
        //                        if (!value && policyHolder.OfficeOrSchool.indexOf('无') != 0)
        //                            return true;
        //                        return false;
        //                    }
        //                }
        //            })
        //        ]);

        //        $scope.policyHolderOfficeOrSchoolAddressTerritoryRules = new BusinessRules([
        //            new Required({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_COMPANY_OR_SCHOOL_TERRITORY');
        //                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
        //                        if (!value && policyHolder.OfficeOrSchool.indexOf('无') != 0)
        //                            return true;
        //                        return false;
        //                    }
        //                }
        //            })
        //        ]);

        //        $scope.policyHolderOfficeOrSchoolAddressCountyRules = new BusinessRules([
        //            new Rule({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_COMPANY_OR_SCHOOL_COUNTY');
        //                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
        //                        if (!value && policyHolder.OfficeOrSchool.indexOf('无') != 0) {
        //                            var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
        //                            if (policyHolder.OfficeOrSchoolAddressProvince == "110000" || policyHolder.OfficeOrSchoolAddressProvince == "440000") {
        //                                //ignore special cases in Territory, Copied From EAPS
        //                                if (policyHolder.OfficeOrSchoolAddressTerritory != "441900" && policyHolder.OfficeOrSchoolAddressTerritory != "442000") {
        //                                    return true;
        //                                }
        //                            }
        //                        }

        //                        return false;
        //                    }
        //                }
        //            })
        //        ]);

        $scope.policyHolderOfficeOrSchoolAddressLine1Rules = new BusinessRules([
        //            new Required({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_COMPANY_OR_SCHOOL_ADDRESS_LINE');
        //                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
        //                        if (!value && policyHolder.OfficeOrSchool.indexOf('无') != 0)
        //                            return true;
        //                        return false;
        //                    }
        //                }
        //            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_COMPANY_OR_SCHOOL_ADDRESS_LINE_EXCESS_MAXIMUM_LENGTH');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_COMPANY_OR_SCHOOL_ADDRESS_LINE_EXCESS_MINIMUM_LENGTH');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_COMPANY_OR_SCHOOL_ADDRESS_LINE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        $scope.policyHolderOfficeOrSchoolAddressZipCodeRules = new BusinessRules([
        //            new Required({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICYHOLDER_COMPANY_OR_SCHOOL_ZIP_CODE');
        //                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;
        //                        if (!value && policyHolder.OfficeOrSchool.indexOf('无') != 0)
        //                            return true;
        //                        return false;
        //                    }
        //                }
        //            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_POLICYHOLDER_INVALID_COMPANY_OR_SCHOOL_ADDRESS_ZIP_CODE');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
        //>>King_GACP




        $scope.GetInsuredOccupationClass = function () {
            if ($scope.occupationCodeList.length > 0) {
                var occCode = $scope.Person.Insured.Insured.OccCD;
                $scope.Person.Insured.Insured.OccClass = null;
                for (i = 0; i < $scope.occupationCodeList.length; i++) {
                    if ($scope.occupationCodeList[i].Value == occCode) {
                        $scope.Person.Insured.Insured.OccClass = $scope.occupationCodeList[i].CalsType;
                        break;
                    }
                }
            }
        }
        //<<20202502
        $scope.onInsuredOccupationClassChanged = function () {
            $scope.GetInsuredOccupationClass();

            $scope.doValidator("Person.Insured.Insured.OccCD", null);
        }
        //>>20202502
        $scope.Initial = function () {
            return true;
        }

        $scope.Submit = function () {
            //<<20194653
            if ($scope.showAgreement == true && $scope.agreementIsAccept != 'Y') {
                ShowMessageDialog('没有勾选儿童个人信息收集告知，本次投保将无法继续，请再次确认！')
                return;
            }
            //>>20194653
            var data = $scope.Person;
            var flag = true;
            var result = nglhAppService.SavePersonData(data);

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

        $scope.insuredPlaceOfCensusTerritoryList = nglhAppService.loadTerritoryRegList($scope.Person.Insured.Insured.PlaceOfCensusProvince);

        //------------------------Person--------------------------------------
        //页面Chnage事件
        //<<King_GACP
        $scope.onInsuredIsCopyInsuredChanged = function (IsCopyInsured) {
            var Insured = $scope.Person.Insured.Insured;
            var policyholder = $scope.Person.PolicyHolder.PolicyHolder;
            if (IsCopyInsured == "Y") {
                Insured.PHRelationship = "I";
                Insured.IDType = policyholder.IDType;
                Insured.ID = policyholder.ID;
                Insured.IDExpired = policyholder.IDExpired;

                Insured.IDIsPermanent = policyholder.IDIsPermanent;
                Insured.Name = policyholder.Name;
                Insured.Sex = policyholder.Sex;
                Insured.DOB = policyholder.DOB;
                Insured.Age = policyholder.Age;
                Insured.SocialSecFlag = policyholder.SocialSecFlag;
                Insured.OccCD = policyholder.OccCD;
                Insured.OccClass = policyholder.OccClass;

                Insured.Nationality = policyholder.Nationality;

                Insured.PlaceOfCensusProvince = policyholder.PlaceOfCensusProvince;
                $scope.InitialInsuredPlaceOfCensusTerritory(Insured.PlaceOfCensusProvince);
                Insured.PlaceOfCensusTerritory = policyholder.PlaceOfCensusTerritory;

                Insured.ResidenceDistrictCode = policyholder.ResidenceDistrictCode;
                Insured.ResidencePhoneNumber = policyholder.ResidencePhoneNumber;
                Insured.OfficeDistrictCode = policyholder.OfficeDistrictCode;
                Insured.OfficePhoneNumber = policyholder.OfficePhoneNumber;
                Insured.Mobile = policyholder.Mobile;
                Insured.Mailbox = policyholder.Mailbox;

                Insured.ResidenceAddressProvince = policyholder.ResidenceAddressProvince;

                $scope.InitialResidenceAddressTerritoryList(Insured.ResidenceAddressProvince)
                Insured.ResidenceAddressTerritory = policyholder.ResidenceAddressTerritory;

                $scope.IntitalResidenceAddressCountyList(Insured.ResidenceAddressProvince, Insured.ResidenceAddressTerritory)
                Insured.ResidenceAddressCounty = policyholder.ResidenceAddressCounty;
                //20202430
                Insured.IndustryCode1 = policyholder.IndustryCode1;
                $scope.InitialResidenceIndustryCode2List(policyholder.IndustryCode1)
                Insured.IndustryCode2 = policyholder.IndustryCode2;
                $scope.IntitalResidenceIndustryCodeList(policyholder.IndustryCode1, policyholder.IndustryCode2)


                Insured.ResidenceAddressLine1 = policyholder.ResidenceAddressLine1;
                Insured.ResidenceAddressZipCode = policyholder.ResidenceAddressZipCode;
                Insured.OfficeOrSchool = policyholder.OfficeOrSchool;

                Insured.OfficeOrSchoolAddressProvince = policyholder.OfficeOrSchoolAddressProvince;
                $scope.InitialOfficeOrSchoolAddressTerritoryList(Insured.OfficeOrSchoolAddressProvince)
                Insured.OfficeOrSchoolAddressTerritory = policyholder.OfficeOrSchoolAddressTerritory;

                $scope.InitialOfficeOrSchoolAddressCountyList(Insured.OfficeOrSchoolAddressProvince, Insured.OfficeOrSchoolAddressTerritory)
                Insured.OfficeOrSchoolAddressCounty = policyholder.OfficeOrSchoolAddressCounty;

                Insured.OfficeOrSchoolAddressLine1 = policyholder.OfficeOrSchoolAddressLine1;
                Insured.OfficeOrSchoolAddressZipCode = policyholder.OfficeOrSchoolAddressZipCode;
            }
            else {
                Insured.PHRelationship = "";
                Insured.IDType = "";
                Insured.ID = "";
                Insured.IDExpired = null;
                Insured.IDIsPermanent = "";
                Insured.Name = "";
                Insured.Sex = "";
                Insured.DOB = null;
                Insured.Age = "";
                Insured.SocialSecFlag = "";
                Insured.OccCD = "";
                Insured.OccClass = "";
                Insured.Nationality = "";
                Insured.PlaceOfCensusProvince = "";
                Insured.PlaceOfCensusTerritory = "";
                Insured.ResidenceDistrictCode = "";
                Insured.ResidencePhoneNumber = "";
                Insured.OfficeDistrictCode = "";
                Insured.OfficePhoneNumber = "";
                Insured.Mobile = "";
                Insured.Mailbox = "";
                Insured.ResidenceAddressProvince = "";
                Insured.ResidenceAddressTerritory = "";
                Insured.ResidenceAddressCounty = "";
                Insured.ResidenceAddressLine1 = "";
                Insured.ResidenceAddressZipCode = "";
                Insured.OfficeOrSchool = "";
                Insured.OfficeOrSchoolAddressProvince = "";
                Insured.OfficeOrSchoolAddressTerritory = "";
                Insured.OfficeOrSchoolAddressCounty = "";
                Insured.OfficeOrSchoolAddressLine1 = "";
                Insured.OfficeOrSchoolAddressZipCode = "";
                Insured.IndustryCode1 = "";
                Insured.IndustryCode2 = "";
                $scope.occupationIndustryCode2List = null;
                $scope.occupationIndustryCodeList = null;
            }
        };
        //>>King_GACP

        $scope.onInsuredPlaceOfCensusProvinceChanged = function (provCd) {
            $scope.insuredPlaceOfCensusTerritoryList = nglhAppService.loadTerritoryRegList(provCd);
            $scope.Person.Insured.Insured.PlaceOfCensusTerritory = null;
        };

        $scope.InitialInsuredPlaceOfCensusTerritory = function (provCd) {
            $scope.insuredPlaceOfCensusTerritoryList = nglhAppService.loadTerritoryRegList(provCd);
        };

        $scope.onInsuredResidenceAddressProvinceChanged = function (provCd) {
            var insured = $scope.Person.Insured.Insured;

            $scope.insuredResidenceAddressTerritoryList = nglhAppService.loadTerritoryList(provCd);
            $scope.insuredResidenceAddressCountyList = null;
            insured.ResidenceAddressTerritory = null;
            insured.ResidenceAddressCounty = null;
        };

        $scope.onInsuredIndustryCode1Changed = function (industryCode1) {
            var insured = $scope.Person.Insured.Insured;
            $scope.occupationIndustryCode2List = $scope.occupationCodeList.filter(function (item) {
                return item.IndustryCode1 == industryCode1
            });
            $scope.occupationIndustryCodeList = null;
            insured.IndustryCode2 = null;
            insured.OccCD = null;
            insured.OccClass = null;
        };

        $scope.onPolicyIndustryCode1Changed = function (industryCode1) {
            var insured = $scope.Person.PolicyHolder.PolicyHolder;
            $scope.occupationPolicyIndustryCode2List = $scope.occupationCodeList.filter(function (item) {
                return item.IndustryCode1 == industryCode1
            });
            $scope.occupationPolicyCodeList = null;
            insured.IndustryCode2 = null;
            insured.OccCD = null;
            insured.OccClass = null;
        };

        $scope.onInsuredResidenceAddressTerritoryChanged = function (provCd, terrCd) {
            $scope.insuredResidenceAddressCountyList = nglhAppService.loadCountyList(provCd, terrCd);
            $scope.Person.Insured.Insured.ResidenceAddressCounty = null;
        };

        //20202430
        $scope.onInsuredResidenceIndustryCode2Changed = function (industryCode1, industryCode2) {
            $scope.occupationIndustryCodeList = $scope.occupationCodeList.filter(function (item) {
                return (item.IndustryCode1 == industryCode1 && item.IndustryCode2 == industryCode2)
            });
            $scope.Person.Insured.Insured.OccCD = null;
            $scope.Person.Insured.Insured.OccClass = null;
        };

        $scope.onPolicyIndustryCode2Changed = function (industryCode1, industryCode2) {
            $scope.occupationPolicyCodeList = $scope.occupationCodeList.filter(function (item) {
                return (item.IndustryCode1 == industryCode1 && item.IndustryCode2 == industryCode2)
            });
            $scope.Person.PolicyHolder.PolicyHolder.OccCD = null;
            $scope.Person.PolicyHolder.PolicyHolder.OccClass = null;
        };


        $scope.InitialResidenceAddressTerritoryList = function (provCd) {
            var insured = $scope.Person.Insured.Insured;
            $scope.insuredResidenceAddressTerritoryList = nglhAppService.loadTerritoryList(provCd);
        };

        $scope.InitialResidenceIndustryCode2List = function (industryCode1) {
            $scope.occupationIndustryCode2List = $scope.occupationCodeList.filter(function (item) {
                return item.IndustryCode1 == industryCode1
            });
        };

        $scope.InitialPolicyIndustryCode2List = function (industryCode1) {
            $scope.occupationPolicyIndustryCode2List = $scope.occupationCodeList.filter(function (item) {
                return item.IndustryCode1 == industryCode1
            });
        };


        $scope.IntitalResidenceAddressCountyList = function (provCd, terrCd) {
            $scope.insuredResidenceAddressCountyList = nglhAppService.loadCountyList(provCd, terrCd);
        };


        $scope.IntitalResidenceIndustryCodeList = function (industryCode1, industryCode2) {
            $scope.occupationIndustryCodeList = $scope.occupationCodeList.filter(function (item) {
                return (item.IndustryCode1 == industryCode1 && item.IndustryCode2 == industryCode2)
            });
        };

        $scope.IntitalPolicyIndustryCodeList = function (industryCode1, industryCode2) {
            $scope.occupationPolicyCodeList = $scope.occupationCodeList.filter(function (item) {
                return (item.IndustryCode1 == industryCode1 && item.IndustryCode2 == industryCode2)
            });
        };

        $scope.onInsuredOfficeOrSchoolAddressProvinceChanged = function (provCd) {
            var insured = $scope.Person.Insured.Insured;

            $scope.insuredOfficeOrSchoolAddressTerritoryList = nglhAppService.loadTerritoryList(provCd);
            $scope.insuredOfficeOrSchoolAddressCountyList = null;
            insured.OfficeOrSchoolAddressTerritory = null;
            insured.OfficeOrSchoolAddressCounty = null;
        };

        $scope.onInsuredOfficeOrSchoolAddressTerritoryChanged = function (provCd, terrCd) {
            $scope.insuredOfficeOrSchoolAddressCountyList = nglhAppService.loadCountyList(provCd, terrCd);
            $scope.Person.Insured.Insured.OfficeOrSchoolAddressCounty = null;
        };

        $scope.InitialOfficeOrSchoolAddressTerritoryList = function (provCd) {
            var insured = $scope.Person.Insured.Insured;
            $scope.insuredOfficeOrSchoolAddressTerritoryList = nglhAppService.loadTerritoryList(provCd);
        };

        $scope.InitialOfficeOrSchoolAddressCountyList = function (provCd, terrCd) {
            $scope.insuredOfficeOrSchoolAddressCountyList = nglhAppService.loadCountyList(provCd, terrCd);
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

        $scope.CalculateInsuredInfo = function (insured, num) {

            var age = 0;
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();

            if (insured.DOB != null) {

                var dobStr = formatDate((insured.DOB).substring(0, 10).replace(/-/g, ""));
                var dobYear = dobStr.substring(0, 4);
                var dobMonth = dobStr.substring(4, 6);
                var dobDate = dobStr.substring(6, 8);

                age = year - dobYear;
                if (dobMonth > month) {
                    age = age - 1;
                }
                else if (dobMonth == month) {
                    //                    if (dobDate >= date) { '20193965 王伟周邮件 核心年龄计算
                    if (dobDate > date) { //20193965 王伟周邮件 核心年龄计算
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

        $scope.GetAgeFromID = function (insured) {
            var age = 0;
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();
            //20190786  AWS 在线递交新增证件类型
            if ((insured.IDType == '1' || insured.IDType == '6' || insured.IDType == 'A' || insured.IDType == 'B' || insured.IDType == 'C') && insured.ID.length == 18) {

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
                    //                    if (dobDate >= date) {//20193965 
                    if (dobDate > date) {//20193965 王伟周邮件 核心年龄计算
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
                //if (dobDate >= date) {//20193965 王伟周邮件 核心年龄计算
                if (dobDate > date) {
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
        //<<King_GACP----------------------------------------------------------------------------------------------------------------------------
        //与投保人关系
        $scope.enableinsuredIsCopyInsured = function (client) {
            if (client == "Y") {
                return false;
            }
            else {
                return true;
            }
        }

        $scope.insuredPHRelationshipRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_PH_RELATION_SHIP');
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
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_ONESELF_MORE_THAN_ONE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : '');
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var spCount = 0;
                        for (var i = 0; i < $scope.Person.OtherInsured.length; i++) {
                            var sp = $scope.Person.OtherInsured[i].Relationship;
                            if (sp == 'I') {
                                spCount += 1;
                            }
                        }
                        if (value == "I") {
                            spCount += 1;
                        }
                        if (spCount > 1) {
                            return true;
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_SPOUSE_MORE_THAN_ONE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : '');
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var spCount = 0;
                        for (var i = 0; i < $scope.Person.OtherInsured.length; i++) {
                            var sp = $scope.Person.OtherInsured[i].Relationship;
                            if (sp == 'S') {
                                spCount += 1;
                            }
                        }
                        if (value == "S") {
                            spCount += 1;
                        }
                        if (spCount > 1) {
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);
        //>>King_GACP---------------------------------------------------------------------------------------------------------------------------

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
                        if (!value || value == '') {
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
                            var isInvalidID = (value == '1' || value == '3' || value == '6' || value == '7') && (nationality != "CHN");
                            var isInvalidPP = (value == '2') && (nationality == "TWN" || nationality == "HKG" || nationality == "MAC");
                            var isInvalidHK = (value == '4') && (nationality != "TWN" && nationality != "HKG" && nationality != "MAC");
                            if (isInvalidID || isInvalidPP || isInvalidHK) {
                                return true;
                            }
                            //20190786  AWS 在线递交新增证件类型
                            if (nationality == "CHN" && (value == "A" || value == "B" || value == "C" || value == "D")) {
                                return true;
                            }

                            //<<20193965
                            //20190786  AWS 在线递交新增证件类型
                            if ((nationality == "HKG" && value != "A" && value != "Y") ||
                            (nationality == "MAC" && value != "A" && value != "Y") ||
                            (nationality == "TWN" && value != "C" && value != "Z") ||
                            (nationality && nationality != "CHN" && nationality != "HKG" && nationality != "MAC" && nationality != "TWN" && value != "2" && value != "D")) {
                                return true;
                            }
                            //>>20193965
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
                        if (insured.Age && insured.Age >= 16 && value == '6') {
                            this.message = "主被保险人 - " + insured.Name + "年龄大于等于16周岁，不能选择居民户口簿。";
                            return true;
                        }
                        if (insured.Age && insured.Age > 15 && value == '7') {
                            this.message = "主被保险人 - " + insured.Name + "年龄大于15周岁，不能选择出生医学证明";
                            return true;
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
                        if (!value || value == '') {
                            //                            insured.Sex = "";
                            //                            insured.Age = "";
                            //                            insured.DOB = null;
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
                    //<<20193965 
                    //var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_IDENTITY_CARD_NUMBER_BOOKLET');
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.Insured.Insured.IDType });
                    var _msg = "主被保险人 - {0}{1}号码有误，请核实!";
                    var name = $scope.Person.Insured.Insured.Name;
                    //>>20193965
                    return _msg.format(name ? name : "", idtype ? idtype[0].value : "证件"); //20193965
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.Insured.Insured;
                        //20190786  AWS 在线递交新增证件类型
                        if (value && (!$scope.chkValidIdNumberInput(value) || !$scope.chkBirthdayNumber(value) || value.length != 18 || !/^[0-9]{17}([0-9]|X){1}$/.test(value))
                         && (insured.IDType == "1" || insured.IDType == "6" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C")) {
                            //                            insured.Sex = "";
                            //                            insured.Age = "";
                            //                            insured.DOB = null;
                            return true;
                        }
                        // <<20193965
                        //20190786  AWS 在线递交新增证件类型
                        //if (value && ((insured.IDType == "A" && value.indexOf("810000") != 0) ||
                        //            (insured.IDType == "B" && value.indexOf("820000") != 0) ||
                        //            (insured.IDType == "C" && value.indexOf("830000") != 0))) {
                        //    return true;
                        //}
                        if (value && ((insured.Nationality == "HKG" && insured.IDType == "A" && value.indexOf("810000") != 0) ||
                                    (insured.Nationality == "MAC" && insured.IDType == "A" && value.indexOf("820000") != 0) ||
                                    (insured.Nationality == "TWN" && insured.IDType == "C" && value.indexOf("830000") != 0))) {
                            return true;
                        }
                        //>>20193965

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
                            //20190786  AWS 在线递交新增证件类型
                            if (insured.IDType == "1" || insured.IDType == "6" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C") {
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
                message: function (value, target, scopeKey, scope, controller, me) {
                    //<<20193965
                    //var _msg = $filter('translate')('MESSAGE_INSURED_DOB_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.Insured.Insured.IDType });
                    var _msg = "主被保险人 - {0}出生日期与{1}不符，请核实!";
                    //>>20193965
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "", idtype ? idtype[0].value : "证件"); //20193965
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var insured = $scope.Person.Insured.Insured;
                            insured.ID = value;
                            //20190786  AWS 在线递交新增证件类型
                            if (insured.IDType == "1" || insured.IDType == "6" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C" || insured.IDType == "D") {
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
                    //                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_IDENTITY_NUMBER_FORMAT');
                    var _msg = "主被保险人 - {0}证件格式有误，请核实!";
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
                            } else if (insured.IDType == "7" && ($scope.countLength(value) <= 9)) {
                                this.message = "主被保险人 - " + insured.Name + "出生医学证明号码错误，请输入大于9个字符的号码";
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
                                if (insured.ID != '' || (insured.IDType != '' && insured.IDType != null)) {
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
        //<<Larry 20186222
            , new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_DATE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            var val = formatDate(value.substring(0, 10).replace(/-/g, ""));
                            var val1 = formatDate($('#InsuredIDExpired').val().substring(0, 10).replace(/\//g, ""));
                            if (val != val1 && val1 != '') {
                                $scope.Person.Insured.Insured.Age = "";
                                return true;
                            }
                        }
                        return false;
                    }
                }
            })
        //>>Larry 20186222
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
            if (clientSection.IDExpired != "2099-12-31T00:00:00" && clientSection.IDExpired != "2099-12-31T12:00:00") {
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
                    //20190786  AWS 在线递交新增证件类型
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.Insured.Insured.IDType });
                    var _msg = $filter('translate')('MESSAGE_INSURED_GENDER_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var name = $scope.Person.Insured.Insured.Name;
                    //20190786  AWS 在线递交新增证件类型
                    return _msg.format(name ? name : "", idtype ? idtype[0].value : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var insured = $scope.Person.Insured.Insured;
                            //20190786  AWS 在线递交新增证件类型
                            if (insured.IDType == "1" || insured.IDType == '6' || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C") {
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
            }),
        //<<Larry 20186222
            new Rule({
                //messagfe: "参保的客户与主被保险人的关系为配偶的性别必须相反！
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_SEX_SAME');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                }, performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            if ($scope.Person.Insured.Insured.PHRelationship == 'S' && $scope.Person.PolicyHolder.PolicyHolder.Sex == value) {
                                return true;
                            }

                        }
                        return false;
                    }
                }
            })
        //>>Larry 20186222
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

                            //                            if ($scope.Person.Insured.Insured.Age < 16 || $scope.Person.Insured.Insured.Age > 60) {
                            //                                //主被保险人至少要为成年人
                            //                                return true;
                            //                            }
                        }

                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    //20190786  AWS 在线递交新增证件类型
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.Insured.Insured.IDType });
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_BIRTHDAY');
                    var name = $scope.Person.Insured.Insured.Name;
                    //20190786  AWS 在线递交新增证件类型
                    return _msg.format(name ? name : "", idtype ? idtype[0].value : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            //20190786  AWS 在线递交新增证件类型
                            if (($scope.Person.Insured.Insured.IDType == '1' ||
                                $scope.Person.Insured.Insured.IDType == 'A' ||
                                $scope.Person.Insured.Insured.IDType == 'B' ||
                                $scope.Person.Insured.Insured.IDType == 'C')
                             && $scope.Person.Insured.Insured.ID.length == 18) {
                                var dob = formatDate(value.substring(0, 10).replace(/-/g, ""));
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
        //<<Larry 20186222  验证日期是否合法
            , new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_DATE');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : '');
                    return _msg;
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            //<<20193965 
                            $timeout(function () {
                                var val = formatDate(value.substring(0, 10).replace(/-/g, ""));
                                var val1 = formatDate($('#insuredDOB').val().substring(0, 10).replace(/\//g, ""));
                                if (val != val1 && val1 != '') {
                                    $scope.Person.Insured.Insured.Age = "";
                                    return true;
                                }
                            });
                            //>>20193965 
                        }
                        return false;
                    }
                }
            }),
        //>>Larry 20186222
        //<<旁系
              new Rule({
                  message: function (value, target, scopeKey, scope, controller, me) {
                      var _msg = "主被保险人 - {0} 被保险人投保年龄小于20周岁，应为20-65周岁,不符合投保年龄要求";
                      var name = $scope.Person.Insured.Insured.Name;
                      return _msg.format(name ? name : '');
                  },
                  performCheck: function () {
                      return $scope.fullCheck;
                  },
                  isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                      if (me.isDirty(isDirty)) {

                          var insured = $scope.Person.Insured.Insured;
                          //配偶年龄
                          if (value && insured.PHRelationship == "S" && insured.Age < 20) {
                              return true;
                          }


                          return false;
                      }

                  }
              }),
              new Rule({
                  message: function (value, target, scopeKey, scope, controller, me) {
                      var _msg = "主被保险人 - {0} 被保险人投保年龄大于65周岁，应为20-65周岁，不符合投保年龄要求";
                      var name = $scope.Person.Insured.Insured.Name;
                      return _msg.format(name ? name : '');
                  },
                  performCheck: function () {
                      return $scope.fullCheck;
                  },
                  isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                      if (me.isDirty(isDirty)) {

                          var insured = $scope.Person.Insured.Insured;
                          //配偶年龄
                          if (value && insured.PHRelationship == "S" && insured.Age > 65) {
                              return true;
                          }
                          return false;
                      }

                  }
              })//>>旁系
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
            }), //<<20202502
        //            new Rule({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = "主被保险人 - {0}职业类别超过4级，请检查。";
        //                    var name = name = $scope.Person.Insured.Insured.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var insured = $scope.Person.Insured.Insured;
        //                        if (value && insured.OccClass > 4) {
        //                            return true;
        //                        }
        //                        return false;
        //                    }
        //                } //>>20202502
        //            })
        ]);


        //职业类别
        $scope.insuredOccClassRules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "主被保险人 - {0}职业类别不能为空，请填选职业代码!";
                    var name = name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            }),
                new Rule({
                    message: function (value, target, scopeKey, scope, controller, me) {
                        var _msg = "主被保险人 - {0}职业类别不能为空，请填选职业代码!";
                        var name = name = $scope.Person.Insured.Insured.Name;
                        return _msg.format(name ? name : "");
                    },
                    performCheck: function () {
                        return $scope.fullCheck;
                    },
                    isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                        if (me.isDirty(isDirty)) {
                            if (!value || value <= 0) {
                                return true;
                            }
                            return false;
                        }
                    }
                }),
        //<<20202502
                new Rule({
                    message: function (value, target, scopeKey, scope, controller, me) {
                        var _msg = "主被保险人 - {0}职业类别超过4级，请检查。";
                        var name = name = $scope.Person.Insured.Insured.Name;
                        return _msg.format(name ? name : "");
                    },
                    performCheck: function () {
                        return $scope.fullCheck;
                    },
                    isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                        if (me.isDirty(isDirty)) {
                            if (value && value > 4) {
                                return true;
                            }
                            return false;
                        }
                    }
                })//>>20202502
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
                    //                    var _msg = $filter('translate')('MESSAGE_INSURED_INVALID_NON_CHINA_IDENTITY_DOCUMENT_TYPE');//20193965                    
                    var _msg = "主被保险人 - {0}外籍人士请递交护照或外国人永久居留证!"; //20193965
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var insured = $scope.Person.Insured.Insured;
                        if (insured.IDType && (insured.IDType == "6" || insured.IDType == "7") && value != "CHN") {//非中国籍客户不能选择居民户口簿、出生医学证明
                            this.message = "主被保险人 - " + insured.Name + "非中国籍客户不能选择居民户口簿、出生医学证明";
                            return true;
                        }

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

                        //<<20193965
                        if ((value == "HKG" && insured.IDType != "A" && insured.IDType != "Y") ||
                            (value == "MAC" && insured.IDType != "A" && insured.IDType != "Y") ||
                            (value == "TWN" && insured.IDType != "C" && insured.IDType != "Z") ||
                            (value != "CHN" && value != "HKG" && value != "MAC" && value != "TWN" && insured.IDType && insured.IDType != '2' && insured.IDType != "D")) {
                            return true;
                        }
                        //>>20193965
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
            })
        //King_GACP
        //<<旁系
                    ,
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
                    }),
                    new Rule({
                        message: function (value, target, scopeKey, scope, controller, me) {
                            var _msg = "主被保险人{0}  配偶、父母、成年子女、旁系亲属的联系电话不得与投保人相同.";
                            var name = $scope.Person.Insured.Insured.Name;
                            return _msg.format(name ? name : "");
                        },
                        performCheck: function () {
                            return $scope.fullCheck;
                        },
                        isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                            if (me.isDirty(isDirty)) {
                                var pMobile = $scope.Person.PolicyHolder.PolicyHolder.Mobile;
                                var insured = $scope.Person.Insured.Insured;
                                if (insured.PHRelationship != "I" && insured.Age >= 18 && value && value == pMobile) {
                                    return true;
                                }
                                return false;
                            }
                        }
                    })
        //>>旁系
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

        //行业
        $scope.insuredResidenceIndustryCode1Rules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_RESIDENCE_Industry_Code1');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.policyResidenceIndustryCode1Rules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICY_RESIDENCE_Industry_Code1');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);


        //职能
        $scope.insuredResidenceIndustryCode2Rules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_RESIDENCE_Industry_Code2');
                    var name = $scope.Person.Insured.Insured.Name;
                    return _msg.format(name ? name : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.policyResidenceIndustryCode2Rules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_POLICY_RESIDENCE_Industry_Code2');
                    var name = $scope.Person.PolicyHolder.PolicyHolder.Name;
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
                }
                ,
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value) {
                            //20190214 将该下拉框设为必填
                            //                            var insured = $scope.Person.Insured.Insured;
                            //                            if (insured.ResidenceAddressProvince == "110000" || insured.ResidenceAddressProvince == "440000") {
                            //                                if (insured.ResidenceAddressTerritory != "441900" && insured.ResidenceAddressTerritory != "442000") {
                            //                                    return true;
                            //                                }
                            //                            }
                            return true;
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
        //<<King_GACP
        //            new Rule({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_RESIDENCE_ZIP_CODE');
        //                    var name = $scope.Person.Insured.Insured.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        if (!value) {
        //                            return true;
        //                        }
        //                        return false;
        //                    }
        //                }
        //            }),
        //>>King_GACP
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
        //<<King_GACP
        //            new Required({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_NAME');
        //                    var name = $scope.Person.Insured.Insured.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        if (!value) {
        //                            return true;
        //                        }

        //                        $scope.Person.Insured.Insured.OfficeOrSchool = value;
        //                        $scope.doValidator("Person.Insured.Insured.OfficeOrSchoolAddressProvince", null);
        //                        $scope.doValidator("Person.Insured.Insured.OfficeOrSchoolAddressTerritory", null);
        //                        $scope.doValidator("Person.Insured.Insured.OfficeOrSchoolAddressCounty", null);
        //                        $scope.doValidator("Person.Insured.Insured.OfficeOrSchoolAddressLine1", null);
        //                        $scope.doValidator("Person.Insured.Insured.OfficeOrSchoolAddressZipCode", null);
        //                        return false;
        //                    }
        //                }
        //            }),
        //>>King_GACP
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
        //<<King_GACP
        //            new Required({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_PROVINCE');
        //                    var name = $scope.Person.Insured.Insured.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var insured = $scope.Person.Insured.Insured;
        //                        //学校名称第一个不是"无"，则剩下关于学校信息字段都必须填写
        //                        if (!value && insured.OfficeOrSchool.indexOf('无') != 0)
        //                            return true;
        //                        return false;
        //                    }
        //                }
        //            })
        //>>King_GACP
        ]);

        $scope.insuredOfficeOrSchoolAddressTerritoryRules = new BusinessRules([
        //<<King_GACP
        //            new Required({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_TERRITORY');
        //                    var name = $scope.Person.Insured.Insured.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var insured = $scope.Person.Insured.Insured;
        //                        if (!value && insured.OfficeOrSchool.indexOf('无') != 0)
        //                            return true;
        //                        return false;
        //                    }
        //                }
        //            })
        //>>King_GACP
        ]);

        $scope.insuredOfficeOrSchoolAddressCountyRules = new BusinessRules([
        //<<King_GACP
        //            new Rule({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_COUNTY');
        //                    var name = $scope.Person.Insured.Insured.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var insured = $scope.Person.Insured.Insured;
        //                        if (!value && insured.OfficeOrSchool.indexOf('无') != 0) {
        //                            var insured = $scope.Person.Insured.Insured;
        //                            if (insured.OfficeOrSchoolAddressProvince == "110000" || insured.OfficeOrSchoolAddressProvince == "440000") {
        //                                //ignore special cases in Territory, Copied From EAPS
        //                                if (insured.OfficeOrSchoolAddressTerritory != "441900" && insured.OfficeOrSchoolAddressTerritory != "442000") {
        //                                    return true;
        //                                }
        //                            }
        //                        }

        //                        return false;
        //                    }
        //                }
        //            })
        //>>King_GACP
        ]);

        $scope.insuredOfficeOrSchoolAddressLine1Rules = new BusinessRules([
        //<<King_GACP
        //            new Required({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_ADDRESS_LINE');
        //                    var name = $scope.Person.Insured.Insured.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var insured = $scope.Person.Insured.Insured;
        //                        if (!value && insured.OfficeOrSchool.indexOf('无') != 0)
        //                            return true;
        //                        return false;
        //                    }
        //                }
        //            }),
        //>>King_GACP
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
        //<<King_GACP
        //            new Required({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_EMPTY_INSURED_COMPANY_OR_SCHOOL_ZIP_CODE');
        //                    var name = $scope.Person.Insured.Insured.Name;
        //                    return _msg.format(name ? name : "");
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var insured = $scope.Person.Insured.Insured;
        //                        if (!value && insured.OfficeOrSchool.indexOf('无') != 0)
        //                            return true;
        //                        return false;
        //                    }
        //                }
        //            }),
        //>>King_GACP
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
                        if ($scope.Person.Insured.Insured.PHRelationship == "S") {
                            spCount += 1;
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
        //			new Rule({
        //			    message: function (value, target, scopeKey, scope, controller, me) {
        //			        var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_PARENT_MORE_THAN_ONE');
        //			        var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
        //			        return _msg = _msg.format(name ? name : "");
        //			    },
        //			    performCheck: function () {
        //			        return $scope.fullCheck;
        //			    },
        //			    isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //			        if (me.isDirty(isDirty)) {
        //			            $scope.Person.OtherInsured[scope.$orgIndex].Relationship = value;
        //			            var paCount = 0;
        //			            for (var i = 0; i < $scope.Person.OtherInsured.length; i++) {
        //			                var pa = $scope.Person.OtherInsured[i].Relationship;
        //			                if (pa == 'P') {
        //			                    paCount += 1;
        //			                    $scope.globalPAScopeKeys.push(scopeKey);
        //			                }
        //			            }
        //			            //if (paCount > 1) {20184045
        //			            if (paCount > 2) {//20184045
        //			                if (value == 'P') {
        //			                    return true;
        //			                }
        //			                else {
        //			                    $scope.ErrorSummary.remove("otherInsured.Relationship", scopeKey);
        //			                }
        //			            }
        //			            else {
        //			                for (var i = 0; i < $scope.globalPAScopeKeys.length; i++) {
        //			                    var cnrtKey = $scope.globalPAScopeKeys.pop();

        //			                    if (cnrtKey != '') {
        //			                        $scope.ErrorSummary.remove("otherInsured.Relationship", cnrtKey);
        //			                    }
        //			                }
        //			            }

        //			            return false;
        //			        }
        //			    }
        //			}),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_ONESELF_MORE_THAN_ONE');
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
                            if (sp == 'I') {
                                spCount += 1;
                                $scope.globalSPScopeKeys.push(scopeKey);
                            }
                        }
                        if ($scope.Person.Insured.Insured.PHRelationship == "I") {
                            spCount += 1;
                        }
                        if (spCount > 1) {
                            if (value == 'I') {
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
            new Rule({//<<旁系
                message: "",
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var o_count = $scope.Person.OtherInsured.filter(function (x) { return x.Relationship == 'I' }).length;
                        var s_count = $scope.Person.OtherInsured.filter(function (x) { return x.Relationship == 'S' }).length;
                        var r_o_count = $scope.Person.OtherInsured.filter(function (x) { return x.Relationship == 'R' }).length;
                        var r_s_count = $scope.Person.OtherInsured.filter(function (x) { return x.Relationship == 'U' }).length;
                        var rs_count = $scope.Person.OtherInsured.filter(function (x) { return x.Relationship == 'V' }).length;

                        if ($scope.Person.Insured.Insured.PHRelationship == "I") {
                            o_count++;
                        }
                        if ($scope.Person.Insured.Insured.PHRelationship == "S") {
                            s_count++;
                        }

                        //投保人配偶旁系血亲处，如果投保人配偶没有参保且投保人配偶旁系血亲参保
                        if (s_count <= 0 && r_s_count >= 0 && value && value == "U") {
                            this.message = "其他被保险人{0} - {1} 请添加投保人配偶信息后，方可添加投保人配偶旁系亲属.";
                            var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                            this.message = this.message.format((scope.$orgIndex + 1), name);
                            return true;
                        }

                        //投保人旁系血亲处，如果投保人没有参保且投保人旁系血亲参保
                        if (o_count <= 0 && r_o_count >= 0 && value && value == "R") {
                            this.message = "其他被保险人{0} - {1} 请补充投保人信息后，方可添加投保人旁系亲属.";
                            var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                            this.message = this.message.format((scope.$orgIndex + 1), name);
                            return true;
                        }


                        //投保人旁系血亲、投保人配偶旁系血亲、旁系血亲配偶处，其参保人数超过总参保人数50%
                        if (2 * (r_o_count + r_s_count + rs_count) > $scope.Person.OtherInsured.length + 1 && value && (value == "R" || value == "U" || value == "V")) {
                            this.message = "其他被保险人{0} - {1} 旁系亲属的参保人数不得超过所有参保人数的50%.";
                            var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                            this.message = this.message.format((scope.$orgIndex + 1), name);
                            return true;
                        }

                        //旁系血亲配偶处，投保人旁系血亲、投保人配偶旁系血亲未参保，旁系血亲配偶参保
                        if (r_o_count <= 0 && r_s_count <= 0 && rs_count > 0 && value && value == "V") {
                            this.message = "其他被保险人{0} - {1} 旁系血亲未参保的情况下，旁系血亲的配偶不可参保.";
                            var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                            this.message = this.message.format((scope.$orgIndex + 1), name);
                            return true;
                        }

                        return false;
                    }
                }
            })//>>旁系
        ]);


        //<<旁系
        $scope.otherInsuredRelativesDescRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "其他被保险人{0}-{1} 投保人旁系亲属或投保人配偶旁系亲属，需录入与投保人（配偶）关系描述";
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (!otherInsured.Relationship) {
                            return false;
                        }

                        //                        if (otherInsured.Relationship != "R" && otherInsured.Relationship != "U" && otherInsured.Relationship != "V" && value && value != "") {
                        //                            otherInsured.RelativesDesc = "";
                        //                            return false;
                        //                        }

                        if ((otherInsured.Relationship == "R" || otherInsured.Relationship == "U" || otherInsured.Relationship == "V") && !value) {
                            return true;
                        }

                    }
                }
            }), //<<20202502
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "其他被保险人 - {0} 与投保人(配偶)关系描述不可超过{1}个字符({2}个汉字)!";
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format(name, RELATIVES_RELATION_DESC, RELATIVES_RELATION_DESC / 2);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && $scope.countLength(value) > RELATIVES_RELATION_DESC) {
                            return true;
                        }
                        return false;
                    }
                }
            })//>>20202502
        ]);


        $scope.otherInsuredRelativeSuposeRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "其他被保险人{0} - {1} 请填选旁系姓名证件号码!";
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (!otherInsured.Relationship) {
                            return false;
                        }
                        if (otherInsured.Relationship == "V") {
                            if (!value || !otherInsured.RelativesIdNum) {
                                return true;
                            }
                        }
                        return false;
                    }
                }
            }),
             new Rule({
                 message: "",
                 performCheck: function () {
                     return $scope.fullCheck;
                 },
                 isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                     if (me.isDirty(isDirty)) {
                         var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                         if (!otherInsured.Relationship) {
                             return false;
                         }
                         if (otherInsured.Relationship == "V") {
                             if (value) {
                                 var flag = false;
                                 var relativesNames = [];
                                 angular.forEach($scope.Person.OtherInsured, function (item, key) {
                                     if (item.$$hashKey == value.$$hashKey && item.Relationship != "R" && item.Relationship != "U") {
                                         flag = true;
                                         if (value.Name) {
                                             relativesNames.push("其他被保险人" + (key + 1) + "(" + value.Name + ")");
                                         } else {
                                             relativesNames.push("其他被保险人" + (key + 1));
                                         }
                                     }
                                 });

                                 if (flag == true) {
                                     this.message = "其他被保险人" + scope.$orgIndex + " - " + otherInsured.Name + "为旁系亲属配偶，其对应的" + relativesNames.join(",") + "不是旁系亲属!"; ;
                                     return true;
                                 }
                             }
                         }
                         return false;
                     }
                 }
             }),
              new Rule({
                  message: "",
                  performCheck: function () {
                      return $scope.fullCheck;
                  },
                  isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                      if (me.isDirty(isDirty)) {

                          var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];

                          //配偶年龄
                          if (value && otherInsured.Relationship == "V") {
                              var relativesNames = [];
                              angular.forEach($scope.Person.OtherInsured, function (item, key) {
                                  if (item.$$hashKey == value.$$hashKey && (item.Age < 20 || item.Age > 60)) {
                                      if (item.Name) {
                                          relativesNames.push("其他被保险人" + (key + 1) + "(" + item.Name + ")");
                                      } else {
                                          relativesNames.push("其他被保险人" + (key + 1));
                                      }
                                  }
                              });
                              if (relativesNames.length > 0) {
                                  this.message = "其他被保险人{0} - {1} 旁系亲属的配偶，其对应的旁系亲属{2}年龄应为20-60周岁,不符合投保年龄要求".format((scope.$orgIndex + 1), otherInsured.Name, relativesNames.join("、"));
                                  return true;
                              }


                          }
                          return false;
                      }

                  }
              }),
              new Rule({
                  message: "",
                  performCheck: function () {
                      return $scope.fullCheck;
                  },
                  isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                      if (me.isDirty(isDirty)) {

                          var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];

                          var sopuseIndex = $.inArray(value, $scope.Person.OtherInsured);
                          var sopuseName = "其他被保险人" + (sopuseIndex + 1);
                          if (value.Name) {
                              sopuseName += "(" + value.Name + ")";
                          }

                          //所有以当前被保险人选择的旁系为配偶的被保险人
                          var otherRelatives = $scope.Person.OtherInsured.filter(function (item) {
                              return item.RelativeSupose && item.RelativeSupose.$$hashKey == value.$$hashKey && item.$$hashKey != scopeKey
                          });


                          //多个旁系选择同一旁系为配偶
                          if (value && otherRelatives.length > 0) {
                              this.message = "其他被保险人{0} - {1} 与{2}的关系为配偶的被保险人只能有一个!".format((scope.$orgIndex + 1), otherInsured.Name, sopuseName);
                              return true;
                          }
                          return false;
                      }

                  }
              })

        ]); //>>旁系

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
                    //var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_UNMATCHED_IDENTITY_DOCUMENT_TYPE'); //20193965
                    var _msg = "其他被保险人{0} - {1}证件类型与国籍不符!"; //20193965
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
                            var isInvalidID = (value == '1' || value == '3' || value == '6' || value == '7') && (nationality != "CHN");
                            var isInvalidPP = (value == '2') && (nationality == "TWN" || nationality == "HKG" || nationality == "MAC");
                            var isInvalidHK = (value == '4') && ((nationality != "TWN" && nationality != "HKG" && nationality != "MAC") && !(nationality == "CHN" && otherInsured.Age <= 2));
                            if (isInvalidID || isInvalidPP || isInvalidHK) {
                                return true;
                            }

                            //20190786  AWS 在线递交新增证件类型
                            if (nationality == "CHN" && (value == "A" || value == "B" || value == "C" || value == "D")) {
                                return true;
                            }

                            //<<20193965
                            //20190786  AWS 在线递交新增证件类型
                            if ((nationality == "HKG" && value != "A" && value != "Y") ||
                            (nationality == "MAC" && value != "A" && value != "Y") ||
                            (nationality == "TWN" && value != "C" && value != "Z") ||
                            (nationality && nationality != "CHN" && nationality != "HKG" && nationality != "MAC" && nationality != "TWN" && value != "2" && value != "D")) {
                                return true;
                            }
                            //>>20193965
                        }

                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    //<<20193965
                    // var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_CHN_BABY_FOBID_CARDTYPE');
                    var _msg = "其他被保险人{0} - {1}是2岁以下中国籍未成年人，证件类型只可选居民身份证、居民户口簿、出生医学证明!";
                    //>>20193965

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
                        //if (value != '1' && value != '4' && nationality == 'CHN' && otherInsured.Age <= 2) {//20193965
                        //2岁以下中国籍未成年人，只可选居民身份证|居民户口簿|出生医学证明
                        if (value != '1' && value != '6' && value != '7' && nationality == 'CHN' && otherInsured.Age <= 2) {//20193965
                            return true;
                        }

                        if (otherInsured.Age && otherInsured.Age >= 16 && value == '6') {
                            this.message = "其他被保险人" + (scope.$orgIndex + 1) + " - " + otherInsured.Name + "年龄大于等于16周岁，不能选择居民户口簿。";
                            return true;
                        }

                        if (otherInsured.Age && otherInsured.Age > 15 && value == '7') {
                            this.message = "其他被保险人" + (scope.$orgIndex + 1) + " - " + otherInsured.Name + "年龄大于15周岁，不能选择出生医学证明";
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
                            //                            insured.Sex = "";
                            //                            insured.Age = "";
                            //                            insured.DOB = null;
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

                    //<<20193965 
                    //var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_IDENTITY_CARD_NUMBER');
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.OtherInsured[scope.$orgIndex].IDType });
                    var _msg = "其他被保险人{0} - {1}{2}号码有误，请核实!";
                    //>>20193965

                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name ? name : "", idtype ? idtype[0].value : "证件"); //20193965
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var insured = $scope.Person.OtherInsured[scope.$orgIndex];
                        //20190786  AWS 在线递交新增证件类型
                        if (value && (!$scope.chkValidIdNumberInput(value) || !$scope.chkBirthdayNumber(value) || value.length != 18 || !/^[0-9]{17}([0-9]|X){1}$/.test(value))
                         && (insured.IDType == "1" || insured.IDType == "6" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C")) {
                            //                            insured.Sex = "";
                            //                            insured.Age = "";
                            //                            insured.DOB = null;
                            return true;
                        }

                        // <<20193965
                        ////20190786  AWS 在线递交新增证件类型
                        //if (value && ((insured.IDType == "A" && value.indexOf("810000") != 0) ||
                        //            (insured.IDType == "B" && value.indexOf("820000") != 0) ||
                        //            (insured.IDType == "C" && value.indexOf("830000") != 0))) {
                        //    return true;
                        //}
                        if (value && ((insured.Nationality == "HKG" && insured.IDType == "A" && value.indexOf("810000") != 0) ||
                                    (insured.Nationality == "MAC" && insured.IDType == "A" && value.indexOf("820000") != 0) ||
                                    (insured.Nationality == "TWN" && insured.IDType == "C" && value.indexOf("830000") != 0))) {
                            return true;
                        }
                        //>>20193965

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
                            //20190786  AWS 在线递交新增证件类型
                            if (insured.IDType == "1" || insured.IDType == "6" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C") {
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
                    //<<20193965
                    //var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_DOB_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.OtherInsured[scope.$orgIndex].IDType });
                    var _msg = "其他被保险人{0} - {1}出生日期与{1}号码不符，请核实!";
                    //>>20193965
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name ? name : "", idtype ? idtype[0].value : ""); //20193965
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var insured = $scope.Person.OtherInsured[scope.$orgIndex];
                            insured.ID = value;
                            //20190786  AWS 在线递交新增证件类型
                            if (insured.IDType == "1" || insured.IDType == "6" || insured.IDType == "A" || insured.IDType == "B" || insured.IDType == "C" || insured.IDType == "D") {
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
                    //                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_IDENTITY_NUMBER_FORMAT');
                    var _msg = "其他被保险人{0} - {1}证件格式有误，请核实!";
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
                            } else if (insured.IDType == "7" && ($scope.countLength(value) <= 9)) {
                                this.message = "其他被保险人" + (scope.$orgIndex + 1) + " - " + insured.Name + "出生医学证明号码错误，请输入大于9个字符的号码";
                                return true;
                            }
                        }
                        return false;
                    }
                }
            }),
        //<<Larry 20186222
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_ID');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        var PolicyHolder = $scope.Person.PolicyHolder.PolicyHolder;

                        if (otherInsured.Relationship == "I") {
                            if (PolicyHolder.ID != otherInsured.ID) {
                                return true
                            }
                        }
                        return false;
                    }
                }
            })//>>Larry 20186222
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
                                if (insured.ID != '' || (insured.IDType != '' && insured.IDType != null)) {
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
        //<<Larry 20186222
                    , new Rule({
                        message: function (value, target, scopeKey, scope, controller, me) {
                            var _msg = $filter('translate')('MESSAGE_OTHER_INVALID_DATE');
                            var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                            return _msg.format((scope.$orgIndex + 1), name);
                        },
                        performCheck: function () {
                            return $scope.fullCheck;
                        },
                        isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                            if (me.isDirty(isDirty)) {
                                if (value) {
                                    var val = formatDate(value.substring(0, 10).replace(/-/g, ""));
                                    //var val1 = $('#otherInsuredIDExpired' + [scope.$orgIndex]).val().substring(0, 10).replace(/\//g, "");
                                    var val1 = formatDate($("input[name='otherInsuredIDExpired" + scope.$orgIndex + "']").val().substring(0, 10).replace(/\//g, ""));
                                    if (val != val1 && val1 != '') {
                                        $scope.Person.OtherInsured[scope.$orgIndex].Age = "";
                                        return true;
                                    }
                                }
                                return false;
                            }
                        }
                    })
        //>>Larry 20186222
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
            }),
        //<<Larry 20186222
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_NAME');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        var PolicyHolder = $scope.Person.PolicyHolder.PolicyHolder;

                        if (otherInsured.Relationship == "I") {
                            if (PolicyHolder.Name != otherInsured.Name) {
                                return true
                            }
                        }
                        return false;
                    }
                }
            })//>>Larry 20186222
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
                    //20190786  AWS 在线递交新增证件类型
                    //<<20193965 
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.OtherInsured[scope.$orgIndex].IDType });
                    // var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_GENDER_NOT_MATCH_WITH_IDENTITY_NUMBER');
                    var _msg = "其他被保险人{0} - {1}性别与{2}不符，请核实!";
                    //>>20193965    
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    //20190786  AWS 在线递交新增证件类型
                    return _msg.format((scope.$orgIndex + 1), name, idtype ? idtype[0].value : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {

                        if (value) {
                            var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                            //20190786  AWS 在线递交新增证件类型
                            if ($scope.Person.OtherInsured[scope.$orgIndex].IDType == '1'
                                || $scope.Person.OtherInsured[scope.$orgIndex].IDType == '6'
                                || $scope.Person.OtherInsured[scope.$orgIndex].IDType == 'A'
                                || $scope.Person.OtherInsured[scope.$orgIndex].IDType == 'B'
                                || $scope.Person.OtherInsured[scope.$orgIndex].IDType == 'C') {
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
            }),
        //<<Larry 20186222
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_SEX');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        var PolicyHolder = $scope.Person.PolicyHolder.PolicyHolder;

                        if (otherInsured.Relationship == "I") {
                            if (PolicyHolder.Sex != otherInsured.Sex) {
                                return true
                            }
                        }
                        return false;
                    }
                }
            }), //>>Larry 20186222
              new Rule({
                  message: function (value, target, scopeKey, scope, controller, me) {
                      var _msg = "其他被保险人{0} - {1}为旁系亲属的配偶，与旁系亲属的性别必须相反。";
                      var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                      return _msg.format((scope.$orgIndex + 1), name);
                  },
                  performCheck: function () {
                      return $scope.fullCheck;
                  },
                  isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                      if (me.isDirty(isDirty)) {
                          var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                          if (otherInsured.Relationship == "V") {
                              var supose = $scope.Person.OtherInsured.filter(function (item) {
                                  return item.ID == otherInsured.RelativesIdNum
                              });
                              if (supose.length > 0 && supose[0].Sex == otherInsured.Sex) {
                                  return true;
                              }
                          }
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
        //            new Rule({//如果当前客户“和被保人关系”为“配偶”，且其年龄小于20周岁或大于60周岁
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = $filter('translate')('MESSAGE_INVALID_MARRIAGE_INSURED_DATE_OF_BIRTH');
        //                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
        //                    return _msg.format((scope.$orgIndex + 1), name);
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var relationship = $scope.Person.OtherInsured[scope.$orgIndex].Relationship;
        //                        if (value && relationship == 'S') {
        //                            if ($scope.Person.OtherInsured[scope.$orgIndex].Age < 20 || $scope.Person.OtherInsured[scope.$orgIndex].Age > 60) {
        //                                return true;
        //                            }
        //                        }
        //                        return false;
        //                    }
        //                }
        //            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    //20190786  AWS 在线递交新增证件类型
                    var idtype = $filter('filter')($scope.identityDocumentTypeList, { key: $scope.Person.OtherInsured[scope.$orgIndex].IDType });
                    //<<20193965 
                    //var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_BIRTHDAY');
                    var _msg = "其他被保险人{0} - {1}{2}与出生日期不符!";
                    //>>20193965
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    //20190786  AWS 在线递交新增证件类型
                    return _msg.format((scope.$orgIndex + 1), name, idtype ? idtype[0].value : "");
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            $scope.Person.OtherInsured[scope.$orgIndex].DOB = value;
                            //20190786  AWS 在线递交新增证件类型
                            if (($scope.Person.OtherInsured[scope.$orgIndex].IDType == '1'
                                || $scope.Person.OtherInsured[scope.$orgIndex].IDType == 'A'
                                || $scope.Person.OtherInsured[scope.$orgIndex].IDType == 'B'
                                || $scope.Person.OtherInsured[scope.$orgIndex].IDType == 'C')
                             && $scope.Person.OtherInsured[scope.$orgIndex].ID.length == 18) {
                                var dob = formatDate(value.substring(0, 10).replace(/-/g, ""));
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
            }),
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
        //            }),
        //<<Larry 20186222 验证日期格式是否合法
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_DOB');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        var PolicyHolder = $scope.Person.PolicyHolder.PolicyHolder;

                        if (otherInsured.Relationship == "I") {
                            if (PolicyHolder.DOB.substr(0, 10) != otherInsured.DOB.substr(0, 10)) {
                                return true
                            }

                        }
                        return false;
                    }
                }
            })
            ,
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_OTHER_INVALID_DATE');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value) {
                            //<<20193965 
                            $timeout(function () {
                                var val = formatDate(value.substring(0, 10).replace(/-/g, ""));
                                //var val1 = document.getElementsByName("otherInsuredDOB" + scope.$orgIndex);
                                //val1 = val1.substring(0, 10).replace(/\//g, "");
                                //var val1 = $('#otherInsuredDOB' + scope.$orgIndex).val().substring(0, 10).replace(/\//g, "");
                                var val1 = formatDate($("input[name='otherInsuredDOB" + scope.$orgIndex + "']").val().substring(0, 10).replace(/\//g, ""));
                                if (val != val1 && val1 != '') {
                                    $scope.Person.OtherInsured[scope.$orgIndex].Age = "";
                                    return true;
                                }
                            });
                            //>>20193965 
                        }
                        return false;
                    }
                }
            }),
        // >>Larry 20186222
        //<<旁系
             new Rule({
                 message: function (value, target, scopeKey, scope, controller, me) {
                     var _msg = "其他被保险人{0} - {1} 被保险人投保年龄小于30天，应为30天-60周岁，不符合投保年龄要求";
                     var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                     return _msg.format((scope.$orgIndex + 1), name);
                 },
                 performCheck: function () {
                     return $scope.fullCheck;
                 },
                 isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                     if (me.isDirty(isDirty)) {

                         var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                         //旁系亲属或配偶旁系亲属，出生30天以内
                         if (value && (otherInsured.Relationship == "R" || otherInsured.Relationship == "U")) {
                             if (new Date(value) > new Date(Math.abs(new Date()) - 30 * 24 * 60 * 60 * 1000)) {
                                 return true;
                             }
                         }
                         return false;
                     }

                 }
             }),
              new Rule({
                  message: function (value, target, scopeKey, scope, controller, me) {
                      var _msg = "其他被保险人{0} - {1} 被保险人投保年龄小于30天，应为30天-30周岁，不符合投保年龄要求";
                      var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                      return _msg.format((scope.$orgIndex + 1), name);
                  },
                  performCheck: function () {
                      return $scope.fullCheck;
                  },
                  isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                      if (me.isDirty(isDirty)) {

                          var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                          //子女，出生30天以内
                          if (value && otherInsured.Relationship == "C") {
                              if (new Date(value) > new Date(Math.abs(new Date()) - 30 * 24 * 60 * 60 * 1000)) {
                                  return true;
                              }
                          }
                          return false;
                      }

                  }
              }),
               new Rule({
                   message: function (value, target, scopeKey, scope, controller, me) {
                       var _msg = "其他被保险人{0} - {1} 被保险人投保年龄大于30周岁，应为30天-30周岁，不符合投保年龄要求";
                       var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                       return _msg.format((scope.$orgIndex + 1), name);
                   },
                   performCheck: function () {
                       return $scope.fullCheck;
                   },
                   isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                       if (me.isDirty(isDirty)) {

                           var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                           //子女，年龄大于30周岁
                           if (value && otherInsured.Relationship == "C" && otherInsured.Age > 30) {
                               return true;
                           }
                           return false;
                       }
                   }
               }),
              new Rule({
                  message: function (value, target, scopeKey, scope, controller, me) {
                      var _msg = "其他被保险人{0} - {1} 旁系被保险人投保年龄大于60周岁，应不超过60周岁，不符合投保年龄要求";
                      var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                      return _msg.format((scope.$orgIndex + 1), name);
                  },
                  performCheck: function () {
                      return $scope.fullCheck;
                  },
                  isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                      if (me.isDirty(isDirty)) {

                          var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                          //旁系亲属或配偶旁系亲属或旁系亲属的配偶，大于60岁
                          if (value && (otherInsured.Relationship == "R" || otherInsured.Relationship == "U" || otherInsured.Relationship == "V")) {
                              if (otherInsured.Age > 60) {
                                  return true;
                              }
                          }


                          return false;
                      }

                  }
              }),
              new Rule({
                  message: function (value, target, scopeKey, scope, controller, me) {
                      var _msg = "其他被保险人{0} - {1} 被保险人投保年龄小于20周岁，应为20-65周岁,不符合投保年龄要求";
                      var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                      return _msg.format((scope.$orgIndex + 1), name);
                  },
                  performCheck: function () {
                      return $scope.fullCheck;
                  },
                  isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                      if (me.isDirty(isDirty)) {

                          var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                          //配偶年龄
                          if (value && otherInsured.Relationship == "S" && otherInsured.Age < 20) {
                              return true;
                          }


                          return false;
                      }

                  }
              }),
              new Rule({
                  message: function (value, target, scopeKey, scope, controller, me) {
                      var _msg = "其他被保险人{0} - {1} 被保险人投保年龄大于65周岁，应为20-65周岁，不符合投保年龄要求";
                      var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                      return _msg.format((scope.$orgIndex + 1), name);
                  },
                  performCheck: function () {
                      return $scope.fullCheck;
                  },
                  isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                      if (me.isDirty(isDirty)) {

                          var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                          //配偶年龄
                          if (value && otherInsured.Relationship == "S" && otherInsured.Age > 65) {
                              return true;
                          }
                          return false;
                      }

                  }
              }),
              new Rule({
                  message: function (value, target, scopeKey, scope, controller, me) {
                      var _msg = "其他被保险人{0} - {1} 被保险人投保年龄小于20周岁，应为20-60周岁,不符合投保年龄要求";
                      var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                      return _msg.format((scope.$orgIndex + 1), name);
                  },
                  performCheck: function () {
                      return $scope.fullCheck;
                  },
                  isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                      if (me.isDirty(isDirty)) {

                          var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                          //配偶年龄
                          if (value && otherInsured.Relationship == "V" && (otherInsured.Age < 20 || otherInsured.Age > 60)) {
                              return true;
                          }
                          return false;
                      }
                  }
              })
        //>>旁系
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
            }), //<<20202502
        //            new Rule({
        //                message: function (value, target, scopeKey, scope, controller, me) {
        //                    var _msg = "其他被保险人{0} - {1}职业类别超过4级，请检查。";
        //                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
        //                    return _msg.format((scope.$orgIndex + 1), name);
        //                },
        //                performCheck: function () {
        //                    return $scope.fullCheck;
        //                },
        //                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
        //                    if (me.isDirty(isDirty)) {
        //                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
        //                        if (value && otherInsured.OccClass > 4) {
        //                            return true;
        //                        }
        //                        return false;
        //                    }
        //                }
        //            })//>>20202502
        ]);



        //职业类别
        $scope.otherInsuredOccClassRules = new BusinessRules([
                 new Required({
                     message: function (value, target, scopeKey, scope, controller, me) {
                         var _msg = "其他被保险人{0} - {1}职业类别不能为空，请填选职业代码!";
                         var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                         return _msg.format((scope.$orgIndex + 1), name);
                     },
                     performCheck: function () {
                         return $scope.fullCheck;
                     }
                 }),
                new Rule({
                    message: function (value, target, scopeKey, scope, controller, me) {
                        var _msg = "其他被保险人{0} - {1}职业类别不能为空，请填选职业代码!";
                        var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                        return _msg.format((scope.$orgIndex + 1), name);
                    },
                    performCheck: function () {
                        return $scope.fullCheck;
                    },
                    isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                        if (me.isDirty(isDirty)) {
                            if (!value || value <= 0) {
                                return true;
                            }
                            return false;
                        }
                    }
                }),
        //<<20202502
                new Rule({
                    message: function (value, target, scopeKey, scope, controller, me) {
                        var _msg = "其他被保险人{0} - {1}职业类别超过4级，请检查。";
                        var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                        return _msg.format((scope.$orgIndex + 1), name);
                    },
                    performCheck: function () {
                        return $scope.fullCheck;
                    },
                    isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                        if (me.isDirty(isDirty)) {
                            if (value && value > 4) {
                                return true;
                            }
                            return false;
                        }
                    }
                })//>>20202502
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
                            //20190786  AWS 在线递交新增证件类型
                            //$scope.Person.OtherInsured[scope.$orgIndex].Nationality = value;
                            $scope.CheckOtherNationalityWanings(scope.$orgIndex);
                        }
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {

                    //                    var _msg = $filter('translate')('MESSAGE_OTHER_INSURED_INVALID_OTHERS_IDENTITY_DOCUMENT_TYPE');//20193965
                    var _msg = "其他被保险人{0} - {1}外籍人士请递交护照或外国人永久居留证!"; //20193965
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (otherInsured.IDType && (otherInsured.IDType == "6" || otherInsured.IDType == "7") && value != "CHN") {//非中国籍客户不能选择居民户口簿、出生医学证明
                            this.message = "其他被保险人" + (scope.$orgIndex + 1) + " - " + otherInsured.Name + "非中国籍客户不能选择居民户口簿、出生医学证明";
                            return true;
                        }

                        if (otherInsured.IDType && otherInsured.IDType != "2" && otherInsured.IDType != "D" && value != "CHN" && value != "TWN" && value != "HKG" && value != "MAC") {//20190786  AWS 在线递交新增证件类型
                            return true;
                        }


                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    //<<20193965 
                    //var _msg = $filter('translate')('MESSAGE_INVALID_OTHER_INSURED_IDENTITY_DOCUMENT_TYPE');
                    var _msg = "其他被保险人{0} - {1}证件类型与国籍不符!";
                    //>>20193965
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var insured = $scope.Person.OtherInsured[scope.$orgIndex];
                        //<<20193965
                        //20190786  AWS 在线递交新增证件类型
                        //if (insured.IDType && insured.Age >= 2 && insured.IDType == "4" && value != "" && value == "CHN") {
                        //    return true;
                        //}

                        //20190786  AWS 在线递交新增证件类型
                        if ((value == "HKG" && insured.IDType != "A" && insured.IDType != "Y") ||
                            (value == "MAC" && insured.IDType != "A" && insured.IDType != "Y") ||
                            (value == "TWN" && insured.IDType != "C" && insured.IDType != "Z") ||
                           (value != "CHN" && value != "HKG" && value != "MAC" && value != "TWN" && insured.IDType && insured.IDType != '2' && insured.IDType != "D")) {
                            return true;
                        }
                        //>>20193965
                        return false;
                    }
                }
            }),
            new Rule({//20193965
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "其他被保险人{0} - {1}是2岁以下中国籍未成年人，证件类型只可选居民身份证、居民户口簿、出生医学证明!";
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty, hasError)) {
                        var insured = $scope.Person.OtherInsured[scope.$orgIndex];
                        if (insured.IDType && insured.Age <= 2 && insured.IDType != "1" && insured.IDType != "6" && insured.IDType != "7" && value == "CHN") {//2岁以下中国籍未成年人，只可选居民身份证|居民户口簿|出生医学证明
                            return true;
                        }
                        return false;
                    }
                }
            })
        ]);


        $scope.otherInsuredGuardianRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "其他被保险人{0} - {1}监护人年龄小于18周岁，应为18周岁及以上!";
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (value && value.Age < 18) {
                            return true;
                        }
                        return false;
                    }
                }
            })
         ])
        //<<旁系



        $scope.otherInsuredGuardianNameRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "其他被保险人{0} - {1}请填选监护人姓名!";
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "其他被保险人 - {0} 监护人姓名不可超过{1}个字符({2}个汉字)!";
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
         ])



        $scope.otherInsuredGuardianIdNoRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "其他被保险人{0} - {1} 请填选监护人证件号码!";
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value)
                            return true;
                        return false;
                    }
                }
            })
         ])


        $scope.otherInsuredRelationToPupillusRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "其他被保险人{0} - {1} 请填选与被监护人关系!";
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value)
                            return true;
                        return false;
                    }
                }
            })
         ])



        $scope.otherInsuredGuardianMobileRules = new BusinessRules([
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "其他被保险人{0} - {1}请填选监护人手机号码!";
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                },
                isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                    if (me.isDirty(isDirty)) {
                        if (!value)
                            return true;
                        return false;
                    }
                }
            }),
            new Rule({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = "其他被保险人{0} - {1}监护人移动电话填写有误.";
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
            })
         ])


        //>>旁系

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
            })
        //<<King_GACP 
        //<<20202502
                    ,
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
                    }),
                    new Rule({
                        message: function (value, target, scopeKey, scope, controller, me) {
                            var _msg = "其他被保险人{0} - {1} 配偶、父母、成年子女、旁系亲属的联系电话不得与投保人相同.";
                            var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                            return _msg.format((scope.$orgIndex + 1), name);
                        },
                        performCheck: function () {
                            return $scope.fullCheck;
                        },
                        isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                            if (me.isDirty(isDirty)) {
                                var pMobile = $scope.Person.PolicyHolder.PolicyHolder.Mobile;
                                var otherInsured = $scope.Person.OtherInsured[scope.$orgIndex];
                                if (otherInsured.Relationship != "I" && otherInsured.Age >= 18 && value && value == pMobile) {
                                    return true;
                                }
                                return false;
                            }
                        }
                    })
        //>>20202502
        //<<King_GACP 旁系
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

        $scope.otherInsuredResidenceIndustryCode1Rules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_RESIDENCE_Industry_Code1');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
                }
            })
        ]);

        $scope.otherInsuredResidenceIndustryCode2Rules = new BusinessRules([
            new Required({
                message: function (value, target, scopeKey, scope, controller, me) {
                    var _msg = $filter('translate')('MESSAGE_EMPTY_OTHER_INSURED_RESIDENCE_Industry_Code2');
                    var name = $scope.Person.OtherInsured[scope.$orgIndex].Name;
                    return _msg.format((scope.$orgIndex + 1), name);
                },
                performCheck: function () {
                    return $scope.fullCheck;
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
                            //20190214 将该下拉框设为必填
                            //                            if (otherInsured.ResidenceAddressProvince == "110000" || otherInsured.ResidenceAddressProvince == "440000") {
                            //                                if (otherInsured.ResidenceAddressTerritory != "441900" && otherInsured.ResidenceAddressTerritory != "442000") {
                            //                                    return true;
                            //                                }
                            //                            }
                            return true;
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
            //<<旁系
            if ($scope.Person.OtherInsured.length + 1 >= 10) {
                ShowErrorDialog('参保人数不能超过10人。', null);
                return;
            }
            //>>旁系

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
                //加载旁系
                $scope.getRelativesExceptSopuse();
                var result = [];
                var resultIndustry = [];
                for (var i = 0; i <= $scope.Person.OtherInsured.length - 1; i++) {
                    var o = $scope.Person.OtherInsured[i];
                    var tmpOtherInsuredResidenceAddressTerritoryList = nglhAppService.loadTerritoryList(o.ResidenceAddressProvince);
                    var tmpOtherInsuredResidenceAddressCountyList = nglhAppService.loadCountyList(o.ResidenceAddressProvince, o.ResidenceAddressTerritory);

                    result.push({
                        "otherInsuredResidenceAddressTerritoryList": tmpOtherInsuredResidenceAddressTerritoryList,
                        "otherInsuredResidenceAddressCountyList": tmpOtherInsuredResidenceAddressCountyList
                    });

                    //准备 职能/职业代码初始数据
                    var tmpotherInsuredIndustryCode2List = $scope.occupationCodeList.filter(function (item) {
                        return item.IndustryCode1 == o.IndustryCode1
                    });

                    var tmpotherInsuredOccupationCodeList = $scope.occupationCodeList.filter(function (item) {
                        return (item.IndustryCode1 == o.IndustryCode1 && item.IndustryCode2 == o.IndustryCode2)
                    });

                    resultIndustry.push({
                        "otherInsuredIndustryCode2List": tmpotherInsuredIndustryCode2List,
                        "otherInsuredOccupationCodeList": tmpotherInsuredOccupationCodeList
                    });
                }

                $scope.otherInsuredAddressList = result;
                $scope.otherInsuredOccupationClassList = resultIndustry;
            }
        };

        $scope.CalculateOtherInsuredAge = function (index) {
            var age = 0;
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var date = now.getDate();
            if ($scope.Person.OtherInsured[index].DOB != null) {
                var dobStr = formatDate(($scope.Person.OtherInsured[index].DOB).substring(0, 10).replace(/-/g, ""));
                var dobYear = dobStr.substring(0, 4);
                var dobMonth = dobStr.substring(4, 6);
                var dobDate = dobStr.substring(6, 8);

                age = year - dobYear;
                if (dobMonth > month) {
                    age = age - 1;
                }
                else if (dobMonth == month) {
                    //                    if (dobDate >= date) {//20193965 王伟周邮件 核心年龄计算
                    if (dobDate > date) {//20193965 王伟周邮件 核心年龄计算
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
                        //                        if (dobDate >= date) {//20193965 王伟周邮件 核心年龄计算
                        if (dobDate > date) {//20193965 王伟周邮件 核心年龄计算
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
                //<<20194653
                if ($scope.showAgreement == false && age < 14) {
                    $scope.showAgreement = true
                }
                var result = $scope.isNotHasChildren()
                if (result) {
                    $scope.showAgreement = false
                    $scope.agreementIsAccept = ""
                }
                //>>20194653
            }
        }

        $scope.GetOtherInsuredOccupationClass = function (index) {
            if ($scope.occupationCodeList.length > 0) {
                var occCode = $scope.Person.OtherInsured[index].OccCD;
                $scope.Person.OtherInsured[index].OccClass = null;
                for (i = 0; i < $scope.occupationCodeList.length; i++) {
                    if ($scope.occupationCodeList[i].Value == occCode) {
                        $scope.Person.OtherInsured[index].OccClass = $scope.occupationCodeList[i].CalsType;
                        break;
                    }
                }
            }
        }
        //<<20202502
        $scope.onOtherInsuredIDChanged = function (otherInsured, index) {
            $scope.CalculateOtherInsuredAge(index);
            $scope.GetOtherInsuredClientListByID(index);

            //先清除提示信息
            $scope.clearWarningRelativeSuposemsg();

            //更新旁系亲属配偶所选配偶处的证件号
            var flag = false;
            var relativesNames = [];
            angular.forEach($scope.Person.OtherInsured, function (data, index, array) {
                if (data.RelativeSupose && data.RelativeSupose.$$hashKey == otherInsured.$$hashKey) {
                    flag = true;
                    if (data.Name) {
                        relativesNames.push("其他被保险人" + (index + 1) + "(" + data.Name + ")");
                    } else {
                        relativesNames.push("其他被保险人" + (index + 1));
                    }
                }
            });
            if (flag == true) {
                $scope.TimeoutWarning.add("Person.OtherInsured.ID_" + index, "您作为" + relativesNames.join(",") + "的旁系，其对应的旁系证件号码将同步更新！", 7000)//20203337
                //otherInsured.RelativeSuposeIDChgWarnMsg = "您作为" + relativesNames.join(",") + "的旁系，其对应的旁系证件号码将同步更新！"//20203337
            }
        }

        $scope.onOtherInsuredNameChanged = function (otherInsured, index) {
            //先清除提示信息
            $scope.clearWarningRelativeSuposemsg();
            //更新旁系亲属配偶所选配偶处的证件号
            var flag = false;
            var relativesNames = [];
            angular.forEach($scope.Person.OtherInsured, function (data, index, array) {
                if (data.RelativeSupose && data.RelativeSupose.$$hashKey == otherInsured.$$hashKey) {
                    flag = true;
                    if (data.Name) {
                        relativesNames.push("其他被保险人" + (index + 1) + "(" + data.Name + ")");
                    } else {
                        relativesNames.push("其他被保险人" + (index + 1));
                    }
                }
            });
            if (flag == true) {
                // otherInsured.RelativeSuposeNmChgWarnMsg = "您作为" + relativesNames.join(",") + "的旁系，其对应的旁系姓名将同步更新！"//20203337
                $scope.TimeoutWarning.add("Person.OtherInsured.Name_" + index, "您作为" + relativesNames.join(",") + "的旁系，其对应的旁系姓名将同步更新！", 7000)//20203337
            }

        }

        $scope.onOtherInsuredOccCdChanged = function (otherInsured, index) {
            $scope.GetOtherInsuredOccupationClass(index);
            $scope.doValidator("otherInsured.OccCD", otherInsured.$$hashKey);
        }


        $scope.onOtherInsuredDobChange = function (otherInsured, index) {
            $scope.CalculateOtherInsuredAge(index);
            $scope.GetOtherInsuredClientList(index)

            //清除提示信息
            $scope.clearWarningRelativeSuposemsg();

            //关系变更 非旁系亲属或年龄不小于18岁，清除监护人相关信息
            var otherInsured = $scope.Person.OtherInsured[index];
            if ((otherInsured.Relationship != "R" && otherInsured.Relationship != "U") || otherInsured.Age >= 18) {
                otherInsured.GuardianTypeMode = "select";
                otherInsured.GuardianKey = "";
                otherInsured.GuardianName = "";
                otherInsured.GuardianIdNo = "";
                otherInsured.RelationToPupillus = "";
                otherInsured.GuardianMobile = "";
            }

            //验证
            angular.forEach($scope.Person.OtherInsured, function (data, index, array) {
                if (data.RelativesIdNum) {
                    $scope.doValidator("otherInsured.RelativeSupose", data.$$hashKey);
                }
            });

        }
        //>>20202502

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
                "ResidenceAddressLine1": "",
                "GuardianTypeMode": "select"
            });
        };

        $scope.deleteOtherInsured = function (item) {
            //<<20202502
            var checkRes;

            //删除
            var checkRes = $scope.isGuardianRelatedCheck(item);
            if (checkRes) return;


            //删除投保人旁系亲属/投保人配偶旁系亲属，其配偶不能投保
            var checkRes = $scope.isRelativesSuposeRelatedCheck(item);
            if (checkRes) return;
            //>>20202502


            $scope.showLoading(true);
            //item.canDelete = true;  20202502
            ShowConfirmationDialog("删除该被保险人会同时删除相关账户信息,是否继续?", "是", "否", function () {
                //<<20202502
                //                var m = [];
                //                var list = $scope.Person.OtherInsured;

                //                for (var a in list) {
                //                    if (list[a].canDelete != true) {
                //                        m.push(list[a]);
                //                    }
                //                }
                //                angular.copy(m, $scope.Person.OtherInsured);

                var delIndex = 0;
                angular.forEach($scope.Person.OtherInsured, function (ovalue, key) {
                    if (angular.equals(item, ovalue)) {
                        delIndex = key;

                    }
                });
                $scope.Person.OtherInsured.splice(delIndex, 1);
                //>>20202502
                $scope.showLoading(false);
            }, function () {
                item.canDelete = false;
                $scope.showLoading(false);
            });
        };

        //<<20202502
        $scope.isGuardianRelatedCheck = function (deleteItem) {
            var flag = false;
            var relativesNames = [];
            angular.forEach($scope.Person.OtherInsured, function (value, key) {
                if (value.GuardianKey == deleteItem && (value.Relationship == "R" || value.Relationship == "U")) {
                    flag = true;
                    if (value.Name) {
                        relativesNames.push("其他被保险人" + (key + 1) + "(" + value.Name + ")");
                    } else {
                        relativesNames.push("其他被保险人" + (key + 1));
                    }
                }
            });
            if (flag == true) {
                ShowErrorDialog("<div >此客户为<span style='color:red'>" + relativesNames.join(",") + "</span> 的监护人，若需要删除请修改<span style='color:red'>" + relativesNames.join(",") + "</span> 的监护人信息后再进行删除操作", null);
            }
            return flag;
        }



        $scope.isRelativesSuposeRelatedCheck = function (deleteItem) {
            if (deleteItem.Relationship != "R" && deleteItem.Relationship != "U") {
                return false;
            }
            var flag = false;
            var relativesNames = [];
            var msg = "{0}{1}已被选择为{2}的配偶。如果要删除，请更换{2}的【旁系姓名证件号码】选择项";
            angular.forEach($scope.Person.OtherInsured, function (value, key) {
                if (value.Relationship == "V" && value.RelativesIdNum == deleteItem.ID) {
                    flag = true;

                    if (value.Name) {
                        relativesNames.push("其他被保险人" + (key + 1) + "(" + value.Name + ")");
                    } else {
                        relativesNames.push("其他被保险人" + (key + 1));
                    }
                }
            });


            if (flag == true) {
                ShowErrorDialog("<div >此被保险人已关联配偶<span style='color:red'>" + relativesNames.join(",") + "</span> 若需要删除请先删除<span style='color:red'>" + relativesNames.join(",") + "</span>后再进行删除操作</div>", null);
            }

            return flag;
        }
        //>>20202502
        $scope.getIdDocumentType = function (code) {
            return nglhAppService.loadIdDocumentType(code).value;
        };

        $scope.onOtherInsuredResidenceAddressProvinceChanged = function (provCd, idx) {
            var otherInsured = $scope.Person.OtherInsured[idx];

            $scope.otherInsuredAddressList[idx].otherInsuredResidenceAddressTerritoryList = nglhAppService.loadTerritoryList(provCd);
            $scope.otherInsuredAddressList[idx].otherInsuredResidenceAddressCountyList = null;
            otherInsured.ResidenceAddressTerritory = null;
            otherInsured.ResidenceAddressCounty = null;
        };

        $scope.onOtherInsuredResidenceIndustryCode1Changed = function (industryCode1, idx) {
            var otherInsured = $scope.Person.OtherInsured[idx];
            $scope.otherInsuredOccupationClassList[idx].otherInsuredIndustryCode2List = $scope.occupationCodeList.filter(function (item) {
                return item.IndustryCode1 == industryCode1
            }); ;
            $scope.otherInsuredOccupationClassList[idx].otherInsuredOccupationCodeList = null;
            otherInsured.IndustryCode2 = null;
            otherInsured.OccCD = null;
            otherInsured.OccClass = null;
        };

        $scope.onOtherInsuredResidenceAddressTerritoryChanged = function (provCd, terrCd, idx) {
            $scope.otherInsuredAddressList[idx].otherInsuredResidenceAddressCountyList = nglhAppService.loadCountyList(provCd, terrCd);
            $scope.Person.OtherInsured[idx].ResidenceAddressCounty = null;
        };

        $scope.onOtherInsuredResidenceIndustryCode2Changed = function (industryCode1, industryCode2, idx) {
            $scope.otherInsuredOccupationClassList[idx].otherInsuredOccupationCodeList = $scope.occupationCodeList.filter(function (item) {
                return (item.IndustryCode1 == industryCode1 && item.IndustryCode2 == industryCode2)
            });
            $scope.Person.OtherInsured[idx].OccCD = null;
            $scope.Person.OtherInsured[idx].OccClass = null;
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

        $scope.chkBirthdayNumber = function (cardNumber) {
            var BirthdayYear = cardNumber.substr(6, 4);
            var BirthdayMonth = cardNumber.substr(10, 2);
            var BirthdayDay = cardNumber.substr(12, 2);
            var now = new Date();
            if (BirthdayYear > now.getFullYear() || BirthdayMonth > 12 || BirthdayDay > 31) {
                return false;
            } else {
                return true;
            }
        };

        //        $scope.CalculateAge = function (newDOB) {
        //            var age = 0;
        //            var now = new Date();
        //            var year = now.getFullYear();
        //            var month = now.getMonth() + 1;
        //            var date = now.getDate();
        //            if (newDOB != null) {
        //                var dobStr = formatDate(newDOB.substring(0, 10).replace(/-/g, ""));
        //                var dobYear = dobStr.substring(0, 4);
        //                var dobMonth = dobStr.substring(4, 6);
        //                var dobDate = dobStr.substring(6, 8);

        //                age = year - dobYear;
        //                if (dobMonth > month) {
        //                    age = age - 1;
        //                }
        //                else if (dobMonth == month) {
        //                    if (dobDate >= date) {
        //                        age = age - 1;
        //                    }
        //                }
        //                else {
        //                    ;
        //                }
        //            }
        //            return age;
        //        };

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

            var date = parseDateWithISOFormat(value.replace("年", "").replace("月", "").replace("日", ""));
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

        //<<20202502 get relatives except sopuse of the relatives
        $scope.getRelativesExceptSopuse = function (index) {
            $scope.RelativesExceptSopuse = new Array();
            angular.forEach($scope.Person.OtherInsured, function (item, key) {
                if ((item.Relationship == 'R' || item.Relationship == 'U') && item.ID && item.Name && item.Age >= 20 && item.Age <= 60) {
                    $scope.RelativesExceptSopuse.push(item);
                }
            });

            //            $scope.RelativesExceptSopuse = $scope.RelativesExceptSopuse;
        };

        $scope.getRelativesGuardian = function (index) {
            $scope.RelativesGuardian = new Array();
            //主被保险人
            var insured = $scope.Person.Insured.Insured;
            //投保人
            var policyHolder = $scope.Person.PolicyHolder.PolicyHolder
            if (insured.ID == policyHolder.ID) {
                $scope.RelativesGuardian.push(policyHolder); //20203337
            } else {
                $scope.RelativesGuardian.push(insured, policyHolder);
            }
            angular.forEach($scope.Person.OtherInsured, function (value, key) {
                if (value.ID != insured.ID && value.ID != policyHolder.ID) {
                    $scope.RelativesGuardian.push(value);
                }
            });
            $scope.RelativesGuardian = $scope.RelativesGuardian.filter(function (item) {
                return (item.Age >= 18)
            });
        };


        $scope.onGuardinaManualModeSelected = function (index) {
            $scope.Person.OtherInsured[index].GuardianKey = "";
            $scope.clearWarningGuardianmsg();
        }

        $scope.clearOtherInsuredGuardian = function (otherInsured) {

            otherInsured.GuardianIdNo = "";
            otherInsured.GuardianName = "";
            otherInsured.GuardianMobile = "";
            otherInsured.GuardianKey = null;
        }
        $scope.setOtherInsuredRelativeSupose = function (otherInsured) {
            if (!otherInsured.RelativeSupose) {
                otherInsured.RelativesIdNum = "";
                otherInsured.RelativesName = "";
                return;
            }
            otherInsured.RelativesIdNum = otherInsured.RelativeSupose.ID;
            otherInsured.RelativesName = otherInsured.RelativeSupose.Name;

            $scope.clearWarningRelativeSuposemsg();
            $scope.doValidator("otherInsured.RelativeSupose", otherInsured.$$hashKey);
        }

        //<<20203337
        $scope.onOtherInsuredGuardianChanged = function (guardianKey, otherInsured, oldGuardianMobile, orgIndex) {
            if (!guardianKey) {
                return;
            }
            otherInsured.GuardianIdNo = guardianKey.ID;
            otherInsured.GuardianName = guardianKey.Name;
            otherInsured.GuardianMobile = guardianKey.Mobile;
            $scope.clearWarningGuardianmsg();

            //移动电话为空，更新为监护人手机号码
            if (!otherInsured.Mobile) {
                otherInsured.Mobile = guardianKey.Mobile;
            } //移动电话为空与变更前的监护人手机号码相同，同步更新移动电话
            else if (otherInsured.Mobile == oldGuardianMobile) {
                otherInsured.Mobile = guardianKey.Mobile;
                $scope.TimeoutWarning.add("Person.OtherInsured.GuardianKey_" + orgIndex, "其他被保险人" + (orgIndex + 1) + "(" + otherInsured.Name + ")的监护人变更，其对应的移动电话将同步更新！", 7000)
            };



        }
        //>>20203337

        $scope.clearWarningGuardianmsg = function () {

            //<<20203337
            //清除监护人warning 信息
            //            angular.forEach($scope.Person.OtherInsured, function (value, key) {
            //                value.GuardianIdmsg = "";
            //                value.GuardianNamemsg = "";
            //                value.GuardianMobilemsg = "";
            //            });
            //>>20203337

            //主被保险人
            var insured = $scope.Person.Insured.Insured;
            //投保人
            var policyHolder = $scope.Person.PolicyHolder.PolicyHolder
            //<<20203337
            //            insured.GuardianIdmsg = "";
            //            insured.GuardianNamemsg = "";
            //            insured.GuardianMobilemsg = "";
            //            policyHolder.GuardianIdmsg = "";
            //            policyHolder.GuardianNamemsg = "";
            //            policyHolder.GuardianMobilemsg = "";
            //>>20203337
        }



        $scope.clearWarningRelativeSuposemsg = function () {
            //清除旁系亲属配偶对应旁系warning 信息
            angular.forEach($scope.Person.OtherInsured, function (value, key) {
                //<<20203337
                //                value.RelativeSuposeIDChgWarnMsg = "";
                //                value.RelativeSuposeNmChgWarnMsg = "";
                //>>20203337
            });
        }

        $scope.$watch('RelativesExceptSopuse', function (newValue, oldValue) {
            if (newValue.length <= 0) {
                return;
            }
            angular.forEach(newValue, function (nv, key) {
                angular.forEach($scope.Person.OtherInsured, function (ov, key) {
                    if (nv.$$hashKey && //页面加载完毕
                    ov.RelativeSupose && ov.RelativeSupose.$$hashKey == nv.$$hashKey) {
                        ov.RelativesIdNum = nv.ID;
                        ov.RelativesCliNm = nv.Name;
                        //                        console.log(ov.RelativeSupose)
                    }
                });
            });

        }, true)

        $scope.$watch('RelativesGuardian', function (newValue, oldValue) {
            //监听$scope.RelativesGuardian
            $scope.getRelativesGuardian();
            if (oldValue.length > newValue.length) {
                //进行了删除或更改年龄等操作 
                //找出删除人集合
                var delItemList = [];
                angular.forEach(oldValue, function (ovalue, oldkey) {
                    var newItem = newValue.filter(function (item) {
                        return angular.equals(item, ovalue)
                    });
                    if (newItem.length == 0) {
                        delItemList.push(ovalue);
                    }
                });

                angular.forEach(delItemList, function (ovalue, oldkey) {
                    //找出被监护人
                    var guardian = $scope.Person.OtherInsured.filter(function (item) {
                        return (item.GuardianIdNo == ovalue.ID && item.GuardianTypeMode == 'select')
                    });
                    angular.forEach(guardian, function (value, key) {
                        value.GuardianIdNo = ""
                        value.GuardianName = ""
                        value.GuardianMobile = ""
                    });

                });

            } else {
                angular.forEach(oldValue, function (ovalue, oldkey) {
                    if (newValue.length == oldValue.length && (ovalue.ID != newValue[oldkey].ID || ovalue.Name != newValue[oldkey].Name || ovalue.Mobile != newValue[oldkey].Mobile)) {
                        //找出被监护人
                        var guardian = $scope.Person.OtherInsured.filter(function (item) {
                            return (item.GuardianIdNo && item.GuardianIdNo == ovalue.ID && item.GuardianTypeMode == 'select')//20203337
                        });
                        if (guardian.length == 0) {
                            $scope.clearWarningGuardianmsg();
                            return;
                        }

                        //其他被保险人作为监护人
                        var pguardian = $scope.Person.OtherInsured.filter(function (item) {
                            return item.ID == newValue[oldkey].ID
                        });
                        //主被保险人作为监护人
                        var insured = $scope.Person.Insured.Insured;
                        //投保人作为监护人
                        var policyHolder = $scope.Person.PolicyHolder.PolicyHolder;

                        var relativesNames = [];
                        angular.forEach($scope.Person.OtherInsured, function (item, key) {
                            if (item.GuardianIdNo == ovalue.ID && item.GuardianTypeMode == 'select') {
                                if (item.Name) {
                                    relativesNames.push("其他被保险人" + (key + 1) + "(" + item.Name + ")");
                                } else {
                                    relativesNames.push("其他被保险人" + (key + 1));
                                }
                            }
                        });
                        //更新监护人信息
                        angular.forEach(guardian, function (value, key) {
                            value.GuardianIdNo = newValue[oldkey].ID
                            value.GuardianName = newValue[oldkey].Name
                            value.GuardianMobile = newValue[oldkey].Mobile

                        });
                        //添加提示信息
                        if (ovalue.ID != newValue[oldkey].ID) {
                            if (pguardian.length > 0) {
                                //<<20203337
                                var index = $.inArray(newValue[oldkey], $scope.Person.OtherInsured);
                                $scope.TimeoutWarning.add("Person.OtherInsured.ID_" + index, "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人证件号码将同步更新！", 7000)
                                //                                pguardian[0].GuardianIdmsg = "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人证件号码将同步更新！";
                                //                                pguardian[0].GuardianNamemsg = "";
                                //                                pguardian[0].GuardianMobilemsg = "";
                                //>>20203337
                            }
                            if (insured.ID == newValue[oldkey].ID) {
                                //<<20203337
                                $scope.TimeoutWarning.add("Person.Insured.Insured.ID", "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人证件号码将同步更新！", 7000)

                                //                                insured.GuardianIdmsg = "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人证件号码将同步更新！";
                                //                                insured.GuardianNamemsg = "";
                                //                                insured.GuardianMobilemsg = "";
                                //>>20203337
                            }
                            if (policyHolder.ID == newValue[oldkey].ID) {
                                //<<20203337
                                $scope.TimeoutWarning.add("Person.PolicyHolder.PolicyHolder.ID", "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人证件号码将同步更新！", 7000)

                                //                                policyHolder.GuardianIdmsg = "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人证件号码将同步更新！";
                                //                                policyHolder.GuardianNamemsg = "";
                                //                                policyHolder.GuardianMobilemsg = "";
                                //>>20203337
                            }


                        }
                        if (ovalue.Name != newValue[oldkey].Name) {
                            if (pguardian.length > 0) {
                                //<<20203337
                                var index = $.inArray(newValue[oldkey], $scope.Person.OtherInsured);
                                $scope.TimeoutWarning.add("Person.OtherInsured.Name_" + index, "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人姓名将同步更新！", 7000)

                                //                                pguardian[0].GuardianNamemsg = "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人姓名将同步更新！";
                                //                                pguardian[0].GuardianIdmsg = "";
                                //                                pguardian[0].GuardianMobilemsg = "";
                                //>>20203337
                            }
                            if (insured.ID == newValue[oldkey].ID) {
                                //<<20203337
                                $scope.TimeoutWarning.add("Person.Insured.Insured.Name", "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人姓名将同步更新！", 7000)

                                //                                insured.GuardianNamemsg = "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人姓名将同步更新！";
                                //                                insured.GuardianIdmsg = "";
                                //                                insured.GuardianMobilemsg = "";
                                //>>20203337
                            }
                            if (policyHolder.ID == newValue[oldkey].ID) {//20203337
                                //<<20203337
                                $scope.TimeoutWarning.add("Person.PolicyHolder.PolicyHolder.Name", "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人姓名将同步更新！", 7000)

                                //                                policyHolder.GuardianNamemsg = "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人姓名将同步更新！";
                                //                                policyHolder.GuardianIdmsg = "";
                                //                                policyHolder.GuardianMobilemsg = "";
                                //>>20203337
                            }
                        }

                        if (ovalue.Mobile != newValue[oldkey].Mobile) {
                            if (pguardian.length > 0) {
                                //<<20203337
                                var index = $.inArray(newValue[oldkey], $scope.Person.OtherInsured);
                                $scope.TimeoutWarning.add("Person.OtherInsured.Mobile_" + index, "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人手机号码将同步更新！", 7000)
                                //                                pguardian[0].GuardianMobilemsg = "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人手机号码将同步更新！";
                                //                                pguardian[0].GuardianIdmsg = "";
                                //                                pguardian[0].GuardianNamemsg = "";
                                //>>20203337
                            }
                            if (insured.ID == newValue[oldkey].ID) {
                                //<<20203337
                                $scope.TimeoutWarning.add("Person.Insured.Insured.Mobile", "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人手机号码将同步更新！", 7000)
                                //                                insured.GuardianMobilemsg = "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人手机号码将同步更新！";
                                //                                insured.GuardianIdmsg = "";
                                //                                insured.GuardianNamemsg = "";
                                //>>20203337
                            }
                            if (policyHolder.ID == newValue[oldkey].ID) {
                                //<<20203337
                                $scope.TimeoutWarning.add("Person.PolicyHolder.PolicyHolder.Mobile", "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人手机号码将同步更新！", 7000)
                                //                                policyHolder.GuardianMobilemsg = "您作为" + relativesNames.join(',') + "的监护人，其对应的监护人手机号码将同步更新！";
                                //                                policyHolder.GuardianIdmsg = "";
                                //                                policyHolder.GuardianNamemsg = "";
                                //>>20203337
                            }
                        }


                    }

                });
            }
        }, true);

        //<<20203337
        $scope.onGuardianMobileChange = function (person, oldGuardianMobile, orgIndex) {
            if (!person.Mobile) {
                person.Mobile = person.GuardianMobile;
            } else if (person.Mobile == oldGuardianMobile) {
                person.Mobile = person.GuardianMobile;
                $scope.TimeoutWarning.add("Person.OtherInsured.GuardianMobile_" + orgIndex, "其他被保险人" + (orgIndex + 1) + "(" + person.Name + ")的监护人手机号码变更，其对应的移动电话将同步更新", 7000)
            }
        }
        //>>20203337


        $scope.onOtherInsuredRelationshipChange = function (otherInsured, oldVal, orgIndex) {
            //清除

            if (otherInsured.Relationship != "R" && otherInsured.Relationship != "U") {
                otherInsured.RelativesDesc = "";
                $scope.clearWarningGuardianmsg();
                $scope.clearWarningRelativeSuposemsg();
            }
            //关系变更 非旁系亲属或年龄不小于18岁，清除监护人相关信息
            if ((otherInsured.Relationship != "R" && otherInsured.Relationship != "U") || otherInsured.Age >= 18) {
                otherInsured.GuardianTypeMode = "select";
                otherInsured.GuardianKey = "";
                otherInsured.GuardianName = "";
                otherInsured.GuardianIdNo = "";
                otherInsured.RelationToPupillus = "";
                otherInsured.GuardianMobile = "";
            }

            if (otherInsured.Relationship != "V") {
                otherInsured.RelativesIdNum = "";
            }

            //<<20203337
            if (otherInsured.Relationship == "C" && otherInsured.Age < 18 && !otherInsured.Mobile) {
                otherInsured.Mobile = $scope.Person.PolicyHolder.PolicyHolder.Mobile;
            }
            //>>20203337
            //验证
            angular.forEach($scope.Person.OtherInsured, function (data, index, array) {
                $scope.doValidator("otherInsured.Relationship", data.$$hashKey);
                if (data.RelativesIdNum) {
                    $scope.doValidator("otherInsured.RelativeSupose", data.$$hashKey);
                }
            });

            $scope.doValidator("otherInsured.Sex", otherInsured.$$hashKey);

        }


        $scope.checkRelativesRelationship = function (oldVal) {
            var o_count = $scope.Person.OtherInsured.filter(function (x) { return x.Relationship == 'I' }).length;
            var s_count = $scope.Person.OtherInsured.filter(function (x) { return x.Relationship == 'S' }).length;
            var r_o_count = $scope.Person.OtherInsured.filter(function (x) { return x.Relationship == 'R' }).length;
            var r_s_count = $scope.Person.OtherInsured.filter(function (x) { return x.Relationship == 'U' }).length;
            var rs_count = $scope.Person.OtherInsured.filter(function (x) { return x.Relationship == 'V' }).length;

            if ($scope.Person.Insured.Insured.PHRelationship == "I") {
                o_count++;
            }
            if ($scope.Person.Insured.Insured.PHRelationship == "S") {
                s_count++;
            }

            var names = [];
            var msg = "{0}不参保，{1}为{2}，将无法参保"
            if (oldVal == "I" && o_count <= 0 && r_o_count > 0) {
                angular.forEach($scope.Person.OtherInsured, function (data, index, array) {
                    if (data.Relationship == "R" && data.Name)
                        names.push(data.Name);
                });
                ShowErrorDialog(msg.format("投保人本人", names.join(','), "投保人旁系亲属"), null);
                return;
            }

            if (oldVal == "S" && s_count <= 0 && r_s_count > 0) {
                angular.forEach($scope.Person.OtherInsured, function (data, index, array) {
                    if (data.Relationship == "U" && data.Name)
                        names.push(data.Name);
                });
                ShowErrorDialog(msg.format("投保人配偶", names.join(','), "投保人配偶旁系亲属"), null);
                return;
            }

            if ((oldVal == "R" || oldVal == "U") && r_o_count + r_s_count <= 0 && rs_count > 0) {
                angular.forEach($scope.Person.OtherInsured, function (data, index, array) {
                    if (data.Relationship == "V" && data.Name)
                        names.push(data.Name);
                });
                ShowErrorDialog(msg.format("投保人旁系亲属和投保人配偶旁系亲属", names.join(','), "旁系亲属的配偶"), null);
                return;
            }


        }


        //>>20202502
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
                nglhAppService.save($scope.Person, boolShowMsg).then(function () {
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
            //<<20193965 
            if (!isoFormatDateStr) {
                return "";
            }
            //>>20193965
            if (yearSeparator) {
                var thisDate = parseDateWithISOFormat(isoFormatDateStr.replace("年", "").replace("月", "").replace("日", ""));
                return $.datepicker.formatDate('yy' + yearSeparator + 'mm' + monthSeparator + 'dd' + daySeparator, thisDate);
            } else {
                return isoFormatDateToDisplayFormat_GACP(isoFormatDateStr);
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

        //<<King_GACP
        $scope.loadPolicyHolderPlaceOfCensusTerritory = function (province) {
            $scope.policyHolderPlaceOfCensusTerritoryList = nglhAppService.loadTerritoryRegList(province);
        }

        $scope.loadPolicyHolderResidenceAddressProvinceTerritory = function (province) {
            $scope.policyHolderResidenceAddressTerritoryList = nglhAppService.loadTerritoryRegList(province);
        }

        $scope.loadPolicyHolderOfficeOrSchoolAddressProvinceTerritory = function (province) {
            $scope.policyHolderOfficeOrSchoolAddressTerritoryList = nglhAppService.loadTerritoryRegList(province);
        }
        //>>King_GACP

        $scope.loadPlaceOfCensusTerritory = function (province) {
            $scope.insuredPlaceOfCensusTerritoryList = nglhAppService.loadTerritoryRegList(province);
        }

        $scope.loadResidenceAddressProvinceTerritory = function (province) {
            $scope.insuredResidenceAddressTerritoryList = nglhAppService.loadTerritoryRegList(province);
        }

        $scope.loadOfficeOrSchoolAddressProvinceTerritory = function (province) {
            $scope.insuredOfficeOrSchoolAddressTerritoryList = nglhAppService.loadTerritoryRegList(province);
        }

        $scope.enableIdentityDocumentIsPermanent = function (client) {
            if (client.DocumentType == "6" || client.DocumentType == "7") {
                client.IDIsPermanent = '';
                return false;
            }
            return true;
        }
        //King_GACP 为主被保险人单独增加一个条件 || client.IsCopyInsured=="Y"
        $scope.enableIdentityDocumentIsPermanentByInsured = function (client) {
            if (client.DocumentType == "6" || client.DocumentType == "7" || client.IsCopyInsured == "Y") {
                //client.IDIsPermanent = '';
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

                    //|| isNumber 不包含数字 删除 20186222 zheng
                    if (!(isChineseCharacter || isEnglishCharacter)) {
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

        //选择职业代码 20202430
        $scope.getOccCDByCode = function (person, index, type) {
            $scope.PersonOccCD = person;
            $scope.PersonOccCD.orgIndex = index;
            $scope.PersonOccCD.orgType = type;
            //更新$scope数据/界面的代码
            $scope.tmpCommonUsedOccuList = $scope.occupationCodeList.filter(function (item) {
                return (item.SortSeq != null)
            });
            $scope.tmpotherInsuredOccupationCodeList = [];
            var occDialog = $("#system-form-dlg").load("OccupationList", function () {
                compile($("#system-form-dlg"))($scope);
                $scope.$apply();
                var dialogOptions = {
                    title: "职业列表",
                    autoOpen: false,
                    resizable: false,
                    position: "center",
                    height: 530,
                    modal: true,
                    draggable: true,
                    width: 750,
                    zIndex: 500,
                    open: function (event, ui) {
                        $('body').css('overflow-y', 'hidden');
                    },
                    close: function (event, ui) {
                        $('body').css('overflow-y', 'auto');
                        $("#system-form-dlg").html("");
                    }
                };

                occDialog.dialog(dialogOptions);
                occDialog.dialog('open');

            });
        }

        $scope.setOccCDValue = function (data) {
            $scope.PersonOccCD.IndustryCode1 = data.IndustryCode1;
            //准备 职能/职业代码数据
            if ($scope.PersonOccCD.orgType == 1) {
                //投保人
                $scope.InitialPolicyIndustryCode2List(data.IndustryCode1);
                $scope.IntitalPolicyIndustryCodeList(data.IndustryCode1, data.IndustryCode2);
            }
            if ($scope.PersonOccCD.orgType == 2) {
                //主被保险人
                $scope.InitialResidenceIndustryCode2List(data.IndustryCode1);
                $scope.IntitalResidenceIndustryCodeList(data.IndustryCode1, data.IndustryCode2);

            }
            if ($scope.PersonOccCD.orgType == 3) {
                //其他被保险人
                var tmpotherInsuredIndustryCode2List = $scope.occupationCodeList.filter(function (item) {
                    return item.IndustryCode1 == data.IndustryCode1
                });
                var tmpotherInsuredOccupationCodeList = $scope.occupationCodeList.filter(function (item) {
                    return (item.IndustryCode1 == data.IndustryCode1 && item.IndustryCode2 == data.IndustryCode2)
                });
                $scope.otherInsuredOccupationClassList[$scope.PersonOccCD.orgIndex] = {
                    "otherInsuredIndustryCode2List": tmpotherInsuredIndustryCode2List,
                    "otherInsuredOccupationCodeList": tmpotherInsuredOccupationCodeList
                };
            }
            $scope.PersonOccCD.IndustryCode2 = data.IndustryCode2;
            $scope.PersonOccCD.OccCD = data.Value;
            $scope.PersonOccCD.OccClass = data.CalsType;
        }

    }
]).filter('unique', function () {
    //自定义去重过滤器
    return function (collection, keyname) {
        var output = [],
             keys = [];
        angular.forEach(collection, function (item) {
            var key = item[keyname];
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });
        return output;
    }
});             