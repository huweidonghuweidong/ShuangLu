     
Vue.component('component-bank-transfer',{
    props:['bankFormItem','showBankTransfer'],
    template: '#BankAutoTransferAuth',
    methods:{
        getAcctTypeDesc: function (acctType) {
            if (acctType == "DDA") {
                return "扣款账户";
            } else if (acctType == "DCA") {
                return "给付账户";
            } else {
                return "";
            }
        },
        getBankName: function (bankCode) {
            var bankName;

            for (var idx in app.bankList) {
                var bank = app.bankList[idx];

                if (bank.key == bankCode) {
                    bankName = bank.value;
                    break;
                }
            }

            return bankName;
        },
        confirmBankTransfer: function (e) {
            e.stopPropagation();
            e.preventDefault();

            $.ajax({
                async: true,
                type: "POST",
                url: "REST/SaveESignBankInfo"
                ,
                data:
                {
                   "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.showBankTransfer = false;
                app.inputBankTransfer = true;
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
            
            app.autoChoose(app.docName);

            if(app.eAppNumber){
                app.getEappBankAccount(app.eAppNumber) 
            }

        },

        // 账号修改
        updateBankAccount: function () {                
            app.defmod = true;

            // 如果付款账号  没有同时设立为给付账号
            // if(!app.deductionAccount[app.personIndex].asdca){
            //     app.paymentAccount.shift();
            // }
     
            //app.addAccNum = app.paymentAccount.length;
            if(app.eAppNumber){
                app.cliSelect = [];
                app.getEappBankAccount(app.eAppNumber); 
                app.getEappBankClient(app.eAppNumber,function(data){
                    app.paymentAccount.forEach(function(item,index){
                        item.eappBankClientList = data;

                    });
                    
                    if(data.length == 1 && app.paymentAccount.length > 0){
                        app.addAccState = false;
                    }else{
                        app.addAccState = true;
                    }
                    
                });
            }
           
        },
        closeBankTransfer: function () {
            app.showBankTransfer = false;
            app.inputBankTransfer = false;
        }
    }
})
 
Vue.component('component-financial',{
    props:['financialFormItem','showFinancial','test'],
   
    data:function(){
        return {
            qyClick:false,
            cwSureClick:false,
            formData:{
                user:'',
                password:''
            }
        }
    }, 
    template: '#Financial',

    mounted:function(){
        var HeartBeatTimer //heartBeat
        if (HeartBeatTimer == null){  
            HeartBeatTimer = setInterval("app.heartBeat()", 1000 * 60);
        }
    },

    methods:{
        changeV:function(e,finInfo,name){   //千位分隔符
            var reg = /,*/g;
            if(e.target.value.indexOf('.') == '-1'){
                e.target.value = e.target.value.replace(reg,'');
                e.target.value = toNum(e.target.value);
            } 
        }, 
        chooseOtherLoan:function(e,finInfo){
            finInfo.liabilitiesOtherLoan = e;
          
        },
        employeeChooseHandle:function(e,finInfo,key){
            if(finInfo.isEmployee == 'Y'){
                finInfo.doubleChoose1 = true;
                if(finInfo.doubleChoose3){
                    $('#workOther' + key).trigger('click');
                }

                finInfo.workOtherDescription = null;
                finInfo.companyList = [{
                    "companyName": null,
                    "companyAddress": null,
                    "establishDate": null,
                    "mainBusiness": null,
                    "employeeCount": null,
                    "registerCaptail": null,
                    "hasRatio": null,
                    "companyJob": null,
                    "netWorth": null,
                    "liabilitiesAmount": null,

                    "turnover1": null,
                    "turnover2": null,
                    "turnover3": null,

                    "grossProfit1": null,
                    "grossProfit2": null,
                    "grossProfit3": null,

                    "netProfit1": null,
                    "netProfit2": null,
                }];
            }else{
                finInfo.doubleChoose1 = false;
            }

        },
        otherChooseHandle:function(e,finInfo){
            if(finInfo.isWorkOther == 'Y'){
                finInfo.doubleChoose3 = true;

                finInfo.companyName = null;
                finInfo.companyAddress = null;
                finInfo.companyEnterDate = null;
                finInfo.companyJobState = null;
                finInfo.companyList = [{
                    "companyName": null,
                    "companyAddress": null,
                    "establishDate": null,
                    "mainBusiness": null,
                    "employeeCount": null,
                    "registerCaptail": null,
                    "hasRatio": null,
                    "companyJob": null,
                    "netWorth": null,
                    "liabilitiesAmount": null,

                    "turnover1": null,
                    "turnover2": null,
                    "turnover3": null,

                    "grossProfit1": null,
                    "grossProfit2": null,
                    "grossProfit3": null,

                    "netProfit1": null,
                    "netProfit2": null,
                    "netProfit3": null
                }];
                
            }else{
                finInfo.doubleChoose3 = false;
            }

        },
        finishedCwHandle:function(e,item){
            if(e == 'N'){
                item.insuranceAimOtherDescState = false;
                item.isEmployeeState = false;
                item.companyNameState = false;
                item.companyAddressState = false;
                item.companyEnterDateState = false;
                item.companyJobState = false;


                item.companyNameStateSy = false;
                item.companyAddresstateSy = false;
                item.establishDateStateSy = false;
                item.mainBusinessStateSy = false;
                item.employeeCountStateSy = false;
                item.registerCaptailStateSy = false;
                item.hasRatioStateSy = false;
                item.companyJobStateSy = false;
                item.netWorthStateSy = false;
                item.liabilitiesAmountStateSy = false;
                item.turnoverState = false; 
                item.grossProfitState = false;
                item.netProfitState = false; 

                item.workOtherDescriptionState = false;

                item.salary1State = false;

                item.unearnedIncome1State = false;
                item.unearnedIncomeSourceState = false;

                item.addressState  = false;
                item.buyDateState = false;
                item.buildAreaState = false;
                item.buyPriceState = false;
                item.nowPriceState = false;
                item.hasRatioState = false;

                item.buyDateState2 = false;
                item.carModelState = false;
                item.buyPriceState2 = false;

                item.depositStockFundBondOtherState = false;
                item.depositStockFundBondAmountState = false;

                item.otherLoanAmountState = false;
                item.otherLoanPeriodState = false;
                item.otherLoanReasonState = false;

                item.otherNoticeState = false;
                
                item.hasCarState = false;
                item.hasDepositStockFundBondState = false;
                item.hasLiabilitiesState = false;
                item.hasOtherNoticeState = false;
                item.hasPropertyState = false;
                item.hasSalaryState = false;
                item.hasUnearnedIncomeState = false;
                item.insuranceState = false;
                item.propertyHasLoan = false;

            }
        },
        cwCheck:function(e){
            if(!e.target.value){
                e.target.className = 'ivu-input ivu-input-default newBorder'
            }else{
                e.target.className = 'ivu-input ivu-input-default'
            }
            
        },
        closeBorder:function(e){
          
        },
 
        closeCw:function(){
            app.showFinancial = false; 
            if(this.eAppNumber){
                this.HasFinData(this.eAppNumber,function(data){
    
                    if(data.HasFinData == 'Y'){
                        that.inputFinancial = true;
                    }else{
                        that.inputFinancial = false;
                    }
                }) 
            }  

        },
        gx:function(e){
           
        },
        changeMyState:function(e){
           
        },
        chooseCw:function(){

        },
        

        confirmFinacial: function (e) {
            e.stopPropagation();
            e.preventDefault();
           
            var that = this;

         
            var showBoon = app.financialFormItem.financialInfoList.every(function(item){   
                return item.fillFinancial == 'N' || String(item.fillFinancial) == 'null';
            });   
            
            app.showFinancial = false;

            
            //当财务问卷选择为是的时候。
            
            /*
                房产必填。默认N
                车辆必填。默认N
                基金必填：默认N
                负债必填：默认N


                当工资性收入为Y时   近三年的收入必填。

                当非工资性收入为Y时   近三年的收入必填。 且主要来源必填。

                当有房产为Y时   可增加房产信息
                
                当车辆为Y时   可增加车辆信息

                当基金为Y时  基金详情和总金额为必填

                当负债为Y时  贷款额，偿还期，原因为必填


            */

           app.financialFormItem.financialInfoList.forEach(function(item){
            if(item.salary1){
                item.salary1 = changeV2(item.salary1.toString());
            }
            if( item.salary2){
                item.salary2 = changeV2(item.salary2.toString());
            }
            if(item.salary3){
                item.salary3 = changeV2(item.salary3.toString());
            }
            
            if(item.unearnedIncome1){
                item.unearnedIncome1 = changeV2(item.unearnedIncome1.toString());
            }

            if(item.unearnedIncome2){
                item.unearnedIncome2 = changeV2(item.unearnedIncome2.toString());
            }
            if(item.unearnedIncome3){
                item.unearnedIncome3 = changeV2(item.unearnedIncome3.toString());
            }
                     
            
            item.propertyList.forEach(function(item2, index2){
                if(item2.buyPrice){
                    item2.buyPrice = changeV2(item2.buyPrice.toString());
                }

                if(item2.nowPrice){
                    item2.nowPrice = changeV2(item2.nowPrice.toString());
                }

                if(item2.remainLoanAmount){
                    item2.remainLoanAmount = changeV2(item2.remainLoanAmount.toString());
                }

            });

            item.carList.forEach(function(item2, index2){
                if(item2.buyPrice){

                    item2.buyPrice = changeV2(item2.buyPrice.toString());
                }
            });

            if(item.otherLoanAmountState){
                item.otherLoanAmountState = changeV2(item.otherLoanAmountState.toString());
            }

            if(item.depositStockFundBondAmount){
                item.depositStockFundBondAmount = changeV2(item.depositStockFundBondAmount.toString());
            }


            item.companyList.forEach(function(item2, index2) {
                if(item2.registerCaptail){
                    item2.registerCaptail = changeV2(item2.registerCaptail.toString());
                }

                if(item2.netWorth){
                    item2.netWorth = changeV2(item2.netWorth.toString());
                }

                if(item2.liabilitiesAmount){
                    item2.liabilitiesAmount = changeV2(item2.liabilitiesAmount.toString());
                }

                if(item2.turnover1){
                    item2.turnover1 = changeV2(item2.turnover1.toString());
                }
                if(item2.turnover2){
                    item2.turnover2 = changeV2(item2.turnover2.toString());
                }
                if(item.turnover3){
                    item2.turnover3 = changeV2(item2.turnover3.toString());
                }

                if(item2.grossProfit1){
                    item2.grossProfit1 = changeV2(item2.grossProfit1.toString());
                }
                if(item.grossProfit2){
                    item2.grossProfit2 = changeV2(item2.grossProfit2.toString());
                }
                if(item2.grossProfit3){
                    item2.grossProfit3 = changeV2(item2.grossProfit3.toString());
                }

                if(item2.netProfit1){
                    item2.netProfit1 = changeV2(item2.netProfit1.toString());
                }
                if(item2.netProfit2){
                    item2.netProfit2 = changeV2(item2.netProfit2.toString());
                }
                if(item2.netProfit3){
                    item2.netProfit3 = changeV2(item2.netProfit3.toString());
                }

            })

        });

        
            var financialIndex = 0;
            var hasFinancial = false;


            app.documentList.forEach(function(item, index){
                if(item == 'financial'){
                    hasFinancial =  true;
                    financialIndex = index;
                }
            });


            var strData = JSON.stringify({"FinList": app.financialFormItem,"eAppNumber": app.eAppNumber });//SessionAppNumBugFix_houjin


            if(showBoon){
                app.inputFinancial = false;

                if(hasFinancial){
                    app.documentList.splice(financialIndex,1)
                }
                 

                $.ajax({
                    async: true,
                    type: "POST",
                    url: "REST/SaveESignFinInfo",
                    datatype: "json",
                    contentType: "application/json",
                    data: strData
                }).success(function (response) {
    
                    app.showFinancial = false;
                    
                }).error(function (jqXHR, textStatus, errorThrown) {
                    console.log("textStatus:" + textStatus);
                    console.log("errorThrown:" + errorThrown);
                }); 
            }else{
            
                var can = app.financialFormItem.financialInfoList.some(function(item){
                    return item.salary1State || item.salary2State || item.salary3State || item.salaryState || item.insuranceState || item.insuranceAimOtherDescState
                        || item.unearnedIncome1State || item.unearnedIncome2State || item.unearnedIncome3State || item.unearnedIncomeState
                        || item.unearnedIncomeSourceState || item.addressState || item.buyDateState || item.buildArea || item.hasRatioState
                        || item.buyPriceState || item.nowPriceState || item.buyDateState2 || item.carModelState || item.remainLoanAmountStat || item.remainLoanPeriodState
                        || item.buyPriceState2
                        || item.otherLoanAmountState || item.otherLoanPeriodState || item.otherLoanReasonState || item.otherNoticeState
                        || item.isEmployeeState || item.companyNameState || item.companyAddressState
                        || item.companyEnterDateState || item.companyJobState || item.companyNameStateSy
                        || item.companyAddresstateSy || item.establishDateStateSy || item.mainBusinessStateSy
                        || item.employeeCountStateSy || item.registerCaptailStateSy || item.hasRatioStateSy
                        || item.companyJobStateSy || item.netWorthStateSy || item.liabilitiesAmountStateSy
                        || item.turnoverState || item.turnoverState1 || item.turnoverState2 || item.turnoverState3   ||item.grossProfitState || item.grossProfitState1 || item.grossProfitState2 || item.grossProfitStat3 || item.netProfitState || item.netProfitState1 || item.netProfitState2 ||item.netProfitState3 || item.workOtherDescriptionState || item.fzState
                        || item.fillFinancialState || item.hasSalaryState || item.hasUnearnedIncomeState
                        || item.hasPropertyState || item.hasCarState || item.hasDepositStockFundBondState
                        || item.hasOtherNoticeState || item.hasLiabilitiesState
                });

               
                var can2 = app.financialFormItem.financialInfoList.some(function(item){
                    return (item.isEmployee == 'Y' || item.isPrivateOwner == 'Y') && item.isWorkOther == 'Y'
                })
               
               
                if(can2){
                    app.alertState =  true;
                    app.alertMsg = '雇员或私营业主不能和其他同时选择!';
                }
                
                if(can || can2){
                    app.showFinancial = true;
                    this.cwSureClick = true;
                    }else{
                        app.inputFinancial = true;
                        $.ajax({
                            async: true,
                            type: "POST",
                            url: "REST/SaveESignFinInfo",
                            datatype: "json",
                            contentType: "application/json",
                            data: strData
                            }).success(function (response) {
                                app.showFinancial = false;
                                if(!app.financialClick && app.inputFinancial && !app.cancleState){
                                    $('#cwwj').trigger('click');
                                }
                
                                app.financialClick = true;
                            
                            }).error(function (jqXHR, textStatus, errorThrown) {
                                alert('服务器超时');
                                console.log("textStatus:" + textStatus);
                                console.log("errorThrown:" + errorThrown);
                            }); 
                }
            }

            
          
            
        },
        closeFinacial: function () {
            var showBoon = app.financialFormItem.financialInfoList.some(function(item){   
                return item.fillFinancial == 'Y';
            });   
            if(showBoon){
                app.cwTipModal = true; 
            }else{
                app.showFinancial = false;
            }
        },
           
        //工作收入切换
        changeSalary: function (val) {
            if (val.hasSalary == "N") {
                val.salary1 = "";
                val.salary2 = "";
                val.salary3 = "";
            }
        }, 

        // 非工作收入切换
        changeUnearnedIncome: function (val) {
            if (val.hasUnearnedIncome == "N") {
                val.unearnedIncome1 = "";
                val.unearnedIncome2 = "";
                val.unearnedIncome3 = "";
                val.unearnedIncomeSource = "";
            }
        },      
        //选择房产              
        changeProperty: function (val) { 
            if (val.hasProperty == 'N') {
                val.propertyList = [];
            } else {
                val.propertyList.push({
                    "address": null,
                    "buyDate": null,
                    "buildArea": null,
                    "hasRatio": null,
                    "buyPrice": null,
                    "nowPrice": null,
                    "hasLoan": "N",
                    "remainLoanAmount": null,
                    "remainLoanPeriod": null
                });
            }
        },
        
        //添加房产信息
        addProperty: function (finInfo) {
            var propListCount = finInfo.propertyList.length;

            finInfo.propertyList.push({
                "address": null,
                "buyDate": null,
                "buildArea": null,
                "hasRatio": null,
                "buyPrice": null,
                "nowPrice": null,
                "hasLoan": "N",
                "remainLoanAmount": null,
                "remainLoanPeriod": null
            });

          
            app.financialFormItem.financialInfoList.forEach(function(item,index){
                var hasLoan = item.propertyList.every(function(item2, index2){ 
                    return item2.hasLoan == 'N';
                });  
               
                if(hasLoan){  
                    item.propertyHasLoan = true;
                    
                }else{
                    item.propertyHasLoan = false;
                    
                }
            })

        },
        // 删除房产信息
        delProperty: function (finInfo,val) {
            if(finInfo.propertyList.length == 1){
                return false;
            }
            finInfo.propertyList.splice(val, 1);
            app.financialFormItem.financialInfoList.forEach(function(item,index){
                var hasLoan = item.propertyList.every(function(item2, index2){ 
                    return item2.hasLoan == 'N';
                });  
               
                if(hasLoan){  
                    item.propertyHasLoan = true;
                    
                }else{
                    item.propertyHasLoan = false;
                    
                }
            })

        },
        changeLoan: function(finInfo,val){
            if (val.hasLoan == 'N') {
                val.showLoan = false;
                app.financialFormItem.financialInfoList.forEach(function(item,index){
                    var hasLoan = item.propertyList.every(function(item2, index2){ 
                        return item2.hasLoan == 'N';
                    });  
                   
                    if(hasLoan){  
                        item.propertyHasLoan = true;
                        
                    }else{
                        item.propertyHasLoan = false;
                        
                    }
                })

                finInfo.liabilitiesPropertyLoan = 'N';

            }else{
                val.showLoan = true;
            }
        },   
        delCar: function (finInfo,val) {
            if(finInfo.carList.length == 1){
                return false;
            }
            finInfo.carList.splice(val, 1);
        },              
        delEmployerCompany: function (finInfo,val) {
            if(finInfo.companyList.length == 1){
                return false;
            }
            finInfo.companyList.splice(val, 1);
        },

        // 添加公司
        addCompany: function (finInfo) {
            this.qyClick = true;

            finInfo.companyList.push({
                "companyName": null,
                "companyAddress": null,
                "establishDate": null,
                "mainBusiness": null,
                "employeeCount": null,
                "registerCaptail": null,
                "hasRatio": null,
                "companyJob": null,
                "netWorth": null,
                "liabilitiesAmount": null,

                "turnover1": null,
                "turnover2": null,
                "turnover3": null,

                "grossProfit1": null,
                "grossProfit2": null,
                "grossProfit3": null,

                "netProfit1": null,
                "netProfit2": null,
                "netProfit3": null
            });
        },      

        //选择公司
        changeCompany: function (e,finInfo, key) { 
            if(finInfo.isPrivateOwner=='Y'){
                finInfo.doubleChoose2 = true;
                if(finInfo.doubleChoose3){
                    $('#workOther' + key).trigger('click');
                }
                finInfo.companyName = null;
                finInfo.companyAddress = null;
                finInfo.companyEnterDate = null;
                finInfo.companyJobState = null;
                finInfo.workOtherDescription = null;

            }else{
                finInfo.doubleChoose2 = false; 
            }
          

            if (finInfo.isPrivateOwner == 'Y' && finInfo.companyList.length == 0) {
                finInfo.companyList.push({
                    "companyName": null,
                    "companyAddress": null,
                    "establishDate": null,
                    "mainBusiness": null,
                    "employeeCount": null,
                    "registerCaptail": null,
                    "hasRatio": null,
                    "companyJob": null,
                    "netWorth": null,
                    "liabilitiesAmount": null,

                    "turnover1": null,
                    "turnover2": null,
                    "turnover3": null,

                    "grossProfit1": null,
                    "grossProfit2": null,
                    "grossProfit3": null,

                    "netProfit1": null,
                    "netProfit2": null,
                    "netProfit3": null
 
                });
            }
        },


        // 添加车子信息        
        addCar: function (finInfo) {
            finInfo.carList.push({
                buyDate: null,
                buyPrice: null,
                carModel: null
            });

        },            

        changeWorkType: function (val) {
            app.showEmployee = false;
            app.showEmployer = false;

            for (var i = 0; i < val.length; i++) {
                if (val[i] == '1') {
                    app.showEmployee = true;
                }
                if (val[i] == '2') {
                    app.showEmployer = true;
                }
            }
        },
        changeCar: function (val) {

            if (val.hasCar == 'N') {
                val.carList = [];
            } else {
                
                console.log(val);
                val.carList.push({
                    "buyDate": null,
                    "carModel": null,
                    "buyPrice": null
                });
            }
            console.log(val);

        },                
        changeStock: function (val) {
            if(val.hasDepositStockFundBond == 'N'){
                val.depositStockFundBondOther = '';
                val.depositStockFundBondAmount = '';
                
            }
        },        
        changeLiabilities: function (val) {
            if(val.hasLiabilities == 'N'){
                val.liabilitiesPropertyLoan = 'N';
                val.liabilitiesOtherLoan = 'N';
                
                val.otherLoanAmount = '';
                val.otherLoanPeriod = '';
                val.otherLoanReasonState = '';
                

            }
        },       

        changeWorkType: function (val) {
            app.financialFormItem.showEmployee = false;
            app.financialFormItem.showEmployer = false;
            app.financialFormItem.showEmployeeOther = false;
                
            for(var i = 0; i < val.length; i++) {
                if (val[i] == '1'){
                    app.financialFormItem.showEmployee = true;
                    app.financialFormItem.showEmployer = true;
                    app.financialFormItem.showEmployeeOther = false;
                }
                if (val[i] == '2'){
                    app.financialFormItem.showEmployer = true;
                    app.financialFormItem.showEmployee = true;
                    app.financialFormItem.showEmployeeOther = false;                    
                }
                if (val[i] == '3'){
                    app.financialFormItem.showEmployee = false;
                    app.financialFormItem.showEmployer = false;
                    app.financialFormItem.showEmployeeOther = true;
                    app.financialFormItem.workTypeList = ['3'];
                }
            }
        },         
        changeOtherNotice: function (val) {
            if(val == '1'){
                app.financialFormItem.showOtherNotice = true;
            }else{
                app.financialFormItem.showOtherNotice = false;
            }
        },
        getDisplayYear: function (val) {
            var curDate = new Date();
            var curYear = curDate.getFullYear();

            return curYear + val;
        }
    }
})    
 


var app = new Vue({
    el: '#app',
    data: {
    	
    	showInfoState: false,
		infoMsg: '',
		msgDoc: '',
        msgTyp: '',
    	
        isPreApp:null,
        docData:[],
        productData:[],

        doubleShow:false,

        closeBtnState:true,
        doubleDocumentInfo:false, //双录入文档弹框状态
        infoTransfer:false,
        reminderTransfer:false,
        clauseTransfer:false,
        instructionsTransfer:false,
        responseTransfer:false,
        showPdf:false,
        showAudio:false,
        playIndex:0,



        isN:false, // 财务问卷取消状态
        reflesh:true, //初次加载页面
        uploadArg:{

        }, //上传持证图片参数
        zoomPhoto:false, //预览上传图片大图
        sameYes : false, //同账号
        TerrName:'',  //开户地
        TerrNameWithProv:'', //开户分行
        cwLen:1,//财务问卷的长度
        ocrData:{}, //OCR识别的数据
        ruleValidate:{
            accountbranch:[{required:true, message:'开户分行不能为空',trigger:'blur'}],
            accountPlace:[{required:true, message:'开户分行不能为空',trigger:'blur'}],
            accountNum:[{required:true, message:'开户分行不能为空',trigger:'blur'}]
        },
        payOnePerson:null, // 第一个支付账号持有人
        accChangeData:{
            holderName : '', //账户持有姓名  
            bankCode:'',
            bankName:'',
            accountNum:'',
            accountbranch:'',
            accountPlace:''
        },
        
        alertState:false, //alert直接昂太
        alertMsg:'', // alert信息

        addAccState:true, //添加账号按钮状态。
        cameraIndex:0, //orc索引
        addState:false, //是否已经选择同一账户人
        lastChoose:'', //最后一次选择的账户人
        addAccNum:0, //已经添加的账户人数量
        cliSelect:[], //账户修改选择的人
        whichClient : null,
        eappBankClientList:[], // 账户人列表
        test1:true,
        financialInfoListLen:0,  //财务问卷的人数
        cancleState:false,
        visible:false,
        ConfirmModDiv: false,
        orcModel:false,

        tbrQm:true,
        timerAgainState:false,
        cwTipModal:false,
        docName:'',
        canPhoto:true,
        timeInfo:{
            IsTimeOut:'N'
        },
        timeTipModal:false,
        timeMsg:'',
        typeName:'yjcl',
        sxIdiea:true,
        zzsIdiea:true,
        accCliNum : [],
        curIndex:0,
        qmFinish:[],
        yjclFinish:false,
        docType:'',

        cardTypeCn:'',
        cardList:[], 
        bankTypeCn:'',
        chooseBackCode:'001',
        model1:'001',
        personIndex:0,
        isPc:true,
        flowState:null,
        currentData:{
        },
            

        ocrType: 'B',       
        showSubmit: true,
        showFront: true,
        showBack: true,
        imgFront: '',
        imgBack: '',
        showBackCamera: true,

        formItem: {   //orc
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

        faceDataMap:{ //人脸识别及拍照
            imgShow:false,
            coverState1:false,
            coverState2:false,
            viewList:[],
            forward:[],
            reverse:[],
            fwState:true,
            reState:true,
            isIdCard:false
        },
        dataLen:0,
        signPhoto:[],  //电子签名 人脸识别完成进度
        signPhoto2:[],
        str:'data:image/gif;base64,',
        commentFileId:null,  //语句抄录状态
        commentStateModal:false, //语句抄录弹窗
        qm:['R0lGODlhhwBIAJECAL6+vtHR0f///wAAACH5BAEAAAIALAAAAACHAEgAAAL/jI+py+0Po5y02ouz3rz7Dx7CSJbmiabqyrbuC6NLTNf2jddKzvf+r9oBh8TiS2hMKo3IpfOJa0KnVJa0is0Krtruk+sNMxPi8hJsTufQ6jaN7Y634PK6jGzPu+j6PL9f9wcYJzjYVmiYhphYtngCAMkDUDOJEklzCeRokolTCdNZEuoyyrPJaRnz+dL5uSrwahnbcyr6WJoyuwLJywvb28sCPKw7hyc5THmbOxLryqqCu3ecU3xLTBz9TLIqza3rbYzgYw1t3jw5Wo4bLi7S81qeSor6+yhszylvRQ2KDYyJnixYqr6J2sdvnLJdC+dp40YqnkFa/c4xu/YvY7FQ7O1yIZymMCBDkST1fUQ3xNG6kfVsacv4KxizjjFU4nvYcqI+f8I00jSh0ucuZ/d2FnXZwle0GzaH4kQKkSXBgz3zXdRR8Ym6o0tRepXlytrJEovAQTV6dqrTZlFZiWWaVWorqstysk0aday3sSQQSdSplm7afUTTonX4Jq7HnK1mZcsG1ifAlzBtCNra9QZfzZvdGWCUqBZoLKJHUyltGgrq1E5Ws1bi+vWYkLIJKa4tJjZuTbd3d9HtmyLt4I16E68C/Djc4cp/G2/+5Tn0M9KnJ0lu/Uj17ERmcEceIrz48eTLmz+PPr368gUAADs='],
        signState:[],  //电子签名 完成进度
        sqState:false,  //
        affState:false,  //计划书状态
        agreeState:true,
        sentenceState:false,
        documentState:true,  //文档确认状态
        commentState:true,   //语句抄录状态
        CommentState:false,   //语句抄录状态 新
        SignFileState:true,  //电子签名状态
        BIOFicialState:true, //人脸识别状态
        jzrState:true,  //见证人状态
        jzrPanelState:true,

        allState:true,
        defmod: false,
        eAppNumber: '',
        cliInfo: [],   //
        isInsuredChild :false, //被保险人为未成年人
        insuredChildName :'', //未成年人被保险人姓名
        signCliInfo: [],  //电子签名data
        confirmedSignStatementClientTypeList:[],//已确认签名声明的客户类型列表
        jzrInfo:[], //见证人
        eSignStatus: 'E1',
        isAgentPolicy: 'N',
        isLoading: false,
        showDocFin: true,  //false默认
        showFnaCQ: false,
        showFnaNB: false,
        newProductType: false,
        isAccident: false,
        panelValue: [1,2,3,4,5],
        documentList: [],
        documentAllList: [],
        confirmDocumentList: [],
        modalDocumentInfo: false,
        document: [],
        documentIndex: 0,
        modalDocTitle: '',
        showPreNotice: false,
        showConfirmNotice: false,
        commentModal: false,
        signModal: false,
        recoModal: false,
        recoCliNum: '',
        recoTime: 0,
        bioFacialFailedCount: 0,
        bioFacialFailedCountLen:3,
        showWithID: false,
        canPhoto:true,
        readAuth: false,
        authBookModal: false,
        showBankTransfer: false,
        inputBankTransfer: false,
        inputFinancial: false,
        bankList: [],
        ocrbankList: [],
        bankFormItem: {
            polNum: '',
            accountList: []
        },
        showFinancial: false,
        financialFormItem: {
            financialInfoList: []
        },
        uploadList: [],
        defaultList:[],
        imgName: '',
        signApiInstances: [],
        commentUrl: "",
        finishESign: true,
        commentTyp: '',
        // 扣款账号
        addAccountState:false,
        panelValue2: [1,2],
        accountData:[],
        switch2:false,
        disabledSingle: true,
        disabledGroup: '投保人',
        IsSameAsInsured:false,
        deductionAccount: [],
        // 给付账号
        paymentAccount:[
            
        ]
    },
    watch:{
        eSignStatus:function(){
            app.getGlobalState(app.eSignStatus,app.isAgentPolicy);
        },

        'financialFormItem.financialInfoList':{
            deep:true,
            handler:function(){
                app.financialFormItem.financialInfoList.forEach(function(item,index){                
                    if(item.fillFinancial == 'Y'){
                        item.fillFinancialState = false;
                        if(item.insuranceAimOther == 'Y'){
                            if(testStr(item.insuranceAimOtherDesc)){
                                
                                item.insuranceAimOtherDescState = false;
                            }else{
                                item.insuranceAimOtherDescState = true;
                            }
                        }else{
                            item.insuranceAimOtherDescState = false;
                        }
    
                        // 保险目的
                        if(item.insuranceAimFamily == 'Y' || item.insuranceAimChild == 'Y' || item.insuranceAimLoan == 'Y' || item.insuranceAimOther == 'Y'){
                            item.insuranceState = false;
                        }else{
                            item.insuranceState = true;
                        }
    
                        // 工作详情
                    
                        if(item.isEmployee == 'Y' || item.isPrivateOwner == 'Y' || item.isWorkOther == 'Y'){
                            item.isEmployeeState = false;
                        }else{
                            item.isEmployeeState = true;
                        }
                      
    
                        //雇员
                        if(item.isEmployee == 'Y'){
                            if(!testStr(item.companyName)){
                                item.companyNameState = true;
                            }else{
                                item.companyNameState = false;
                            }
                            if(!testStr(item.companyAddress)){
                                item.companyAddressState = true;
                            }else{
                                item.companyAddressState = false;
                            }
                            if(!item.companyEnterDate){
                                item.companyEnterDateState = true;
                            }else{
                                item.companyEnterDateState = false;
                            }
                            if(!testStr(item.companyJob)){
                                item.companyJobState = true;
                            }else{
                                item.companyJobState = false;
                            }
                        }else{
                            item.companyNameState = false;
                            item.companyAddressState = false;
                            item.companyEnterDateState = false;
                            item.companyJobState = false;
                        }
    
    
                        //私营业主
                        if(item.isPrivateOwner == 'Y'){
                            item.companyList.forEach(function(value,key){
                                if(!testStr(value.companyName)){
                                    item.companyNameStateSy = true;
                                    item['companyNameStateSy' + key] = true;
                                }else{
                                    item.companyNameStateSy  = false;
                                    item['companyNameStateSy' + key] = false;
                                }
                                if(!testStr(value.companyAddress)){
                                    item.companyAddresstateSy = true;
                                    item['companyAddresstateSy' + key] = true;
                                }else{
                                    item.companyAddresstateSy = false;
                                    item['companyAddresstateSy' + key] = false;
                                }
                                if(!value.establishDate){
                                    item.establishDateStateSy= true;
                                    item['establishDateStateSy' + key] = true;
                                } else{
                                    item.establishDateStateSy = false;
                                    item['establishDateStateSy' + key] = false;
                                }if(!testStr(value.mainBusiness)){
                                    item.mainBusinessStateSy = true;
                                    item['mainBusinessStateSy' + key] = true;
                                }else{
                                    item.mainBusinessStateSy = false;
                                    item['mainBusinessStateSy' + key] = false;
                                }if(testNumber6(value.employeeCount)){
                                    item.employeeCountStateSy = false;
                                    item['employeeCountStateSy' + key] = false;
                                }else{
                                    item.employeeCountStateSy = true;
                                    item['employeeCountStateSy' + key] = true;
                                    
                                }if(testNumber5(value.registerCaptail)){
                                    item.registerCaptailStateSy = false;
                                    item['registerCaptailStateSy' + key] = false;
                                }else{
                                    item.registerCaptailStateSy = true;
                                    item['registerCaptailStateSy' + key] = true;
                                }if(testNumber2(value.hasRatio) && value.hasRatio <= 100){
                                    item.hasRatioStateSy = false;
                                    item['hasRatioStateSy' + key] = false;
                                    
                                }else{
                                    item.hasRatioStateSy = true;
                                    item['hasRatioStateSy' + key] = true;
                                }if(!testStr(value.companyJob)){
                                    item.companyJobStateSy = true;
                                    item['companyJobStateSy' + key] = true;
                                }else{
                                    item.companyJobStateSy = false;
                                    item['companyJobStateSy' + key] = false;
                                }if(testNumber5(value.netWorth)){
                                    item.netWorthStateSy = false;
                                    item['netWorthStateSy' + key] = false;
                                    
                                }else{
                                    item.netWorthStateSy = true;
                                    item['netWorthStateSy' + key] = true;
                                }if(testNumber5(value.liabilitiesAmount)){
                                    item.liabilitiesAmountStateSy = false;
                                    item['liabilitiesAmountStateSy' + key] = false;
                                   
                                }else{
                                    item.liabilitiesAmountStateSy = true;
                                    item['liabilitiesAmountStateSy' + key] = true;
                                }
    
                                // 公司营业额
                                if(!value.turnover1 && !value.turnover2 && !value.turnover3){
                                    item.turnoverState = true;
                                    item['turnoverStateA' + key] = true;
                                    
                                }else{
                                    item.turnoverState = false;
                                    item['turnoverStateA' + key] = false;
                                }
        
    
                                if(testNumber4(value.turnover1)){
                                    item.turnoverState1 = false;
                                    item['turnoverState1A' + key] = false;
                                    
                                }else{
                                    item.turnoverState1 = true;
                                    item['turnoverState1A' + key] = true;
                                }

                                if(testNumber4(value.turnover2)){
                                    
                                    item.turnoverState2 = false;
                                    item['turnoverState2A' + key] = false;
                                }else{
                                    item.turnoverState2 = true;
                                    item['turnoverState2A' + key] = true;
                                }

                                if(testNumber4(value.turnover3)){
                                    item.turnoverState3 = false;
                                    item['turnoverState3A' + key] = false;
                                }else{
                                    item.turnoverState3 = true;
                                    item['turnoverState3A' + key] = true;
                                }

                                // 毛利
                                if(!value.grossProfit1 && !value.grossProfit2 && !value.grossProfit3){
                                    item.grossProfitState = true;
                                    item['grossProfitStateA' + key] = true;
                                }else{
                                    item.grossProfitState = false;
                                    item['grossProfitStateA' + key] = false;
                                }

                                if(testNumber4(value.grossProfit1)){
                                    item.grossProfitState1 = false;
                                    item['grossProfitState1A' + key] = false;
                                }else{
                                    item.grossProfitState1 = true;
                                    item['grossProfitState1A' + key] = true;
                                }

                                if(testNumber4(value.grossProfit2)){
                                    item.grossProfitState2 = false;
                                    item['grossProfitState2A' + key] = false;
                                }else{
                                    item.grossProfitState2 = true;
                                    item['grossProfitState2A' + key] = true;
                                }

                                if(testNumber4(value.grossProfit3)){
                                    item.grossProfitState3 = false;
                                    item['grossProfitState3A' + key] = false;
                                }else{
                                    item.grossProfitState3 = true;
                                    item['grossProfitState3A' + key] = true;
                                }

    
                                // 净利

                                if(!value.netProfit1 && !value.netProfit2 && !value.netProfit3){
                                    item.netProfitState = true;
                                    item['netProfitStateA' + key] = true;
                                }else{
                                    item.netProfitState = false;
                                    item['netProfitStateA' + key] = false;
                                }

                                if(testNumber4(value.netProfit1)){
                                    item.netProfitState1 = false;
                                    item['netProfitState1A' + key] = false;
                                }else{
                                    item.netProfitState1 = true;
                                    item['netProfitState1A' + key] = true;
                                }

                                if(testNumber4(value.netProfit2)){
                                    item.netProfitState2 = false;
                                    item['netProfitState2A' + key] = false;
                                }else{
                                    item.netProfitState2 = true;
                                    item['netProfitState2A' + key] = true;
                                }

                                if(testNumber4(value.netProfit3)){
                                    item.netProfitState3 = false;
                                    item['netProfitState3A' + key] = false;
                                }else{
                                    item.netProfitState3 = true;
                                    item['netProfitState3A' + key] = true;
                                }

    
                            });
                        }else{
                            item.companyNameStateSy = false;
                            item.companyAddresstateSy = false;
                            item.establishDateStateSy = false;
                            item.mainBusinessStateSy = false;
                            item.employeeCountStateSy = false;
                            item.registerCaptailStateSy = false;
                            item.hasRatioStateSy = false;
                            item.companyJobStateSy = false;
                            item.netWorthStateSy = false;
                            item.liabilitiesAmountStateSy = false;
                            item.turnoverState = false; 
                            item.turnoverState1 = false; 
                            item.turnoverState2 = false; 
                            item.turnoverState3 = false; 
                            item.grossProfitState = false;
                            item.grossProfitState1 = false;
                            item.grossProfitState2 = false;
                            item.grossProfitState3 = false;
                            item.netProfitState = false; 
                            item.netProfitState1 = false; 
                            item.netProfitState2 = false; 
                            item.netProfitState3 = false; 
                        }
    
    
                        // 工作详情 其他
                        if(item.isWorkOther == 'Y'){
                            if(!testStr(item.workOtherDescription)){
                                item.workOtherDescriptionState = true;
                            }else{
                                item.workOtherDescriptionState = false;
                            }
                        }else{
                            item.workOtherDescriptionState = false;
                        }
    
    
    
                        //工资为Y
                        if(item.hasSalary == 'Y'){
                            item.hasSalaryState = false; 
                           if(!item.salary1 && !item.salary2 && !item.salary3){
                                item.salaryState = true;
                           }else{
                                item.salaryState = false;
                           }

                            if(testNumber4(item.salary1)){
                                item.salary1State = false;
                            }else{
                                item.salary1State = true;
                            }
                            
                            if(testNumber4(item.salary2)){
                                item.salary2State = false;
                                
                            }else{
                                item.salary2State = true;
                            }

                            if(testNumber4(item.salary3)){
                                item.salary3State = false;
                            }else{
                                item.salary3State = true;
                            }

              
                        }else if(item.hasSalary == 'N'){
                            item.hasSalaryState = false;
                            item.salaryState = false;
                            item.salary1State = false;
                            item.salary2State = false;
                            item.salary3State = false;
                        }else{
                            item.hasSalaryState = true;
                        }
               
    
                         // 非工资为Y  unearnedIncomeSource
                         if(item.hasUnearnedIncome == 'Y'){
                            item.hasUnearnedIncomeState = false;
                            if(!item.unearnedIncome1 && !item.unearnedIncome2  &&  !item.unearnedIncome3){
                                item.unearnedIncomeState = true;  
                            }else{
                                item.unearnedIncomeState = false;
                                     
                            }

                            if(testNumber4(item.unearnedIncome1)){
                                item.unearnedIncome1State = false;
                            }else{
                                item.unearnedIncome1State = true;
                            }

                            if(testNumber4(item.unearnedIncome2)){
                                item.unearnedIncome2State = false;
                            }else{
                                item.unearnedIncome2State = true;
                            }

                            if(testNumber4(item.unearnedIncome3)){
                                item.unearnedIncome3State = false;
                            }else{
                                item.unearnedIncome3State = true;
                            }

                            if(!testStr(item.unearnedIncomeSource)){
                                item.unearnedIncomeSourceState = true;
                            }else{
                                item.unearnedIncomeSourceState = false;
                            }         
                        }else if(item.hasUnearnedIncome == 'N'){
                            item.hasUnearnedIncomeState = false;
                            item.unearnedIncomeState = false;
                            item.unearnedIncome1State = false;
                            item.unearnedIncome2State = false;
                            item.unearnedIncome3State = false;
                            item.unearnedIncomeSourceState = false;
                        }else{
                            item.hasUnearnedIncomeState = true;
                        }
    
                        // 房产Y  hasProperty
                        if(item.hasProperty == 'Y'){
                            item.hasPropertyState = false;
                           item.addA = '';
                           //debugger;
                            item.propertyList.forEach(function(value, key, array2){      
                                if(item.addA != ''){
                                    //item.addA = parseFloat(item.addA) +  (parseFloat(value.hasRatio || 0)/100 * parseFloat(value.buyPrice || 0) - parseFloat(value.remainLoanAmount || 0));
                                    item.addA = parseFloat(item.addA) +  parseFloat(changeV2(String(value.hasRatio)) || 0)/100 * parseFloat(changeV2(String(value.buyPrice)) || 0) - parseFloat(changeV2(String(value.remainLoanAmount)) || 0);
                                    
                                }else{
                                    item.addA = parseFloat(changeV2(String(value.hasRatio)) || 0)/100 * parseFloat(changeV2(String(value.buyPrice)) || 0) - parseFloat(changeV2(String(value.remainLoanAmount)) || 0);
                                }

                                if(!testStr(value.address)){
                                    item.addressState  = true;
                                    item['addressState' + key]  = true;
                                    
                                }else{
                                    item.addressState  = false;
                                    item['addressState' + key]  = false;
                                }
                                if(!value.buyDate){
                                    item.buyDateState = true;
                                    item['buyDateState' + key]  = true;
                                }else{
                                    item.buyDateState = false;
                                    item['buyDateState' + key]  = false;
                                }
                                if(testNumber3(value.buildArea)){
                                    item.buildAreaState = false;
                                    item['buildAreaState' + key]  = false;
                                } else{
                                    item.buildAreaState= true;    
                                    item['buildAreaState' + key]  = true;
                                }
                                if(testNumber5(value.buyPrice)){
                                    item.buyPriceState = false;
                                    item['buyPriceState' + key]  = false;
                                }else{
                                    item.buyPriceState = true;
                                    item['buyPriceState' + key]  = true;
                                    
                                }
                                if(testNumber5(value.nowPrice)){
                                    item.nowPriceState = false; 
                                    item['nowPriceState' + key]  = false;
                                }else{
                                    item.nowPriceState = true;
                                    item['nowPriceState' + key]  = true;
                                }

                                if(testNumber2(value.hasRatio) && value.hasRatio <= 100){
                                    item.hasRatioState = false;
                                    item['hasRatioState' + key]  = false;
                                }else{
                                    item.hasRatioState = true;
                                    item['hasRatioState' + key]  = true;
                                }  
                                    
                                
                                //  有抵押贷款                
                                if(value.hasLoan == 'Y'){          
                                    if(testNumber5(value.remainLoanAmount)){
                                        item.remainLoanAmountState = false;
                                        item['remainLoanAmountState' + key]  = false;
                                    }else{
                                        item.remainLoanAmountState = true;
                                        item['remainLoanAmountState' + key]  = true;
                                        
                                    }
                                    if(testNumber3(value.remainLoanPeriod)){
                                        item.remainLoanPeriodState = false;
                                        item['remainLoanPeriodState' + key]  = false;
                                    }else{
                                        item.remainLoanPeriodState = true;
                                        item['remainLoanPeriodState' + key]  = true;
                                       
                                    }    
                                    item.propertyHasLoan = false;
                                }
                                            
                            });
        
                            
                        }else if(item.hasProperty == 'N'){
                            item.hasPropertyState = false;
                            item.propertyHasLoan = true;
                            item.liabilitiesPropertyLoan = 'N';
                            item.addressState  = false;
                            item.buyDateState = false;
                            item.buildAreaState = false;
                            item.buyPriceState = false;
                            item.nowPriceState = false;
                            item.hasRatioState = false;
                            //item['remainLoanPeriodState' + key]  = true;
                        }else{
                            item.hasPropertyState = true;
                        }
    
    
                         // 车子为Y hasCar
                         if(item.hasCar == 'Y'){
                            item.hasCarState = false;
                            item.addB = '';
                            item.carList.forEach(function(value, index, array2){
                                if(item.addB != ''){
                                    //item.addB = parseFloat(item.addB) + parseFloat(value.buyPrice);
                                    item.addB = parseFloat(changeV2(Sting(item.addB))) + parseFloat(changeV2(String(value.buyPrice)));
                                }else{
                                    //item.addB = parseFloat(value.buyPrice);
                                    item.addB = parseFloat(changeV2(String(value.buyPrice)));
                                }
                                
                                if(!value.buyDate){
                                    item.buyDateState2 = true;
                                    item['buyDateState2' + index] = true;
                                }else{
                                    item.buyDateState2 = false;
                                    item['buyDateState2' + index] = false;
                                }if(testStr(value.carModel)){
                                    item.carModelState = false;
                                    item['carModelState' + index] = false;
                                }else{
                                    
                                    item['carModelState' + index] = true;
                                    item.carModelState = true;
                                }if(testNumber5(value.buyPrice)){
                                    item.buyPriceState2 = false;
                                    item['buyPriceState2' + index] = false;
                                }else{
                                    item.buyPriceState2 = true;
                                    item['buyPriceState2' + index] = true;
                                }
                            })
                        }else if(item.hasCar == 'N'){
                            item.hasCarState = false;
                            item.buyDateState2 = false;
                            item.carModelState = false;
                            item.buyPriceState2 = false;
                        }else{
                            item.hasCarState = true;
                        }
    
    
                        // 存款 基金 等为Y  hasDepositStockFundBond
                        if(item.hasDepositStockFundBond == 'Y'){
                            item.hasDepositStockFundBondState = false;
                            if(!testStr(item.depositStockFundBondOther)){
                                item.depositStockFundBondOtherState = true;
                            }else{
                                item.depositStockFundBondOtherState = false;
                            }if(testNumber5(item.depositStockFundBondAmount)){
                                item.depositStockFundBondAmountState = false;
                            }else{
                                item.depositStockFundBondAmountState = true;
                            }
                        }else if(item.hasDepositStockFundBond == 'N'){
                            item.hasDepositStockFundBondState = false;
                            item.depositStockFundBondOtherState = false;
                            item.depositStockFundBondAmountState = false;
                        }else{
                            item.hasDepositStockFundBondState = true;
                        }
    
                        // 贷款  为Y  hasDepositStockFundBond
                        if(item.hasLiabilities == 'Y'){
                            item.hasLiabilitiesState = false;
                            if(testNumber5(item.otherLoanAmount)){
                                item.otherLoanAmountState = false;
                            }else{
                                item.otherLoanAmountState = true;
                            }if(testNumber5(item.otherLoanPeriod)){
                                item.otherLoanPeriodState = false;
                            }else{
                                item.otherLoanPeriodState = true;
                               
                            }if(!testStr(item.otherLoanReason)){
                                item.otherLoanReasonState = true;
                            }else{
                                item.otherLoanReasonState = false;
                            }
                            if((!item.liabilitiesPropertyLoan || item.liabilitiesPropertyLoan == 'N')  && (!item.liabilitiesOtherLoan || item.liabilitiesOtherLoan == 'N')){
                                item.fzState = true;
                            }else{
                                item.fzState = false;
                            }

                            if(!item.liabilitiesOtherLoan || item.liabilitiesOtherLoan == 'N'){
                                item.otherLoanAmountState = false;
                                item.otherLoanPeriodState = false;
                                item.otherLoanReasonState = false;
                            }

                        }else if(item.hasLiabilities == 'N'){
                            item.hasLiabilitiesState = false;
                            item.otherLoanAmountState = false;
                            item.otherLoanPeriodState = false;
                            item.otherLoanReasonState = false;
                            item.fzState = false;
                        }else{
                            item.hasLiabilitiesState = true;
                        }   
    
                        // 补充公告为Y: hasOtherNotice
                        if(item.hasOtherNotice == 'Y'){
                            item.hasOtherNoticeState = false;
                            if(!testStr(item.otherNotice)){
                                item.otherNoticeState = true;
                            }else{
                                item.otherNoticeState = false;
                            }
                        }else if(item.hasOtherNotice == 'N'){
                            item.hasOtherNoticeState = false;
                            item.otherNoticeState = false;
                        }else{
                            item.hasOtherNoticeState = true;
                        }
    
                        //净产值
                        item.netWorth = math.format(parseFloat(item.addA || 0)  + parseFloat(item.addB || 0) + parseFloat(changeV2(String(item.depositStockFundBondAmount)) || 0) - parseFloat(changeV2(String(item.otherLoanAmount)) || 0),14);
                    }
                    else if(item.fillFinancial == 'N'){
                        item.fillFinancialState = false;
                    }else{
                        item.fillFinancialState = true;
                    }        
                    

    
                })
                
            }
        } 
    },
    computed:{
        newBorder:function(){
            return {
                border:'1px solid red'
            }
        },
        defpaymentAccount:function(){
            var data = this.paymentAccount;
            return data;        
        },
        getBankNameCn:function(){
            return function(code){
                var name = '';
                this.bankList.forEach(function(item, index){
                    if(item.key == code){
                        name = item.value;
                    }
                });
                return name;
            }
            
        }       
    },
    methods: {
        changePage:function(oldV, newV){

        },

        isSignDataReady:function(eAppNumber,cli,callback){   //递交投保  信息校验 （无见证人）
            $.ajax({
                async: true,
                type: "POST",
                url: "REST/isSignDataReady",
                datatype: "json",
                data: {
                    "eAppNumber": eAppNumber
                }
            }).success(function(response){
                var JSON_RESULT_DATA = response.JSON_RESULT_DATA
                var JSON_RESULT_ERROR = response["JSON_RESULT_ERROR"];  
                
                if(!JSON_RESULT_ERROR.length > 0){
                    // 真的校验通过
                    if(callback instanceof Function){
                        callback(JSON_RESULT_DATA);
                    }

                }else{
                    var _errMsg = "";
                    for (var idx in JSON_RESULT_ERROR) {
                        _errMsg = _errMsg + JSON_RESULT_ERROR[idx].errorCode + ":" + JSON_RESULT_ERROR[idx].errorMessage + '<br/>';
                    }

                    app.$Modal.info({
                        title: "信息",
                        content: _errMsg,
                        onOk: function () {
                            cli.SignFileId = '';
                        }
                    });
                    
                }

            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
                alert(funcName+ "  failed!");
            });
        },



        isAgentDataReady:function(eAppNumber,callback){   //递交投保  信息校验 （见证人校验）
            $.ajax({
                async: true,
                type: "POST",
                url: "REST/isAgentDataReady",
                datatype: "json",
                data: {
                    "eAppNumber": eAppNumber
                }
            }).success(function(response){
                app.isLoading = false;
                var JSON_RESULT_ERROR = response["JSON_RESULT_ERROR"];  
                
                if(!JSON_RESULT_ERROR.length > 0){
                    // 真的校验通过
                    if(callback instanceof Function){
                        callback(JSON_RESULT_ERROR);
                    }

                }else{
                    var _errMsg = "";
                    for (var idx in JSON_RESULT_ERROR) {
                        _errMsg = _errMsg + JSON_RESULT_ERROR[idx].errorCode + ":" + JSON_RESULT_ERROR[idx].errorMessage + '<br/>';
                    }

                    app.$Modal.info({
                        title: "信息",
                        content: _errMsg,
                        onOk: function () {
                            app.finishESign = false;
                        }
                    });
                    
                }


            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
                alert(funcName+ "  failed!");
            });
        },

        // 预览持证大图
        lookPhoto:function(){
            this.zoomPhoto  = true;
        },

        // 显示orc
        callOCR:function(type, index){
            this.showFront = true;
            this.orcModel = true;
            this.ocrType = type;
            this.imgFront = '';
            this.formItem = {   //orc
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
            }


            this.cameraIndex = index;

        },

        // 关闭orc
        closeOcr:function(){
            this.orcModel = false;
        },

        sureOcr:function(e){
            e.stopPropagation();
            e.preventDefault();
            if(!this.ocrData.category){
              
                app.alertMsg = '银行卡识别错误';
                app.alertState = true;
            }else{
                this.ConfirmModDiv = true;
            }
           
        }, 

        clsoeSureModal: function () {
            this.ConfirmModDiv = false;
        },
        show: function () {
            this.visible = true;
        },
        submit: function () {
            this.ConfirmModDiv = true;
        },
        confirmOCRData: function (e) {
            //debugger;
            e.stopPropagation();
            e.preventDefault();
            this.ConfirmModDiv = false;
            app.isLoading = true;
            var data = {};

            if (app.ocrType == "B") {
                data = {
                    "bankNo": app.formItem.bankNo,
                    "bankName": app.formItem.bankName,
                    "account": app.formItem.account,
                    "category": app.formItem.category
                };
            } 
            
            this.setOCRValue(data, app.personIndex);
            app.isLoading = false;
        },

        setOCRValue:function(data, personindex){
            //pillar
            if(app.cameraIndex >= 0){
                if (data.category == "贷记卡") {
                    this.alertMsg = '您输入的账户为信用卡。扣款或领款账户的设立仅支持借记卡，请您更换银行卡为借记卡';
                    this.alertState = true;
                } else {
                    var ocrBank = app.loadOcrBank(data.bankNo);
                    
                    if (ocrBank && ocrBank.value) {

                        app.paymentAccount[app.cameraIndex].accountNum = data.account;

                        app.bankList.forEach(function(item, index){
                            if(item.key == ocrBank.value){
                                app.paymentAccount[app.cameraIndex].bankCode = item.key;
                                app.paymentAccount[app.cameraIndex].bankName = item.value;
                                
                            }
                        });

                    } else {
                        this.alertState = true;
                        this.alertMsg = '您的银行卡的开户银行暂与我司没有合作，请您更换“银行名称”列表中的银行卡';
                    }
                } 


            }else{
                if (data.category == "贷记卡") {
                    this.alertMsg = '您输入的账户为信用卡。扣款或领款账户的设立仅支持借记卡，请您更换银行卡为借记卡';
                    this.alertState = true;
                } else {
                    var ocrBank = app.loadOcrBank(data.bankNo);
                    if (ocrBank && ocrBank.value) {
                        app.deductionAccount[app.personIndex].bankCode = ocrBank.value;
                        this.deductionAccount[personindex].accountNum = data.account;
                        this.chooseBackCode = app.deductionAccount[app.personIndex].bankCode;

                    } else {
                        this.alertState = true;
                        this.alertMsg = '您的银行卡的开户银行暂与我司没有合作，请您更换“银行名称”列表中的银行卡';
                    }
                }                 
            }
                       
            this.orcModel = false;
        },
        loadOcrBank: function (bankCode) {
            var output = {};
            var data = app.ocrbankList;

            for (a in data) {
                var b = data[a];

                if (b.key == bankCode) {
                    output = b;
                    break;
                }
            }

            return output;
        },
        close: function () {
            $("#system-form-dialog").dialog("close");
        },

        timerAgain:function(){
            this.timerAgainState = false;
            this.clearSignInfo(this.eAppNumber);
            this.saveTimerInfo(this.eAppNumber);
            this.geteAppInfo(this);
            this.getCliInfo(this);
        },

        //  付款账号同时
        payAccountHandle:function(e){
            if(e){
                app.deductionAccount[app.personIndex].asdca = true;
            }else{
                app.deductionAccount[app.personIndex].asdca = false;
            }
        },
        // 设置银行 code
        setBankValue:function(e,itemData){
        
            if(app.bankList.length < 1){
                return;
            }
           

            app.bankList.forEach(function(item, index){
                
                if(item.key == e){       
                    app.deductionAccount[app.personIndex].bankCode = item.key;
                    itemData.bankCode = item.key;
                  
                    app.getBankNameCn(item.key);
                }
            });
            
        },
      
        // 下拉选择账户持有人
        setBankClient:function(e){            
            var arr = [];
            app.eappBankClientList.forEach(function(item, index){
                if(item.ClientName == e){
                    app.paymentAccount.forEach(function(item2,index2){
                        if(item2.holderName == e){
                            item2.APPNum = app.eAppNumber;
                            item2.holderCardTypeDesc = item.IDTypeDesc; //证件类型
                            item2.holderCardType = item.IDType;  //证件 id
                            item2.holderCardNum = item.IDNumber; // 
                            item2.relToInsured = item.ReltoInsured;
                            item2.cliNum = item.ClientNum;
                            item2.LinkTypeDesc = item.LinkTypeDesc;

                        }
                    })
                }
                
            })
                  
            app.addState = false;

            app.paymentAccount.forEach(function(item, index){
                arr.push(item.holderName);
            });

            var arr2 = arr.sort();
            for (var i =0; i< arr.length; i++){
                if(arr2[i] == arr2[i + 1]){
                    app.addState = true;
                }
            }   


            if(app.deductionAccount[app.personIndex].asdca){
                if(this.cliSelect.indexOf(e) > -1 || app.deductionAccount[app.personIndex].holderName == e){
                    app.addState = true;
                }else{
                    app.lastChoose = e;
                }
                
            }else{
                if(this.cliSelect.indexOf(e) > -1){
                    app.addState = true;
                }else{
                    app.lastChoose = e;
                }
            }


            var isoK = app.paymentAccount.some(function(item){
                return item.holderName == app.deductionAccount[app.personIndex].holderName;
            });

            if(isoK){
                app.sameYes = true;
            }else{
                app.sameYes = false;
            }  

        },

        choosePerson:function(e){  //选取投保人或被保人  扣款账号
            if(e == '被保险人'){
                app.personIndex = 1;
                app.deductionAccount[app.personIndex].showOwner = 'N';
                app.deductionAccount[app.personIndex].relToInsured = '02';

                if(app.deductionAccount[app.personIndex].IsSameAsInsured){
                    app.deductionAccount[app.personIndex].cliNum = app.accCliNum[0];
                }else{
                    app.deductionAccount[app.personIndex].cliNum = app.accCliNum[1];
                }
                
                if(app.deductionAccount[app.personIndex].bankCode){
                    app.deductionAccount[app.personIndex].bankCode = app.deductionAccount[app.personIndex].bankCode;
                }else{
                    app.deductionAccount[app.personIndex].bankCode = '001';
                }

                if(!app.deductionAccount[app.personIndex].accountPlace){
                    app.deductionAccount[app.personIndex].accountPlace = app.TerrNameWithProv; 
                }

                if(!app.deductionAccount[app.personIndex].accountbranch){
                    app.deductionAccount[app.personIndex].accountbranch = app.TerrName + '分行';
                }
               
                if(app.paymentAccount.length == 0){
                    app.sameYes = false;
                }else{
                    var isoK = app.paymentAccount.some(function(item){
                        return item.holderName == app.deductionAccount[app.personIndex].holderName;
                    });

                    if(isoK){
                        app.sameYes = true;
                    }else{
                        app.sameYes = false;
                    }

                }

                app.bankList.forEach(function(item,index){
                    if(app.deductionAccount[app.personIndex].bankCode == item.key){
                        app.chooseBackCode = item.key;
                    }
                });

            }else{
                app.personIndex = 0;
                app.deductionAccount[app.personIndex].relToInsured = '01';
                app.deductionAccount[app.personIndex].showOwner = 'Y';
                app.deductionAccount[app.personIndex].cliNum = app.accCliNum[0];
                

                if(app.deductionAccount[app.personIndex].bankCode){
                    app.deductionAccount[app.personIndex].bankCode = app.deductionAccount[app.personIndex].bankCode;
                }else{
                    app.deductionAccount[app.personIndex].bankCode = '001';
                }

                var isoK = app.paymentAccount.some(function(item){
                    return item.holderName == app.deductionAccount[app.personIndex].holderName;
                });

                if(!app.deductionAccount[app.personIndex].accountPlace){
                    app.deductionAccount[app.personIndex].accountPlace = app.TerrNameWithProv; 
                }

                if(!app.deductionAccount[app.personIndex].accountbranch){
                    app.deductionAccount[app.personIndex].accountbranch = app.TerrName + '分行';
                }

                if(isoK){
                    app.sameYes = true;
                }else{
                    app.sameYes = false;
                }

                app.bankList.forEach(function(item,index){
                    if(app.deductionAccount[app.personIndex].bankCode == item.key){
                        app.chooseBackCode = item.key;
                    }
                });
            }
            
        },
        handleRemove:function(){
            app.faceDataMap.coverState1 = false; 
            app.faceDataMap.forward = []; 
                  
        },
        handleRemove2:function(){
            app.faceDataMap.coverState2 = false; 
            app.faceDataMap.reverse = [];         
        },
        tickPhoto:function(){
        },    
        showCover:function(){
            this.faceDataMap.coverState = true;
        },
        hideCover:function(){
            this.faceDataMap.coverState = false;
        },
            
        // 文档确认后自当勾选
        autoChoose:function(docName){
            if(app.documentList.length >= 1){
                if(app.documentList.indexOf(docName) == -1){
                    var dcClickTimer2 = setTimeout(function(){
                        $('#' + docName).trigger('click');
                        clearInterval(dcClickTimer2);
                    },100);
                }
            }else{
                var dcClickTimer2 = setTimeout(function(){
                    $('#' + docName).trigger('click');
                    clearInterval(dcClickTimer2);
                },100);
            }


            if(docName == 'exemption' || docName == 'response'){
                if(this.productData.length >= 1){
                    this.$nextTick(function(){
                        this.productData.forEach(function(item, index){
                            document.getElementById('audio' + index).load();
                            item.playFlag = false;
                        })
                    });
                    
                }
            }

        },

        closePop:function(docName){
            
            this.modalDocumentInfo=false;

            this.doubleDocumentInfo = false;

            if(app.docName == 'declaration'){
                this.affState = true;
            }

            if(this.docName == 'info'){
                this.infoTransfer = true;
            }
            
            if(this.docName == 'reminder'){
                this.reminderTransfer = true;
            }

            if(this.docName == 'clause'){
                this.clauseTransfer = true;
            }

            if(this.docName == 'instructions'){
                this.instructionsTransfer = true;
            }

            if(this.docName == 'response'){
                this.responseTransfer = true;
                
            }

            this.closeDouble();
         
            this.autoChoose(this.docName);    
            
        },

        closeDouble:function(){
            if(this.productData.length >= 1){
                this.$nextTick(function(){
                    this.productData.forEach(function(item, index){
                        document.getElementById('audio' + index).load();
                        item.playFlag = false;
                    })
                });
                
            } 
        },

        checkAll:function(e){
            var len = $('.eSignature-list li').length;  //文档确认的所有选项数量
            var cwwjLen = $('#cwwj').length;   //财务问卷的数量                

            e.forEach(function(item){
                
                app.docName = item;
                if(item == 'declaration'){
                    app.sxIdiea = false;
                }
                else if(item == 'bank'){
                    app.zzsIdiea = false; 
                }
                else if(item =='financial'){
                    if(!app.inputFinancial){
                        alert('请先填写财务问卷');
                        e.pop();
                        
                        $('#cwwj').trigger('click');
                    }
                }else{
                    
                }
            });

            if(e.indexOf('financial') == '-1'){
                app.financialClick = false;
                localStorage.setItem('financial','no');
            }else{
                app.financialClick = true;
                localStorage.setItem('financial','yes');
            }

    
            if(cwwjLen == 1){  //如果存在财务问卷
                if(e.indexOf('financial') > -1){   //alert('财务被选中')
                    if( e.length == len){
                        this.allState = false;
                    }else{
                        this.allState = true;
                        this.agreeState = true;
                    }                     
                }else{
                    if( e.length == len -1){
                        this.allState = false;

                    }else{
                        this.allState = true;
                        this.agreeState = true;
                    } 
                }
            }else{
                
                if(e.length == len){
                    this.allState = false;
                }else{
                    this.allState = true;
                    this.agreeState = true;
                }
            }

            app.agreeCheck(app.cliInfo.length);
        },

        agreeCheck:function(num){
            if(this.confirmDocumentList.length == num && !this.allState){
                this.agreeState = false;
            }else{
                this.agreeState = true;
            }
        },
        //开始电子签名 E1
        startESignProcess: function () {
            this.updAppStatus("startEsign","E1");
        },
        //文档确认完成 E2
        confirmEDoc: function () {
            this.updAppStatus("confirmEDoc","E2");
        },
        //电子签名完成 E3
        confirmESignature: function () {
            this.updAppStatus("confirmESignature","E3");
        },
        //人脸识别完成 E4
        confirmEBioSignature: function () {
            this.updAppStatus("confirmEBioSignature","E4");
        },
        //见证人签名完成 E5
        confirmEAgentSignature: function () {
            this.updAppStatus("confirmEAgentSignature","E5");
        },

        //更新电子签名状态
        updAppStatus: function (funcName,status) {
            this.flowState = status;
            this.isLoading = true;

            //SessionAppNumBugFix_houjin
            var eAppNumberTmp="";
               //先从这儿取值
               if (app && app.eAppNumber) {
                    eAppNumberTmp=app.eAppNumber;
                }
                //再从这儿取值，主要从这儿取值
                if (this && this.eAppNumber) {
                    eAppNumberTmp=this.eAppNumber ;
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
            }).success(function(){
                app.isLoading = false;
                app.eSignStatus = status;
                //app.eSignStatus = '';
                console.log('当前状态是' + status + 'OK');   
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
                alert(funcName+ "  failed!");
            });
        },

        heartBeat: function () {   //heartBeat
            $.ajax({
                    async: true,
                    type: "POST",
                    url: "REST/HeartBeat",
                    datatype: "json"
            }).success(function(){
                console.log('当前状态是' + status + 'OK');   
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
                console.log("HeartBeat  failed!");
            });
        },

        changeFontColor: function (uwMsg, polNum) {
            return uwMsg.replace(polNum, "<font color=red>" + polNum + "</font>");
        },
        getUwResultList: function (uwMsg, polNum) {
            var msg = "<p>" + uwMsg + "<br/>";

            $.ajax({
                    async: false,
                    type: "POST",
                    url: "REST/UWResults",
                    datatype: "json",
                    data: {
                        "PolicyNumber": polNum
                    }
            }).success(function (response) {
                var uwResult = response["JSON_RESULT_DATA"];

                for (i in uwResult) {
                    msg = msg + "<br/>-" + uwResult[i];
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });

            return msg + "</p>";
        },

        formatTime: function (date, fmt) {
            var date = new Date(date);
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            var o = {
                'M+': date.getMonth() + 1,
                'd+': date.getDate(),
                'h+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds()
            };
            for (var k in o) {
                if (new RegExp('('+k+')').test(fmt)) {
                    var str = o[k] + '';
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).substr(str.length));
                }
            }
            return fmt;
        },

        parseDateWithISOFormat: function (s, trimTime) {
            //ISO_8601:yyyy-MM-ddThh:mm:ss
            if (s == null) return null;
            var arr = s.split("T");
            var dateStr = arr[0];
            var timeStr = null;
            if (arr.length > 1) {
                timeStr = arr[1];
            }
            var _y = null,
                _m = null,
                _d = null,
                _hh = null,
                _mm = null,
                _ss = null;
            var dateArr = dateStr.split("-");
            if (dateArr.length == 3) {
                _y = parseInt(dateArr[0], 10);
                _m = parseInt(dateArr[1], 10) - 1;
                _d = parseInt(dateArr[2], 10);
                if (!timeStr) {
                    return new Date(_y, _m, _d);
                }
            }

            if (timeStr && !trimTime) {
                var timeArr = timeStr.split(":");
                if (timeArr.length >= 3) {
                    _hh = parseInt(timeArr[0], 10);
                    _mm = parseInt(timeArr[1], 10);
                    _ss = parseInt(timeArr[2], 10);
                    return new Date(_y, _m, _d, _hh, _mm, _ss);
                }
            }
            else {
                return new Date(_y, _m, _d, 0, 0, 0);
            }

            return null;
        },

        isoFormatDateToDisplayFormat: function (isoFormatDateStr, yearSeparator, monthSeparator, daySeparator){
            if (yearSeparator) {
                var thisDate = app.parseDateWithISOFormat(isoFormatDateStr);
                return app.formatTime(thisDate, 'yy' + yearSeparator + 'mm' + monthSeparator + 'dd' + daySeparator);
            } else {
                var thisDate = app.parseDateWithISOFormat(isoFormatDateStr);
                return app.formatTime(thisDate, 'yy/mm/dd');
            }
        },

        isShowIdTips:function(eAppNumber){
            var result;

            $.ajax({
                type: 'post',
                url: '../eApplication/REST/IsShowIdTips/' + eAppNumber,
                dataType: "json",
                async: false,
                success: function (data) {
                    if (!checkError('', data)) {
                        result = data["JSON_RESULT_DATA"];
                    }
                },
                error: function (errMsg) {
                    throw new Error('cannot show id tips: ' + errMsg.responseText);
                }
            });

            return result;
        },

        getAllDocuments:function(eAppNumber){
            var displayError = function (s) {
                //ShowErrorDialog(s);
                app.$Modal.info({
                    title: "信息",
                    content: s,
                    onOk: function () {
                       
                    }
                });
            };
            var checkError = function (description, result, isErrorShown) {
                if (isErrorShown == undefined) isErrorShown = true;
                var _hasError = false;
                if (result && result["JSON_RESULT_ERROR"] && result["JSON_RESULT_ERROR"].length > 0) {
                    _hasError = true;
                    if (isErrorShown) {
                        var _errMsg = description + "<br/>";
                        for (var idx in result["JSON_RESULT_ERROR"]) {
                            _errMsg = _errMsg + result["JSON_RESULT_ERROR"][idx].errorCode + ":" + result["JSON_RESULT_ERROR"][idx].errorMessage + '<br/>';
                        }
                        displayError(_errMsg);
                    }
                }
    
                return _hasError;
            };

            
            var result = {}; 

            $.ajax({
                type: 'post',
                url: '../eApplication/REST/Documents/' + eAppNumber,
                dataType: "json",
                async: false,
                success: function (data) {
                    if(data){
                        result = data["JSON_RESULT_DATA"];
                    }
                    
                },
                error: function (errMsg) {
                    throw new Error('unable to load documents: ' + errMsg.responseText)
                }
            });

            return result;
        },

        getDocumentList:function(eAppNumber, UnderwritingResultCode, PolicyNumber, TipsCode){
            var doc = app.getAllDocuments(eAppNumber);
            var msg = "";
            //<<20192652_Gray
            //if (TipsCode == "2") {
            if (TipsCode == "2" || TipsCode == "3") {
                //>>20192652_Gray
                msg = "<p>恭喜您！您提交的保单：" + PolicyNumber + "已进入核心系统！";
                //20190028 Felix msg = msg + "<br/><span style='color:red;'>" + "请您上传三张保险销售所需的影像资料！" + "</span>";
                //20191434
                msg = msg + "<br/><span style='color:red;'>" + "请确认录音录像已完成！" + "</span>";
            }
            else {
                msg = "<p>恭喜您！您提交的保单：" + PolicyNumber + "已进入核心系统，在线投保流程已完成！";
            }
            //20172794 end
            msg = msg + "<br/> " + "温馨提醒您在3个工作日内将以下资料交回公司：";

            for (i in doc.Documents) {
                msg = msg + "<br/>  -" + doc.Documents[i];
                //<<20190065_Gray
                if (doc.Documents[i] == "《营销员报告》") {
                    //<<20190268_Gray
                    var isShowIdTips = app.isShowIdTips(eAppNumber);

                    if (isShowIdTips.ReturnCode == "Y") {
                        msg = msg + "<br/>  请将受益人身份证件资料交回公司";
                    };

                    //var isNewTypePlan = eAppService.isNewTypePlanForDocList(eAppNumber);

                    if (app.newProductType == "Y") {
                        msg = msg + "<br/>  *您投保的是新型产品，请注意抄录《在线投保申请确认书》中投保人确认栏内的38个字";
                    };
                    //>>20190268_Gray
                }
                //>>20190065_Gray
            }

            if (UnderwritingResultCode == "UN") {
                msg = msg + "<br/><br/>*我们将人工核保您的投保申请，如果有需要，<br/>&nbsp;烦请您配合再次递交相关资料*";
            }

            msg = msg + "<br/>带*标记的资料可以在" + app.isoFormatDateToDisplayFormat(doc.ImageUploadEndDate) + " 24:00前通过影像上传的方式递交。";
            //<<20160648_Gray
            //msg = msg + "</pre>";
            msg = msg + "</p>";
            //>>20160648_Gray
            return msg;
        },

        //注册一条新的计时数据 
        saveTimerInfo:function(eAppNumber){
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
    
        // 获取倒计时信息
        getTimerInfo:function(eAppNumber,callback){
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
                if(callback instanceof Function){
                    callback(that.timeInfo);
                }  
                
                
            }).error(function (jqXHR, textStatus, errorThrown) {
                
            });

        },

        
        // 清除状态台信息 
        clearSignInfo:function(eAppNumber){
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


        postGetTimerInfo: function (eAppNumber) {
            $.ajax({
                    async: false,
                    type: "POST",
                    url: "REST/GetTimerInfo",
                    datatype: "json",
                    data: {
                        "eAppNumber": eAppNumber
                    }
            }).success(function (response) {
            
            }).error(function (jqXHR, textStatus, errorThrown) {
                
            });

        },

        //递交投保
        complete: function () {
            app.isLoading = true;
            app.finishESign = true;
             
             //20200801_DoubleRecord_houjin isAgentDataReady所调用的存储过程中的逻辑有增加
             //判断是否是需要双录的单据，如果是，则判断双录状态是否是99，是则允许提交，不是则不允许提交。不是双录单据则逻辑原封不动。
                app.isAgentDataReady(app.eAppNumber,function(data){
                    app.finishDzqm();
                });
           
        },
        
        showInfo:function(){
            app.showInfoState = false;

            if (app.msgTyp == "1") {
                app.infoMsg = app.msgDoc;
                app.msgTyp = "2";
                app.showInfoState = true;
            } else if (app.msgTyp == "2") {
                window.location = './ApplicationList';
            }
        },


        // 递交投保 表单提交
        finishDzqm:function(){
            //app.finishESign = true;
            app.isLoading = true;
            var newProdType = "N";

            if (app.newProductType) {
                newProdType = "Y";
            }

            var isPreApp = app.isPreApp;

            if(isPreApp == 'Y'){
                $.ajax({
                    async: true,
                    type: "POST",
                    url: "REST/PreSubmiteSignature",
                    datatype: "json",
                    data: {
                        "newProductType": newProdType,
                        "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                    }
                }).success(function (response) {
                    app.isLoading = false;
                    
                    var JSON_RESULT_ERROR = response["JSON_RESULT_ERROR"];  
    
                    if(!JSON_RESULT_ERROR.length > 0){
                        var msg = response["JSON_RESULT_DATA"].SubmissionResult.ErrorMessage;
                        var uwRsltCd = response["JSON_RESULT_DATA"].UnderwritingResultCode;
                        var polNum = response["JSON_RESULT_DATA"].PolicyNumber;

                        if (uwRsltCd == "UR") {
                            app.$Modal.info({
                                title: "信息",
                                content: msg,
                                onOk: function () {
                                    window.location = './PendingList';
                                }
                            });
                        }else if(uwRsltCd == 'UN'){
                            msg = app.changeFontColor(msg, polNum);
                            msg = app.getUwResultList(msg, polNum);

							app.showInfoState = true;
							app.infoMsg = msg;
							app.msgDoc = app.getDocumentList(app.eAppNumber, uwRsltCd, polNum);
                            app.msgTyp = "1";

                        }else if(uwRsltCd == 'UY'){
                            msg = app.changeFontColor(msg, polNum);

							app.showInfoState = true;
							app.infoMsg = msg;
							app.msgDoc = app.getDocumentList(app.eAppNumber, uwRsltCd, polNum);
                            app.msgTyp = "1";

                        } 

                    }else{
                        var _errMsg = "";
                        for (var idx in JSON_RESULT_ERROR) {
                            _errMsg = _errMsg + JSON_RESULT_ERROR[idx].errorCode + ":" + JSON_RESULT_ERROR[idx].errorMessage + '<br/>';
                        }
    
                        app.$Modal.info({
                            title: "信息",
                            content: _errMsg,
                            onOk: function () {
                               app.finishESign = false;
                            }
                        });
                        
                    }
    
      
                }).error(function (jqXHR, textStatus, errorThrown) {
                    app.isLoading = false;
                    console.log("textStatus:" + textStatus);
                    console.log("errorThrown:" + errorThrown);
                    alert("保存失败!");
                    window.location.reload();
                });
            }else{
                $.ajax({
                    async: true,
                    type: "POST",
                    url: "REST/SubmiteSignature",
                    datatype: "json",
                    data: {
                        "newProductType": newProdType,
                        "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                    }
                }).success(function (response) {
                    app.isLoading = false;
                    
                    var JSON_RESULT_ERROR = response["JSON_RESULT_ERROR"];  
    
                    if(!JSON_RESULT_ERROR.length > 0){
                        var msg = response["JSON_RESULT_DATA"].SubmissionResult.ErrorMessage;
                        var uwRsltCd = response["JSON_RESULT_DATA"].UnderwritingResultCode;
                        var polNum = response["JSON_RESULT_DATA"].PolicyNumber;
                        if (uwRsltCd == "UR") {
              
                            app.$Modal.info({
                                title: "信息",
                                content: msg,
                                onOk: function () {
                                    window.location = './PendingList';
                                }
                            });
                        } else if (uwRsltCd == "UN") {
                            
                            msg = app.changeFontColor(msg, polNum);
                            msg = app.getUwResultList(msg, polNum);
                            
                            app.$Modal.info({
                                title: "信息",
                                content: msg,
                                onOk: function () {
                                    var _url = "Edit?section=confirm#div-initial-payment";
                                    var form = $('<form action="' + _url + '" method="post">' +
                                        '<input type="hidden" name="ApplicationNumber" value="' + app.eAppNumber + '" />' +
                                        '</form>');
                                    $('body').append(form);
                                    $(form).submit();
                                }
                            });
                        } else if (uwRsltCd == "UY") {
                           
                            msg = app.changeFontColor(msg, polNum);
                            app.$Modal.info({
                                title: "信息",
                                content: msg,
                                onOk: function () {
                                    var _url = "Edit?section=confirm#div-initial-payment";
                                    var form = $('<form action="' + _url + '" method="post">' +
                                        '<input type="hidden" name="ApplicationNumber" value="' + app.eAppNumber + '" />' +
                                        '</form>');
                                    $('body').append(form);
                                    $(form).submit();
                                }
                            });
                        }
                    }else{
                        var _errMsg = "";
                        for (var idx in JSON_RESULT_ERROR) {
                            _errMsg = _errMsg + JSON_RESULT_ERROR[idx].errorCode + ":" + JSON_RESULT_ERROR[idx].errorMessage + '<br/>';
                        }
    
                        app.$Modal.info({
                            title: "信息",
                            content: _errMsg,
                            onOk: function () {
                               app.finishESign = false;
                            }
                        });
                        
                    }
                }).error(function (jqXHR, textStatus, errorThrown) {
                    app.isLoading = false;
                    console.log("textStatus:" + textStatus);
                    console.log("errorThrown:" + errorThrown);
                    alert("保存失败!");
                    window.location.reload();
                });
            }
        },

        setPanelValue: function (data) {
            if (this.eSignStatus == "E1") {
                //data[0] = "1";
            }
        },
        setImgId2: function (imgId, index) {
            return imgId + index;
        },
        setImgId: function (imgId, index) {
            return imgId + index;
        },
        closeAuthBookModal: function () {
            this.authBookModal = false;
            this.readAuth = true;
        },
        preNotice: function () {
            if (this.documentIndex > 0) {
                this.documentIndex = this.documentIndex - 1
            }

            this.showPreNotice = (this.documentIndex > 0);
            this.showConfirmNotice = false;
        },
        nextNotice: function () {
            if (this.documentIndex == (this.document.length - 1)) {
                this.modalDocumentInfo = false;
            } else {
                this.documentIndex = this.documentIndex + 1
                this.showPreNotice = true;
                this.showConfirmNotice = (this.documentIndex == (this.document.length - 1));
            }
        },
        showRecoModal: function (cli,index,typeName) {
            var that = this;

            app.getTimerInfo(app.eAppNumber,function(data){
                that.timeInfo = data;
                app.checkTime(data,typeName,cli.linkTyp);


                if(data.RemainTime == 0 || data.IsTimeOut == 'Y'){
                    return false;
                }else{
                    app.readAuth = false;
                    app.showWithID = false;
                    app.curIndex = index;   

                    
                    that.recoCliNum = cli.cliNum;
                    that.recoModal = true;
                    that.currentData = cli;
                    that.faceDataMap.coverState1 = false;
                    that.faceDataMap.coverState2 = false;
                    that.bioFacialFailedCount = 0;
                    that.bioFacialFailedCountLen = 3;
                    that.typeName = typeName;
                    
                    
                
                    
                    var brower = navigator.userAgent.toLocaleLowerCase();
                    //var version = brower.match(/chrome\/([\d.]+)/)[1];
                    
                        
                    if(/iphone|iPad/i.test(navigator.userAgent)){
                            var version = brower.match(/cpu iphone os (.*?) like mac os/) 
                            /*if(version[1].replace(/_/g,".")<=12){
                                    this.showWithID = true;
                            }*/
                        app.showWithID = false; 
                    }else{
                        
                    }
    
    
                    // 重置图片数据
                    app.faceDataMap.forward = [];
                    app.faceDataMap.reverse = [];
                    
    
                    if(cli.idTyp == 1){  //身份证需要两个入口按钮
                        that.faceDataMap.isIdCard = false;
                    }else{
                        that.faceDataMap.isIdCard = false;
                    }
                }
            
            });

        },
        showFaceAuth: function (val) {
            if (val) {
                this.authBookModal = true;
            }
        },
        closeRecoModal: function () {
            // 上传图片 确认
            if(app.faceDataMap.forward.length>=1){
                app.uploadPhoto(app.uploadArg.file,app.uploadArg.e, app.uploadArg.paramData, app.uploadArg.index);
            }
        
            this.recoModal = false;
        },
        noticeInfo: function (e) {
            e.stopPropagation();
            e.preventDefault(); 
            var that = this;
            app.isLoading = true;
        
            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetESignDocumentPageCount",
                datatype: "json",
                data: {
                    "docTyp": "01",
                    "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var result = response["JSON_RESULT_DATA"];

                app.document = [];

                for (var i = 0; i < result; i++) {
                    app.document.push('REST/GetESignDocument' + "?PageNumber=" + i + '&DocTyp=' + '01');
                    
                }

                that.docName = 'notice';

                app.documentIndex = 0;
                app.showPreNotice = false;
                app.showConfirmNotice = false;
                app.modalDocumentInfo = true;
                app.modalDocTitle = "投保须知";
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        reminderInfo: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            app.isLoading = true;

            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetESignDocumentPageCount",
                datatype: "json",
                data: {
                    "docTyp": "02",
                     "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var result = response["JSON_RESULT_DATA"];
                that.docName = 'reminder';
                app.document = [];
    
                for (var i = 0; i < result; i++) {
                    app.document.push('REST/GetESignDocument' + "?PageNumber=" + i + '&DocTyp=' + '02');
                }

                app.documentIndex = 0;
                app.showPreNotice = false;
                app.showConfirmNotice = false;
                app.modalDocumentInfo = true;
                app.modalDocTitle = "投保提示书";

                if(app.doubleShow){
                    app.setBtnState();
                }

            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        applicationInfo: function (e) {
            e.stopPropagation();
            e.preventDefault();
            app.isLoading = true;

            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetESignApplicationDocumentPageCount",
                datatype: "json",
                data:
                {
                   "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var result = response["JSON_RESULT_DATA"];
                app.docName = 'application';
                app.document = [];

                for (var i = 0; i < result; i++) {
                    app.document.push('REST/GetESignApplicationDocument' + "?PageNumber=" + i );
                }

                app.documentIndex = 0;
                app.showPreNotice = false;
                app.showConfirmNotice = false;
                app.modalDocumentInfo = true;
                app.modalDocTitle = "投保信息资料";
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        proposalInfo: function (e) {
            e.stopPropagation();
            e.preventDefault();
            app.isLoading = true;
            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetESignProposalDocumentPageCount",
                datatype: "json",
                data:
                {
                   "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var result = response["JSON_RESULT_DATA"];
                app.docName = 'proposal';
                app.document = [];

                for (var i = 0; i < result; i++) {
                    app.document.push('REST/GetESignProposalDocument' + "?PageNumber=" + i );
                }

                app.documentIndex = 0;
                app.showPreNotice = false;
                app.showConfirmNotice = false;
                app.modalDocumentInfo = true;
                app.modalDocTitle = "计划书";
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        bankTransfer: function () {

            app.isLoading = true;  

            $.ajax({
                async: true,
                type: "POST",
                url: "REST/GetESignBankTransferData",
                datatype: "json",
                timeout: 60000,
                data:
                {
                   "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                app.bankFormItem = response["JSON_RESULT_DATA"];
                app.docName = 'bank';
                app.showBankTransfer = true;
                app.sqState =  true;
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },

        //打开双录文档说明 (保险产品信息)
        infoHandle:function(e){
            e.stopPropagation();
            e.preventDefault();
            this.docName = 'info';
            
            this.isLoading = true;
            this.doubleDocumentInfo = true;
            this.showPdf = false;
            this.showAudio = false;
        
            this.modalDocTitle =  '保险产品信息';
           
            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetAdVdProductInfo",
                datatype: "json",
                data:
                {
                   "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var data = response["JSON_RESULT_DATA"];
                app.docData = data;
                app.setBtnState();
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                alert(errorThrown);
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
  
        },

        //产品条款
        clauseHandle:function(e){
            e.stopPropagation();
            e.preventDefault();
                
            this.isLoading = true;
            
            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetStaticDocumentPageCount",
                datatype: "json",
                data: {
                    "docTyp": "PROD_PRV",
                    "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                
                
                var result = response["JSON_RESULT_DATA"];
                app.docName = 'clause';
                app.document = [];
                
                for (var i = 0; i < result; i++) {
                    app.document.push('REST/GetStaticDocument' + "?PageNumber=" + i + '&DocTyp=' + 'PROD_PRV'+'&eAppNumber='+app.eAppNumber);//SessionAppNumBugFix_houjin
                }
                app.documentIndex = 0;
                app.showPreNotice = false;
                app.showConfirmNotice = false;
                app.showPdf = true;
                app.showAudio = false;
                app.doubleDocumentInfo = true;
                app.modalDocTitle =  '产品条款';
                app.setBtnState();
                
                app.isLoading = false;
              
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });


        },

        //产品说明书    
        instructionsHandle:function(e){
            e.stopPropagation();
            e.preventDefault();
            
            this.isLoading = true;

            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetStaticDocumentPageCount",
                datatype: "json",
                data: {
                    "docTyp": "PROD_DESC",
                     "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;

                var result = response["JSON_RESULT_DATA"];
                app.docName = 'instructions';
                app.document = [];
    
                for (var i = 0; i < result; i++) {
                    app.document.push('REST/GetStaticDocument' + "?PageNumber=" + i + '&DocTyp=' + 'PROD_DESC');
                }
                
                app.documentIndex = 0;
                app.showPreNotice = false;
                app.showConfirmNotice = false;
                app.showPdf = true;
                app.showAudio = false;
                app.doubleDocumentInfo = true;
                app.modalDocTitle =  '产品说明书';

                app.setBtnState();

                localStorage.setItem('clickEle','instructions')
                localStorage.setItem('documentLen',result)
               
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });


        },

        //产品责任
        responseHandle:function(e){
            e.stopPropagation();
            e.preventDefault();
            
            this.isLoading = true;
            localStorage.setItem('currentEle','');
            this.getAudioList('response');
           
            var len = this.productData.length;

            if(this.productData.length >= 1){
                this.productData.forEach(function(item, index){
                    document.getElementById('audio' + index).load();
                })
            }


            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetStaticDocumentPageCount",
                datatype: "json",
                data: {
                    "docTyp": "PROD_LBT",
                    "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var result = response["JSON_RESULT_DATA"];
                app.docName = 'response';
                app.document = [];
    
                for (var i = 0; i < result; i++) {
                    app.document.push('REST/GetStaticDocument' + "?PageNumber=" + i + '&DocTyp=' + 'PROD_LBT'+'&eAppNumber='+app.eAppNumber);//SessionAppNumBugFix_houjin
                }

                app.documentIndex = 0;
                app.showPreNotice = false;
                app.showConfirmNotice = false;
                app.showPdf = true;
                app.showAudio = true;
                app.doubleDocumentInfo = true;
                app.modalDocTitle =  '产品责任';
                
                app.setBtnState();

                localStorage.setItem('clickEle','response')
                localStorage.setItem('documentLen',result)

                
              
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });


        },

        //免责条款
        exemptionHandle:function(e){
            e.stopPropagation();
            e.preventDefault();
            
            this.isLoading = true;
            localStorage.setItem('currentEle','');

            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetStaticDocumentPageCount",
                datatype: "json",
                data: {
                    "docTyp": "ESCP_CLA",
                    "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var result = response["JSON_RESULT_DATA"];
                app.docName = 'exemption';
                app.document = [];
    
                for (var i = 0; i < result; i++) {
                    app.document.push('REST/GetStaticDocument' + "?PageNumber=" + i + '&DocTyp=' + 'ESCP_CLA'+'&eAppNumber='+app.eAppNumber);//SessionAppNumBugFix_houjin
                }

                app.documentIndex = 0;
                app.showPreNotice = false;
                app.showConfirmNotice = false;
                app.showPdf = true;
                app.showAudio = true;
                app.doubleDocumentInfo = true;
                app.modalDocTitle =  '免责条款说明书';

                app.setBtnState();

                localStorage.setItem('clickEle','exemption')
                localStorage.setItem('documentLen',result)
              
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });

        },

        //设置按钮延时高亮
        setBtnState:function(){
            this.closeBtnState = true;
            var btnTimer  = null;
            if(btnTimer){
                clearInterval(btnTimer);
            }
        
            btnTimer = setInterval(function(){
                app.closeBtnState = false;
                clearInterval(btnTimer);
            },5000)
          
        },

        play:function(id,index){
            var playBtnBox = document.getElementById(id);
            
            var currentEle = localStorage.getItem('currentEle');
            if(currentEle && currentEle != id){
                var beforeBtnBox = document.getElementById(currentEle);
                beforeBtnBox.pause();

                this.productData.forEach(function(item,index){
                    item.playFlag = false;
                }); 
            }
            
            localStorage.setItem('currentEle',id);
            if(playBtnBox !== null){
                if(this.productData[index].playFlag){
                    playBtnBox.pause();
                    
                    this.productData[index].playFlag = false;
                }else{
                    playBtnBox.play();

                    playBtnBox.addEventListener('ended',function(){
                        app.productData[index].playFlag = false;
                    });
                    
                    this.productData[index].playFlag = true;
                }
            }
            
        },

        getAudioList:function(name){
            // 产品列表
            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetAudioList",
                datatype: "json",
                data:
                {
                   "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                var data = response["JSON_RESULT_DATA"];
                app.productData = '';
                if(name=='exemption'){
                   // 免责条款
                    app.productData = data.escpClaList;
                }else if(name=='response') {
                    //产品责任
                    app.productData = data.prodLbtList;
                }else{
                    alert('播报加载异常，请重新刷刷新页面~');
                }
                
            }).error(function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },

        // 打开财务问卷
        financialInfo: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.isLoading = true;
            var that = this;
            app.cancleState = false;
            app.isN = false;
            app.$refs.cwwqCom.cwSureClick = false;
            //app.documentList.push('financial');
            $.ajax({
                async: true,
                type: "POST",
                url: "REST/GetESignFinancialInfo",
                datatype: "json",
                timeout: 60000,
                data:
                {
                   "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                that.isLoading = false;
                that.financialFormItem = response["JSON_RESULT_DATA"];
   
                
                that.financialFormItem.financialInfoList.forEach(function(item){
                    // if(item.isEmployee == 'Y'){
                    //     item.gsArr.push();
                    // }
                    if(item.isEmployee == 'Y'){
                        item.doubleChoose1 = true;
                    }else{
                        item.doubleChoose1 = false;
                    }
                    if(item.isPrivateOwner == 'Y'){
                        item.doubleChoose2 = true; 
                    }else{
                        item.doubleChoose2 = false; 
                    }
                    if(item.isWorkOther == 'Y'){
                        item.doubleChoose3 = true; 
                    }else{
                        item.doubleChoose3 = false;
                    }

                    if(item.salary1){
                        item.salary1 = toNum(item.salary1.toString());
                    }
                    if( item.salary2){
                        item.salary2 = toNum(item.salary2.toString());
                    }
                    if(item.salary3){
                        item.salary3 = toNum(item.salary3.toString());
                    }
                    
                    if(item.unearnedIncome1){
                        item.unearnedIncome1 = toNum(item.unearnedIncome1.toString());
                    }

                    if(item.unearnedIncome2){
                        item.unearnedIncome2 = toNum(item.unearnedIncome2.toString());
                    }
                    if(item.unearnedIncome3){
                        item.unearnedIncome3 = toNum(item.unearnedIncome3.toString());
                    }
                             
                    
                    item.propertyList.forEach(function(item2, index2){
                        if(item2.buyPrice){
                            item2.buyPrice = toNum(item2.buyPrice.toString());
                        }

                        if(item2.nowPrice){
                            item2.nowPrice = toNum(item2.nowPrice.toString());
                        }

                        if(item2.remainLoanAmount){
                            item2.remainLoanAmount = toNum(item2.remainLoanAmount.toString());
                        }

                    });

                    item.carList.forEach(function(item2, index2){
                        if(item2.buyPrice){

                            item2.buyPrice = toNum(item2.buyPrice.toString());
                        }
                    });

                    if(item.otherLoanAmountState){
                        item.otherLoanAmountState = toNum(item.otherLoanAmountState.toString());
                    }

                    if(item.depositStockFundBondAmount){
                        item.depositStockFundBondAmount = toNum(item.depositStockFundBondAmount.toString());
                    }


                    

                    item.companyList.forEach(function(item2, index2) {
                        if(item2.registerCaptail){
                            item2.registerCaptail = toNum(item2.registerCaptail.toString());
                        }

                        if(item2.netWorth){
                            item2.netWorth = toNum(item2.netWorth.toString());
                        }

                        if(item2.liabilitiesAmount){
                            item2.liabilitiesAmount = toNum(item2.liabilitiesAmount.toString());
                        }

                        if(item2.turnover1){
                            item2.turnover1 = toNum(item2.turnover1.toString());
                        }
                        if(item2.turnover2){
                            item2.turnover2 = toNum(item2.turnover2.toString());
                        }
                        if(item.turnover3){
                            item2.turnover3 = toNum(item2.turnover3.toString());
                        }


                        if(item2.grossProfit1){
                            item2.grossProfit1 = toNum(item2.grossProfit1.toString());
                        }
                        if(item.grossProfit2){
                            item2.grossProfit2 = toNum(item2.grossProfit2.toString());
                        }
                        if(item2.grossProfit3){
                            item2.grossProfit3 = toNum(item2.grossProfit3.toString());
                        }

                        if(item2.netProfit1){
                            item2.netProfit1 = toNum(item2.netProfit1.toString());
                        }
                        if(item2.netProfit2){
                            item2.netProfit2 = toNum(item2.netProfit2.toString());
                        }
                        if(item2.netProfit3){
                            item2.netProfit3 = toNum(item2.netProfit3.toString());
                        }

                    })

                });
             
                that.showFinancial = true;

                that.financialInfoListLen = that.financialFormItem.financialInfoList.length;


            }).error(function (jqXHR, textStatus, errorThrown) {
                that.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        fnaCQInfo: function (e) {
            e.stopPropagation();
            e.preventDefault();

            app.isLoading = true;

            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetESignFnaDocumentPageCount",
                datatype: "json",
                data:
                {
                   "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var result = response["JSON_RESULT_DATA"];
                app.docName = 'fnacq';
                app.document = [];

                for (var i = 0; i < result; i++) {
                    app.document.push('REST/GetESignFnaDocument' + "?PageNumber=" + i );
                }

                app.documentIndex = 0;
                app.showPreNotice = false;
                app.showConfirmNotice = false;
                app.modalDocumentInfo = true;
                app.modalDocTitle = "人身保险客户需求分析问卷";
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        fnaNBInfo: function (e) {
            e.stopPropagation();
            e.preventDefault();
            app.isLoading = true;

            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetESignFnaDocumentPageCount",
                datatype: "json",
                data:
                {
                   "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var result = response["JSON_RESULT_DATA"];
                app.docName = 'fnanb';
                app.document = [];

                for (var i = 0; i < result; i++) {
                    app.document.push('REST/GetESignFnaDocument' + "?PageNumber=" + i );
                }

                app.documentIndex = 0;
                app.showPreNotice = false;
                app.showConfirmNotice = false;
                app.modalDocumentInfo = true;
                app.modalDocTitle = "新型人身保险产品风险承受能力测评问卷";
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        //投保申明时事件
        declarationInfo: function (e) {

            e.stopPropagation();
            e.preventDefault();
            app.docType= 'declaration';
            app.isLoading = true;
            $('body').addClass('hidden');
            $.ajax({
                async: true,
                type: "GET",
                url: "REST/GetESignDocumentPageCount",
                datatype: "json",
                data: {
                    "docTyp": "03",
                     "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var result = response["JSON_RESULT_DATA"];

                app.document = [];
                app.docName = 'declaration';
                for (var i = 0; i < result; i++) {
                    app.document.push('REST/GetESignDocument' + "?PageNumber=" + i + '&DocTyp=' + '03');
                }
                //20193312 $('body').removeClass('hidden');
                app.documentIndex = 0;
                app.showPreNotice = false;
                app.showConfirmNotice = false;
                app.modalDocumentInfo = true;
                app.modalDocTitle = "被保险人与投保人声明";
                if(app.doubleShow){
                    app.setBtnState();
                }

                $('body').removeClass('hidden');//20193312
                
            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        confirmDocument: function () {
            //app.isLoading = true;
            app.agreeState = true;   
            
            if(app.showDocFin){
                app.HasFinData(app.eAppNumber,function(data){
                    if(data.HasFinData == 'Y'){
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
                            app.agreeState = false;    
                            console.log("textStatus:" + textStatus);
                            console.log("errorThrown:" + errorThrown);
                        });
                    }else{
                        app.$Modal.confirm({
                            title: "提示",
                            content: '请确认是否在线填写财务问卷',
                            onOk: function () {
                                app.agreeState = false;
                            },
                            onCancel:function(){
                                $.ajax({
                                    async: true,
                                    type: "POST",
                                    url: "REST/ConfirmDocument",
                                    datatype: "json",
                                }).success(function (response) {
                                    app.isLoading = false;
                                    app.documentState = true;
                                    console.log("confirm document");
                                    app.confirmEDoc(); 
                    
                                    app.saveTimerInfo(app.eAppNumber);
                    
                                    
                                }).error(function (jqXHR, textStatus, errorThrown) {
                                    app.isLoading = false;
                                    app.agreeState = false;   
                                    console.log("textStatus:" + textStatus);
                                    console.log("errorThrown:" + errorThrown);
                                });
                            }
                        });
                    }
                }) 
            }else{
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
                    app.agreeState = false;    
                    console.log("textStatus:" + textStatus);
                    console.log("errorThrown:" + errorThrown);
                });

            }    
        },

        cwGO:function(){
            app.showFinancial = false;
            app.cwTipModal = false;
            
            $('.chooseN').trigger('click');
        },


        cwBack:function(){
            app.cwTipModal = false;
        },
        
        //  检查剩余时间
        checkTime:function(timeInfo,typeName,type,cliNm){
            if(timeInfo.IsTimeOut == 'Y'){
                this.timeTipModal = true;
                this.timeMsg = '对不起，您的操作已超时，请重新开始！';
               
                return false;
            }else{
                switch(typeName){
                    case 'yjcl':  //语句抄录
                        if(timeInfo.RemainTime <=15 && timeInfo.RemainTime >= 10){
                            // 15分钟的情况 
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于15分钟，请注意！';  
                        }else if(timeInfo.RemainTime <=10 && timeInfo.RemainTime >= 5){
                            // 10分钟的情况        
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于10分钟，请注意！';
            
                        }else if(timeInfo.RemainTime <=5 && timeInfo.RemainTime > 0){
                            // 5分钟的情况     
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于5分钟，请注意！';
                        }else{
                            this.flowGo(typeName,type); 
                        }
                         
                        break;
                    case 'dzqm': 
                        if(timeInfo.RemainTime <=10 && timeInfo.RemainTime >= 5){
                            // 10分钟的情况        
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于10分钟，请注意！';
                        }else if(timeInfo.RemainTime <=5 && timeInfo.RemainTime > 0){
                            // 5分钟的情况     
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于5分钟，请注意！';
                        }else{
                            this.flowGo(typeName,type,cliNm);  
                        }
                       
                        break;
                    case 'jzr': 
                        this.flowGo(typeName,type,cliNm); 
                        
                        break;    
                    case 'rlsb':
                        if(timeInfo.RemainTime <=5 && timeInfo.RemainTime > 0){
                            // 5分钟的情况     
                            this.timeTipModal = true;
                            this.timeMsg = '剩余时间少于5分钟，请注意！';
                        }else{
                            this.flowGo(typeName,type); 
                        }
                         
                        break;
                    default:
                        alert('网络异常，请刷新页面试试看！');
                         
                }
  

            }
        },

        // 重新开始电子签名流程
        flowRestart:function(){
            this.clearSignInfo(this.eAppNumber);
            
            this.saveTimerInfo(this.eAppNumber);

            this.geteAppInfo(this);
            this.getCliInfo(this);

            this.timeTipModal = false;
            this.recoModal = false;
        },

        // 继续电子签名
        flowGo:function(typeName,type,cliNum){
            if(typeName == 'yjcl'){ //语句抄录
                var owner = this.getOwnerSignCliInfo();
                initSign(owner);
                initTemplateData();
                var res = apiInstance.showCommentDialog("30");

                if (res == RESULT_OK) {
                    document.getElementById("app").style.display = "none";
                } else {
                    console.log("Error:" + res);
                }
                
            }else if(typeName == 'dzqm'){ //电子签名

                var owner = this.getOwnerSignCliInfo();
                if(type == 'W'){  //见证人
                    var cli = this.getSignCliInfoByCliNum2(cliNum,type);
                }else{
                    var cli = this.getSignCliInfoByCliNum(cliNum,type);
                }


                if (cliNum != owner.cliNum || !app.newProductType) {
                    initSign(cli);
                    initTemplateData();
                }else{
                   
                }

                var res = apiInstance.showSignatureDialog("20");

                if (res == RESULT_OK) {
                    document.getElementById("app").style.display = "none";
                } else {
                    console.log("Error:" + res);
                }


            }else if(typeName == 'jzr'){

                var owner = this.getOwnerSignCliInfo();
                if(type == 'W'){  //见证人
                    var cli = this.getSignCliInfoByCliNum2(cliNum,type);
                }else{
                    var cli = this.getSignCliInfoByCliNum(cliNum,type);
                }


                if (cliNum != owner.cliNum || !app.newProductType) {
                    initSign(cli);
                    initTemplateData();
                }else{
                
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

        // 放弃电子签名    
        flowCancel:function(){
            this.clearSignInfo(this.eAppNumber);
            //this.saveTimerInfo(this.eAppNumber);
            window.location = './SubmittedList';
            //this.timeTipModal = false;
        },
        //显示新型产品风险语句抄录  [doublerecord-2nd-phase carrier.zhang]
        showComment: function (typeName) {
            this.typeName = typeName;
            this.sentenceState = true;
            this.commentTyp = "30";
                                
            app.getTimerInfo(app.eAppNumber,function(data){
                app.checkTime(data,typeName,'O');
            });
        },
        //显示新型产品风险抄录预览弹窗 [doublerecord-2nd-phase carrier.zhang]
        showCommentState: function () {
           this.commentStateModal=true;
        },
        //关闭新型产品风险抄录预览弹窗 [doublerecord-2nd-phase carrier.zhang]
        closeCommentState:function(){
            this.commentStateModal=false;
        },
        // 判断是否阻止触发电子签名 (显示PopState div 盖住下方签名Div)
        blockShowSign:function(eSignStatus,cli,confirmedSignStatementClientTypeList){
           var blocked = eSignStatus != 'E2'|| cli.SignFileId;
           var notConfirmed = confirmedSignStatementClientTypeList.indexOf(cli.linkTyp) == -1;
           var isAdult = cli.linkTyp != 'G';//Not Guarded.
           return blocked || (notConfirmed && isAdult)//状态不为E2 或者已经签名 或者 没有确认签名声明(成人) 就阻止触发签名.
        },
        // 电子签名事件入口
        showSign: function (cli,cliNum,type,typeName) {
            this.currentData = cli;
            cli.qmBefore = false;
            if(app.newProductType){
                if(!app.commentFileId){
                    return false;
                }
				
            }
            
            
            if(type != 'O'){
                if(!this.signCliInfo[0].SignFileId){
                    alert('请先进行投保人签名');
                  
                }else{
                    this.typeName = typeName;
                    app.getTimerInfo(app.eAppNumber,function(data){
                        app.checkTime(data,typeName,type,cliNum);
                    });
                }
            }else{
                this.typeName = typeName;
                app.getTimerInfo(app.eAppNumber,function(data){
                    app.checkTime(data,typeName,type,cliNum);
                });
            }
        },
    
        //上传图片
        uploadPhoto:function(file,e,paramData,index){ 
            app.isLoading = true;
            $.ajax({
                async: true,
                type: "POST",
                url: "REST/UploadBioFacial",
                datatype: "json",
                data: paramData
            }).success(function (response) {
                
                var addFile = {
                    "index":index,
                    "name": file.name,
                    "url": e.target.result,
                    "status": "finished"
                };

                app.isLoading = false;
                // 人脸识别 图片上传已完成
                var JSON_RESULT_ERROR = response.JSON_RESULT_ERROR;

                if(JSON_RESULT_ERROR.length>=1){
                    alert('网络异常，请重新上传')
                    return;
                }else{
                    app.isBioFrFileIdUploaded(app.signCliInfo[app.curIndex].cliNum, function(data){
                        if(data == 'Y'){
                            app.signPhoto.push(1);
                            app.signCliInfo[app.curIndex].bioFacialTyp = 'PT';
                
                            if(app.signPhoto.length == app.dataLen2 && app.eSignStatus !='E5'){
                                app.confirmEBioSignature();  
                                //20193312  
                                //if (app.isAgentPolicy == 'Y')
                                //{
                                //    app.confirmEAgentSignature(); 
                                //}
                            //<<20193312
                                var stateTimer = setInterval(function(){
                                    if (app.isAgentPolicy == 'Y' && app.eSignStatus == 'E4')
                                    {
                                        app.confirmEAgentSignature(); 
                                        clearInterval(stateTimer);
                                    }
                                },1000);                    
                            //>>20193312
                            }
                        }else if(data == 'N'){
                            alert('网络不稳定，请重新拍照或上传');
                        }
                    });
                }

            }).error(function (jqXHR, textStatus, errorThrown) {
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },



        getGlobalState:function(state,is_agent_policy){
            //alert(state);
            var that = this;
            if(state == 'E1'){
                this.documentState = false; 
                this.commentState = true;  
                this.SignFileState = true;
                this.BIOFicialState = true;
                this.jzrState = true;
                this.finishESign = true;

            }else if(state == 'E2'){ 
                this.documentState = true; 
                this.commentState = false;
                this.SignFileState = false;
                this.BIOFicialState = true;
                this.jzrState = true;
                this.finishESign = true;
                this.documentList = [];
                this.documentList = ['info','clause','instructions','response','exemption','notice', 'reminder', 'application', 'proposal', 'bank', 'fnacq', 'fnanb', 'declaration']
                if(localStorage.getItem('financial') == 'yes'){
                    this.documentList.push("financial");
                }
                for(var i=0; i < this.dataLen; i++){
                    this.confirmDocumentList.push(i);   
                }
            }else if(state == 'E3'){ 
                this.documentState = true; 
                this.commentState = true;
                this.SignFileState = true;
                this.BIOFicialState = false;
                this.jzrState = true;
                this.finishESign = true;
                this.documentList = [];
                this.documentList = ['info','clause','instructions','response','exemption','notice', 'reminder', 'application', 'proposal', 'bank', 'fnacq', 'fnanb', 'declaration']
                if(localStorage.getItem('financial') == 'yes'){
                    this.documentList.push("financial");
                }
                for(var i=0; i < this.dataLen; i++){
                    this.confirmDocumentList.push(i);   
                }

            }else if(state == 'E4'){ 
                this.documentState = true; 
                this.commentState = true;
                this.SignFileState = true;
                this.BIOFicialState = true;
                this.jzrState = false;
                this.finishESign = true;   
                this.documentList = [];
                this.documentList = ['info','clause','instructions','response','exemption','notice', 'reminder', 'application', 'proposal', 'bank', 'fnacq', 'fnanb', 'declaration']
                if(localStorage.getItem('financial') == 'yes'){
                    this.documentList.push("financial");
                }
                for(var i=0; i < this.dataLen; i++){
                    this.confirmDocumentList.push(i);   
                }       

            }else if(state == 'E5'){ 

                this.documentState = true; 
                this.commentState = true;
                this.SignFileState = true;
                this.BIOFicialState = true;
                this.jzrState = true;
                this.finishESign = false; 
                this.documentList = [];
                this.documentList = ['info','clause','instructions','response','exemption','notice', 'reminder', 'application', 'proposal', 'bank', 'fnacq', 'fnanb', 'declaration']
               
                if(localStorage.getItem('financial') == 'yes'){
                    this.documentList.push("financial");
                }
                for(var i=0; i < this.dataLen; i++){
                    this.confirmDocumentList.push(i);   
                }

            }
            //20193058
            if (is_agent_policy == 'Y'){
                this.jzrPanelState = false;
            }else{
                this.jzrPanelState = true;
            }
        },
        //获取总数据
        getCliInfo: function (app,callback) {   
            var that = this;
            
            $.ajax({
                async: false,
                type: "GET",
                url: "REST/GetESignCliInfo",
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

                data.cliInfo.forEach(function(item,index){
                    if(item.age<18&&item.linkTyp=='I'){
                        app.isInsuredChild=true;
                        app.insuredChildName=item.cliNm;
                    }
                })

                data.signCliInfo.forEach(function(item,index){
                    if(item.linkTyp != 'W'){
                        qmArr.push(item);
                    }else{
                        jzArr.push(item);
                    }   

                });

                var oIndex = 0;
                qmArr.forEach(function(item, index){
                    if(item.linkTyp == 'O'){
                        oIndex =  index;
                    }
                });
            
            var child = [];
            var oArr = qmArr.splice(oIndex,1);
            qmArr = oArr.concat(qmArr);

                jzArr.forEach(function(item){   
                    if(item.SignFileId){
                        app.getFileByFileId(item.SignFileId,app.eAppNumber,function(data){
                             item.SignFileImage = data;
                         });
                        
                     }

                })

                app.jzrInfo = jzArr;
                app.signCliInfo = qmArr;
                
                app.signPhoto = [];

                app.signPhoto2 = [];
                
                app.cliInfo.forEach(function(item, index){
                    
                    if(item.linkTyp == 'O'){
                        app.CommentFileId = item.CommentFileId;                      
                        app.accCliNum.push(item.cliNum);
                    }

                    if(item.linkTyp == 'I'){
                        app.accCliNum.push(item.cliNum);
                    }
                });

                
                app.signCliInfo.forEach(function(item,index){
                    
                    if(item.SignFileId){
                       app.getFileByFileId(item.SignFileId,app.eAppNumber,function(data){
                            item.SignFileImage = data;
                        });
                        
                        app.qmFinish.push(item.SignFileId);
                        app.confirmedSignStatementClientTypeList.push(item.linkTyp);//初始化时有签名的自动设置成已确认签名
                    }
                    

                    if(item.linkTyp == 'O'){
                        if(item.CommentFileId && !item.SignFileId){
                            alert('您进行了错误操作');
                        }else{
                            that.commentFileId = item.CommentFileId;
                            that.CommentState = item.CommentStatus;
                        }

                        
                    }

                    
                    if(item.age < 18){
                        child.push(item)
                    }

                      
                    if(item.bioFacialTyp == 'FR' || item.bioFacialTyp == 'PT'){
                        app.signPhoto.push(item.cliNum);
                        app.signPhoto2.push(item.cliNum);
                    }                   
                    
                });
            
                app.dataLen = app.signCliInfo.length;
                app.dataLen2 = app.signCliInfo.length - child.length;

                
                if(callback instanceof Function){
                    callback();
                }

            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        // 获取图片
        getFileByFileId:function(fileId,eAppNumber,callback){
            $.ajax({
                async: false,
                type: "GET",
                url: "REST/GetFileByFileIdWithAppNumber",//SessionAppNumBugFix_houjin  新加一个方法替换了原方法GetFileByFileId
                datatype: "json",
                data: {
                    "FileId": fileId,
                    "eAppNumber": eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                console.log(response);
                //return response;
                if(callback instanceof Function){
                    callback(response);
                }
               
            
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },

        // 财务问卷状态
        HasFinData:function(eAppNumber,callback){
            $.ajax({
                async: false,
                type: "POST",
                url: "REST/HasFinData",
                datatype: "json",
                data: {
                    "eAppNumber": eAppNumber
                }
            }).success(function (response) {
              
                //return response;
                
                if(callback instanceof Function){
                    var data = response["JSON_RESULT_DATA"];
                    callback(data);
                }
               
            
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },


        getBankList: function (app) {
            var that = this;
            $.ajax({
                async: false,
                type: "GET",
                url: "REST/GetCommonResourceList",
                datatype: "json",
                data: {
                    "resourceId": "bank_options"
                }
            }).success(function (response) {
                that.bankList = response["JSON_RESULT_DATA"];

            
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
         getocrBankList: function (app) {
            var that = this;
            $.ajax({
                async: false,
                type: "GET",
                url: "REST/GetCommonResourceList",
                datatype: "json",
                data: {
                    "resourceId": "ocr_bank_options"
                }
            }).success(function (response) {
                that.ocrbankList = response["JSON_RESULT_DATA"];

            
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        getIdTypList: function (app) {
            $.ajax({
                async: false,
                type: "GET",
                url: "REST/GetCommonResourceList",
                datatype: "json",
                data: {
                    "resourceId": "id_document_types"
                }
            }).success(function (response) {
                app.cardList = response["JSON_RESULT_DATA"];
                                        

            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },       
        
        // 银行人员
        getEappBankClient:function (eappNumber,callback) {
            var that = this;
            $.ajax({
                async: false,
                type: "GET",
                url: "REST/GetEappBankClient",
                datatype: "json",
                data: {
                    "eappNumber": eappNumber
                }
            }).success(function (response) {
                var data = response["JSON_RESULT_DATA"].eAppBankClient;
                that.eappBankClientList = data;
                if(callback instanceof Function){
                    callback(data);
                }                  
                
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },       

        getEappBankAccount: function (eappNumber) {
            var that = this;
            $.ajax({
                async: false,
                type: "GET",
                url: "REST/GetEappBankAccount",
                datatype: "json",
                data: {
                    "eappNumber": eappNumber
                }
            }).success(function (response) { 
            
                var strDataTemp = response["JSON_RESULT_DATA"];
            
                that.deductionAccount = strDataTemp.deductionAccount;
                that.paymentAccount = strDataTemp.paymentAccount;
                that.payOnePerson = strDataTemp.paymentAccount[0];
                that.TerrName = strDataTemp.TerrName;
                that.TerrNameWithProv = strDataTemp.TerrNameWithProv;


                that.paymentAccount.forEach(function(item, index){
                
                    if(item.SaveInd == 'Y'){
                        that.cliSelect.push(item.holderName);
                    }

                });
            
                that.addAccNum = that.paymentAccount.length; //3
                
                var tbIndex = 0;
                var json = that.deductionAccount;

                if(that.bankList.length < 1 ){
                    return;
                }

                that.paymentAccount.forEach(function(item){
                        
                        that.bankList.forEach(function(value, index){
                            if(value.key == item.bankCode){
                                item.bankName = value.value;
                            }
                    
                        });
                        
                })

                

                if(that.deductionAccount.length ==1){
                    that.personIndex = 0;
                    that.IsSameAsInsured = true;
                }else{

                    json.forEach(function(item, index){

                        if(item.IsSameAsInsured){
                            that.IsSameAsInsured = true;
                        }else{
                            that.IsSameAsInsured = false;
                        }

                        if(item.accountNum){
                            tbIndex = index;
                        
                        }
                    });

                    that.personIndex = tbIndex;

                    var isoK = that.paymentAccount.some(function(item){
                        return item.holderName == that.deductionAccount[that.personIndex].holderName;
                    });
        
                    if(isoK){
                        that.sameYes = true;
                    }else{
                        that.sameYes = false;
                    }    
                }

                that.bankList.forEach(function(item, index){
                    
                    if(item.key == json[that.personIndex].bankCode){ //holderCardType
                        that.chooseBackCode = item.key;
                        
                    }
                });

                
                that.cardList.forEach(function(item, index){
                    
                    if(item.key == json[0].holderCardType){
                    
                        that.cardTypeCn = item.value;
                    }
                });


                
                if(that.deductionAccount[that.personIndex].bankCode && that.deductionAccount.length == 2){
                    if(that.personIndex == 0){
                        that.deductionAccount[0].bankCode = that.deductionAccount[0].bankCode
                        that.deductionAccount[1].bankCode = '001'
                    }else if(that.personIndex == 1){
                    that.deductionAccount[1].bankCode = that.deductionAccount[1].bankCode
                        that.deductionAccount[0].bankCode = '001'
                    }    
                    
                }


                if(json[that.personIndex].showOwner == 'Y'){
                    that.disabledGroup = '投保人'
                }else{
                    that.disabledGroup = '被保险人'
                }




            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        SaveEappBankAccount: function (accountChangeData,callback) {   
        
            $.ajax({
                async: true,
                type: "POST",
                url: "REST/SaveEappBankAccount",
                datatype: "json",
                contentType: "application/json",
                data:  accountChangeData
            
                
            }).success(function (response) {

                if(callback instanceof Function){
                    callback();
                }
                

            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
            

            
        
        },
        geteAppInfo: function (app,callback) {

        //SessionAppNumBugFix_houjin 从隐藏控件取值
         var hideApplicationNumber=  document.getElementById("hideApplicationNumber");
         app.eAppNumber=hideApplicationNumber.value;

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

                if(data.isNewDoubleRecord == 'Y'){
                    app.doubleShow = true;
                }

                app.getGlobalState(app.eSignStatus,app.isAgentPolicy); //获取全局状态    

                if(callback instanceof Function){
                    callback();
                }

            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        //根据[用/客]户类型缩写,显示中文类型
        getLinkTypDesc: function (linkTyp) {
            if (linkTyp == "O") {
                return "投保人";
            } else if (linkTyp == "I") {
                return "被保险人";
            } else if (linkTyp == "T") {
                return "其他被保险人";
            } else if (linkTyp == "G") {
                return "监护人";
            } else if (linkTyp == "W") {
                return "见证人";
            }

            else {
                return "";
            }
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
        getCliInfoByCliNum: function (cliNum) {
            var ret;

            for (var idx in this.cliInfo) {
                var cli = this.cliInfo[idx];

                if (cli.cliNum == cliNum) {
                    ret = cli;
                    break;
                }
            }

            return ret;
        },
        getSignCliInfoByCliNum: function (cliNum,type) {
            var ret;

            for (var idx in this.signCliInfo) {
                var cli = this.signCliInfo[idx];

                if (cli.cliNum == cliNum && cli.linkTyp == type) {
                    ret = cli;
                    break;
                }
            }

            return ret;
        },
        getSignCliInfoByCliNum2: function (cliNum,type) {
            var ret;

            for (var idx in this.jzrInfo) {
                var cli = this.jzrInfo[idx];

                if (cli.cliNum == cliNum) {
                    ret = cli;
                    break;
                }
            }

            return ret;
        },
        getOwnerCliInfo: function () {
            var ret;

            for (var idx in this.cliInfo) {
                var cli = this.cliInfo[idx];

                if (cli.linkTyp == "O") {
                    ret = cli;
                    break;
                }
            }

            return ret;
        },
        getOwnerSignCliInfo: function () {
            var ret;

            for (var idx in this.signCliInfo) {
                var cli = this.signCliInfo[idx];

                if (cli.linkTyp == "O") {
                    ret = cli;
                    break;
                }
            }

            return ret;
        },
        addAcc: function (){
        // this.addAccountState = true   
            var myData = {
                APPNum:'',
                AccountAuthType:'DCA',
                BankAcctId:'',
                IsSameAsInsured:false,
                SaveInd:'N',
                accountNum:'',
                accountPlace: app.TerrNameWithProv,
                accountbranch: app.TerrName+ '分行',
                asdca: false,
                bankCode: '',
                cliNum: '',
                holderCardNum: '',
                holderCardType: '',
                holderCardTypeDesc: '',
                holderName: '',
                isFinished: '', 
                relToInsured: '',
                showOwner: ''

            }

            var count = 0;
            myData.eappBankClientList = this.eappBankClientList;
            //this.accountData.push(myData);

            var isoK = app.paymentAccount.some(function(item){
                return item.holderName == app.deductionAccount[app.personIndex].holderName;
            });

            if(isoK){
                app.sameYes = true;
            }else{
                app.sameYes = false;
            }    
  
                 
            this.cliSelect.push(this.lastChoose);
            if(this.cliSelect.length < 1){
                this.cliSelect.push(this.lastChoose);
            }else{
                this.cliSelect.forEach(function(item,index,arrray){
                    if(arrray.indexOf(app.lastChoose) == -1){
                        if(app.lastChoose != ''){
                            arrray.push(app.lastChoose); 
                         
                        }
                    }else{

                    }
                })
            }
            

            var payLen = this.paymentAccount.length;
            
            if(payLen <= this.eappBankClientList.length){
                this.paymentAccount.push(myData); 
            }
            
            
        },
        del: function (item, index){
            if(item.holderName == app.deductionAccount[app.personIndex].holderName){
                app.sameYes = false;
            }
            this.paymentAccount.splice(index,1);
            this.addAccNum -- ;
            this.addState = false;
            this.lastChoose = ''; 

            this.cliSelect.forEach(function(data, index2, arrray){
                if(data == item.holderName){
                    arrray.splice(index2,1);
                }
            });
            
            
        },
        
        accountCheck:function(e,data){
            if(data == ''){
                e.target.className = 'ivu-input ivu-input-default newBorder';
            }else{
                e.target.className = 'ivu-input ivu-input-default'
            }
        },

        // 保存账号修改
        accountOk: function (e){
            e.stopPropagation();
            e.preventDefault();
            var bankAccountTimer = null;
            var accValidaata = false;
            var postData;
            var bankAccountRequest = {};
            //app.accountCheck($.event,app.deductionAccount[app.personIndex].accountbranch);
            if(app.deductionAccount.length == 1){
                //app.deductionAccount = app.deductionAccount;            
                var bankAccountRequest =  {
                    bankAccountRequest:{
                        deductionAccount:app.deductionAccount,
                        paymentAccount:app.paymentAccount
                    }    
                    //eductionAccount:app.deductionAccount
                }

                app.deductionAccount.forEach(function(item, index){
                    if(!item.accountNum || !item.accountPlace || !item.accountbranch){
                        accValidaata = true;
                    }
                    
                });

            }else{
                if(app.personIndex == 0){
                    postData = app.deductionAccount.slice(0,1)
                }else{
                    postData = app.deductionAccount.slice(1,2)
                }   

                postData.forEach(function(item, index){
                    if(!item.accountNum || !item.accountPlace || !item.accountbranch){
                        accValidaata = true;
                    }
                    
                });
                var arr = [];

                app.paymentAccount.forEach(function(item, index){
                    arr.push(item.holderName);
                    if(item.APPNum == '' || item.holderCardTypeDesc == '' || item.holderCardType ==''
                    || item.holderCardNum == '' || item.relToInsured == '' || item.cliNum == '' 
                    || item.accountNum == '' || item.accountPlace== '' || item.accountbranch == ''){
                        accValidaata = true;
                    }    
                });

                //app.deductionAccount[app.personIndex]
                var arr2 = arr.sort();
                for (var i =0; i< arr.length; i++){
                    if(arr2[i] == arr2[i + 1]){
                        accValidaata = true;
                        app.addState = true;
                    }
                }
                

                var bankAccountRequest =  {
                    bankAccountRequest:{
                        deductionAccount:postData,
                        paymentAccount:app.paymentAccount
                    }    
                    //eductionAccount:app.deductionAccount
                } 
    
                
                
                //app.deductionAccount = myData.splice(app.personIndex,1);
            }

            //bankAccountRequest.bankAccountRequest.paymentAccount = [];  //临时
           
            
           
            
            if(app.addState || accValidaata){
                //alert('请核对信息再提交');
               
            }else{
               this.SaveEappBankAccount(JSON.stringify(bankAccountRequest),function(){
                    if(app.eAppNumber){
                    app.bankTransfer();
                    }
                });
                this.defmod =  false;               
            }
            
        },
        accountCancel: function (data){
            this.defmod =  false
        
        },
        //签名包 状态
        isSignFileIdUploaded : function (SignCliTyp, CliNum, callBack) {
            app.isLoading = true;
            $.ajax({
                async: true,
                type: "GET",
                url: "REST/IsSignFileIdUploaded",
                datatype: "json",
                data:{
                    'SignCliTyp':SignCliTyp,
                    'CliNum':CliNum,
                    "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var errMsg = response["JSON_RESULT_ERROR"];
                var data = response["JSON_RESULT_DATA"];
                if(errMsg.length >= 1){
                    alert('网络异常，请稍后再试');
                }else{
                    if(callBack instanceof Function){
                        callBack(data);
                    }
                }
                
            }).error(function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
        // 人脸识别包 状态
        isBioFrFileIdUploaded : function (CliNum, callBack) {
            $.ajax({
                async: true,
                type: "GET",
                url: "REST/IsBioFrFileIdUploaded",
                datatype: "json",
                data:{
                    'CliNum':CliNum,
                    "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                }
            }).success(function (response) {
                app.isLoading = false;
                var errMsg = response["JSON_RESULT_ERROR"];
                var data = response["JSON_RESULT_DATA"];

                if(errMsg.length >=1){
                    alert('系统异常，请稍后再试')
                }else{
                    if(callBack instanceof Function){
                        callBack(data);
                    }
                }
                
            }).error(function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
                app.isLoading = false;
                console.log("textStatus:" + textStatus);
                console.log("errorThrown:" + errorThrown);
            });
        },
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
                    
                    if(isPhoto){
                        that.confirmEBioSignature();
                    }
                    
                }else if(that.eSignStatus == 'E4'){    
                    var isCli2 = that.jzrInfo.every(function(item, index){
                        return item.SignFileId;
                    });


                    if(isCli2){
                        that.confirmEAgentSignature();
                    }
                }
            });
        });

        
       
        this.getBankList(this); //银行列表
        this.getocrBankList(this); //OCR银行列表
        
        
        this.getIdTypList(this);

        if(this.eSignStatus != 'E1' ){
            this.sxIdiea = false;  
            this.zzsIdiea = false;  
            //this.inputFinancial = true;
            this.inputBankTransfer = true;
        }

        if(this.eAppNumber){
            this.getEappBankAccount(this.eAppNumber) 
        }    

        if(this.eAppNumber){
            this.HasFinData(this.eAppNumber,function(data){

                if(data.HasFinData == 'Y'){
                    that.inputFinancial = true;
                }else{
                    that.inputFinancial = false;
                }
            }) 
        }  

    },
    mounted: function () {
      
        var that = this;

        document.getElementById("cameraFaceAuthInput").addEventListener("change", frontCamera);
        
        document.getElementById("cameraFaceAuthInput2").addEventListener("change", frontCamera2);
        
        document.getElementById("cameraInputFront").addEventListener("change", frontCameraOcr);


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
})
 
$('#comment_cancel').on('click',function(){
    app.sentenceState = false;
})

 
function frontCamera () {
    if (!app.readAuth) {
        app.$Modal.error({
            title: "错误",
            content: "<br /><p>请阅读并同意人脸授权同意书！</p>"
        });

        return;
    }
    
    var Orientation = null;
    
    if (this.files && this.files[0]) {
        var client = app.getCliInfoByCliNum(app.recoCliNum);
        var FR = new FileReader();
        var file =  this.files[0];

        
        FR.addEventListener("load", function(e) {
            
            app.isLoading = true;
            
            var routeCanvas = document.getElementById('routeCanvas');
            var ctx = routeCanvas.getContext('2d');
            var i =  new Image();
            
            i.src= e.target.result;
            
            var compressResult = '';
            var targetRato = 0.9;
            var base64img = null;

            i.onload = function(){
                EXIF.getData(file, function(){
                    EXIF.getAllTags(this);
                    Orientation = EXIF.getTag(this, 'Orientation');
                    
                    if (Orientation != "") {
                        switch (Orientation) {
                            case 6:
                            routeCanvas.width = i.height;
                            routeCanvas.height = i.width;
                            ctx.rotate(90 * Math.PI / 180);
                            ctx.drawImage(i,0,-i.height,i.width,i.height);
                            base64img = routeCanvas.toDataURL('image/jpeg', targetRato);
                            break;
                            case 8:
                            routeCanvas.width = i.height;
                            routeCanvas.height = i.width;
                            ctx.rotate(270 * Math.PI / 180);
                            ctx.drawImage(i,-i.width,0,i.width,i.height);
                            base64img = routeCanvas.toDataURL('image/jpeg', targetRato);
                            break;
                            case 3:
                            routeCanvas.width = i.width;
                            routeCanvas.height = i.height;
                            ctx.rotate(180 * Math.PI / 180);
                            ctx.drawImage(i,-i.width,-i.height,i.width,i.height);
                            base64img = routeCanvas.toDataURL('image/jpeg', targetRato);
                            break;
                            default:
                     
                            routeCanvas.width = i.width;
                            routeCanvas.height = i.height;
                            ctx.drawImage(i,0,0,i.width,i.height);
                            base64img = routeCanvas.toDataURL('image/jpeg', targetRato);
                           
                            break;
                        }
                    }
                    
                    compressImg(base64img, 400, function(base64){
                        var paramData = {
                            "ImageValue": base64,
                            "IdTyp": client.idTyp,
                            "IdNum": client.idNum,
                            "CliNm": client.cliNm,
                            "CliNum": client.cliNum,
                            "eAppNumber":  app.eAppNumber //SessionAppNumBugFix_houjin
                        };
                    
                        $.ajax({
                            async: true,
                            type: "POST",
                            url: "REST/BioFacial",
                            datatype: "json",
                            data: paramData
                        }).success(function (response) {
                            app.isLoading = false;
                            
                            console.log('response.passed=' + response.passed);
                            if (response.passed == "Y") {
                            

                                app.isBioFrFileIdUploaded(app.signCliInfo[app.curIndex].cliNum, function(data){
                                    console.log(data);
                                    if(data == 'Y'){
                                        app.signPhoto.push('1');  
                                        app.signPhoto2.push('1');  
                                        
                                        app.signCliInfo[app.curIndex].bioFacialTyp = 'FR';
                                        app.recoModal = false;
            
                                    
                                        if(app.signPhoto2.length == app.dataLen2 || app.signPhoto.length == app.dataLen2){
                                            app.confirmEBioSignature();                            
                                            //20193312
                                            //if (app.isAgentPolicy == 'Y')
                                            //{
                                            //    app.confirmEAgentSignature(); 
                                            //}
                                            //<<20193312
                                            var stateTimer2 = setInterval(function(){
                                                if (app.isAgentPolicy == 'Y' && app.eSignStatus == 'E4')
                                                {
                                                    app.confirmEAgentSignature(); 
                                                    clearInterval(stateTimer2);
                                                }
                                            },1000);
                                            //>>20193312                                    
                                        }
                                    }else if(data == 'N'){
                                        alert('网络不稳定，请重新拍照或上传');
                                    }
                                });

            
                            } else {
        						app.bioFacialFailedCountLen -= 1;
                                app.bioFacialFailedCount += 1;
            
                                if (app.bioFacialFailedCount == 3) {
                                    app.$Modal.error({
                                        title: "错误",
                                        content: "<br /><p style='font-size:14px;'>人脸识别失败，请<span class='red'>客户手持有效证件</span>进行拍照！</p>",  //请进行持证拍照
                                        onOk: function () {
                                            app.showWithID = true;
                                        }
                                    });
                                } else {
                                    app.$Modal.error({
                                        title: "错误",
                                        content: "<br /><p style='font-size:14px;'>本次<span class='red'>人脸识别</span>失败，请重试！（剩余<span class='red'>" + app.bioFacialFailedCountLen  +"</span>次)</p>"
                                    });
                                }
                            }
                        }).error(function (jqXHR, textStatus, errorThrown) {
                            app.isLoading = false;
                            console.log("textStatus:" + textStatus);
                            console.log("errorThrown:" + errorThrown);
                        });
    
                    });
                    
               
                });
            }
        
        })
        FR.readAsDataURL(this.files[0]);
    }else{
        alert('other');
    } 
}
 
 
 
function frontCamera2(){
    app.faceDataMap.imgShow = true;
    if (this.files && this.files[0]){
        var file = this.files[0];
        var FR = new FileReader();
            FR.addEventListener("load", function(e) {
                var client = app.currentData;
               
                console.log(e.target.result);

                compressImg(e.target.result, 1200, function (base64) {
                    var paramData = {
                        "ImageValue": base64,
                        "CliNum": client.cliNum,
                        "CliNm": client.cliNm,
                        "GrpTyp": "1",
                        "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
                    };  
                 
                    var addFile = {
                        "name": file.name,
                        "url": e.target.result,
                        "status": "finished"
                    };
           
                    //var client = app.getCliInfoByCliNum(app.recoCliNum);
                    var index = 0;
    
                    app.uploadArg = {
                        file:file,
                        e,e,
                        paramData:paramData,
                        index,index
                    }
                    //app.uploadPhoto(file,e,paramData,index);
                    app.faceDataMap.forward.push(addFile); 
                    app.faceDataMap.fwState = false;

                });

            });
            FR.readAsDataURL(file);

            app.faceDataMap.coverState1 = true;
        }
}
    


function loadFrontCamera(img) {
    app.isLoading = true;
    var idTyp;

    if (app.ocrType == "B") {
        idTyp = "Bank";
    } else if (app.ocrType == "C") {
        idTyp = app.formItem.idTyp;
    }

    var paramData = {
        "ImageValue": img,
        "IdTyp": idTyp,
        "CliNum": app.cliNum,
        "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
    };

    $.ajax({
        async: true,
        type: "POST",
        url: "REST/LoadFrontCameraWithAppNumber",//LoadFrontCamera
        datatype: "json",
        data: paramData,
        timeout: 60000
    }).success(function (response) {
        app.isLoading = false;


        if (idTyp == "1") {
         
            app.formItem.name = response.name;
            app.formItem.gender = response.gender;
            app.formItem.birthDate = response.birthDate;
            app.formItem.idNum = response.idNum;
            app.formItem.nationality = "CHN";
            app.imgFront = img;
            app.showFront = false;

            if (!app.showBack) {
                app.showSubmit = false;
            }
        } else if (idTyp == "Bank") {
           
            if(!response.category){
                return false;
            }

            if (response.category == "贷记卡") {
                //pillar
                app.alertMsg = '您输入的账户为信用卡。扣款或领款账户的设立仅支持借记卡，请您更换银行卡为借记卡';
                app.alertState = true;

            } else {
                app.ocrData.category =  response.category;

                app.formItem.account = response.account;
                app.formItem.category = response.category;
                app.formItem.cardName = response.cardname;
                app.formItem.bankName = response.bankname;
                app.formItem.bankNo = response.bankno;
                app.imgFront = img;
                app.showFront = false;
                app.showSubmit = false;
            }
        } else {
            
            app.formItem.name = response.name;
            app.formItem.gender = response.gender;
            app.formItem.birthDate = response.birthDate;
            app.formItem.idNum = response.idNum;
            app.formItem.nationality = response.nationality;
            app.formItem.expiryDate = response.expiryDate;
            app.imgFront = img;
            app.showFront = false;
            app.showSubmit = false;
        }
    }).error(function (jqXHR, textStatus, errorThrown) {
        app.isLoading = false;
        alert("服务器繁忙，稍后重试!");
    });
}

function frontCameraOcr() {
    if (this.files && this.files[0]) {
        var FR = new FileReader();
        var file = this.files[0];

        FR.addEventListener("load", function (e) {
            var routeCanvas = document.getElementById('routeCanvas');
            var ctx = routeCanvas.getContext('2d');
            var i = new Image();

            i.src = e.target.result;

            var compressResult = '';
            var targetRato = 0.9;
            var base64img = null;

            i.onload = function () {
                EXIF.getData(file, function () {
                    EXIF.getAllTags(this);
                    Orientation = EXIF.getTag(this, 'Orientation');

                    if (Orientation != "") {
                        switch (Orientation) {
                            case 6:
                                routeCanvas.width = i.height;
                                routeCanvas.height = i.width;
                                ctx.rotate(90 * Math.PI / 180);
                                ctx.drawImage(i, 0, -i.height, i.width, i.height);
                                base64img = routeCanvas.toDataURL('image/jpeg', targetRato);
                                break;
                            case 8:
                                routeCanvas.width = i.height;
                                routeCanvas.height = i.width;
                                ctx.rotate(270 * Math.PI / 180);
                                ctx.drawImage(i, -i.width, 0, i.width, i.height);
                                base64img = routeCanvas.toDataURL('image/jpeg', targetRato);
                                break;
                            case 3:
                                routeCanvas.width = i.width;
                                routeCanvas.height = i.height;
                                ctx.rotate(180 * Math.PI / 180);
                                ctx.drawImage(i, -i.width, -i.height, i.width, i.height);
                                base64img = routeCanvas.toDataURL('image/jpeg', targetRato);
                                break;
                            default:
                                routeCanvas.width = i.width;
                                routeCanvas.height = i.height;
                                ctx.drawImage(i, 0, 0, i.width, i.height);
                                base64img = routeCanvas.toDataURL('image/jpeg', targetRato);
                                break;
                        }
                    }

                    compressImg(base64img, 720, function (base64) {
                        loadFrontCamera(base64);
                    });
                });
            }
        });
        FR.readAsDataURL(this.files[0]);
    }
}

 
function base64ImgSize(base64) {
    var baseStr = base64;
    var tag = "base64,";

    baseStr = baseStr.substring(baseStr.indexOf(tag) + tag.length);

    var eqTagIndex = baseStr.indexOf("=");
    
    baseStr = eqTagIndex != -1 ? baseStr.substring(0, eqTagIndex) : baseStr;

    var strLen = baseStr.length;
    var fileSize = (strLen - (strLen / 8) * 2) / 1024; // KB
    //alert(fileSize)
    return fileSize;
}


function compressImg(imgBase64, maxLen, callBack) {
    var img = new Image();
    var base64MaxSize = 250;
    var base64;

    img.src = imgBase64;
    img.onload = function () {
        //生成比例
        var width = img.width;
        var height = img.height;
        //计算缩放比例
        var rate = 1;

        if (width >= height) {
            if (width > maxLen) {
                rate = maxLen / width;
            }
        } else {
            if (height > maxLen) {
                rate = maxLen / height;
            }
        }

        img.width = width * rate;
        img.height = height * rate;
        //生成canvas
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var targetRato = 0.9;
        var fileSize;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        base64 = canvas.toDataURL('image/jpeg', targetRato);
        fileSize = base64ImgSize(base64);

        while (fileSize > base64MaxSize) {
            base64 = canvas.toDataURL('image/jpeg', targetRato);
            fileSize = base64ImgSize(base64);

            if (targetRato > 0.1) {
                targetRato = targetRato - 0.1;
            }
        }

        callBack(base64);
    };
}



function testStr(str){
    var reg = /\S+/
    if(String(str) == 'null'){
        str = '';
    }
   
    return reg.test(str);
}


function testNumber(str){
    var reg = /^[1-9]*\d*$/g
    if(String(str) == 'null'){
        str = '';
    }
   
    return reg.test(str);
}

function testNumber2(str){
    var reg = /^[1-9]\d*$/g
    if(String(str) == 'null'){
        str = '';
    }
   
    return reg.test(str);
}


function testNumber3(str){
    var reg = /^\d+(\.\d+)?$/g
    if(String(str) == 'null'){
        str = '';
    }
   
    return reg.test(str);
}


// 工资收入  可为0
function testNumber4(str){
    //var reg = /^[0-9]\d*$/g
    var reg = /^\d*(,|\d)*\d$/g
    if(String(str) == 'null'){
        str = '';
    }

    if(str == ''){
        return reg.test(0);
    }else{
        return reg.test(str);
    }
   
    
}

//  车子房子 不能为0 价格
function testNumber5(str){
    var reg = /^[1-9][\d,]*$/g
    if(String(str) == 'null'){
        str = '';
    }

   
    return reg.test(str);
}

//可为零 不能有小数。
function testNumber6(str){
    var reg = /^[0-9]+\d*$/g
    if(String(str) == 'null'){
        str = '';
    }
    return reg.test(str);
}



function toNum(str){
    var reg = str.replace(/\d+/,function(n){
        return n.replace(/(\d)(?=(\d{3})+$)/g,function($1){
            return $1+',';
        });
    })

    return reg;
}



function changeV2(num){   //千位分隔符 提交去除
    if(String(num) == 'null'){
        num = '0';
    }
    var reg = /,*/g;
    if(reg.test(num)){
        return num = num.replace(reg,'');
    }else{
        return num;
    }
    
} 




// 浏览器名称 
function browserVersion() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //Edge浏览器
    var isFirefox = userAgent.indexOf("Firefox") > -1; //Firefox浏览器
    var isOpera = userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1; //Opera浏览器
    var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Edge") == -1 && userAgent.indexOf("OPR") == -1; //Chrome浏览器
    var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1 && userAgent.indexOf("Edge") == -1 && userAgent.indexOf("OPR") == -1; //Safari浏览器
    if (isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if (fIEVersion == 7) {
            return 'IE';
        } else if (fIEVersion == 8) {
            return 'IE';
        } else if (fIEVersion == 9) {
            return 'IE';
        } else if (fIEVersion == 10) {
            return 'IE';
        } else {
            return 'IE'; //IE版本<7
        }
    } else if (isIE11) {
        return 'IE';
    } else if (isEdge) {
        return 'Edge';
    } else if (isFirefox) {
        return 'Firefox';
    } else if (isOpera) {
        return 'Opera';
    } else if (isChrome) {
        return 'Chrome';
    } else if (isSafari) {
        return 'Safari';
    } else {
        return -1; //不是ie浏览器
    }
}
// 浏览器版本 
function browserDtlVersion() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //Edge浏览器
    var isFirefox = userAgent.indexOf("Firefox") > -1; //Firefox浏览器
    var isOpera = userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1; //Opera浏览器
    var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Edge") == -1 && userAgent.indexOf("OPR") == -1; //Chrome浏览器
    var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1 && userAgent.indexOf("Edge") == -1 && userAgent.indexOf("OPR") == -1; //Safari浏览器
    if (isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if (fIEVersion == 7) {
            return '7';
        } else if (fIEVersion == 8) {
            return '8';
        } else if (fIEVersion == 9) {
            return '9';
        } else if (fIEVersion == 10) {
            return '10';
        } else {
            return '6'; //IE版本<7
        }
    } else if (isIE11) {
        return '11';
    } else if (isEdge) {
        return userAgent.split('Edge/')[1].split('.')[0];
    } else if (isFirefox) {
        return userAgent.split('Firefox/')[1].split('.')[0];
    } else if (isOpera) {
        return userAgent.split('OPR/')[1].split('.')[0];
    } else if (isChrome) {
        return userAgent.split('Chrome/')[1].split('.')[0];
    } else if (isSafari) {
        return userAgent.split('Safari/')[1].split('.')[0];
    } else {
        return -1; //不是ie浏览器
    }
}


function uploadSignComment (img, cli, cliNum, typ) {        
    var paramData = {
        "ImageValue": img,
        "CliNum": cliNum,
        "UploadTyp": typ,
        "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
    };

    app.reflesh = false;

    app.isLoading = true;

    $.ajax({
        async: true,
        type: "POST",
        url: "REST/UploadSignComment",
        datatype: "json",
        data: paramData
    }).success(function (response) {
        console.log("upload success");     
        // 签名包
        if(typ == 'SIGN'){
            uploadEncryptedSign(cli.cliNum, cli.linkTyp, function(){
                var JSON_RESULT_ERROR = response.JSON_RESULT_ERROR;
                if(JSON_RESULT_ERROR.length >= 1){
                    alert('网络异常，请稍后再试');
                    app.isLoading = false;
                    return false;
                }
    
               
                app.signState.push(cliNum);
    
                // 如果语句抄录完成   
                if(app.newProductType){
                    if(typ == 'SIGN'){
                        app.isSignFileIdUploaded(cli.linkTyp, cli.cliNum, function(data){
                            if(data == 'Y'){
                                // 签名回显
                                var imgId = "imgSign" + cli.cliNum + cli.linkTyp;
                                var aImg = document.getElementById(imgId);

                                aImg.src = "data:image/png;base64," + img;

                                for (var i = 0; i < aImg.length; i++) {
                                    aImg[i].style.height = "250";
                                    aImg[i].style.width = "250";
                                }
                                                            
                                cli.SignFileId = Date.now();
                                app.qmFinish.push(1);
                                //alert('见证认签名成功')
        
                                if(cli.linkTyp == 'W'){
                                    app.isSignDataReady(app.eAppNumber,cli,function(data){
                                        app.confirmEAgentSignature() //E5
                                        app.finishESign = false;
                                    });
                                }else{
                                    if(app.qmFinish.length == app.dataLen && app.CommentState){
        
                                        if(app.eSignStatus != 'E5'){  //flowState
                                            app.confirmESignature(); //电子签名完成
                        
                                            //app.finishESign = false;
                                            if(cli.linkTyp == 'W'){
                                                
                                                cli.qm2Before = false;
                                                
                                            }else{
                                                cli.qm1Before = false;
                                            }
                                        
                                        }
                                        
                                    }
                                }
        
                                
                            }else if(data == 'N'){
                                if(cli.linkTyp == 'O'){
                                    alert('网络不稳定，请重新进行语句抄录！');
                                }else{
                                    alert('网络不稳定，请重新进行签名！');
                                }

                                app.CommentState = false;
                                app.commentFileId = null;
                                
                            }
                        });
                    }
                    
                    
                }else{
        
                    if(typ == 'SIGN'){
                        app.isSignFileIdUploaded(cli.linkTyp, cli.cliNum, function(data){
                            if(data == 'Y'){
                                // 签名回显
                                var imgId = "imgSign" + cli.cliNum + cli.linkTyp;
                                var aImg = document.getElementById(imgId);

                                aImg.src = "data:image/png;base64," + img;

                                for (var i = 0; i < aImg.length; i++) {
                                    aImg[i].style.height = "250";
                                    aImg[i].style.width = "250";
                                }
                                                            
                                cli.SignFileId = Date.now();
                                app.qmFinish.push(1);
        
                                if(cli.linkTyp == 'W'){
                                    app.isSignDataReady(app.eAppNumber,cli,function(data){
                                        app.confirmEAgentSignature() //E5
                                        app.finishESign = false;
                                    });
                                }else{
                                    if(app.qmFinish.length == app.dataLen){
        
                                    if(app.eSignStatus != 'E5'){  //flowState
                                    app.confirmESignature(); //电子签名完成
                    
                                        //app.finishESign = false;
                                        if(cli.linkTyp == 'W'){
                                            
                                            cli.qm2Before = false;
                                            
                                        }else{
                                            cli.qm1Before = false;
                                        }
                                    
										}
                                    
									}
								}	
                            }else if(data == 'N'){
                                alert('网络不稳定，请重新签名！');
                            }
                        });
                    }
        
                }
    
    
                
            });
        }else if(typ == 'COMMENT'){
            app.isLoading = false;
            app.CommentState = true;
            app.tbrQm = false;
            app.commentFileId = 1;
        }

        
    }).error(function (jqXHR, textStatus, errorThrown) {
        app.isLoading = false;
        console.log("textStatus:" + textStatus);
        console.log("errorThrown:" + errorThrown);
    });
}
 

// 操作系统名称
function osName(){
    var arr = navigator.userAgent.toLocaleLowerCase().split(' ')
    var os = arr[1].replace('(','')  //iPhone  // Windows   Mac OS
    if(os == 'linux'){
        os = 'android'
    }
    return os;
}

// 操作系统版本
function osName(){
    var arr = navigator.userAgent.toLocaleLowerCase().split(' ')
    var os = arr[1].replace('(','')  //iPhone  // Windows   Mac OS
    if(os == 'linux'){
        os = 'android'
    }
    return os;
}

function parseDateWithISOFormat(s, trimTime) {
    //ISO_8601:yyyy-MM-ddThh:mm:ss
    //if (angular.isUndefined(s) || s == null) return null;
    if(!s){
        return null;
    }else{
        var arr = s.split("T");
        var dateStr = arr[0];
        var timeStr = null;
        if (arr.length > 1) {
            timeStr = arr[1];
        }
        var _y = null,
            _m = null,
            _d = null,
            _hh = null,
            _mm = null,
            _ss = null;
        var dateArr = dateStr.split("-");
        if (dateArr.length == 3) {
            _y = parseInt(dateArr[0], 10);
            _m = parseInt(dateArr[1], 10) - 1;
            _d = parseInt(dateArr[2], 10);
            if (!timeStr) {
                return new Date(_y, _m, _d);
            }
        }

        if (timeStr && !trimTime) {
            var timeArr = timeStr.split(":");
            if (timeArr.length >= 3) {
                _hh = parseInt(timeArr[0], 10);
                _mm = parseInt(timeArr[1], 10);
                _ss = parseInt(timeArr[2], 10);
                return new Date(_y, _m, _d, _hh, _mm, _ss);
            }
        }
        else {
            return new Date(_y, _m, _d, 0, 0, 0);
        }
    }
    

    //return null;
};



function uploadEncryptedSign (cliNum,SignCliTyp, callBack) {
    //alert("Ready:" + apiInstance.isReadyToUpload());
    var retData = apiInstance.getUploadDataGram();
    var paramData = {
        "EncryptedSign": retData,
        "CliNum": cliNum,
        "SignCliTyp":SignCliTyp,
        "UploadTyp": "ENCRYPTED",
        "eAppNumber": app.eAppNumber //SessionAppNumBugFix_houjin
    };

    $.ajax({
        async: true,
        type: "POST",
        url: "REST/UploadEncryptedSign",
        datatype: "json",
        data: paramData
    }).success(function (response) {
        var JSON_RESULT_ERROR = response.JSON_RESULT_ERROR;
        var JSON_RESULT_DATA = response.JSON_RESULT_DATA;
        if(JSON_RESULT_ERROR.length >= 1){
            alert('网络异常，请稍后再试');
            console.log('uploadEncryptedSign接口异常');
            return false;
        }
        if(callBack instanceof Function){
            callBack(JSON_RESULT_DATA);
        }
        console.log("upload encrypted sign success");
    }).error(function (jqXHR, textStatus, errorThrown) {
        app.isLoading = false;
        console.log("textStatus:" + textStatus);
        console.log("errorThrown:" + errorThrown);
    });
}
 
var apiInstance;
var ocrCapture;
var DATA_CANNOT_PARSED = "10003"; //输入数据项无法解析
var SERVICE_SYSTEM_EXCEPTION = "10011"; //服务系统异常错误
var RECOGNITION_RESULT_EMPTY = "10100"; //识别结果为空
var CONNECTION_SERVICE_TIMEOUT = "10101"; //连接识别服务超时
var CONNECTION_RECOGNITION_EXCEPTION = "10102"; //连接识别服务异常
var SUCCESS = "0"; //识别成功
var RECOGNITION_FALSE = "-1";//识别错误
var RESULT_OK = 0; //操作成功
var CALLBACK_TYPE_SIGNATURE = 10; //签名框点击确认之后的回调，回调中包含签名快照
var CALLBACK_TYPE_DIALOG_CANCEL = 11; //点击签名框"取消"按钮时的回调，同时也会触发dismiss回调
var CALLBACK_TYPE_COMMENTSIGN = 12; //批注签名框点击确认之后的回调，回调中包含签名快照
var CALLBACK_TYPE_GETVERSION = 13; //获得版本号
var RESULT_ERROR = -1; //操作失败
var EC_API_NOT_INITED = 1; //接口未初始化错误
             
//配置模板数据
function initTemplateData()
{
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

    if(res)
    {
        console.log("setTemplateData success");
        return res;
    }
    else
    {
        console.log("setTemplateData error");
        return res;
    }
}
        
//添加单签签名框
function initSignatureObj(objId, cli)
{  
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

    if(cli.linkTyp == 'G'){ //监护人
        //（被保险人）{{cli.cliNm}} （投保人）{{cli.AboveSignDesc}} 代
        signatureConfig.title="签名格式为:" + cli.cliNm + ' '+ cli.AboveSignDesc +'代';
    }else{
        signatureConfig.title = "请" + app.getSignLinkTypDesc(cli.linkTyp)  + ' ' + cli.AboveSignDesc   + " 签字";
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

    if(res)
    {
        console.log("addSignatureObj "+context_id+" success");
        return res;
    }
    else
    {
        console.log("addSignatureObj "+context_id+" error");
        return res;
    }
}
 
//添加批签签名框
function initCommentObj(objId, cli)
{
    var context_id = objId;
    //根据实际情况填真实信息
    //todo 姓名 身份证
    var signer = new Signer(cli.cliNm, cli.idNum);
    /**
     * 关键字定位方式，寻找PDF中的关键字，根据关键字位置放置签名图片
     * @param keyword 关键字
     * @param keyWordAlignMethod 签字图片和关键字位置关系：等于1时，签字图片和关键字矩形重心重合
     *                           等于2时，签字图片位于关键字正下方，中心线对齐；等于3时，签字图片位于关键字正右方，中心线对齐；
     *                            等于4时，签字图片左上角和关键字右下角重合，可能额外附加偏移量，详见构造函数的offset参数
     * @param keyWordOffset 当keyWordAlignMethod非零时，额外附加的偏移量，单位pt
     * @param pageNo 寻找关键字的PDF起始页码
     * @param KWIndex KWIndex 第几个关键字
     * @constructor
     */
    var signerRule = new SignRule_KeyWord('投保人签署38个抄录字',1,0,1,1);
    var commentConfig = new CommentConfig(signer,signerRule);
    //批注内容
    commentConfig.commitment = "本人已阅读保险条款、产品说明书和投保提示书，了解本产品的特点和保单利益的不确定性。";
    //commentConfig.commitment = "本人。";
    //生成的签名图片中单个字的高、宽
    commentConfig.mass_word_height = 62;
    commentConfig.mass_word_width = 62;
    commentConfig.mass_words_in_single_line = 20;//批注图片每行字数
    commentConfig.penColor = "#000000";
    commentConfig.nessesary = false;
    //识别开关
    commentConfig.isdistinguish = false;
    commentConfig.ocrCapture = ocrCapture;
    commentConfig.mass_dlg_type = CommentInputType.WhiteBoard;

    var res = apiInstance.addCommentObj(context_id,commentConfig);

    if(res)
    {
        console.log("addCommentObj "+context_id+" success");
        return res;
    }
    else
    {
        console.log("addCommentObj "+context_id+" error");
        return res;
    }
}
 
//签名总入口
function initSign(cli)
{  
    var res;
    //识别回调接口
    var identify_callback = function (errCode) {
        if(errCode == SUCCESS){
            return;
        }
        if(errCode == DATA_CANNOT_PARSED) {
            alert("输入数据项无法解析！");
        } else if(errCode == SERVICE_SYSTEM_EXCEPTION) {
            alert("服务系统异常错误！");
        } else if(errCode == RECOGNITION_RESULT_EMPTY) {
            alert("识别结果为空！");
        } else if(errCode == CONNECTION_SERVICE_TIMEOUT) {
            alert("连接识别服务超时！");
        } else if(errCode == CONNECTION_RECOGNITION_EXCEPTION) {
            alert("连接识别服务异常！");
        } else if(errCode == RECOGNITION_FALSE) {
            alert("书写错误！");
        } else {
            alert(errCode);
        }
    }
    var callback = function(context_id,context_type,val)
    {                    	
        document.getElementById("app").style.display = "block";
            
        if(context_type == CALLBACK_TYPE_SIGNATURE)
        {
            uploadSignComment(val, cli, cli.cliNum, "SIGN");
        }
        else if(context_type == CALLBACK_TYPE_COMMENTSIGN)
        {
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
    
    res = apiInstance.initAnySignApi(callback,channel);

    if(!res){
        console.log("init error");
    }else{

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

    
    if(!res){
        console.log("initSignatureObj error");
        return;
    }else{
    }

    if (app.newProductType) {
        res = initCommentObj(30, cli);
        if(!res){
            console.log("initCommentObj error");
            return;
        }else{
        }

        res = initCommentObj(31, cli);
        if(!res){
            console.log("initCommentObj error");
            return;
        }else{
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

    if(res){
        console.log("Init ALL 提交配置成功");
    }else{
        console.log("Init ALL 提交配置失败");
    }

    
    ////////////////////////////////////////////////            
}