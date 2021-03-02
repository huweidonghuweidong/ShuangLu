var dev = true;

var url='sl.pdf';
var PDFData = '';  
var DEFAULT_URL = '';

var delHtmlTag = /<[^>]*>/g;

//var playBtnBox = document.getElementById('audio');
//var playPdfBtn = document.getElementById('audio2')

var validateSignNumber = function(rule, value, callback){
//	var regDigi = /^[0-9]*$/;
//  var regUpper = /^([A-Z])+$/;
//  if ((value.length == 10) && (value.substr(0, 2) == "GA")
//      && regUpper.test(value.substr(2, 1))
//      && regDigi.test(value.substr(3, 7))) {
//      return false;
//  } else {
//      return true;
//  }

	
	if(value == ''){
		callback(new Error('请填选投保确认书单证序列号!'))
	}else{
		callback();
	}
};
		
		
var validateSignNumberCheck = function(rule, value, callback){
	if(value == ''){
		callback(new Error('请填选投保确认书单证序列号!'))
	}else if(value != app.signForm.signNumber){
		callback(new Error('您两次输入的在线投保申请确认书单证序列号不一致，请重新输入!'))
	}else{
		callback();
	}
};
			

//var currentPageNum=1;

/*
  	快速进入风险提示
 *  app.dbInputData.forEach(function(item, indxex){
		item.Current = false;
		if(item.index == 4){
			item.Current = true;
			item.Items.forEach(function(item2, index2){
				item2.Current = false
	      		if(item2.index == 0){
	      			item2.Current = true;
	      		}
	      	});
		
		}
		
	
	})
	
	
	app.isLoading
	
 * 
 * 
 * */




