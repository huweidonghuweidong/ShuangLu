var dbData = [
    {
        name:'征求确认', //节点名称
        index:0,
        current:true,
        itemList:[
            {
                title:'征求投保人意见',
                current:true,
                des:'<span class="red">A先生</span>/女士，您好！为规范保险销售从业人员的销售行为，也为了更好地保护您的合法权益，根据银保监会有关规定，我们将以录音录像方式对我的销售过程关键环节予以记录。请问您是否同意？',
                tbrDes:'<p class="tbr">投保人:同意</p>',
                tips:['1.投保人需清晰肯定回答；','2.若投保人不同意，则本次销售过程终止。'],
            	index:0,
            },
            {
                title:'出示身份证件、告知本人所属机构',
                current:false,
                des:'<span class="red">A先生</span>/女士，您好！为规范保险销售从业人员的销售行为，也为了更好地保护您的合法权益，根据银保监会有关规定，否同意？',
                tips:['1.投保人需清晰肯定回答；'],
            	index:1
            }

        ]
    },
    {
        name:'告知声明', //节点名称
        index:1,
        current:false,
        itemList:[
            {
                title:'征求投保人意见',
                current:false,
                des:'<span class="red">B先生</span>/女士，您好！为规范保险销售从业人员的销售行为，也为了更好地保护您的合法权益，根据银保监会有关规定，我们将程关键环节予以记录。请问您是否同意？',
                tips:['1.投保人需清晰肯定回答；','2.若投保人不同意，则本次销售过程终止。'],
                index:0
                
            },
            {
                title:'出示身份证件、告知本人所属机构',
                current:false,
                des:'<span class="red">A先生</span>/女士，您好！为规范保险销售从业人员的销售行为，也为了更好地保护您的合法权益，根据银保监会有关规定，否同意？',
                tips:['1.投保人需清晰肯定回答；'],
                index:1
            }

        ]
    },
    {
        name:'投保真实性和由犹豫期提醒', //节点名称
        index:2,
        current:false,
        itemList:[
            {
                title:'征求投保人意见',
                current:false,
                des:'<span class="red">C先生</span>/女士，您好！为规范保险销售从业人员的销售行为，也为了更好地保护您的合法权益，根据银保监会有关规定，我们将程关键环节予以记录。请问您是否同意？<p class="tbr">投保人:同意</p>',
                tips:['1.投保人需清晰肯定回答；','2.若投保人不同意，则本次销售过程终止。'],
                index:0
            },
            {
                title:'出示身份证件、告知本人所属机构',
                current:false,
                des:'<span class="red">A先生</span>/女士，您好！为规范保险销售从业人员的销售行为，也为了更好地保护您的合法权益，根据银保监会有关规定，否同意？',
                tips:['1.投保人需清晰肯定回答；'],
                index:1
            }

        ]
    },
    {
        name:'产品介绍', //节点名称
        index:3,
        current:false,
        itemList:[
            {
                title:'征求投保人意见',
                current:false,
                des:'<span class="red">D先生</span>/女士，您好！为规范保险销售从业人员的销售行为，也为了更好地保护您的合法权益，根据银保监会有关规定，我们将程关键环节予以记录。请问您是否同意？',
                tips:['1.投保人需清晰肯定回答；','2.若投保人不同意，则本次销售过程终止。'],
                index:0
            },
            {
                title:'出示身份证件、告知本人所属机构',
                current:false,
                des:'<span class="red">A先生</span>/女士，您好！为规范保险销售从业人员的销售行为，也为了更好地保护您的合法权益，根据银保监会有关规定，否同意？',
                tips:['1.投保人需清晰肯定回答；'],
                index:1
            }

        ]
    },
    {
        name:'风险提示', //节点名称
        index:4,
        current:false,
        itemList:[
            {
                title:'一、出示保险条款说明保险责任',
                current:false,
                des:'您购买的E产品的保险责任包括以下内容，请您认真阅读。我已向您详细介绍过，对我已经介绍的产品保险责任，请问我说清楚了吗？',
                tbrDes:'<p class="tbr">投保人：同意</p>',
                docList:[
                    {
                        name:'产品条款',
                        type:'notice',
                        isMust:false,
                        isCheck:true,
                        url:'../Content/宏掌门APP下载安装说明.pdf',
                      
                        des:'我是产品条款说明书的内容，现在只是一段测试代码',
                        index:0
                    },
                    {
                        name:'免责声明',
                        type:'application',
                        isMust:true,
                        isCheck:false,
                         url:'../Content/宏掌门电子版操作手册.pdf',
                        des:'我是免责声明说明书的内容，现在只是一段测试代码',
                        index:1
                    }
                ],
                tips:['1.投保人需清晰肯定回答；','2.若投保人不同意，则本次销售过程终止。'],
                index:0
            },
            {
                title:'二、出示保险条款说明保险责任',
                current:false,
                des:'您购买的E产品的保险责任包括以下内容，请您认真阅读。我已向您详细介绍过，对我已经介绍的产品保险责任，请问我说清楚了吗？',
                tbrDes:'<p class="tbr">投保人：说清楚了</p>',
                docList:[
                    {
                        name:'产品条款',
                        type:'notice2',
                        isMust:false,
                        isCheck:false
                    },
                    {
                        name:'免责声明',
                        type:'application2',
                        isMust:true,
                        isCheck:false
                    }
                ],
                tips:['1.投保人需清晰肯定回答；','2.若投保人不同意，则本次销售过程终止。'],
                index:1
            },
            {
                title:'三、出示保险条款说明保险责任',
                current:false,
                des:'您购买的E产品的保险责任包括以下内容，请您认真阅读。我已向您详细介绍过，对我已经介绍的产品保险责任，请问我说清楚了吗？',
                docList:[
                    {
                        name:'产品条款',
                        type:'notice3',
                        isMust:false,
                        isCheck:false
                    },
                    {
                        name:'免责声明',
                        type:'application3',
                        isMust:true,
                        isCheck:false
                    }
                ],
                tips:['1.投保人需清晰肯定回答；','2.若投保人不同意，则本次销售过程终止。'],
                index:2
            },
            {
                title:'四、出示保险条款说明保险责任',
                current:false,
                des:'您购买的E产品的保险责任包括以下内容，请您认真阅读。我已向您详细介绍过，对我已经介绍的产品保险责任，请问我说清楚了吗？',
                docList:[
                    {
                        name:'产品条款',
                        type:'notice4',
                        isMust:false,
                        isCheck:false
                    },
                    {
                        name:'免责声明',
                        type:'application4',
                        isMust:true,
                        isCheck:false
                    }
                ],
                tips:['1.投保人需清晰肯定回答；','2.若投保人不同意，则本次销售过程终止。'],
                index:3
            },
            {
                title:'五、出示保险条款说明保险责任',
                current:false,
                des:'您购买的E产品的保险责任包括以下内容，请您认真阅读。我已向您详细介绍过，对我已经介绍的产品保险责任，请问我说清楚了吗？',
                docList:[
                    {
                        name:'产品条款',
                        type:'notice5',
                        isMust:false,
                        isCheck:false,
                        des:'我是免责条款说明书的内容，现在只是一段测试代码'
                    },
                    {
                        name:'免责声明',
                        type:'application5',
                        isMust:true,
                        isCheck:false,
                        des:''
                    }
                ],
                tips:['1.投保人需清晰肯定回答；','2.若投保人不同意，则本次销售过程终止。'],
                index:4
            },

        ]
    }
   
]
