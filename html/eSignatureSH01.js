var app = new Vue({
    el: '#app',
    data: {

        showInfoState: false,
        infoMsg: '',
        msgDoc: '',
        msgTyp: '',

        isPreApp: null,//某产品和版本是否参与预投保 houjin
        docData: [],//文档数组 houjin
        productData: [],

        doubleShow: false,//是否显示 免责条款说明书 复选框 houjin

        closeBtnState: true,//显示PDF的div中关闭按钮 延时高亮标识 houjin
        doubleDocumentInfo: false, //双录入文档弹框状态
        infoTransfer: false,
        reminderTransfer: false,
        clauseTransfer: false,
        instructionsTransfer: false,
        responseTransfer: false,
        showPdf: false,//显示PDF div界面 houjin
        showAudio: false,//显示语音播放
        playIndex: 0,



        isN: false, // 财务问卷取消状态
        reflesh: true, //初次加载页面
        alertState: false, //alert直接昂太 by gary-通用alert弹框显示状态
        alertMsg: '', // alert信息    by gary-通用alert描述内容

        addAccState: true, //添加账号按钮状态。
        cameraIndex: 0, //orc索引
        addState: false, //是否已经选择同一账户人
        lastChoose: '', //最后一次选择的账户人
        addAccNum: 0, //已经添加的账户人数量
        cliSelect: [], //账户修改选择的人
        whichClient: null,//查询结果1个，未引用 houjin
        eappBankClientList: [], // 账户人列表
        test1: true,
        financialInfoListLen: 0,  //财务问卷的人数
        cancleState: false,
        visible: false,
        ConfirmModDiv: false, // by gary-ocr确认框显示状态
        orcModel: false, // by gary-ocr弹框状态

        tbrQm: true,//签名相关 houjin
        timerAgainState: false,//签名是否超时标识(面签必须在指定的时间范围内完成操作，超时之后不可继续签名) houjin
        cwTipModal: false, //by gary-财务问卷不勾选提示弹框状态
        docName: '',//勾选的文档名称 houjin
        canPhoto: true, //non use
        timeInfo: {
            IsTimeOut: 'N'
        },//超时返回的数据 houjin
        timeTipModal: false,//超时弹框状态 houjin
        timeMsg: '',//超时弹框提示语 houjin
        typeName: 'yjcl',//签名类型 houjin

        insure_tips: true,//投保提示书显示状态
        insure_state: false,  //投保提示书选择框显示状态
        zzsIdiea: true,//授权书红字状态 houjin
        accCliNum: [],//账户CliNum数据 houjin
        curIndex: 0,//人脸识别及持证拍照索引 houjin
        qmFinish: [],//完成签名的数据标识 houjin
        yjclFinish: false,
        docType: '',//勾选的文档名称 houjin

        cardTypeCn: '',//账户修改 证件类型名称 houjin
        cardList: [], //证件列表 houjin
        bankTypeCn: '',
        chooseBackCode: '001',//账户修改 选择的银行code houjin
        model1: '001',
        personIndex: 0,//账户持有人索引 houjin
        isPc: true, // non use
        flowState: null,//电子签名状态 E1到E5 houjin
        currentData: {
        },//签名或人脸识识选中的cli对象 houjin


        ocrType: 'B',       //by gary-ocr类型
        showSubmit: true,
        showFront: true,  //by gary-orc弹框相机的显示状态(正面)
        showBack: true,  //by gary-orc弹框相机的显示状态(反面)
        imgFront: '',   //by gary-ocr正面拍摄图
        imgBack: '',    //by gary-ocr反面拍摄图
        showBackCamera: true,

        formItem: {   //orc  by gary-ocr显示数据
            name: '',
            gender: '',
            birthDate: '',
            idTyp: '',
            idNum: '',
            expiryDate: '',
            nationality: '',
            account: '',
            category: '',
            cardName: '',
            bankName: '',
            bankNo: ''
        },

        faceDataMap: { //人脸识别及持证拍照数据
            imgShow: false,
            coverState1: false,
            coverState2: false,
            viewList: [],
            forward: [],
            reverse: [],
            fwState: true,
            reState: true,
            isIdCard: false
        },
        dataLen: 0,   //by gary-cli的个数
        signPhoto: [],  //电子签名 人脸识别完成进度
        signPhoto2: [], //by gary-持证拍照进度完成进度
        str: 'data:image/gif;base64,',
        commentFileId: null,  //语句抄录状态
        commentStateModal: false, //语句抄录弹窗
        qm: ['R0lGODlhhwBIAJECAL6+vtHR0f///wAAACH5BAEAAAIALAAAAACHAEgAAAL/jI+py+0Po5y02ouz3rz7Dx7CSJbmiabqyrbuC6NLTNf2jddKzvf+r9oBh8TiS2hMKo3IpfOJa0KnVJa0is0Krtruk+sNMxPi8hJsTufQ6jaN7Y634PK6jGzPu+j6PL9f9wcYJzjYVmiYhphYtngCAMkDUDOJEklzCeRokolTCdNZEuoyyrPJaRnz+dL5uSrwahnbcyr6WJoyuwLJywvb28sCPKw7hyc5THmbOxLryqqCu3ecU3xLTBz9TLIqza3rbYzgYw1t3jw5Wo4bLi7S81qeSor6+yhszylvRQ2KDYyJnixYqr6J2sdvnLJdC+dp40YqnkFa/c4xu/YvY7FQ7O1yIZymMCBDkST1fUQ3xNG6kfVsacv4KxizjjFU4nvYcqI+f8I00jSh0ucuZ/d2FnXZwle0GzaH4kQKkSXBgz3zXdRR8Ym6o0tRepXlytrJEovAQTV6dqrTZlFZiWWaVWorqstysk0aday3sSQQSdSplm7afUTTonX4Jq7HnK1mZcsG1ifAlzBtCNra9QZfzZvdGWCUqBZoLKJHUyltGgrq1E5Ws1bi+vWYkLIJKa4tJjZuTbd3d9HtmyLt4I16E68C/Djc4cp/G2/+5Tn0M9KnJ0lu/Uj17ERmcEceIrz48eTLmz+PPr368gUAADs='],
        signState: [],  //电子签名 完成进度

        affState: false,  //计划书状态
        agreeState: true, //by gary-文档确认勾选状态
        sentenceState: false,
        documentState: false,  //文档确认状态
        commentState: true,   //语句抄录状态
        CommentState: false,   //语句抄录状态 新
        SignFileState: true,  //电子签名状态
        BIOFicialState: true, //人脸识别状态
        jzrState: true,  //见证人状态
        jzrPanelState: true,

        allState: true, //by gary-文档全选状态
        defmod: false, //by gary-修改账号弹框显示状态
        eAppNumber: '',
        cliInfo: [],   //by gary-客户数据
        isInsuredChild: false, //被保险人为未成年人
        insuredChildName: '', //未成年人被保险人姓名
        signCliInfo: [{
            AboveSignDesc: "史三香",
            BioFacialFileId: [],
            BioFacialStatus: false,
            BioFacialType: null,
            BottomSignDesc: null,
            CommentFileId: null,
            CommentStatus: false,
            SignFileId: null,
            age: 22,
            bioFacialTyp: null,
            cliNm: "史三香",
            cliNum: "7f732834-fbab-4232-9819-792d9876b2cd",
            idNum: "310101199810040166",
            idTyp: "1",
            keyWord: "792d9876b2cd的电子签名",
            linkTyp: "O",
            newCliNum: "7f732834-fbab-4232-9819-792d9876b2cd"
        }],  //电子签名data
        confirmedSignStatementClientTypeList: [],//已确认签名声明的客户类型列表
        jzrInfo: [], //见证人
        eSignStatus: 'E1',  //by gary-电子签名流程状态
        isAgentPolicy: 'N',//代理人自买单 houjin
        isLoading: false,   //by gary-是否正在加载
        showDocFin: true,  //false默认 财务问卷/财务问卷未填写 显示状态
        newProductType: false,//by gary-新型产品风险提示38字抄录显示状态
        isAccident: false, //by gary-计划书显示状态
        panelValue: [1, 2, 3, 4, 5],  //by gary-电子签名 内容显示项  
        documentList: [], //by gary-文档确认勾选列表
        documentAllList: [], //non use
        modalDocumentInfo: false, //by gary-文档确认弹层的显示状态
        document: [], //by gary-文档内容查询列表
        documentIndex: 0, //by gary-选择的文档索引
        modalDocTitle: '', //by gary-档确认弹层的标题
        showPreNotice: false,
        showConfirmNotice: false,
        finishESign: true,
        commentTyp: '',
    },
    created:function(){
        var that = this;
        this.geteAppInfo(this,function(){
            console.log();
            that.getCliInfo(that,function(){
               
                if(that.eSignStatus == 'E2'){
                    var isCli = that.signCliInfo.every(function(item, index){
                        return item.SignFileId;
                    });

                    if(isCli){
                        that.confirmESignature();
                    }
                }else if(that.eSignStatus == 'E3'){   
                     
                    var isPhoto = that.signCliInfo.every(function(item, index){
                        return item.bioFacialTyp; //fix bug
                    });
                    
                }else if(that.eSignStatus == 'E4'){    
                    var isCli2 = that.jzrInfo.every(function(item, index){
                        return item.SignFileId;
                    });
                }
            });
        });
        if(this.eSignStatus != 'E1' ){
            this.sxIdiea = false;  
            this.zzsIdiea = false;  
            //this.inputFinancial = true;
            this.inputBankTransfer = true;
        } 

    },
    mounted() {
        var that = this;
        if(this.eSignStatus != 'E1' && this.eSignStatus != 'E5' ){
            this.getTimerInfo(this.eAppNumber,function(data){
                that.timeInfo = data;
                if(data.IsTimeOut == 'Y'){
                    that.timerAgainState = true;
                }
               
            });
        }
        if(this.eSignStatus == 'E5' && this.reflesh){
            this.$nextTick(function(){
                var t = $('#completeBtn').offset().top;
                var h = $('#completeBtn').height();
                var autoGo = setTimeout(function(){
                    $(window).scrollTop(t + 300);
                    clearTimeout(autoGo);
                },500)
            });            
        }
        this.$nextTick(function(){
             $('.ivu-collapse-header').on('click',function(){
                 app.panelValue = [1,2,3,4,5]
                return false;
            });
         
        });        
        
    },
    methods: {
        //重新开始按钮使用方法
        timerAgain() {
            this.timerAgainState = false;
            this.clearSignInfo(this.eAppNumber);
            this.saveTimerInfo(this.eAppNumber);
            this.geteAppInfo(this);
            this.getCliInfo(this);
        },
        // 清除状态台信息 
        clearSignInfo(eAppNumber) {
            $.ajax({
                async: false,
                type: "POST",
                url: "REST/clearSignInfo",
                datatype: "json",
                data: {
                    "eAppNumber": eAppNumber
                }
            }).success(function (response) {

            }).error(function (jqXHR, textStatus, errorThrown) {

            });

        },
        //注册一条新的计时数据 
        saveTimerInfo(eAppNumber) {
            var that = this;
            $.ajax({
                async: false,
                type: "POST",
                url: "REST/SaveTimerInfo",
                datatype: "json",
                data: {
                    "eAppNumber": eAppNumber
                }
            }).success(function (response) {
                that.timerAgainState = false;
            }).error(function (jqXHR, textStatus, errorThrown) {

            });

        },
        geteAppInfo(app, callback) {

            //SessionAppNumBugFix_houjin 从隐藏控件取值
            var hideApplicationNumber = document.getElementById("hideApplicationNumber");
            app.eAppNumber = hideApplicationNumber.value;

            $.ajax({
                async: false,
                type: "GET",
                url: "REST/GeteAppInfo",
                datatype: "json"
                ,
                data:
                {
                    "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                var data = response["JSON_RESULT_DATA"];

                //<<20200880_Gray
                //app.showFnaNB = (data.terrCode == "NB");
                app.showFnaNB = (data.terrCode == "NB" && data.fnaId);
                //>>20200880_Gray
                app.showFnaCQ = (data.terrCode == "CQ");
                app.eAppNumber = data.eAppNumber;
                app.showDocFin = (data.hasFinList == "Y");
                app.newProductType = (data.isNewProductType == "Y");
                app.isAccident = (data.isAccident == "Y");
                app.eSignStatus = data.appStatus;
                app.isAgentPolicy = data.isAgentPolicy;
                app.documentAllList.push("notice");
                app.documentAllList.push("reminder");
                app.documentAllList.push("application");

                if (app.isAccident) {
                    app.documentAllList.push("proposal");
                }

                app.documentAllList.push("bank");

                if (app.showDocFin) {
                    app.documentAllList.push("financial");
                }

                if (app.showFnaNB) {
                    app.documentAllList.push("fnanb");
                }

                if (app.showFnaNB) {
                    app.documentAllList.push("fnacq");
                }

                app.isPreApp = data.isPreApp;

                app.eAppNumber = data.eAppNumber;
                app.documentAllList.push("declaration");

                if (data.isNewDoubleRecord == 'Y') {
                    app.doubleShow = true;
                }

                // app.getGlobalState(app.eSignStatus, app.isAgentPolicy); //获取全局状态    

                if (callback instanceof Function) {
                    callback();
                }

            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        getCliInfo(app, callback) {
            var that = this;

            $.ajax({
                async: false,
                type: "GET",
                url: "REST/GetNewESignCliInfo",
                datatype: "json",
                data:
                {
                    "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.qmFinish = [];

                var data = response["JSON_RESULT_DATA"];

                var tbrIndex = 0;
                var jzrIndex = 0;
                app.cliInfo = data.cliInfo;

                var qmArr = [];
                var jzArr = [];

                data.cliInfo.forEach(function (item, index) {
                    if (item.age < 18 && item.linkTyp == 'I') {
                        app.isInsuredChild = true;
                        app.insuredChildName = item.cliNm;
                    }
                })

                data.signCliInfo.forEach(function (item, index) {
                    if (item.linkTyp != 'W') {
                        qmArr.push(item);
                    } else {
                        jzArr.push(item);
                    }

                });

                var oIndex = 0;
                qmArr.forEach(function (item, index) {
                    if (item.linkTyp == 'O') {
                        oIndex = index;
                    }
                });

                var child = [];
                var oArr = qmArr.splice(oIndex, 1);
                qmArr = oArr.concat(qmArr);

                jzArr.forEach(function (item) {
                    if (item.SignFileId) {
                        app.getFileByFileId(item.SignFileId, app.eAppNumber, function (data) {
                            item.SignFileImage = data;
                        });

                    }

                })

                app.jzrInfo = jzArr;
                app.signCliInfo = qmArr;

                app.signPhoto = [];

                app.signPhoto2 = [];

                app.cliInfo.forEach(function (item, index) {

                    if (item.linkTyp == 'O') {
                        app.CommentFileId = item.CommentFileId;
                        app.accCliNum.push(item.cliNum);
                    }

                    if (item.linkTyp == 'I') {
                        app.accCliNum.push(item.cliNum);
                    }
                });


                app.signCliInfo.forEach(function (item, index) {

                    if (item.SignFileId) {
                        app.getFileByFileId(item.SignFileId, app.eAppNumber, function (data) {
                            item.SignFileImage = data;
                        });

                        app.qmFinish.push(item.SignFileId);
                        app.confirmedSignStatementClientTypeList.push(item.linkTyp);//初始化时有签名的自动设置成已确认签名
                    }


                    if (item.linkTyp == 'O') {
                        if (item.CommentFileId && !item.SignFileId) {
                            alert('您进行了错误操作');
                        } else {
                            that.commentFileId = item.CommentFileId;
                            that.CommentState = item.CommentStatus;
                        }


                    }


                    if (item.age < 18) {
                        child.push(item)
                    }


                    if (item.bioFacialTyp == 'FR' || item.bioFacialTyp == 'PT') {
                        app.signPhoto.push(item.cliNum);
                        app.signPhoto2.push(item.cliNum);
                    }

                });

                app.dataLen = app.signCliInfo.length;
                app.dataLen2 = app.signCliInfo.length - child.length;


                if (callback instanceof Function) {
                    callback();
                }

            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        confirmDocument() {
            //app.isLoading = true;
            app.agreeState = true;
            console.log('点击下一步')
            if (app.showDocFin) {
                $.ajax({
                    async: true,
                    type: "POST",
                    url: "REST/ConfirmDocument",
                    datatype: "json",
                }).success(function (response) {
                    app.isLoading = false;
                    app.documentState = true;
                    console.log("confirm document");
                    app.confirmEDoc(); //文档确认完成 E2 

                    app.saveTimerInfo(app.eAppNumber);


                }).error(function (jqXHR, textStatus, errorThrown) {
                    app.isLoading = false;
                    console.log("textStatus:" + textStatus);
                    console.log("errorThrown:" + errorThrown);
                });
            }
        },
        //递交投保
        complete() {
            app.isLoading = true;
            app.finishESign = true;

            //20200801_DoubleRecord_houjin isAgentDataReady所调用的存储过程中的逻辑有增加
            //判断是否是需要双录的单据，如果是，则判断双录状态是否是99，是则允许提交，不是则不允许提交。不是双录单据则逻辑原封不动。
            app.isAgentDataReady(app.eAppNumber, function (data) {
                app.finishDzqm();
            });

        },
        // 重新开始电子签名流程
        flowRestart() {
            this.clearSignInfo(this.eAppNumber);

            this.saveTimerInfo(this.eAppNumber);

            this.geteAppInfo(this);
            this.getCliInfo(this);

            this.timeTipModal = false;
        },
        // 放弃电子签名    
        flowCancel() {
            this.clearSignInfo(this.eAppNumber);
            //this.saveTimerInfo(this.eAppNumber);
            window.location = './SubmittedList';
            //this.timeTipModal = false;
        },
        showInfo() {
            app.showInfoState = false;

            if (app.msgTyp == "1") {
                app.infoMsg = app.msgDoc;
                app.msgTyp = "2";
                app.showInfoState = true;
            } else if (app.msgTyp == "2") {
                window.location = './ApplicationList';
            }
        },
        //投保提示确认书
        reminderInfo(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            // app.isLoading = true;
            app.documentIndex = 0;
            app.insure_state = true
            app.insure_tips = false
            app.showPreNotice = false;
            app.agreeState = false;
            app.showConfirmNotice = false;
            app.modalDocumentInfo = true;
            app.modalDocTitle = "投保提示书";
            // $.ajax({
            //     async: true,
            //     type: "GET",
            //     url: "REST/GetESignDocumentPageCount",
            //     datatype: "json",
            //     data: {
            //         "docTyp": "02",
            //         "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
            //     }
            // }).success(function (response) {
            //     app.isLoading = false;
            //     var result = response["JSON_RESULT_DATA"];
            //     that.docName = 'reminder';
            //     app.document = [];
            //     app.insure_state = true

            //     for (var i = 0; i < result; i++) {
            //         app.document.push('REST/GetESignDocument' + "?PageNumber=" + i + '&DocTyp=' + '02');
            //     }

            //     app.documentIndex = 0;
            //     app.showPreNotice = false;
            //     app.agreeState = true;
            //     app.showConfirmNotice = false;
            //     app.modalDocumentInfo = true;
            //     app.modalDocTitle = "投保提示书";

            //     if (app.doubleShow) {
            //         app.setBtnState();
            //     }

            // }).error(function (jqXHR, textStatus, errorThrown) {
            //     app.isLoading = false;
            //     app.insure_state = true
            //     app.insure_tips = false
            //     app.agreeState = false
            //     console.log("textStatus:" + textStatus);
            //     console.log("errorThrown:" + errorThrown);
            // });
        },
        //TODO : 合并上面那个函数
        getSignLinkTypDesc: function (linkTyp) {
            if (linkTyp == "O") {
                return "投保人";
            } else if (linkTyp == "I") {
                return "被保险人";
            } else if (linkTyp == "T") {
                return "其他被保险人";
            } else if (linkTyp == "G") {
                return "监护人";
            } else if (linkTyp == "A") {
                return "账户授权人";
            } else if (linkTyp == "W") {
                return "见证人";
            } else {
                return "";
            }
        },
        // 判断是否阻止触发电子签名 (显示PopState div 盖住下方签名Div)
        blockShowSign: function (eSignStatus, cli, confirmedSignStatementClientTypeList) {
            var blocked = eSignStatus != 'E2' || cli.SignFileId;
            var notConfirmed = confirmedSignStatementClientTypeList.indexOf(cli.linkTyp) == -1;
            var isAdult = cli.linkTyp != 'G';//Not Guarded.
            return blocked || (notConfirmed && isAdult)//状态不为E2 或者已经签名 或者 没有确认签名声明(成人) 就阻止触发签名.
        },
        setImgId: function (imgId, index) {
            return imgId + index;
        },
        //文档点击关闭
        closePop: function (docName) {

            this.modalDocumentInfo = false;

            this.doubleDocumentInfo = false;

            if (this.docName == 'reminder') {
                this.reminderTransfer = true;
                this.insure_tips = true;
            }

            this.closeDouble();

            this.autoChoose(this.docName);

        },
        closeDouble: function () {
            if (this.productData.length >= 1) {
                this.$nextTick(function () {
                    this.productData.forEach(function (item, index) {
                        document.getElementById('audio' + index).load();
                        item.playFlag = false;
                    })
                });

            }
        },
        // 文档确认后自当勾选
        autoChoose: function (docName) {
            if (app.documentList.length >= 1) {
                if (app.documentList.indexOf(docName) == -1) {
                    var dcClickTimer2 = setTimeout(function () {
                        $('#' + docName).trigger('click');
                        clearInterval(dcClickTimer2);
                    }, 100);
                }
            } else {
                var dcClickTimer2 = setTimeout(function () {
                    $('#' + docName).trigger('click');
                    clearInterval(dcClickTimer2);
                }, 100);
            }


            if (docName == 'exemption' || docName == 'response') {
                if (this.productData.length >= 1) {
                    this.$nextTick(function () {
                        this.productData.forEach(function (item, index) {
                            document.getElementById('audio' + index).load();
                            item.playFlag = false;
                        })
                    });

                }
            }

        },
        // 电子签名事件入口
        showSign(cli, cliNum, type, typeName) {
            console.log('jijijiji')
            this.currentData = cli;
            cli.qmBefore = false;
            if (app.newProductType) {
                if (!app.commentFileId) {
                    return false;
                }

            }
            if (type != 'O') {
                if (!this.signCliInfo[0].SignFileId) {
                    alert('请先进行投保人签名');

                } else {
                    this.typeName = typeName;
                    app.getTimerInfo(app.eAppNumber, function (data) {
                        app.checkTime(data, typeName, type, cliNum);
                    });
                }
            } else {
                this.typeName = typeName;
                app.getTimerInfo(app.eAppNumber, function (data) {
                    app.checkTime(data, typeName, type, cliNum);
                });
            }
        },
        //开始电子签名 E1
        startESignProcess: function () {
            this.updAppStatus("startEsign", "E1");
        },
        //文档确认完成 E2
        confirmEDoc: function () {
            this.updAppStatus("confirmEDoc", "E2");
        },
        //电子签名完成 E3
        confirmESignature: function () {
            this.updAppStatus("confirmESignature", "E3");
        },
        //更新电子签名状态
        updAppStatus: function (funcName, status) {
            this.flowState = status;
            this.isLoading = true;

            //SessionAppNumBugFix_houjin
            var eAppNumberTmp = "";
            //先从这儿取值
            if (app && app.eAppNumber) {
                eAppNumberTmp = app.eAppNumber;
            }
            //再从这儿取值，主要从这儿取值
            if (this && this.eAppNumber) {
                eAppNumberTmp = this.eAppNumber;
            }

            $.ajax({
                async: true,
                type: "POST",
                url: "REST/UpdateESignStatus",
                datatype: "json",
                data: {
                    "status": status,
                    "eAppNumber": eAppNumberTmp  //this.eAppNumber //SessionAppNumBugFix_houjin 将app.eAppNumber修改为this 解决修改状态为E4时白屏的问题
                }
            }).success(function () {
                app.isLoading = false;
                app.eSignStatus = status;
                //app.eSignStatus = '';
                console.log('当前状态是' + status + 'OK');
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
                alert(funcName + "  failed!");
            });
        },
        // 获取倒计时信息
        getTimerInfo: function (eAppNumber, callback) {
            var that = this;
            $.ajax({
                async: false,
                type: "POST",
                url: "REST/GetTimerInfo",
                datatype: "json",
                data: {
                    "eAppNumber": eAppNumber
                }
            }).success(function (response) {
                var result = response["JSON_RESULT_DATA"];
                that.timeInfo = result;
                if (callback instanceof Function) {
                    callback(that.timeInfo);
                }


            }).error(function (jqXHR, textStatus, errorThrown) {

            });

        },
        //  检查剩余时间
        checkTime: function (timeInfo, typeName, type, cliNm) {
            if (timeInfo.IsTimeOut == 'Y') {
                this.timeTipModal = true;
                this.timeMsg = '对不起，您的操作已超时，请重新开始！';

                return false;
            } else {
                switch (typeName) {
                    case 'yjcl':  //语句抄录
                        if (timeInfo.RemainTime <= 15 && timeInfo.RemainTime >= 10) {
                            // 15分钟的情况 
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于15分钟，请注意！';
                        } else if (timeInfo.RemainTime <= 10 && timeInfo.RemainTime >= 5) {
                            // 10分钟的情况        
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于10分钟，请注意！';

                        } else if (timeInfo.RemainTime <= 5 && timeInfo.RemainTime > 0) {
                            // 5分钟的情况     
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于5分钟，请注意！';
                        } else {
                            this.flowGo(typeName, type);
                        }

                        break;
                    case 'dzqm':
                        if (timeInfo.RemainTime <= 10 && timeInfo.RemainTime >= 5) {
                            // 10分钟的情况        
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于10分钟，请注意！';
                        } else if (timeInfo.RemainTime <= 5 && timeInfo.RemainTime > 0) {
                            // 5分钟的情况     
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于5分钟，请注意！';
                        } else {
                            this.flowGo(typeName, type, cliNm);
                        }

                        break;
                    case 'jzr':
                        this.flowGo(typeName, type, cliNm);

                        break;
                    case 'rlsb':
                        if (timeInfo.RemainTime <= 5 && timeInfo.RemainTime > 0) {
                            // 5分钟的情况     
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于5分钟，请注意！';
                        } else {
                            this.flowGo(typeName, type);
                        }

                        break;
                    default:
                        alert('网络异常，请刷新页面试试看！');

                }


            }
        },
        // 继续电子签名
        flowGo: function (typeName, type, cliNum) {
            if (typeName == 'yjcl') { //语句抄录
                var owner = this.getOwnerSignCliInfo();
                initSign(owner);
                initTemplateData();
                var res = apiInstance.showCommentDialog("30");

                if (res == RESULT_OK) {
                    document.getElementById("app").style.display = "none";
                } else {
                    console.log("Error:" + res);
                }

            } else if (typeName == 'dzqm') { //电子签名

                var owner = this.getOwnerSignCliInfo();
                if (type == 'W') {  //见证人
                    var cli = this.getSignCliInfoByCliNum2(cliNum, type);
                } else {
                    var cli = this.getSignCliInfoByCliNum(cliNum, type);
                }


                if (cliNum != owner.cliNum || !app.newProductType) {
                    initSign(cli);
                    initTemplateData();
                } else {

                }

                var res = apiInstance.showSignatureDialog("20");

                if (res == RESULT_OK) {
                    document.getElementById("app").style.display = "none";
                } else {
                    console.log("Error:" + res);
                }


            } else if (typeName == 'jzr') {

                var owner = this.getOwnerSignCliInfo();
                if (type == 'W') {  //见证人
                    var cli = this.getSignCliInfoByCliNum2(cliNum, type);
                } else {
                    var cli = this.getSignCliInfoByCliNum(cliNum, type);
                }


                if (cliNum != owner.cliNum || !app.newProductType) {
                    initSign(cli);
                    initTemplateData();
                } else {

                }

                var res = apiInstance.showSignatureDialog("20");

                if (res == RESULT_OK) {
                    document.getElementById("app").style.display = "none";
                } else {
                    console.log("Error:" + res);
                }
            }
            this.timeTipModal = false;
            //this.recoModal = false;
        },
    },
    computed: {
    },
})
//签名总入口
function initSign(cli) {
    var res;
    //识别回调接口
    var identify_callback = function (errCode) {
        if (errCode == SUCCESS) {
            return;
        }
        if (errCode == DATA_CANNOT_PARSED) {
            alert("输入数据项无法解析！");
        } else if (errCode == SERVICE_SYSTEM_EXCEPTION) {
            alert("服务系统异常错误！");
        } else if (errCode == RECOGNITION_RESULT_EMPTY) {
            alert("识别结果为空！");
        } else if (errCode == CONNECTION_SERVICE_TIMEOUT) {
            alert("连接识别服务超时！");
        } else if (errCode == CONNECTION_RECOGNITION_EXCEPTION) {
            alert("连接识别服务异常！");
        } else if (errCode == RECOGNITION_FALSE) {
            alert("书写错误！");
        } else {
            alert(errCode);
        }
    }
    var callback = function (context_id, context_type, val) {
        document.getElementById("app").style.display = "block";

        if (context_type == CALLBACK_TYPE_SIGNATURE) {
            uploadSignComment(val, cli, cli.cliNum, "SIGN");
        }
        else if (context_type == CALLBACK_TYPE_COMMENTSIGN) {
            //批注回显
            var aImg;
            if (app.commentTyp = "31") {
                aImg = document.getElementById("imgComment");
            } else if (app.commentTyp = "30") {
                aImg = document.getElementById("imgComment2");
            }

            aImg.src = "data:image/png;base64," + val;
            uploadSignComment(val, cli, cli.cliNum, "COMMENT");
        }
    };//测试回调，将回调数据显示
    ////////////////////////////////////////////////
    //设置签名算法，默认为RSA，可以设置成SM2
    EncAlgType.EncAlg = "SM2";
    apiInstance = new AnySignApi();
    var channel = "40021252";//渠道号，由信手书提供，请咨询项目经理，可参照老项目设置的渠道号
    //初始化签名接口

    res = apiInstance.initAnySignApi(callback, channel);

    if (!res) {
        console.log("init error");
    } else {

    }
    ////////////////////////////////////////////////
    //开启识别
    ocrCapture = new OCRCapture();
    ocrCapture.text = "a";
    ocrCapture.IPAdress = "http://60.247.77.116:11203/HWR/RecvServlet";
    ocrCapture.appID = "123";
    ocrCapture.count = 5;
    ocrCapture.language = Language.CHS;
    ocrCapture.resolution = 80;
    ocrCapture.serviceID = "999999";

    apiInstance.setIdentifyCallBack(callback);
    ///////////////////////////////////////////////
    //注册单字签字对象20

    res = initSignatureObj(20, cli);


    if (!res) {
        console.log("initSignatureObj error");
        return;
    } else {
    }

    if (app.newProductType) {
        res = initCommentObj(30, cli);
        if (!res) {
            console.log("initCommentObj error");
            return;
        } else {
        }

        res = initCommentObj(31, cli);
        if (!res) {
            console.log("initCommentObj error");
            return;
        } else {
        }
    }
    ////////////////////////////////////////////////
    //注册一个单位签章
    var signer = new Signer(cli.cliNm, cli.idNum);
    /**
     * 使用服务器规则配置签名
     * @param tid 服务器端生成的配置规则
     * @constructor
     */
    var signerRule = new SignRule_Tid("111");
    var cachet_config = new CachetConfig(signer, signerRule, false);
    ////////////////////////////////////////////////
    //将配置提交
    res = apiInstance.commitConfig();

    if (res) {
        console.log("Init ALL 提交配置成功");
    } else {
        console.log("Init ALL 提交配置失败");
    }
    ////////////////////////////////////////////////   
}
var apiInstance;
//配置模板数据
function initTemplateData() {
    var formData = "PGh0bW";
    //文件数据
    var businessId = "123123";//集成信手书业务的唯一标识
    var template_serial = "4000";//用于生成PDF的模板ID
    var res;
    //配置JSON格式签名原文
    /**
     * 设置表单数据，每次业务都需要set一次
     * @param template_type 签名所用的模板类型
     * @param contentUtf8Str 表单数据，类型为Utf8字符串
     * @param businessId 业务工单号
     * @param template_serial 模板序列号
     * @returns {*} 是否设置成功
     */
    res = apiInstance.setTemplate(TemplateType.PDF, formData, businessId, template_serial);

    if (res) {
        console.log("setTemplateData success");
        return res;
    }
    else {
        console.log("setTemplateData error");
        return res;
    }
}
//添加单签签名框
function initSignatureObj(objId, cli) {
    console.log('log');
    var context_id = objId;
    //todo 名字/身份证
    var signer = new Signer(cli.cliNm, cli.idNum);
    /**
     * 关键字定位方式，寻找PDF中的关键字，根据关键字位置放置签名图片
     * @param keyword 关键字
     * @param keyWordAlignMethod 签字图片和关键字位置关系：等于1时，签字图片和关键字矩形重心重合
     *                            等于2时，签字图片位于关键字正下方，中心线对齐；等于3时，签字图片位于关键字正右方，中心线对齐；
     *                            等于4时，签字图片左上角和关键字右下角重合，可能额外附加偏移量，详见构造函数的offset参数
     * @param keyWordOffset 当keyWordAlignMethod非零时，额外附加的偏移量，单位pt
     * @param pageNo 寻找关键字的PDF起始页码
     * @param KWIndex KWIndex 第几个关键字
     * @constructor
     */
    console.log(cli.linkTyp + ':' + cli.keyWord);
    var signerRule = new SignRule_KeyWord(cli.keyWord, 1, 30, 0, 1);
    var signatureConfig = new SignatureConfig(signer, signerRule);
    //1:时间在上、2：时间在下、3：时间在右
    //签名下面带一个签名时间，如无特别需求，可注释掉
    var timeTag = new TimeTag(1, "yyMMdd hh:mm;ss");
    //签名图片大小
    signatureConfig.singleWidth = 420;
    signatureConfig.singleHeight = 120;
    //签名面板标题

    if (cli.linkTyp == 'G') { //监护人
        //（被保险人）{{cli.cliNm}} （投保人）{{cli.AboveSignDesc}} 代
        signatureConfig.title = "签名格式为:" + cli.cliNm + ' ' + cli.AboveSignDesc + '代';
    } else {
        signatureConfig.title = "请" + app.getSignLinkTypDesc(cli.linkTyp) + ' ' + cli.AboveSignDesc + " 签字";
    }

    //签名面板标题凸显字段
    signatureConfig.penColor = "#000000";
    signatureConfig.isTSS = true; //是否开始时间戳服务
    signatureConfig.signatureImgRatio = 3.0;
    //是否为必签项
    signatureConfig.nessesary = true;
    //是否开启识别
    signatureConfig.isdistinguish = false;
    signatureConfig.ocrCapture = ocrCapture;

    var res = apiInstance.addSignatureObj(context_id, signatureConfig);

    if (res) {
        console.log("addSignatureObj " + context_id + " success");
        return res;
    }
    else {
        console.log("addSignatureObj " + context_id + " error");
        return res;
    }
}