var app  = new Vue({
    el:"#app",
    data:{
    	dev:false,
    	posShow:false,
    	scrollTimer:null,
    	loadPdfOk:false,
    	isIpad:false,
    	pdfEnd:false,
    	initHtml:'',
    	currentHtml:'',
    	playStart:false,
    	isNotFirst:false,
    	lastIndex:0,
        currentIntTime:0,
    	htmlArr:[],
    	playBtnBox:null, //节点播放按钮
    	playPdfBtn:null,  // pdf播放按钮
    	
    	playBtnBoxPlayed:false,
    	
    	infoUrl:'',
    	
    	proInfoData:null,
    	
    	stepName:'', //大节点的名称
    	
    	playLoading:true, 
    	pdfPlayLoading:true,
    	
    	stepVedioPop:false,  //小姐点 tts播放按钮 遮罩
    	stepVedioPop2:false,
    	
    	guideInfo:{
    		OwnerName:''
    	}, //操作指引m3
    		

    		
    	docPlay:false,  //// pdf语音播放完成状态 
    	
    	signTypeAfter:false,  // 是否选择过签署方式
    	otherInfo:{
    		CnfrmNum:null
    	},
    	
    	canNext2:'', //pdf 选择状态
    	
    	doctype:'',  ///当前操作文档的id
    	
    	docId:'', //当前操作文档的id
    	stepNeedPlay:'', //节点播放按钮状态
    	playPdfBtnPlay:false, // pdf语音播放状态 (暂停/播放)
    	
        nodeIndex:0,   //节点索引
        listItemIndex:0, //双录条款索引
        isLoading:false,   
        modalDocumentInfo:false, //弹层
        dbInputData:null, // 双录数据对象模型
		callInfo:{
			callInfo:''
		},	// 	callInfo


		operaGuideInfo:{},

        docListCurObj:null,

		pdfRead:false,  //pdf  阅读完毕状态
		pdfReadOjb:{
			
		},
		signState:false, //签署状态
		signNavState:'', //签署导航显示状态
		signConState:false,  //显示内容显示状态
		palyBtnShow:false,  //pdf 按扭区 状态
		modalNav:true, // m1状态
		modalNav2:false,	 //m2 状态

		stepIndex:'', //当前导航索引	
		itemLen:'',   //子节点长度
		itemIndex:'', //当前子节点索引		
		docIndex:'', //当前文档 索引
		
		canNext:false, //下一项按钮状态
		canPrev:false,  //上一项 按钮状态
		
		signEnd:false, //线下签名弹框 状态
        showPdf:false,
        
        currentItem:null, //当前项目对象
        
        nextItem:null,  // 下个项目对象   方便tts 与载入
        
        stepData:{      //下一步小对象
        	CallObjId:'',
        	NodeId:'',
        	ItemId:''
        },
        
        signType:'',
        signForm:{    //签署确认
        	signNumber:'',
        	signNumberCheck:''
        },
        signRule:{ //签署验证规则
        	signNumber:[
        		{validator:validateSignNumber, trigger:'blur'}
        	],
        	signNumberCheck:[
        		{validator:validateSignNumberCheck, trigger:'blur'}
        	]
        },
        
        ttsInfo:null, //  
        
        itemTtsUrl:'',  //
        pdfTtsUrl:'',  // pdf tts url
        
        docData:{
        	NeedShow:'N'   // wrong  why use
        }
        
        
    },
    watch:{
//	  	currentItem:{
//	  		deep:false,
//	  		handler:function(val, oldVal){
//	  			if(app.stepName == '产品介绍'){
//	  				//stepPalyFlag = ''
//	  			}
//	  		}
//	  	},
//  	
//  	stepIndex:function(){
//  		var nextStep = app.stepIndex + 1;
//  		var nextItem =	 app.itemIndex + 1;
//  		app.dbInputData.forEach(function(nodeItem, nodeIndex){
//				
//				if(nextItem > app.itemLen){
//					if(nodeIndex == nextStep){
//	  					nodeItem.Items.forEach(function(item,index){
//	  						if(index == app.itemIndex){
//	  							app.nextItem = item;
//	  						}
//	  					})
//	  				}
//					
//				}else {
//					if(nodeIndex == app.stepIndex){
//					 
//	  					nodeItem.Items.forEach(function(item,index){
//	  						if(index == app.itemIndex + 1){
//	  							app.nextItem = item;
//	  						}
//	  					})
//	  				}
//				}
//				
//			
//			});
//  		
//  		
//  	},
//  	
//  	itemIndex:function(){
//			app.dbInputData.forEach(function(nodeItem, nodeIndex){
//				
//				if(nodeIndex == app.stepIndex){
//					nodeItem.Items.forEach(function(item,index){
//						if(index == app.itemIndex + 1){
//							app.nextItem = item;
//						}
//					})
//				}
//				
//			
//			});
//  	}
//  	
    	
//      itemIndex:{
//      	deep:false,
//      	handler:function(val, oldVal){
//      		
//       		this.dbInputData.forEach(function(item,index){
//			      if(item.current){
//			      	
//			      	app.itemLen = item.itemList.length; 	
//			     
//			      	
//			      }
//				      
//				});
//      	}
//              
//      }
        
        
    },
    methods:{    
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
                alert("HeartBeat  failed!");
            });
        },

    	loadPage:function(app){  //初始化页面你 视图
	    	app.getAudioVedioForm(function(data){
				app.dbInputData = data.Nodes;
				app.guideInfo = data.GuideInfo;
				app.callInfo = data.CallInfo;
				app.ttsInfo = data.TTSInfo;
				app.stepData.CallObjId = data.CallInfo.CallObjId;
				
				app.otherInfo = data.OtherInfo;
				app.operaGuideInfo = data.OperaGuideInfo;
				
				//app.guideInfo.Prem = toNum(String(app.guideInfo.Prem));
				
				app.signForm.signNumber = app.otherInfo.CnfrmNum || '';
				app.signForm.signNumberCheck = app.otherInfo.CnfrmNum || '';
				
				
				console.log(app.guideInfo.Prem);
				//app.operaGuideInfo.Prem = 123;
				
				if(app.otherInfo.SignWay == 'E'){
					app.signTypeAfter = true;
					app.signType = app.otherInfo.SignWay;
				}else if(app.otherInfo.SignWay == 'N'){
					app.signTypeAfter = true;
					app.signType = app.otherInfo.SignWay;
				}else{
					app.signTypeAfter = false;
				}
				
				
				app.currentItem = data.Nodes[0].Items[0];
				
				if(data.CallInfo.CallTyp == 'EAPP'){
					app.signState = true;
				}else{
					app.signState = false;
				}
					
				app.dbInputData.forEach(function(item,index){
					
				  if(item.NodeDesc == '产品介绍'){
				  	app.proInfoData = item.Items[0];
				  	 
				  }
				  
				  item.Items.forEach(function(item2, index2){
						
			      		item2.MsgUpInfoCopy = item2.MsgUpInfo;
			      		
			      	});
					  
				  
			      if(item.Current){	
			      	app.itemLen = item.Items.length; 
			      	app.stepIndex = Number(item.NodeIndex);
			      	app.stepData.NodeId = item.NodeId;
			      	item.Items.forEach(function(item2, index2){
			      		if(item2.Current){
			      			app.currentItem = item2;
			      			app.itemIndex = Number(item2.ItemIndex);
			      			app.stepData.ItemId = item2.ItemId;		
			      		}
//			      		else if( app.itemIndex + 2 > index2 > app.itemIndex){
//			      			app.nextItem = item2;
//			      		}
			      		
			      	});
			      	
			      }
				});	
				
				
//				app.dbInputData.forEach(function(item, index){
//					if(item.Current){
//						app.stepData.NodeId = item.NodeId;
//						item.Items.forEach(function(item2, index2){
//							if(item2.Current){
//								app.currentItem = item2;
//								app.stepData.ItemId = item2.ItemId;	
//							}
//							
//						});
//					}
//          	});
				
//				app.testTts(app.proInfoData, function(data){
//					app.infoUrl = data.fileUrl + '&signature=' + data.signature;
//					
//					
//					app.$nextTick(function(){
//						
//						app.playBtnBox.load();
//						
//						app.playBtnBox.addEventListener('canplaythrough',function(){
//							app.playLoading = false;
//						});
//					});
//					
//					
//				});
				
				if(app.currentItem.MsgUpInfoCopy.length > 0){
					app.currentItem.MsgUpInfoCopy.forEach(function(item,index){
	            		app.htmlArr.push(item.MsgTxt);
	            	});
					console.log('只能出现一次');
				}
				
				
				app.$nextTick(function(){
					app.currentHtml = $('.item-list dl.cur .sound-text').html();
					app.initHtml = $('.item-list dl.cur .sound-text').html();
				
				});
											
			});
			//alert('loadPage');
	    	
	    },
	    upTime:function(){
	    	
	    	var player = this.playBtnBox;
            var newTime = parseInt(player.currentTime);
           // console.log("newTime:"+newTime)
        
            
            if(this.isNotFirst && newTime == this.currentIntTime){
                return;
            }
            if(!this.isNotFirst) {
                this.isNotFirst = true;
            }

            this.currentIntTime = newTime;
           

 			var html = this.currentHtml.replace(/<!---->/gmi,'');
         	var sourceHtml = html;
    	
			if(newTime != 0){
				
					
					

				
				if(this.currentItem.MsgUpInfoCopy.length > 0){
					
					var len = sourceHtml.length;
					var duration = parseInt(player.duration);
				
		            var calPerSec = len / duration;
					
					var parentDiv = $('.item-list dl.cur .sound-text').parents('.layer-body')[0];
	                var childDiv = $('.item-list dl.cur .sound-text')[0];
	
	                var parentClientHeight = parentDiv.clientHeight;
	                var childClientHeight = childDiv.clientHeight;
	                var scrollHeight = childClientHeight - parentClientHeight + 100;
	                console.log(scrollHeight);
	                var stepScroll = scrollHeight / duration;
	                if(scrollHeight % duration != 0){
	                    stepScroll += 1;
	                }
	                let parentTop = parentDiv.scrollTop;
	                if(parentTop < scrollHeight){
	                    parentDiv.scrollTop = parentTop + stepScroll;
	                }
					
					
					
					var startIndex = app.lastIndex;
					
				  	var startStr = sourceHtml.charAt(startIndex);
	                if(startStr == '<'){
	                    while(true){
	                        startIndex++;
	                        startStr = sourceHtml.charAt(startIndex);
	                        if(startStr == '>'){
	                            startIndex++;
	                          //  console.log("start break;")
	                            break;
	                        }
	                        //console.log("start plus plus")
	                    }
	                }
				
					
					
					var realStart = startIndex;
		            
		            if(startIndex != 0 ){
	                    var startStr = sourceHtml.charAt(startIndex);
	                    if(startStr == '<'){
	                        while(true){
	                            startIndex++;
	                            //tempTagTotal += 1;
	                            startStr = sourceHtml.charAt(startIndex);
	                            if(startStr == '>'){
	                                startIndex++;
	                                //tempTagTotal += 1;
	                                //console.log("start break;")
	                                break;
	                            }
	                            //console.log("start plus plus")
	                        }
	                    }
	
	                }
	
	                var realStart = startIndex;
	                if(realStart != 0) {
	                    while (true) {
	                        realStart--;
	                        startStr = sourceHtml.charAt(realStart);
	                        if (startStr == '>') {
	                            realStart++;
	                            //console.log("realStart break;")
	                            break;
	                        }
	                        if (startIndex - realStart > 2) {
	                           // console.log("realStart break for size;")
	                            break;
	                        }
	
	                        //console.log("start plus plus")
	                    }
	                }
		            
	                
	
			
					var curPerSec = parseInt(calPerSec);
	                var poccessSizeDown = Math.floor(player.currentTime * calPerSec);
	                //console.log("poccessSizeDown:"+poccessSizeDown)
	                //console.log("lastIndex:"+this.lastIndex)
	                var poccessSizeUP = Math.ceil(player.currentTime * calPerSec);;
	                //console.log("poccessSizeUP:"+poccessSizeUP);
	
			
			
					if(app.lastIndex < poccessSizeDown){
	                    curPerSec = 2 * curPerSec;
	                   // console.log("process slow:")
	                }else if(this.lastIndex > poccessSizeUP){
	                    //console.log("process fast:")
	                   
	                    return;
	                }
			
			
			
	                var endIndex = startIndex;
	                
	                
	                while (true){
	                    var endStr = sourceHtml.charAt(endIndex)
	                    
	                    if(endStr == '<'){
	                        console.log("end break;");
	                        break;
	                    }
	                    
	                    
	                    
	                    if(endIndex >= startIndex + curPerSec + 2){
	                        //console.log("end break for size;")
	                        break;
	                    }
	                    endIndex++;
	                    //console.log("end plus plus")
	                }
                
	                
	               
	
	                
					
	
					var realEnd = endIndex;
					
					
				
					var headStr = sourceHtml.substring(0,startIndex);
		            var midStr = sourceHtml.substring(startIndex,realEnd);
		            var tailStr = sourceHtml.substring(realEnd);
		
		            var newHtml = headStr + '<span style="color:red;">' + midStr + '</span>' + tailStr;
		            
					// item.MsgTxt = newHtml;
					 
								
					$('.item-list dl.cur .sound-text').html(newHtml);
					
					 app.lastIndex = realEnd;
					
					
					
					
				}
				//console.log(newTime)
				
			}
		
			
			
			
	            

	    	
	    },
		testTts:function(currentItem, callback){
			this.stepNeedPlay = false;
			//e.stopPropagation();
//			if(!currentItem){
//				this.dbInputData.forEach(function(nodeItem, nodeIndex){
//					if(nodeItem.NodeIndex == 0){
//						nodeItem.Items.forEach(function(item, index){
//							if(item.ItemIndex == 0){
//								currentItem = item;
//							}
//						});
//					}
//				});
//				
//			}
			
			var text = '';
			currentItem.TTSMsgUpInfo.forEach(function(iMsgInfoItem,iMsgInfoIndex){
				text += iMsgInfoItem.MsgTxt;
			});
			
			text = text.replace(delHtmlTag, '');
			
			if(text == ''){
				//app.isLoading = false;
				this.stepNeedPlay = true;
				app.canNext = true;
				return;
			}else{
				app.canNext = false;
			}
     		
            var data = {
					audioSRC:app.callInfo.CallTyp,
					agentCode:app.ttsInfo.AgentCode,
					tokenGenDate: app.ttsInfo.TokenGenDate,
                    speed:'6',
                    audioText:text,
					stepNode:String(app.stepIndex + 1) + '0' + String(app.itemIndex + 1)	
			};
			
		

			$.ajax({
				type:'post',
				url: app.ttsInfo.TTSItemUrl, 
				headers:{
					ttsToken:app.ttsInfo.TTSToken
				},
				datatype: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
				success:function(data){
                 
                    console.log(data)
                    callback(data);
					if(callback instanceof Function){
						
					}
					console.log('sucess')
				},
				error:function(){
					alert('网络异常，请稍后再试~')
				}
			});
		},
		testTts2:function(currentDoc, callback){
			//e.stopPropagation();
			
			var data = {
					audioSRC:app.callInfo.CallTyp,
					agentCode:app.ttsInfo.AgentCode,
					speed:'6',
					tokenGenDate:app.ttsInfo.TokenGenDate,
                    srcFileList:currentDoc.DocVedioFileName
			};

			
			$.ajax({
				type:'post',
				url:app.ttsInfo.TTSPdfUrl,
				headers:{
					ttsToken:app.ttsInfo.TTSToken,
					
				},
				datatype: "json",
				contentType: "application/json",
                data:JSON.stringify(data) ,
				success:function(data){
					app.isLoading = false;
					if(callback instanceof Function){
						callback(data);
					}
					console.log('sucess')
				},
				error:function(){
					
				}
			});
		},
		generateAVItemFinishedTrxn:function(requestData, callback){  //更新小步骤状态
			app.isLoading = true;
			$.ajax({
				type:'POST',
				url:' REST/GenerateAVItemFinishedTrxn',
				datatype: "json",
    			data:{
    				CallObjId: requestData.CallObjId || '',
    				NodeId: requestData.NodeId || '',
    				ItemId: requestData.ItemId || ''
    			},
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
				
					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
						alert('网络异常，请稍后再试~');
						app.isLoading = false;
					}else{
						if(JSON_RESULT_ERROR.length > 0){
							alert('网络不稳定');
							app.isLoading = false;
						}else{
							app.isLoading = false;
							if(callback instanceof Function){
								callback(JSON_RESULT_DATA);	
							}
						}
					}
					
			
					
					
				},
				error:function(){
					alert('网络异常，请稍后再试~');
					app.isLoading = false;
				}
			});
		},
		getAudioVedioForm:function(callback){   //获取页面对象
			//e.stopPropagation();
			//alert('getAudioVedioForm Start')
			$.ajax({
				type:'POST',
				url:' REST/GetAudioVedioForm',
				datatype: "json",
    
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
						
					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
						alert('网络异常，请稍后再试~');
						
					}else{
						if(JSON_RESULT_ERROR.length > 0){
							alert('网络不稳定');
						}else if(callback instanceof Function){
							callback(JSON_RESULT_DATA);	
						}
					}
					
					app.isLoading = false;
				},
				error:function(){
					alert('网络异常，请稍后再试~');
					app.isLoading = false;
				}
				
			});
			
			//alert('getAudioVedioForm comp')
		},
		
		
		
		
		generateAVTTSTrxn:function(requestData, type, callback){  //流水账接口
			$.ajax({
				type:'POST',
				url:' REST/GenerateAVTTSTrxn',
				datatype: "json",
    			data:{
    				CallObjId: requestData.CallObjId || '',
    				NodeId: requestData.NodeId || '',
    				ItemId: requestData.ItemId || '',
    				PlayOrStop:type
    			},
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
				
					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
						alert('网络异常，请稍后再试~');
						app.isLoading = false;
					}else{
						if(JSON_RESULT_ERROR.length > 0){
							alert('网络不稳定');
							app.isLoading = false;
						}else{
							app.isLoading = false;
							if(callback instanceof Function){
								callback(JSON_RESULT_DATA);	
							}
						}
					}
					
			
					
					
				},
				error:function(){
					alert('网络异常，请稍后再试~');
					app.isLoading = false;
				}
			});
		},
		
		
		savePos:function(callObjId,callback){
			$.ajax({
				type:'POST',
				url:' REST/GenerateAVPOSFinishedTrxn',
				datatype: "json",
    			data:{
    				CallObjId: callObjId || ''
    			},
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
				
					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
						alert('网络异常，请稍后再试~');
						app.isLoading = false;
					}else{
						if(JSON_RESULT_ERROR.length > 0){
							alert('网络不稳定');
							app.isLoading = false;
						}else{
							app.isLoading = false;
							window.location.href = './AudioVedioNote?NoteTyp=POS';
							
							if(callback instanceof Function){
								callback(JSON_RESULT_DATA);	
							}
							
						}
					}
								
				},
				error:function(){
					alert('网络异常，请稍后再试~');
					app.isLoading = false;
				}
			});
		},
		
		generateAVDocTrxn:function(requestData, type, callback){  //流水账接口  doc
			
			$.ajax({
				type:'POST',
				url:' REST/GenerateAVDocTrxn',
				datatype: "json",
    			data:{
    				CallObjId: requestData.CallObjId || '',
    				NodeId: requestData.NodeId || '',
    				ItemId: requestData.ItemId || '',
    				PlayOrStop:type
    			},
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
				
					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
						alert('网络异常，请稍后再试~');
						app.isLoading = false;
					}else{
						if(JSON_RESULT_ERROR.length > 0){
							alert('网络不稳定');
							app.isLoading = false;
						}else{
							app.isLoading = false;
							if(callback instanceof Function){
								callback(JSON_RESULT_DATA);	
							}
						}
					}
								
				},
				error:function(){
					alert('网络异常，请稍后再试~');
					app.isLoading = false;
				}
			});
		},
		//Special_Release_Gray_20200210 Begin		
		initSignWayC:function(jsonData,callback){    //签署方式
			$.ajax({
				type:'POST',
				url:' REST/InitSignWayC',
				datatype: "json",
    			data:jsonData,
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
					
					
					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
						alert('网络异常，请稍后再试~');
						app.isLoading = false;
					}else{
						if(JSON_RESULT_ERROR.length > 0){
							alert('网络不稳定');
							app.isLoading = false;
						}else if(callback instanceof Function){
							callback(JSON_RESULT_DATA);	
						}
					}
					
				},
				error:function(){
					alert('网络异常，请稍后再试~');
					app.isLoading = false;
				}
			});
		},
		//Special_Release_Gray_20200210 End
		initAVeSign:function(jsonData,callback){    //签署方式
			$.ajax({
				type:'POST',
				url:' REST/InitAVeSign',
				datatype: "json",
    			data:jsonData,
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
					
					
					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
						alert('网络异常，请稍后再试~');
						app.isLoading = false;
					}else{
						if(JSON_RESULT_ERROR.length > 0){
							alert('网络不稳定');
							app.isLoading = false;
						}else if(callback instanceof Function){
							callback(JSON_RESULT_DATA);	
						}
					}
					
				},
				error:function(){
					alert('网络异常，请稍后再试~');
					app.isLoading = false;
				}
			});
		},
		
		confirmAudioVedio:function(callback){    //最后提交
			app.isLoading = true;
			$.ajax({
				type:'POST',
				url:' REST/ConfirmAudioVedio',
				datatype: "json",
    			data:{
    				eAppNumber:app.callInfo.RefKey01,  
    				cnfrmNum:app.signForm.signNumber
    			},
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
//	
//					if(JSON_RESULT_ERROR.length >= 1){
//						 for (var idx in JSON_RESULT_ERROR) {
//                          _errMsg = _errMsg + JSON_RESULT_ERROR[idx].errorCode + ":" + JSON_RESULT_ERROR[idx].errorMessage + '<br/>';
//                      }
    	
    					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
    						alert('网络异常，请稍后再试~');
    						app.isLoading = false;
    					}else{
							if(JSON_RESULT_ERROR.length > 0){
	    						alert(JSON_RESULT_ERROR[0].errorMessage);
	    						app.isLoading = false;
	    					}else if(callback instanceof Function){
								callback(JSON_RESULT_DATA);	
							}
						}
    	
    
//                      app.$Modal.info({
//                          title: "信息",
//                          content: _errMsg,
//                          onOk: function () {
//                           
//                          }
//                      });
						
						
					
					
				},
				error:function(){
					alert('网络异常，请稍后再试~');
					app.isLoading = false;
				}
			});
		},
		
    	clsoeNav:function(){ //关闭指引1  
    		var that = this;
    		this.modalNav = false;
    		this.modalNav2 = true;
    		
    		if(this.itemLen >= 2){
              	
    			app.testTts(app.currentItem, function(data){
					app.itemTtsUrl = app.ttsInfo.TTSBaseUrl + data.fileUrl;
					//app.itemTtsUrl = data.fileUrl + '&signature=' + data.signature;
					app.$nextTick(function(){
						
						console.log(app.playBtnBox.src);
						app.playBtnBox.load();
						
						app.playBtnBox.addEventListener('canplaythrough',function(){
							var timer = setTimeout(function(){
								app.playLoading = false;
								clearTimeout(timer);
							},1000);
							
						});
					});
					
					//alert(app.playBtnBox);
					
				});
    		}else{
    			alert('需要开发')
    			//this.testTTs(this.stepIndex+1, this.itemIndex);
    		}
    		
    	},
    	clsoeNav2: function(){  //关闭指引2
    		this.modalNav2 = false;
    	},
    	
        palyClause:function(){  //播放节点 tts
        	
			//this.testTts();
			
			this.$nextTick(function(){
				//var playBtnBox = document.getElementById('audio');
				//playBtnBox.src= this.ttsUrl;
				
				var size = this.playBtnBox.duration;
				var isEnd = this.playBtnBox.ended;


				// 监听播放进度
//				this.playBtnBox.addEventListener('timeupdate',function(){
//			
//					
//					var percent = this.playBtnBox.currentTime / this.playBtnBox.duration;
//					
//					
//					var sp = 600/100;
//					
//					var swidth = (percent*100 *sp) + 'px';
//					
//					document.getElementById('playProgressBar').style.width = swidth;
//					document.getElementById('ptxt').innerText = ((percent*100).toFixed(2)) + '%';
//					
//				});
				
				//监控播放结束
				
				
				//alert('点击了');
				
	
				
				if(!app.playBtnBoxPlayed){
					app.playBtnBox.play();
					app.playStart = true;
					app.generateAVTTSTrxn(app.stepData,'paly');
				}
	
				
				//alert(2);			
				//播放监控
				//app.generateAVTTSTrxn(app.stepData,'paly');
				
				app.playBtnBoxPlayed = true;
					
			});
        
        },
        pauseClause:function(){  //暂停节点 tts
        	if(this.playBtnBox.paused){
        		return;
        	}
        				
			this.playBtnBox.pause();
			this.generateAVTTSTrxn(app.stepData,'stop');
        	
        	app.playBtnBoxPlayed = false;
        	
        	
      
        },
        refStartClause:function(){ //重新开始播放节点   tts
        	app.playBtnBoxPlayed = false;
        	//app.canNext = false;    //去除重新必须播放完毕的限制
        	//sessionStorage.removeItem(app.currentItem.ItemId + app.callInfo.RefKey01);
        	
        	//var playBtnBox = document.getElementById('audio')
        	
        	$('.item-list dl.cur .sound-text').html('');
        	app.currentItem.MsgUpInfo.forEach(function(item,index){
        		app.htmlArr.push(item.MsgTxt);
        		 $('.item-list dl.cur .sound-text').append('<p>'+ item.MsgTxt +'</p>');
			});
        	
        	app.$nextTick(function(){
				app.currentHtml = app.initHtml;
				app.lastIndex = 0;
				app.playBtnBox.load();	
        	
				var refPlayTimer = setTimeout(function(){
					
	        		app.playBtnBox.play();
	        		
	        		
	        		clearInterval(refPlayTimer)
	        	},200);
			});
        	
        	
        	//document.getElementById('ptxt').innerText = '0 %'	
        },
        
        playDocTts:function(docData){   //pdf tts 播放
        	
        	this.docPlay = true;
        	
        	if(!this.playPdfBtnPlay){
        		this.playPdfBtn.play();
        		this.playPdfBtnPlay = true;
        		$('#stepAudioBtn').html('暂停');
        		
        		this.generateAVDocTrxn(app.stepData,'play');
        		
        		
        	}else{
        		this.playPdfBtn.pause();
        		this.playPdfBtnPlay = false;
        		$('#stepAudioBtn').html('播放');
        		
        		this.generateAVDocTrxn(app.stepData,'stop');
        	}
        	
        	        
        },
        
        nextStep:function(globalState, itemState,currentItem){  //下一项   
        	var that = this;
        	
			if(app.currentItem){			
				//alert(app.currentItem.CliMsg);
				//alert(app.currentItem.CliMsg != null);
			
				if(app.stepName == 'ND_A50' && app.currentItem.DocInfo.length >= 1){  //app.stepName == '风险揭示'
            		//alert(1111);
            		app.canNext2 = app.currentItem.DocInfo.every(function(item, index){
            			return item.IsFinished; 
            		});
            	
            		if(currentItem.IsFinished == 'Y'){
						app.canNext =  true;
					}
            		
            	
            		if(sessionStorage.getItem(app.currentItem.ItemId + app.callInfo.RefKey01) == 'true'){
		        		app.canNext = true;
		        	}
            		
            		
            		if(app.dev){
			      		this.canNext = true;
			      	}
            		
            		if(!app.canNext || !app.canNext2){
            			if(app.playStart){
		        			app.pauseClause();
		        		}
	            		alert('请先完成当前节点');
	            		if(app.playStart){
		        			app.palyClause();
		        		}
	            		return;
	            	}
            		
            		
      				app.playBtnBoxPlayed = false;
      				app.playLoading = true;
      			
      				
      			
      				var bodyScrollT = $('.layer-body').scrollTop();
      			
            		$('.layer-body').scrollTop($('.item-list dl.cur').height() + bodyScrollT + 80);
            		
            	
            	}else if(app.stepName == 'ND_A50' && app.currentItem.CliMsg == null){
					
					app.canNext2 = app.currentItem.DocInfo.every(function(item, index){
            			return item.IsFinished; 
            		});
            	
            		if(currentItem.IsFinished == 'Y'){
						app.canNext =  true;
					}
            		
            	
            		if(sessionStorage.getItem(app.currentItem.ItemId + app.callInfo.RefKey01) == 'true'){
		        		app.canNext = true;
		        	}
            		
            		
            		if(app.dev){
			      		this.canNext = true;
			      	}
            		
            		if(!app.canNext || !app.canNext2){
	            		if(app.playStart){
		        			app.pauseClause();
		        		}
	            		alert('请先完成当前节点');
	            		if(app.playStart){
		        			app.palyClause();
		        		}
	            		return;
	            	}
            		
            		
      				app.playBtnBoxPlayed = false;
      				app.playLoading = true;
					
					
            		var bodyScrollT = $('.layer-body').scrollTop();
            		$('.layer-body').scrollTop($('.item-list dl.cur').height() + bodyScrollT + 80);
            	}
			}
        	
        	
	      	if(app.dev){
	      		this.canNext = true;
	      	}
        
        
        	if(currentItem.IsFinished == 'Y'){
				app.canNext =  true;
			}
        	
        	if(sessionStorage.getItem(app.currentItem.ItemId + app.callInfo.RefKey01) == 'true'){
        		app.canNext = true;
        	}
        	
//      	if(app.stepNeedPlay){
//      		app.canNext = true;
//      	}
			
        
        	if(!app.canNext){
				
				if(app.playStart){
        			app.pauseClause();
        		}
        		alert('请先完成当前节点');
        		if(app.playStart){
        			app.palyClause();
        		}
				
            	return;
			}
        
        	
			if(this.signConState){
				//alert('签署完成了');
				return
			}else{
				//alert(111);
				this.playBtnBox.pause();
				this.playBtnBox.currentTime = 0;
					
						
				this.dbInputData.forEach(function(item,index){
			      if(item.Current){
			      	that.itemLen = item.Items.length; 	
			      }
				});
				
				
				
				if(app.stepName == 'ND_A50' && itemState >= this.itemLen -1 && app.callInfo.CallTyp == 'POS'){   //POStest
					app.isLoading = true;
					app.posShow = true;
					sessionStorage.setItem('layer-body' + app.callInfo.RefKey01, $('.layer-body').scrollTop())
					var posTimer1 = setTimeout(function(){
						app.dbInputData.forEach(function(item, index){
							if(index == app.dbInputData.length -1){
								item.Current = true;
								app.nodeIndex = Number(item.NodeIndex);
								app.stepData.NodeId = item.NodeId;
								app.stepIndex = Number(item.NodeIndex);
								item.Items.forEach(function(item2, index2){
									if(index2 == item.Items.length -1){
										app.currentItem = item2
										app.stepData.ItemId = item2.ItemId;	
										
										app.itemIndex = Number(item2.ItemIndex);
										item2.Current = true;
									}
								});
	
							}
						});
						app.isLoading = false;
						clearTimeout(posTimer1)
					},200)
					
					var posTimer2 = setTimeout(function(){
						$('.layer-body').scrollTop(Number(sessionStorage.getItem('layer-body' + app.callInfo.RefKey01)));
						clearTimeout(posTimer2)
					},500)
					
				}
				
				if(app.stepName == 'ND_A50' && itemState >= this.itemLen -1 && app.callInfo.CallTyp == 'EAPP'){
					//alert('测试');
					
					//app.stepName =  '签署确认'
					
					this.signConState = true;
					this.signState = true;	
					//this.playLoading = false;
					
					this.dbInputData.forEach(function(item,index){
				      item.Current = false;
					});
					
					app.isLoading = false;
					
					this.generateAVItemFinishedTrxn(this.stepData); 
					
					sessionStorage.setItem('layer-body' + app.callInfo.RefKey01, $('.layer-body').scrollTop())
					return;
				}else{
					
					//  设置当前操作item
					//alert('设置当前操作item')
					app.dbInputData.forEach(function(item, index){
						if(item.Current){
							app.stepData.NodeId = item.NodeId;
							item.Items.forEach(function(item2, index2){
								if(item2.Current){
									app.currentItem = item2;
									app.stepData.ItemId = item2.ItemId;	
								}
								
							});
						}
	            	});	
					
					
					if(itemState >= app.itemLen-1){ 
	            		//开始到下一个大状态
	            		            	
	            		//alert('开始下一大节点')
	            		
	            		
	            		
	            		if(sessionStorage.getItem(app.currentItem.ItemId + app.callInfo.RefKey01) == 'true'){
			        		app.canNext = true;
			        	}

		       
		            	$('.layer-body').scrollTop(0);
		            	
		            	
		            	if(app.dev){
				      		this.canNext = true;
				      	}
		            	
		            		if(!app.canNext){
								if(app.playStart){
			        			app.pauseClause();
			        		}
		            		alert('请先完成当前节点');
		            		if(app.playStart){
			        			app.palyClause();
			        		}
			            	return;
						}
	            		
	            		
	            		app.lastIndex = 0;
						app.playStart = false;
						app.currentHtml = app.initHtml;
						$('.item-list dl.cur .sound-text').html(app.initHtml);
				            		
	            		
	            		app.playLoading = true;	
	            		app.playBtnBoxPlayed = false;
	            		
	            		this.itemIndex = 0;
	            		
	            		this.canNext = false;
	            		/*   开始调用完成步骤接口    */
	            		this.generateAVItemFinishedTrxn(this.stepData,function(data){
	            			app.stepIndex = app.stepIndex + 1;
	            		
			            	app.dbInputData.forEach(function(item,index){
			            		item.Current = false;
			            		
			            		item.Items.forEach(function(item2, index2){
				            		item2.Current = false;
				            	})
			            		
			            		if(item.NodeIndex == that.stepIndex){
			            			item.Current = true;
			            			app.stepName = item.NodeId;
			            			if(app.stepName == 'ND_A50'){
										app.stepVedioPop = true;	
									}
			            		}
			            		
			            		
			            		item.Items.forEach(function(item2, index2){
				            		if(item.Current){
				            			if(item2.ItemIndex == 0){
					            			item2.Current = true;
					            		}
				            		}
				            	});	      
				            	
				            	
				            });
	            			
	            			
	            			
	            			//test3
	            			app.dbInputData.forEach(function(item, index){
								if(item.Current){
									app.stepData.NodeId = item.NodeId;
									item.Items.forEach(function(item2, index2){
										if(item2.Current){
											app.currentItem = item2;
											app.stepData.ItemId = item2.ItemId;	
										}
										
										
									});
								}
								
								
			            	});	
			            	
			            	
			            	
			            	
				            app.testTts(app.currentItem, function(data){
				            	//app.playLoading = true;
				            	app.itemTtsUrl = app.ttsInfo.TTSBaseUrl + data.fileUrl;
								//app.itemTtsUrl = data.fileUrl + '&signature=' + data.signature;
								app.$nextTick(function(){
								
									console.log(app.playBtnBox.src);
									app.playBtnBox.load();
									
									app.playBtnBox.addEventListener('canplaythrough',function(){
										var timer = setTimeout(function(){
											app.playLoading = false;
											clearTimeout(timer);
										},1000);
									});
								});
							});
				            
	            			this.canNext = false;
	            			
	            			app.resetHtml(function(){
			            		//var cleanHtml = $('.item-list dl.cur .sound-text').html().replace(/<!---->/gmi,'');
			            		var cleanHtml = $('.item-list dl.cur .sound-text').html();
		      					app.currentHtml =  $('.item-list dl.cur .sound-text').html();
		          				app.initHtml = cleanHtml;
		          		
			            	});
	            		
	            			
	            				
	            			
	            		});
	            		
	            		
		            	
		            	if(sessionStorage.getItem(app.currentItem.ItemId + app.callInfo.RefKey01) == 'true'){
		            		app.canNext = true;
		            		
		            	}
		            	
//		            	if(app.stepNeedPlay){
//			        		app.canNext = true;
//			        	}
		            		
		            	//this.generateAVItemFinishedTrxn(this.stepData); 
			            	    
	            	}else{
	            		
	            		if(sessionStorage.getItem(app.currentItem.ItemId + app.callInfo.RefKey01) == 'true'){
			        		app.canNext = true;
			        	}
	            		
//	            		if(app.stepNeedPlay){
//			        		app.canNext = true;
//			        	}
				          
				            
		            		if(!app.canNext){
								if(app.playStart){
			        			app.pauseClause();
			        		}
		            		alert('请先完成当前节点');
		            		if(app.playStart){
			        			app.palyClause();
			        		}
			            	return;
						}
	            		
	            		
	            		app.lastIndex = 0;
						app.playStart = false;
						app.currentHtml = app.initHtml;
						$('.item-list dl.cur .sound-text').html(app.initHtml);
	            		
	            		app.playLoading = true;
	            		app.playBtnBoxPlayed = false;
	            		
	            		//alert(2222);
	           			this.generateAVItemFinishedTrxn(this.stepData,function(data){
	           				
	           				app.itemIndex = app.itemIndex+1;
		          	            	  	
			            	app.dbInputData.forEach(function(item,index){
				            	
				            	if(item.NodeIndex == app.stepIndex){
				            		
				            		item.Items.forEach(function(item2, index2){
					            		item2.Current = false;
					            		if(item2.ItemIndex == app.itemIndex){
					            			item2.Current = true;
					            			//item2.IsFinished = 'Y';
					            		}
					            	})
				            	}
				            	
				            });
				            
				            
				            
				            app.dbInputData.forEach(function(item, index){
								if(item.Current){
									app.stepData.NodeId = item.NodeId;
									item.Items.forEach(function(item2, index2){
										if(item2.Current){
											app.currentItem = item2;
											app.stepData.ItemId = item2.ItemId;	
										}		
										
									});
								}
		
								
			            	});	
			            	
			            	
				            
				            app.testTts(app.currentItem, function(data){
				            	//app.playLoading = true;  
								app.itemTtsUrl = app.ttsInfo.TTSBaseUrl + data.fileUrl;
								//app.itemTtsUrl = data.fileUrl + '&signature=' + data.signature;
								
								app.$nextTick(function(){
									
									console.log(app.playBtnBox.src);
									app.playBtnBox.load();
									
									app.playBtnBox.addEventListener('canplaythrough',function(){
										var timer = setTimeout(function(){
											app.playLoading = false;
											clearTimeout(timer);
										},1000);
									});
								});
								
							});
				            
				            
				            this.canNext = false;
				            
				            app.resetHtml(function(){
			            		var cleanHtml = $('.item-list dl.cur .sound-text').html().replace(/<!---->/gmi,'');
		      					app.currentHtml =  $('.item-list dl.cur .sound-text').html();
		          				app.initHtml = cleanHtml;
		          		
			            	});
				           									            
	           				
	           			});
	           
	           
	           
		            	
//		            	if(sessionStorage.getItem(app.currentItem.ItemId) == 'true'){
//		            		app.canNext = true;
//		            		
//		            	}
		            	
		            	//this.generateAVItemFinishedTrxn(this.stepData); 
			            
	            	}
	            	
	            	
	            	
	            	
	            	
	            	
	            	//this.generateAVItemFinishedTrxn(this.stepData); 
	            	
	            	
	            	
	            	//alert(app.stepIndex);
	            	//alert(app.currentItem.DocInfo.length);
	            	
//	            	if(app.stepIndex == 4 && app.currentItem.DocInfo.length >= 1){
//	            		alert(app.canNext);
//	            		app.canNext = app.currentItem.DocInfo.every(function(item, index){
//	            			return item.IsFinished; 
//	            		});
//	            		
//	            		console.log(app.canNext);
//	            	}
	            	
	           	
	            	
	            	// 预加载pdf的 tts
	            	
//	            	if(!app.canNext){
//	            		alert('请先完成当前节点');
//	            		return;
//	            	}
//	            	
	            		
				}
			}
			
			
			
			if(!app.stepNeedPlay){
				this.canNext = false;
			}
			
           
    	},
        preStep:function(globalState, itemState){   //上一项
        	var that = this;
            
			
//			var scollT = $('.layer-body').scrollTop();
//			
//			if(app.currentItem){					
//				if(app.stepName == '风险揭示' && app.currentItem.DocInfo.length >= 1){  
//          		$('.layer-body').scrollTop(scollT - $('.item-list dl.cur').height() - 40);
//          	
//          	}
//			}
   			
// 			if(app.stepName == '签署确认'){
// 				$('.layer-body').scrollTop(686);
// 			};
   			
   			
   			
   			
   			
   			   
 			this.dbInputData.forEach(function(item,index){
		      if(item.Current){
		      	app.itemLen = item.Items.length; 	
		      } 
			});
   
   			app.posShow = false;
   			
   			if(this.signConState){
   			
   				var tops = sessionStorage.getItem('layer-body' + app.callInfo.RefKey01) || 0;
   			
   				var scollTimer = setTimeout(function(){
   					$('.layer-body').scrollTop(tops);
   					clearTimeout(scollTimer);
   				},300);
   				
   				
   				this.signConState = false;
   				
   				this.dbInputData.forEach(function(item,index){
			      if(item.NodeIndex == that.stepIndex){
			      	item.Current = true;   	
			      	
			      	
			      	item.Items.forEach(function(item2, index2){
			      		if(item2.ItemIndex == that.itemIndex){
			      			item2.Current = true;
			      		}
			      	});
			      }
			         
				});
   			}else{
   				
   
   				if(app.stepName == 'ND_A50'){
            		var bodyScrollT = $('.layer-body').scrollTop();
            		$('.layer-body').scrollTop(bodyScrollT - $('.item-list dl.cur').height() - 80);
            		
            	}
   				
   				   				
   				if(globalState <= 0 && itemState <=0){
   					
	   				app.canNext = false;
	   				app.isLoading = false;
	   				return;
	   				
	   			}else{
	   				app.canNext = true;
	   				
	   				app.isLoading = true;
   
		   			this.playBtnBox.pause();
					this.playBtnBox.currentTime = 0;
					app.playBtnBoxPlayed = false;
					
					var loadingTimer = setTimeout(function(){
						app.isLoading = false;
						clearTimeout(loadingTimer);
					},500);
	   				
	   				app.lastIndex = 0;
					app.playStart = false;
					app.currentHtml = app.initHtml;
					$('.item-list dl.cur .sound-text').html(app.initHtml);
	   				
		          	if(this.itemIndex <= 0){ 
		          		
		          		//修改大状态 到上一个状态
		          		
		          		if(this.stepIndex >= 1){
		          			
		          			this.stepIndex = this.stepIndex - 1;  //大状态 回1个
		          			
		          			
		          			var next = that.stepIndex + 1;
			          		this.dbInputData[next].Current = false;
			          		this.dbInputData[this.stepIndex].Current = true;
			          		
			          		
				            //this.dbInputData[this.stepIndex].itemList[0].current = true;
				            
				            
				            this.dbInputData.forEach(function(item,index){
						      if(item.Current){
						      	app.stepName = item.NodeId;
						      	that.itemLen = item.Items.length; 	
						      	
						      	if(app.stepName == 'ND_A50'){
									app.stepVedioPop = true;	
								}else{
									app.stepVedioPop = false;
								}
								      	
						      	//alert(app.itemLen);
						      	
						      }
							      
							});
							          
					        this.itemIndex = this.itemLen - 1;
				            
				            app.resetHtml(function(){
			            		var cleanHtml = $('.item-list dl.cur .sound-text').html().replace(/<!---->/gmi,'');
		      					app.currentHtml =  $('.item-list dl.cur .sound-text').html();
		          				app.initHtml = cleanHtml;
		          		
			            	});
				            this.dbInputData.forEach(function(item,index){
				            	
				            	if(item.NodeIndex == that.stepIndex){
				            		if(item.Current){
				            			item.Items.forEach(function(item2, index2){
						            		item2.Current = false;
						            		if(item2.ItemIndex == that.itemLen -1){
						            			item2.Current = true;
						            		}
						            	})
				            		}
				            		
				            		
				            	}
				            	
				            	
				            })
				            
				           
				         
							//$('.layer-body').scrollTop(($('.item-list dl.cur').height() + 40)*5);
							if(app.currentItem){	
								if(app.stepName == 'ND_A50' && app.currentItem.DocInfo.length >= 1){  //app.stepName == '风险揭示'
				            		$('.layer-body').scrollTop(($('.item-list dl.cur').height() + 40)*5);
				            	
				            	}
							}
								           		          			
		          		}
		          		
		            //	this.dbInputData[this.stepIndex].itemList[this.itemLen -1].current = true;
		            	//alert(this.itemIndex);
		            	//this.itemIndex = 0;
			            	
		          	}else{
		          		
		          	
						if(this.itemIndex >= 1){
		          			this.itemIndex = this.itemIndex - 1;  
		          		}
		          			
			          				          			
		            	this.dbInputData.forEach(function(item,index){
			            	if(item.NodeIndex == that.stepIndex){
			            		item.Items.forEach(function(item2, index2){
				            		item2.Current = false;
		
				            		if(item2.ItemIndex == that.itemIndex){
				            			item2.Current = true;
				            		}
				            	})
			            	}
			            	
			            })
		            	
		            
		            	app.resetHtml(function(){
		            		var cleanHtml = $('.item-list dl.cur .sound-text').html().replace(/<!---->/gmi,'');
	      					app.currentHtml =  $('.item-list dl.cur .sound-text').html();
	          				app.initHtml = cleanHtml;
	          		
		            	});
		          	}
		          	
		          	
		         	
		         	
		          	app.dbInputData.forEach(function(item, index){
						if(item.Current){
							app.stepData.NodeId = item.NodeId;
							item.Items.forEach(function(item2, index2){
								if(item2.Current){
									app.currentItem = item2;
									app.stepData.ItemId = item2.ItemId;	
								}
							});
						}
	            	});
	          	
		          
	   			}
   				
   			}
   			
   			app.testTts(app.currentItem, function(data){
				app.itemTtsUrl = app.ttsInfo.TTSBaseUrl + data.fileUrl;
				//app.itemTtsUrl = data.fileUrl + '&signature=' + data.signature;
				app.$nextTick(function(){
					
					console.log(app.playBtnBox.src);
					app.playBtnBox.load();
					
					app.playBtnBox.addEventListener('canplaythrough',function(){
					
						var timer = setTimeout(function(){
							app.playLoading = false;
							clearTimeout(timer);
						},1000);
					});
				});
			});
			
            //app.isLoading = false;
        },
        showDoc:function(e,docData){  //显示pdf文档动作
            //e.stopPropagation();
            app.isLoading = true;
            e.preventDefault();
            app.docData = docData;
            //console.log(docData);
            
            app.playPdfBtnPlay = false;
            
            this.playBtnBox.pause();
			this.playBtnBox.currentTime = 0;
            clearTimeout(app.scrollTimer);
            $('#pdf-container-box').scrollTop(0)
            
            this.stepVedioPop2 = true;
            //this.playPdfBtn.pause();
            //this.playPdfBtn.currentTime = 0;
            
            if(docData.IsFinished || docData.Current){
            	app.pdfRead = true;	
            }else{
            	app.pdfRead = false;
            }
            
            if(docData.IsFinished || !docData.MustNeedPlay){
            	app.docPlay = true;
            	//app.pdfRead = true;
            	
            }else{
            	app.docPlay = false;
            	//app.pdfRead = false;
            }
            
//          var readTimer = setTimeout(function(){
//          	app.pdfRead = true;
//          	clearTimeout(readTimer);
//          },5000);
            
           
            
//          app.pdfRead = true;
//          
//          var arr = Object.keys(app.pdfReadObj);
//          
//          if(arr.lenght>0){
// 	   			if(app.pdfReadObj[docData.DocId]){
// 	   				app.pdfRead = false;
// 	   			}
// 	  
//          }

//			app.pdfRead = true;
//			if(sessionStorage.getItem){
//				if(sessionStorage.getItem(docData.DocId)){
//				
//				}
//			}
			
			
			
            
            this.docIndex = Number(docData.DocIndex);
            
            
            this.doctype = docData.DocId;
            
            docData.Current = true;
            
			if(!docData.NeedRead){
				if(app.canNext){
					docData.IsFinished = true;
					app.stepVedioPop2 = false;
					app.isLoading = false;
					app.pdfPlayLoading = false;
					
					app.generateAVDocCloseTrxn(app.stepData);
				}else{
					app.stepVedioPop2 = false;
					app.isLoading = false;
					app.pdfPlayLoading = false;
		
					alert('请先完成播报');
				}
				
//				this.getAudioVedioDocument(docData, function(data){
//					
//				})
				
				return;
			}
            app.pdfPlayLoading = true;
         
			this.getAudioVedioDocument(docData, function(data){
				$('#pdf-container-box').scrollTop(0);
		
				loadPDF(data.url,function(){
					app.loadPdfOk = true;
				});
				app.palyBtnShow = true;
				
				$('#pdf-container-box').css('z-index',999);
				
				
				if(docData.NeedPlay == 'Y'){
					app.testTts2(docData, function(data){
						app.pdfTtsUrl = app.ttsInfo.TTSBaseUrl + data.fileUrl;
						//app.pdfTtsUrl = data.fileUrl + '&signature=' + data.signature;
						
						app.$nextTick(function(){
							app.playPdfBtn.load();   
							app.playPdfBtn.addEventListener('canplaythrough',function(){
								
								
								var pdfTimer = setTimeout(function(){
									app.pdfPlayLoading = false;
									clearTimeout(pdfTimer);
								},1000);
								
							});
							
							console.log(app.pdfTtsUrl);
						});
								
						
					});
				}
					
				
			});
			
			
			
			
        },
        
        resetHtml:function(callback){
        	if(app.currentItem.MsgUpInfoCopy.length>0){
        			
			}
        	
        	var clearTimer = setTimeout(function(){
				$('.item-list dl.cur .sound-text').html('');	
				app.currentItem.MsgUpInfo.forEach(function(item,index){
	        		app.htmlArr.push(item.MsgTxt);
	        		if(item.MsgTxt.length > 0){
	        			$('.item-list dl.cur .sound-text').append('<p>'+ item.MsgTxt +'</p>');
	        		}
	        		 
				});
				app.lastIndex = 0;
				if(callback instanceof Function){
					callback();	
				}
				
				clearTimeout(clearTimer);
			},100);			
        	
        },
        testPdf:function(){    //PDFTEST
        	$.ajax({
				type:'POST',
				url:' REST/GetAudioVedioDocument',
				datatype: "json",
				contentType: "application/json",
				//mimeType:'text/plain; charset=x-user-defined',
	  			//mimeType:'application/pdf',
	  			data:JSON.stringify({CallInfo:app.callInfo,DocTyp:docObj.DocId}),
	  				//data:
	  				//eAppAVCallInfo:app.stepData || '',
	  				//EAppAVCallInfo:app.callInfo,
	  				//CallInfo:JSON.stringify({app.callInfo}),
	  				//PostData:JSON.stringify({
	  					//CallInfo:app.callInfo,
	  					//DocTyp:docObj.DocId
	  				//})
	  				//DocTyp: docObj.DocId
	  			
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
						alert('网络异常，请稍后再试~');
					
					}else{
						if(JSON_RESULT_ERROR.length > 0){
							alert('网络不稳定');
						}else{
							
							if(callback instanceof Function){
								callback(JSON_RESULT_DATA);	
							}
						}
					}
					
				},
				error:function(){
					alert('error');
				}
			});	
       	},
        
        generateAVDocCloseTrxn:function(stepData){   //文档点击关闭的时候
        	$.ajax({
				type:'POST',
				url:' REST/GenerateAVDocCloseTrxn',
				datatype: "json",
	  			data:{
	  				CallObjId:stepData.CallObjId,
	  				NodeId: stepData.NodeId,
	  				ItemId:stepData.ItemId,
	  				DocId:app.docData.DocId
	  			},
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
										
					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
						alert('网络异常，请稍后再试~');

					}else{
						if(JSON_RESULT_ERROR.length > 0){
							alert('网络不稳定');
						}
					}					
				},
				error:function(){
					alert('error');
				}
			});	
        },
        getAudioVedioDocument:function(docObj,callback){  //获取pdf文件
        	app.isLoading = true;
        	//app.callInfo.DocTyp = docObj.DocId;
        	$.ajax({
				type:'POST',
				url:' REST/GetAudioVedioDocument',
				datatype: "json",
				contentType: "application/json",
				//mimeType:'text/plain; charset=x-user-defined',
	  			//mimeType:'application/pdf',
	  			data:JSON.stringify({CallInfo:app.callInfo,DocTyp:docObj.DocId}),
	  				//data:
	  				//eAppAVCallInfo:app.stepData || '',
	  				//EAppAVCallInfo:app.callInfo,
	  				//CallInfo:JSON.stringify({app.callInfo}),
	  				//PostData:JSON.stringify({
	  					//CallInfo:app.callInfo,
	  					//DocTyp:docObj.DocId
	  				//})
	  				//DocTyp: docObj.DocId
	  			
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
										
					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
						alert('网络异常，请稍后再试~');

					}else{
						
						if(JSON_RESULT_ERROR.length > 0){
							alert('网络不稳定');
						}else{
							
							if(callback instanceof Function){
								callback(JSON_RESULT_DATA);	
							}
						}
					}

					
					
				},
				error:function(){
					alert('error');
				}
			});	
        },
        
        doExecResult:function(callback){
        	app.isLoading = true;
        	$.ajax({
				type:'POST',
				url:' REST/DoExecResult',
				datatype: "json",
    			data:{
    				CallObjId:app.callInfo.CallObjId
    			},
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
					if(typeof(JSON_RESULT_ERROR) == 'undefined'){
						alert('网络异常，请稍后再试~');
					}else{
						if(JSON_RESULT_ERROR.length > 0){
							alert('网络不稳定');

						}else{
							if(callback instanceof Function){
								callback(JSON_RESULT_DATA);	
							}
							
						}
					}
					
					app.isLoading = false;
					
				},
				error:function(){
					alert('服务器打了个盹，请稍后再试~');
					app.isLoading = false;					
				}
			});
        },
        
        closeDoc:function(){		
            this.modalDocumentInfo = false;
        },
        getDocData:function(data){
        	
            this.docListCurObj = data;
            var word = new SpeechSynthesisUtterance(data.des);
           
            if(data.type == 'application'){
                this.showPdf = true;
            }else{
                this.modalDocumentInfo = true;
                window.speechSynthesis.speak(word);
            }
           
        },
        closePdf:function(stepIndex, itemIndex, docIndex){   //关闭pdf文档
        	//sessionStorage.setItem(docData.DocId, true);
       
        	app.generateAVDocCloseTrxn(app.stepData);
        	app.loadPdfOk =false;
        	
        	loadingTask = null;
        	loadingTasktimer = null;
        	app.dbInputData.forEach(function(item, indxex){
				
				if(item.NodeIndex == stepIndex){
					
					item.Items.forEach(function(item2, index2){
						
			      		if(item2.ItemIndex == itemIndex){
			      			if(item2.DocInfo && item2.DocInfo.length > 0){
			      				item2.DocInfo.forEach(function(item3, index3){
				      				if(item3.DocIndex == docIndex){
				      					item3.IsFinished = true;
				      				}
				      			});
			      			}
			      		}
			      	});
				
				}
				
				
			});
			
			
			if(!this.docPlay){
				alert('请先完成播报');
				return;
			}
			
			
			$('#pdf-container').html('');
			
			    
			this.playPdfBtn.pause();    
			this.playPdfBtn.currentTime = 0;        	
            $('#stepAudioBtn').html('播放')
            
            this.showPdf = false;
            
            this.palyBtnShow = false;
            
            this.stepVedioPop2 = false;
        },
        
        signNext:function(){   //签署确认下一步
        	if(this.signType == 'N'){    //线下签署
        		var data ={
        			eAppNumber:this.callInfo.CallTyp == 'EAPP' ? this.callInfo.RefKey01 : '',
        			signWay:this.signType
        		};
        		
        		this.initAVeSign(data,function(){
        			app.signEnd = true;	
        		});
        		

        	}else if(this.signType == 'E'){
        		var data ={
        			eAppNumber:this.callInfo.CallTyp == 'EAPP' ? this.callInfo.RefKey01 : '',
        			signWay:this.signType
        		};
        		this.initAVeSign(data,function(){
        			$('#eSignature').submit();
        			//app.signEnd = true;	
        		});
            } else if (this.signType == 'C') {
        		var data ={
        			eAppNumber:this.callInfo.CallTyp == 'EAPP' ? this.callInfo.RefKey01 : '',
                    signWay:this.signType
        		};
        		this.initSignWayC(data,function(){
                    $('#edit').submit();
        		});
        	}
        	
        	else{    
        		alert('请选择投保签署方式');
        		//电子签名
        		       		
        		//alert('电子签名');
//      		var _url = "eSignature";
//              var form = $('<form action="' + _url + '" method="post">' +
//                      '<input type="hidden" name="ApplicationNumber" value="' +  this.callInfo.CallTyp == 'EAPP' ? this.callInfo.RefKey01 : ''  + '" />' +
//                      '</form>');
//              $('#app').append(form);
                

        	}
        	
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
                //url: './REST/IsShowIdTips/' + eAppNumber,
                url: '../eApplication/REST/IsShowIdTips/' + eAppNumber,
                dataType: "json",
                async: false,
                success: function (data) {
                    if (!checkError('', data)) {
                        result = data["JSON_RESULT_DATA"];
                    }
                },
                error: function (errMsg) {
                    //handleHttpError('cannot show id tips', null, null, null);
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
                    //result = data.JSON_RESULT_DATA;
                    // if (!checkError($filter('translate')('MESSAGE_FAIL_READ_DOCUMENTS_LIST'), data)) {
                    //     result = data[JSON_RESULT];
                    // }
                    if(data){
                        result = data["JSON_RESULT_DATA"];
                    }
                    
                },
                error: function (errMsg) {
                    throw new Error('unable to load documents: ' + errMsg.responseText)
                    /*handleHttpError('unable to load documents', null, null, null);
                    throw new Error('unable to load documents: ' + errMsg.responseText);*/
                }
            });

            return result;
        },
        
        getDocumentList:function(eAppNumber, UnderwritingResultCode, PolicyNumber, TipsCode){
            var doc = app.getAllDocuments(eAppNumber);

            var msg = "";
        
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
        
            msg = msg + "<br/> " + "温馨提醒您在3个工作日内将以下资料交回公司：";
           
            for (i in doc.Documents) {
               
                msg = msg + "<br/>  -" + doc.Documents[i];  
             
                if (doc.Documents[i] == "《营销员报告》") {
                    
                    var isShowIdTips = app.isShowIdTips(eAppNumber);

                    if (isShowIdTips.ReturnCode == "Y") {
                        msg = msg + "<br/>  请将受益人身份证件资料交回公司";
                    };

                  

                    if (app.newProductType == "Y") {
                        msg = msg + "<br/>  *您投保的是新型产品，请注意抄录《在线投保申请确认书》中投保人确认栏内的38个字";
                    };
                 
                }
             
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
        
        signSubmit:function(name){  //签署完成 确认   非电子签名流程
        	//this.signEnd = false;	
        	//alert(name)
        	app.$refs[name].validate(function(valid){
        		if(valid){
        			app.confirmAudioVedio(function(data){
        				if(app.otherInfo.IsPreApp == 'NORMAL'){
        					$('#edit').submit();
        				}else{
        					// 预投保
        					$.ajax({
			                    async: true,
			                    type: "POST",
			                    url: "REST/PreAppAVSubmit",
			                    datatype: "json",
			                    data: {
			                        polNum : app.guideInfo.BusiNum,
				                    eAppNumber : app.callInfo.RefKey01,
				                    cnfrmNum : app.signForm.signNumberCheck
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
//			                                    var _url = "Edit?section=confirm#div-initial-payment";
//			                                    var form = $('<form action="' + _url + '" method="post">' +
//			                                        '<input type="hidden" name="ApplicationNumber" value="' + app.eAppNumber + '" />' +
//			                                        '</form>');
//			                                    $('body').append(form);
//			                                    $(form).submit();
												window.location = './ApplicationList';

			                                }
			                            });
			                        } else if (uwRsltCd == "UY") {
			                           
			                            msg = app.changeFontColor(msg, polNum);
			                            app.$Modal.info({
			                                title: "信息",
			                                content: msg,
			                                onOk: function () {
//			                                    var _url = "Edit?section=confirm#div-initial-payment";
//			                                    var form = $('<form action="' + _url + '" method="post">' +
//			                                        '<input type="hidden" name="ApplicationNumber" value="' + app.eAppNumber + '" />' +
//			                                        '</form>');
//			                                    $('body').append(form);
//			                                    $(form).submit();
												window.location = './ApplicationList';
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
			    
			    
			                    alert("保存失败!");
			                    window.location.reload();
			                });        					      					
        					
        				}
        				
        				//app.isLoading = false;
        				app.signEnd = false;
        			});
        			
        		}else{
        			//app.$Message.error('fail');
        			app.isLoading = false;
        		}
        	});
        },
        
        getOut:function(){    //返回
        	var text = '双录尚未结束，是否确认退出?';
        	//text = '双录已结束，是否确认退出?';
        	if(app.signTypeAfter){
        		if(app.callInfo.CallTyp =='POS'){
        			window.location.href = './AudioVedioNote?NoteTyp=POS';
        		}else{
        			window.location = './PendingList';
        		}
        		
        	}else{
        		this.$Modal.confirm({
	                title: "提示",
	                content: "<br /><p>"+ text +"</p>",
	                onOk:function(){
	                	if(app.callInfo.CallTyp =='POS'){
		        			window.location.href = './AudioVedioNote?NoteTyp=POS';
		        		}else{
		        			window.location = './PendingList';
		        		}	
	                },
	                onCancel:function(){
	                	app.doExecResult();
	                	//alert('取消');	
	                }
	            });
        	}
        	
        }
        
        
    },
    
    created:function(){
     	
    },
    mounted:function(){;
    	if(isPad()){
        	this.isIpad = true;
        }else{
        	this.isIpad = false;
        }
    	
    	this.isLoading = true;
        this.loadPage(this);
        var that = this;
		
		//this.heartBeat();
		
//		var HeartBeatTimer //heartBeat
//      if (HeartBeatTimer == null){  
//         
//      }
        var HeartBeatTimer = setInterval("app.heartBeat()", 1000 * 60);
		
//		$(windiw).on('beforeunload',function(){
//			alert('你确定要关闭')
//		});
	
		// 设置中间主题内容股固定高度
        this.$nextTick(function(){
        	this.playBtnBox = document.getElementById('audio');
			this.playPdfBtn = document.getElementById('audio2');
			
		
		
			this.playBtnBox.addEventListener('ended',function(){
				app.canNext = true;
				
				app.lastIndex = 0;
				app.playStart = false;
				//app.currentHtml = app.initHtml;
				//$('.item-list dl.cur .sound-text').html(app.initHtml);
				if(!sessionStorage.getItem(app.currentItem.ItemId + app.callInfo.RefKey01)){
					sessionStorage.setItem(app.currentItem.ItemId + app.callInfo.RefKey01, true);
				}
				
				//alert('播放完毕');
			});
			
			
			//app.playPdfBtn.load();

			
//			var readyTimer = setInterval(function(){
//				if(app.playBtnBox.readyState == 4){
//					
//					app.playLoading = false;
//					
//					clearInterval(readyTimer);
//				}
//				
//			},300);
//			
			
			
				
			
			
			
//			this.playBtnBox.addEventListener('canplaythrough',function(){
//
//			});
			
			
//			this.playPdfBtn.addEventListener('canplay',function(){
//				
//			});
			
			this.playPdfBtn.addEventListener('ended',function(){
				$('#stepAudioBtn').html('播放');
				
				//alert('播放完毕');
			});
					
					
			$(window).on('resize',function(){
				clearTimeout(app.scrollTimer);
				 $('.layer-body').height($('body').height()-180);
				 app.$nextTick(function(){
				 	$('#pdf-container-box').scrollTop(0);
				 	pdfScroll();
				 })
				 
				 
			});
					
            $('.layer-body').height($('body').height()-180);
        });
		
		function pdfScroll(){
			
			var pdfH = $('#pdf-container-box').height();
			var pdfScrollH = $('#pdf-container-box')[0].scrollHeight;
			var scrollT;;
			
			scrollT = $('#pdf-container-box').scrollTop();
			if(scrollT + pdfH >=  pdfScrollH - $(window).height()){   //768
				//alert('滚动结束');
				//app.pdfRead = true;
				app.pdfRead = true;
				app.pdfEnd = true;
//				var readTimer = setTimeout(function(){
//	            	
//	            	clearTimeout(readTimer);
//	            },1000);
	            
	            
				
				//app.pdfReadObj['app.doctype'] = true;
			}else{
				app.pdfEnd = false;
			}
		}
		
		// pdf滚动到底
		this.$nextTick(function(){
			
			$('#pdf-container-box').on('scroll',function(){
				clearTimeout(app.scrollTimer);
				if(app.loadPdfOk){
					app.scrollTimer = setTimeout(function(){
						pdfScroll();
					},100)
				}
			});
			
			
		})
	       
       
    }
});





