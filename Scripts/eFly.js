var app = new Vue({
    el:'#app',
    data:{
		testState:true,

		pdfUrl:'', //pdf文件地址
		pdfName:'',//pdf文件名称
        showDownload:false,//显示下载按钮
		bigCodeState:false, //大图二维码显示状态
		sbmitFlyPop:false, //确认飞签弹层的显示状态

        newProductType:false, // 是否是新产品
        isPreApp:'N', //是否预投保

		currentSignIdList:[], //当前预览对象fileid 集合
		signImgList:[],  //当前预览对 签名图片集合

		canRestart:false,   //可以重新生成飞签与否 (二维码出不来的情况下)
		resetLoading:false, // 重置飞签按钮的loading状态
		cancelLoading:false, // 取消飞签按钮的loading状态
		submitLoading:false, // 提交飞签按钮的loading状态

		isLoading:false, //全局loading状态
        showPopLoading:true, //文档正在加载中的loading状态

		//finished:false,
        pdfShow:false, //文档信息弹层的显示状态
		readAuth:false,  //是否同意勾选的状态
		signViewState:false, //签名预览弹层的显示状态
        showErrQrCodeBig:false, //显示放大的错误信息二维码
		
		AppInfo:null, //投保单信息
		AppNum:0,
		FlyObjNo:0,
		FlyStatCd:'00',
        DocEappOk:"N",
        FlyMethod:"",
        IsSpecProc:false, //20201579_Gray
        IsDoubleRecord:false, //是否是双录的一部分
        genQRCount: 1, //调用获取QR Code方法的次数
		ClientInfo:[], //签名对象集合
		DocInfo:[] //文档对象集合
	},

    mounted:function(){
		var that = this;
		this.$nextTick(function(){
			app.heartBeat();
		})
		this.GetFlyInfo(function(data){
			that.AppNum = data.AppNum;
			that.FlyObjNo = data.FlyObjNo;
			that.FlyStatCd = data.FlyStatCd;
            that.DocEappOk = data.DocEappOk;
            that.FlyMethod = data.FlyMethod;
            that.IsSpecProc = (data.IsSpecProc && data.IsSpecProc == "Y"); //20201579_Gray
            that.IsDoubleRecord = (data.IsDoubleRecord == "Y");
			that.ClientInfo = data.ClientInfo;
			that.DocInfo = data.DocInfo;
			that.AppInfo = data.AppInfo;
		    that.$nextTick(function(){
                if (that.DocEappOk == "N" && that.FlyMethod == "02") {
                    //<<20200880_Gray
                    //app.GetQRString(that.FlyObjNo);
                    app.GetQRString(that.FlyObjNo,that.AppNum);
                    //>>20200880_Gray
                } else {
                    that.showPopLoading = false;

				    if(that.ClientInfo.length > 0){
					    that.ClientInfo.forEach(function(item, index){
						    var qrcodeObj = 'qrcode' + index;

						    window[qrcodeObj] = new QRCode(document.getElementById('qrcode' + index))
						    window[qrcodeObj].makeCode(item.CurrQRString || '');
					    });

				    }
                }
 		    })
		})
	},
	computed:{
		//飞签状态中文转换
		setFlyState:function(){
			var result = '';
			return function(num){
				switch (num){
					case '00':
						result = '未开始'
						break;
					case '01':
						result = '飞签中'
						break;
					case '02':
						result = '已完成'
						break;	
				}
				return result;
			}
			//alert(num)
		},
		//检查是否完成所有签名
		setFinished:function(){
			if(this.ClientInfo.length > 0){
				return this.ClientInfo.every(function(item){
					return item.SubFlyStatus == '02';
				})
			}
		}
	},
    methods:{
		//防止服务器超时
		heartBeat: function () {   //heartBeat
            $.ajax({
                    async: true,
                    type: "POST",
                    url: "REST/HeartBeat",
                    datatype: "json"
            }).success(function(){  
            }).error(function (jqXHR, textStatus, errorThrown) {
                alert("HeartBeat  failed!");
            });
		},
		
		// 预览签名二维码
		viewBigCode:function(clientItem){
            if (clientItem.CurrQRString) {
			    document.getElementById('qrcodeBig').innerHTML = '';
			    var qrcodeBig = new QRCode(document.getElementById('qrcodeBig'));
			    this.bigCodeState = true;
                this.showErrQrCodeBig = false;
			
			    if(this.ClientInfo.length > 0){
				    //qrcodeBig.clear();
				    qrcodeBig.makeCode(clientItem.CurrQRString || '');
				
			    }
            } else {
			    document.getElementById('qrcodeBig').innerHTML = '';
                this.bigCodeState = true;
                this.showErrQrCodeBig = true;
            }
		},

		//关闭预览签名二维码
		closeBigCode:function(){
			this.bigCodeState = false;
		},

		//关闭签名预览
        closePreviewSign(){
			this.signViewState = false;
            //this.popState = false;
        },
        //二维码是否成功生成
        GetQRString:function(FlyObjNo,AppNum){ //20200880_Gray add input param AppNum
			$.ajax({
				type: 'POST',
				url: 'REST/GetQRString',
				datatype: "json",
                data: {
                    "FlyObjNo": FlyObjNo,
                    "AppNum": AppNum //20200880_Gray
                },
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
						
					if(JSON_RESULT_ERROR.length > 0){
                        app.showPopLoading = false;
                        app.canRestart = true; //此时允许重新生成飞签
						app.$Modal.error({
							title: "信息",
							content: '当前遇到网络异常,请取消飞签后重新发起飞签,或者请点击[生成二维码]重新生成二维码 谢谢。',
							onOk: function () {
							}
						});
					}else{
                        if (JSON_RESULT_DATA) {
    					    JSON_RESULT_DATA.forEach(function(ret, idxRet) {
                                if (ret.CurrQRString) {
					                app.ClientInfo.forEach(function(cli, idxCli){
                                        if (cli.SubFlyObjNo == ret.SubFlyObjNo) {
                                            cli.CurrQRString = ret.CurrQRString;
                                            app.DocEappOk = "Y";
                                            app.showPopLoading = false;

						                    var qrcodeObj = 'qrcode' + idxCli;
						                    window[qrcodeObj] = new QRCode(document.getElementById('qrcode' + idxCli))
						                    window[qrcodeObj].makeCode(cli.CurrQRString || '');
                                        }
                                    });
                                }
					        });
                        }

                        if (app.DocEappOk == "N") {
                            if (app.genQRCount <= 10) {
                                app.genQRCount++;
                                app.GetQRString(FlyObjNo,AppNum);
                            } else {
								app.showPopLoading = false;
								app.canRestart = true; //此时允许重新生成飞签
					            app.$Modal.error({
						            title: "信息",
						            content: '当前遇到网络异常，请点击[生成二维码]重新生成二维码, 谢谢!',
						            onOk: function () {
						            }
					            });
                            }
                        }
					}
				},
				error:function(){
					app.$Modal.error({
						title: "信息",
						content: '当前遇到网络异常，请取消飞签后重新发起飞签, 谢谢。',
						onOk: function () {
						}
					});
				}
			});
       },
		//获取页面对象
        GetFlyInfo:function(callback){ 
			$.ajax({
				type:'POST',
				url:' REST/GetFlyInfo',
				datatype: "json",
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
						
					if(JSON_RESULT_ERROR.length > 0){
						app.$Modal.error({
							title: "信息",
							content: JSON_RESULT_ERROR[0].errorMessage,
							onOk: function () {
							}
						});
					}else if(callback instanceof Function){
						callback(JSON_RESULT_DATA);	
					}
					
				},
				error:function(){
					app.$Modal.error({
						title: "信息",
						content: '网络异常，请稍后再试',
						onOk: function () {
						}
					});
				}
				
			});
		},	
		//文档接口
		GetFlyDocument:function(type,callback){    //PDFTEST
        	$.ajax({
				type:'POST',
				url:' REST/GetFlyDocument',
				datatype: "json",
				contentType: "application/json",
				
				//mimeType:'text/plain; charset=x-user-defined',
	  			//mimeType:'application/pdf',
	  			data:JSON.stringify({
					AppNum:app.AppNum,
					FlyObjNo:app.FlyObjNo,
					DocTyp:type
				}),
	  	
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
			
					if(JSON_RESULT_ERROR.length > 0){
						app.$Modal.error({
							title: "信息",
							content: JSON_RESULT_ERROR[0].errorMessage,
							onOk: function () {
							}
						});
					}else{
						
						if(callback instanceof Function){
							callback(JSON_RESULT_DATA);	
						}
					}
					
				},
				error:function(){
					app.$Modal.error({
						title: "信息",
						content: '网络异常，请稍后再试',
						onOk: function () {
						}
					});
				}
			});	
       	},
		
		//同意飞签   
		agreenHandle:function(){
			this.readAuth = true;
		},
		
		// 获取图片id集合
        GetFlySignFileIds:function(SubFlyObjNo,callback){
            $.ajax({
                async: false,
                type: "POST",
                url: "REST/GetFlySignFileIds",
                datatype: "json",
                data: {
                    "SubFlyObjNo": SubFlyObjNo
                }
            }).success(function (response) {

                if(callback instanceof Function){
                    callback(response);
                }
               
            
            }).error(function (jqXHR, textStatus, errorThrown) {
				app.$Modal.error({
					title: "信息",
					content: '网络异常，请稍后再试',
					onOk: function () {
					}
				});
            });
        },

		// 获取图片
        getFileByFileId:function(fileId,callback){
            $.ajax({
                async: false,
                type: "GET",
                url: "REST/GetFileByFileId",
                datatype: "json",
                data: {
                    "FileId": fileId
                }
            }).success(function (response) {
//                return response;
                if(callback instanceof Function){
                    callback(response);
                }
               
            
            }).error(function (jqXHR, textStatus, errorThrown) {
				app.$Modal.error({
					title: "信息",
					content: '网络异常，请稍后再试',
					onOk: function () {
					}
				});
            });
        },

		// downloadPdf:function(SubDocTyp){
		// //	window.open(app.pdfUrl);
		// },

		//显示文档
		showDoc:function(type){
			app.isLoading = true;
			app.GetFlyDocument(type,function(data){
				app.pdfUrl = data.url;
                loadPDF(data.url,function(pdfData){
					app.isLoading = false;
                    app.showDownload = (type == "PROP");
					app.pdfShow = true;   
					app.pdfName = pdfData._transport._fullReader._filename;

				});
				
				$('#pdf-container-box').css('z-index',999);
            })
		},
        //预览签名
        previewSign:function(SubFlyObjNo){
			this.signViewState = true;
			app.GetFlySignFileIds(SubFlyObjNo,function(data){
				app.currentSignIdList = data.JSON_RESULT_DATA;
                app.signImgList = [];

				if(Array.isArray(app.currentSignIdList) && app.currentSignIdList.length > 0){
					app.currentSignIdList.forEach(function(item, index){
                        app.signImgList.push({
                            "CliTyp": item.CliTyp,
                            "Sign": []
                        });
                        
                        item.FileIds.forEach(function(fileId){
						    app.getFileByFileId(fileId,function(res){
							    app.signImgList[index].Sign.push(res);
						    });
                        });
					});					
				}
			});
		},
		//重新生成飞签
		restartFlyHandle:function(){
			app.restartFly(app.AppNum,function(data){
                alert('请重新刷新页面~');
			});
		},

        //重置飞签状态
        resetFlyStateHandle:function(flyObjNo,subFlyObjNo,cliRole){
			this.$Modal.confirm({
                title:'信息',
                content:'重置将清空已保存的信息，需要重新开始飞签流程，请确认是否要重置？',
                onOk:function(){
					//app.resetLoading = true;
                    app.ResetSubFly(flyObjNo,subFlyObjNo,function(data){
					
                        app.ClientInfo.forEach(function(cli) {
                            if (cli.SubFlyObjNo == subFlyObjNo) {
                                cli.SubFlyStatus = "00";
                            }
                            if (cliRole != "O" && cli.CliRole == "O" && cli.SubFlyStatus == "02") {
                                cli.SubFlyStatus = "01";
                            }
                        });
						//app.resetLoading = false;
					});
                },
                onCancel:function(){
					
                }
            })
        },
        //取消飞签按钮动作
        cancelFlyHandle:function(){
            this.$Modal.confirm({
                title:'信息',
                content:'请确认是否取消本次飞签操作',
                onOk:function(){
					app.isLoading = true;
                    app.CancelFly(app.FlyObjNo,function(data){
                        window.location = './PendingList';
					});
                },
                onCancel:function(){
					
                }
            })
		},
		//关闭飞签确认弹层
		clsoeFlyPop:function(){
            this.readAuth = false;
			app.sbmitFlyPop = false;
			this.$Modal.remove();
		},
        //提交飞签(显示确认弹框)
        submitFlyHandle:function(){
			if(!app.setFinished){
				app.$Modal.error({
					title: "信息",
					content: '飞签尚未完成，无法提交！',
					onOk: function () {
					}
				});
			}else{
				this.sbmitFlyPop = true;
			}
		},
	   
		//提交飞签按钮动作
		submitFlyAction:function(){
			if(app.readAuth){
				 app.isLoading = true;
				 app.SubmitFly(app.FlyObjNo,null);
			}else{
				app.$Modal.error({
					title: "信息",
					content: '请同意并勾选',
					onOk: function () {
					}
				});
			}
		},	
		// 取消飞签接口
       	CancelFly:function(flyObjNo,callback){
			$.ajax({
				type:'POST',
				url:' REST/CancelFly',
				datatype: "json",
    			data:{
    				FlyObjNo: flyObjNo || ''
    			},
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
				
					if(JSON_RESULT_ERROR.length > 0){
						var timer = setTimeout(function(){
							app.$Modal.error({
								title: "信息",
								content: JSON_RESULT_ERROR[0].errorMessage,
								onOk: function () {
								   clearTimeout(timer);
								}
							});
							app.isLoading = false;
						},300)
						
						
					}else{
						app.isLoading = false;
						//window.location.href = './AudioVedioNote?NoteTyp=POS';
						
						if(callback instanceof Function){
							callback(JSON_RESULT_DATA);	
						}
						
					}

								
				},
				error:function(){
					app.$Modal.error({
						title: "信息",
						content: '网络异常，请稍后再试',
						onOk: function () {
						}
					});
					app.isLoading = false;
				}
			});
		},
		//提交飞签接口
		SubmitFly:function(flyObjNo,callback){
			$.ajax({
				type:'POST',
				url:' REST/SubmitFly',
				datatype: "json",
				data:{                  
					FlyObjNo: flyObjNo || ''
				}
			}).success(function(response){
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
                                        '<input type="hidden" name="ApplicationNumber" value="' + app.AppNum + '" />' +
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
                                        '<input type="hidden" name="ApplicationNumber" value="' + app.AppNum + '" />' +
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
					//alert("提交失败!");

					app.$Modal.info({
						title: "信息",
						content: '提交失败'
					});
					
                    window.location.reload();
			});
		},
		//重置飞签接口 (针对某个客户的飞签)
        ResetSubFly:function(flyObjNo,subFlyObjNo,callback){ // RePushSubFly
			$.ajax({
				type:'POST',
				url:' REST/RePushSubFly',
				datatype: "json",
    			data:{
    				FlyObjNo: flyObjNo || '',
                    SubFlyObjNo:subFlyObjNo || ''
    			},
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
					if(JSON_RESULT_ERROR.length > 0){
						var timer = setTimeout(function(){
							app.$Modal.error({
								title: "信息",
								content: JSON_RESULT_ERROR[0].errorMessage,
								onOk: function () {
								   clearTimeout(timer);
								}
							});
							app.isLoading = false;
						},300)
						
					}else{
						app.isLoading = false;
						if(callback instanceof Function){
							callback(JSON_RESULT_DATA);	
						}
						
					}
								
				},
				error:function(){
					app.$Modal.error({
						title: "信息",
						content: '网络异常，请稍后再试',
						onOk: function () {
						}
					});
					app.isLoading = false;
				}
			});
		},
		// 重新生成飞签(整个保单级别)接口 
		restartFly:function(applicationNum,callback){
			$.ajax({
				type:'POST',
				url:' REST/StartFly',
				datatype: "json",
    			data:{
    				AppNum: applicationNum || ''
    			},
				success:function(data){
					var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
					var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;
					
					if(JSON_RESULT_ERROR.length > 0){
						var timer = setTimeout(function(){
							app.$Modal.error({
								title: "信息",
								content: JSON_RESULT_ERROR[0].errorMessage,
								onOk: function () {
								   clearTimeout(timer);
								}
							});
							app.isLoading = false;
						},300)
					}else{
						app.isLoading = false;
						
						if(callback instanceof Function){
							callback(JSON_RESULT_DATA);	
						}
					}
				},
				error:function(){
					app.$Modal.error({
						title: "信息",
						content: '网络异常，请稍后再试',
						onOk: function () {
						}
					});
					app.isLoading = false;
				}
			});
		},

		//递交返回信息弹框文字颜色处理
        changeFontColor: function (uwMsg, polNum) {
            return uwMsg.replace(polNum, "<font color=red>" + polNum + "</font>");
		},
		//递交返回信息筛选处理
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
				app.$Modal.error({
					title: "信息",
					content: '网络异常，请稍后再试',
					onOk: function () {
					}
				});
            });

            return msg + "</p>";
        },
		//递交返回信息弹框日期格式处理
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
		//递交返回信息弹框日期格式处理
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
		//递交返回信息弹框日期格式处理
        isoFormatDateToDisplayFormat: function (isoFormatDateStr, yearSeparator, monthSeparator, daySeparator){
            if (yearSeparator) {
                var thisDate = app.parseDateWithISOFormat(isoFormatDateStr);
                return app.formatTime(thisDate, 'yy' + yearSeparator + 'mm' + monthSeparator + 'dd' + daySeparator);
            } else {
                var thisDate = app.parseDateWithISOFormat(isoFormatDateStr);
                return app.formatTime(thisDate, 'yy/mm/dd');
            }
		},
		//递交返回信息弹框日期格式处理
        isoFormatDateToDisplayFormat: function (isoFormatDateStr, yearSeparator, monthSeparator, daySeparator){
            if (yearSeparator) {
                var thisDate = app.parseDateWithISOFormat(isoFormatDateStr);
                return app.formatTime(thisDate, 'yy' + yearSeparator + 'mm' + monthSeparator + 'dd' + daySeparator);
            } else {
                var thisDate = app.parseDateWithISOFormat(isoFormatDateStr);
                return app.formatTime(thisDate, 'yy/mm/dd');
            }
		},

		//关闭pdf文档
		closePdf:function(stepIndex, itemIndex, docIndex){   
        	//sessionStorage.setItem(docData.DocId, true);
			$('#pdf-container').html('');
			app.pdfShow = false; 
        }
    }
})

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
		var scale = 1.5;
		
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
			
			
			app.isLoading = true;
			$('#pdf-container-box').scrollTop(0);
			
			//用 promise 获取页面
			var id='';
			
		       
			var idTemplate ='cw-pdf-'+ Date.now();
			var pageNum=pdf.numPages;
				

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
			
			callback(pdf);
			
		
		
		},function(reason){
			alert(reason);
		});

	}
	
}