pdfjsLib.workerSrc ='./pdf.worker.js';

//创建canvas方法
function createPdfContainer(id, className){
	var pdfContainer = document.getElementById('pdf-container');
	var canvasNew	= document.createElement('canvas');
	canvasNew.id=id;
	canvasNew.className=className;
	pdfContainer.appendChild(canvasNew);
};


//渲染pdf
function renderPDF(pdf ,i,id){
	pdf.getPage(i).then(function (page){
		//默认设置文档的显示大小
		//console.log(page)
		var scale = 1.0;
		if(app.docData.DocId != "PROD_PRV"){  //""  "PROD_DESC"
			scale = 1.5
		}
		var viewport = page.getViewport(scale);
		
		//
		// 准备用于渲染的 canvas 元素
		//
		var canvas =document.getElementById(id);
		var context =canvas.getContext('2d');
		
		// 显示尺寸
		
		//画布尺寸
		canvas.height=viewport.height;
		canvas.width=viewport.width;
		
		//
		// 将PDF 页面渲染到 canvas 上下文中
		//
		
		var renderContext ={
			canvasContext:context,
			viewport:viewport
		};
		page.render(renderContext);
		
		
	});
	
};




//创建和pdf页数等同的canvas数
function createSeriesCanvas(num ,template){
	var id ='';
	for(var j=1;j<=num;j++){
		id =template+j;
		createPdfContainer(id,'pdfClass');
	}
	};
	
	
var loadingTask = null;	
var loadingTasktimer = null;
	
//读取pdf文件，并加载到页面中
function loadPDF(fileURL,callback){
	//app.isLoading = true;
	if(fileURL){
		loadingTask = pdfjsLib.getDocument(fileURL);
		
		loadingTask.promise.then(function (pdf){
	
			pdf.maxImageSize = -1;
			
//			var canvasNew = document.getElementsByTagName('canvas');
//			for(var i=canvasNew.length; i > 0 ; i--){
//				canvasNew = null;
//			}
			
			//var pdfContainer = document.getElementById('pdf-container');
			
			//pdfContainer.innerHTML = "";
			
			app.isLoading = true;
			$('#pdf-container-box').scrollTop(0);
			
			//用 promise 获取页面
			var id='';
			
			//var date =new Date();
		       //var dateString = (date.getHours())+"_"+(date.getMinutes())+"_"+(date.getSeconds());
		       
		       var idTemplate ='cw-pdf-'+ Date.now();
		       var pageNum=pdf.numPages;
				
			//var idTemplate ='cw-pdf-';
			//var pageNum=pdf.numPages;
			
			
			
			//根据页码创建画布
			createSeriesCanvas(pageNum,idTemplate);
			//将pdf渲染到画布上去
			//var tim;

			for(var i = 1; i<=pageNum;i++)
			{
			     
				id=idTemplate +i;
				(function(i,id){
					loadingTasktimer = setTimeout(function(){
						renderPDF(pdf,i,id);
						
						if (i == pageNum){
							clearTimeout(loadingTasktimer);
							
							var pdfLoadTimer = setTimeout(function(){
								app.isLoading = false;
								clearTimeout(pdfLoadTimer);
							},500);
							
						}
					},100*i);
				})(i,id);		
			}
			
			callback();
			
		
		
		},function(reason){
			alert(reason);
		});

	}
	
}
	


function toNum(str){
	if(!str){
		toNum = 0;
		return;
	}
    var reg = str.replace(/\d+/,function(n){
        return n.replace(/(\d)(?=(\d{3})+$)/g,function($1){
            return $1+',';
        });
    })

    return reg;
}



function isPad(){
	var ua = navigator.userAgent.toLocaleLowerCase();
	var winW = window.screen.width;
	if(ua.indexOf('ipad') != -1 || ua.indexOf('macintosh') != -1 && winW < 1280){
    	return true;
    }else{
    	return false;
    }
}
