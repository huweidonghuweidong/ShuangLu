//03表示进入电子签名(面签)，N的时候不修改状态列，只根据序列号是否有值进行界面显示与隐藏的控制
//04表示进入电子签名(飞签)，N的时候不修改状态列，只根据序列号是否有值进行界面显示与隐藏的控制
const APP_STATUS_CONFIRMED = "02";
const APP_STATUS_EFLY = "F1"; //在选择电子签名(飞签),投保单的状态不是02而是F1
const QRCODE_SCANNED = "02"; //二维码被扫描
const WAIT_CONFIRM_ESIGN = "03";
const WAIT_CONFIRM_EFLY = "04";
const UPLOAD_COMPLETE = "99";

var app = new Vue({
  el: "#app",
  data: {
    bigCodeState: false, //大图二维码显示状态
    isLoading: true, //全局loading状态
    isQRCodeScanned: false, //二维码是否已被扫描

    ApplicationNum: 0, //投保单号
    PolicyNumber: "",
    PlanDesc: "",
    PolicyPremium: "",
    ClientName: "",
    AudioVideoStatus: "", //双录状态 00 未开始/01 双录中/02 已完成
    AudioVideoObjNo: "", //双录对象编号
    QRCode: "", //二维码
    SignWay: "N",
    GenQRCount: 1, //获取二维码重试次数，初始化为1
    HeartBeatCount: 1, //心跳次数，初始化为1
  },

  mounted: function () {
    var that = this;

    var HeartBeatTimer; //heartBeat
    if (HeartBeatTimer == null) {
      HeartBeatTimer = setInterval("app.heartBeat()", 1000 * 60);
    }
    var AutoSignNextTimer;
    if (AutoSignNextTimer == null) {
      AutoSignNextTimer = setInterval("app.automaticSignNext()", 1000 * 5);
    }

    this.load(function (data) {
      that.ApplicationNum = data.AppNum;
      that.AudioVideoObjNo = data.AudioVideoObjNo;
      that.PolicyNumber = data.PolNum;
      that.ClientName = data.CliNm;
      that.PlanDesc = data.PlanDesc;
      that.PolicyPremium = data.PolPrem;
      that.QRCode = data.QRCode;
      that.AudioVideoStatus = data.AudioVideoStatus;
      that.DocEappOk = data.DocEappOk;
      that.SignWay = data.SignWay;
      that.AppStatus = data.AppStatus;

      //最多循环10次 去获取二维码信息
      that.$nextTick(function () {
        if (that.DocEappOk == "N") {
          console.log("DocEappOk ==N");
          app.getDblRecQRString(that.AudioVideoObjNo, that.ApplicationNum);
        } else {
          if (that.QRCode) {
            app.showQRCode(that.QRCode);
          }
        }
      });

      app.isLoading = false;
    });
  },
  computed: {
    //双录状态中文转换
    setDoubleRecordStatus: function () {
      var result = "";
      return function (status) {
        switch (status) {
          case "00":
            result = "等待发送";
            break;
          case "01":
            result = "双录中";
            break;
          case "03":
            result = "电子签名(面签)状态";
            break;
          case "04":
            result = "远程双录中";
            break;
          case "99":
            result = "已确认";
            break;
        }
        return result;
      };
    },
  },
  methods: {
    //获取页面对象
    load: function (callback) {
      console.log(Date() + "  双录界面load处理GetDblRecInfo方法开始");

      axios
        .post("REST/GetDblRecInfo")
        .then(function (response) {
          console.log(Date() + "  GetDblRecInfo方法成功");
          app.isLoading = false;
          var JSON_RESULT_DATA = response.data.JSON_RESULT_DATA;
          var JSON_RESULT_ERROR = response.data.JSON_RESULT_ERROR;

          if (JSON_RESULT_ERROR.length > 0) {
            app.showErrorMsg(JSON_RESULT_ERROR);
          } else if (callback instanceof Function) {
            callback(JSON_RESULT_DATA);
          }
        })
        .catch(function (err) {
          app.isLoading = false;
          app.showErrorMsg("网络异常，请稍后再试");
        });
    },

    //显示二维码
    showQRCode: function (qrCodeUrl) {
      var qrcodeObj = "qrcode";
      var divShow = document.getElementById("qrcode");

      window[qrcodeObj] = new QRCode(document.getElementById("qrcode"), {
        width: 350,
        height: 350,
      });
      window[qrcodeObj].makeCode(qrCodeUrl);
      app.isLoading = false;
    },

    //显示放大二维码
    viewBigCode: function (qrCode) {
      document.getElementById("qrcodeBig").innerHTML = "";
      var qrcodeBig = new QRCode(document.getElementById("qrcodeBig"), {
        width: 512,
        height: 512,
      });
      qrcodeBig.makeCode(qrCode);
      this.bigCodeState = true;
    },

    //关闭放大二维码
    closeBigCode: function () {
      this.bigCodeState = false;
    },

    nextStepHandle: function () {
      this.$Modal.confirm({
        title: "提示",
        content: "请确认是否到下一步？",
        onOk: function () {
          app.isLoading = true;
          app.signNext();
        },
      });
    },

    //二维码是否成功生成
    getDblRecQRString: function (AudioVideoObjNo, ApplicationNum) {
      console.log(Date() + "  getDblRecQRString方法开始");

      app.isLoading = true;
      $.ajax({
        type: "POST",
        url: "REST/GetDblRecQRString",
        datatype: "json",
        data: {
          AudioVideoObjNo: AudioVideoObjNo,
          ApplicationNum: ApplicationNum,
        },
        success: function (data) {
          console.log(Date() + "  getDblRecQRString方法成功");
          console.log(data); //输出data值
          app.isLoading = false;
          var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
          var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;

          if (JSON_RESULT_ERROR.length > 0) {
            app.$Modal.error({
              title: "信息",
              content: "网络异常，请点击确认重试。",
              onOk: function () {},
            });
          } else {
            if (JSON_RESULT_DATA && JSON_RESULT_DATA != null) {
              // 判断其是否为null，是否真的有值，真的有值再设置DocEappOk = "Y"，否则继续下一次循环
              app.DocEappOk = "Y";
              app.QRCode = JSON_RESULT_DATA;
              // 显示返回的二维码地址
              app.showQRCode(JSON_RESULT_DATA);
            } else {
              //没有获取到值则需要继续下一次循环，此处强行赋值为N，确保循环可以继续。
              app.DocEappOk = "N";
            }

            if (app.DocEappOk == "N" && app.GenQRCount <= 10) {
              if (app.GenQRCount <= 10) {
                app.GenQRCount++;
                app.getDblRecQRString(AudioVideoObjNo, ApplicationNum);
              } else {
                app.$Modal.error({
                  title: "信息",
                  content: "当前遇到网络异常，请重新发起双录, 谢谢。",
                  onOk: function () {},
                });
              }
            }
          }
        },
        error: function () {
          app.isLoading = false;
          app.$Modal.error({
            title: "信息",
            content: "当前遇到网络异常，请重新发起双录, 谢谢。",
            onOk: function () {},
          });
        },
      });
    },

    // 心跳检测防止服务器超时
    heartBeat: function () {
      //heartBeat
      if (app.HeartBeatCount <= 60) {
        app.HeartBeatCount++;

        $.ajax({
          async: true,
          type: "POST",
          url: "REST/HeartBeat",
          datatype: "json",
        })
          .success(function () {
            console.log(Date() + "当前状态是" + status + "OK");
          })
          .error(function (jqXHR, textStatus, errorThrown) {
            console.log(Date() + "textStatus:" + textStatus);
            console.log(Date() + "errorThrown:" + errorThrown);
            console.log("HeartBeat  failed");
          });
      } else {
        app.$Modal.error({
          title: "信息",
          content: "当前页面超时失效，请重新登陆！",
          onOk: function () {
            //直接登出当前系统
            window.open("../Authentication/Logout", "_self", "", "false");
          },
        });
      }
    },

    //自动点击下一步,5秒后进入电子签名(面签/飞签)页面
    automaticSignNext: function () {
      app.load(function (data) {
        this.AudioVideoStatus = data.AudioVideoStatus;
        if (data.AudioVideoStatus == QRCODE_SCANNED) {
          app.isQRCodeScanned = true;
          setTimeout("app.signNext()", 1000 * 5);
        }
      });
    },

    //签署线下的确认书，或者线上电子签名(面签), 或者电子签名(飞签)
    signNext: function () {
      //几乎不可能发生的情况,投保单状态不是02.那么直接跳走.
      if (this.SignWay != "F" && this.AppStatus != APP_STATUS_CONFIRMED) {
        //doublerecord-second-phase_houjin
        app.redirectPage("Edit?section=confirm#div-application-summary");
        return;
      }

      if (this.SignWay == "N") {
        //签署线下的确认书
        app.redirectPage("Edit?section=confirm#div-application-summary");
      } else if (this.SignWay == "E") {
        //电子签名(面签)
        app.redirectToESignPage();
      } else if (this.SignWay == "F") {
        //电子签名(飞签)
        app.redirectToEFlyPage();
      } else {
        alert("发现错误的投保签署方式");
      }
    },

    //跳转到电子面签的页面
    redirectToESignPage: function () {
      //优先判断av_status=='03' 如果是直接跳转到指定页面
      if (
        this.AudioVideoStatus == WAIT_CONFIRM_ESIGN ||
        this.AudioVideoStatus == UPLOAD_COMPLETE
      ) {
        app.redirectPage("eSignature");
      } else {
        //签署电子签名
        var data = {
          eAppNumber: this.ApplicationNum,
          signWay: this.SignWay,
        };

        //使用表tap_av_control中的列av_status=='03'来区分是否已经执行过initeSign()操作，用来确保只执行一次initeSign()操作。
        this.initESign(data, function () {
          app.isLoading = false;
          //修改表tap_av_control中的列av_status='03'
          axios
            .post("REST/UpdateDoubleRecordStatus", {
              audioVideoObjNo: app.AudioVideoObjNo,
              statusCode: WAIT_CONFIRM_ESIGN,
            })
            .then(function (response) {
              app.redirectPage("eSignature");
            })
            .catch(function (err) {
              app.showErrorMsgTicky("网络异常，请稍后再试");
            });
        });
      }
    },

    //跳转到电子飞签的页面
    redirectToEFlyPage: function () {
      //优先判断av_status=='04' 如果是直接跳转到指定页面
      if (
        this.AudioVideoStatus == WAIT_CONFIRM_EFLY ||
        this.AudioVideoStatus == UPLOAD_COMPLETE
      ) {
        app.redirectPage("eFly");
      } else {
        //doublerecord-second-phase_houjin begin 飞签
        var data = {
          AppNum: this.ApplicationNum,
        };
        //使用表tap_av_control中的列av_status=='04'来区分是否已经执行过initeFly()操作，用来确保只执行一次initeFly()操作。
        this.initeFly(data, function () {
          app.isLoading = false;
          //修改表tap_av_control中的列av_status='04'
          axios
            .post("REST/UpdateDoubleRecordStatus", {
              audioVideoObjNo: app.AudioVideoObjNo,
              statusCode: WAIT_CONFIRM_EFLY,
            })
            .then(function (response) {
              app.redirectPage("eFly");
            })
            .catch(function (err) {
              app.showErrorMsgTicky("网络异常，请稍后再试");
            });
          //doublerecord-second-phase_houjin end
        });
      }
    },

    //确认并初始化电子面签方式
    //此处有一点小问题,调用InitESign API时,会更改tap_applications的status->02,并且向文件中心请求生成文件
    //在思图双录+面签 时生成文件请求只会产生一个默认的applicationAll文档.其实是没有用的
    initESign: function (jsonData, callback) {
      $.ajax({
        type: "POST",
        url: " REST/IniteSign",
        datatype: "json",
        data: jsonData,
        success: function (data) {
          var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
          var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;

          if (typeof JSON_RESULT_ERROR == "undefined") {
            alert("网络异常，请稍后再试~");
            app.isLoading = false;
          } else {
            if (JSON_RESULT_ERROR.length > 0) {
              alert("网络不稳定");
              app.isLoading = false;
            } else if (callback instanceof Function) {
              callback(JSON_RESULT_DATA);
            }
          }
        },
        error: function () {
          alert("网络异常，请稍后再试~");
          app.isLoading = false;
        },
      });
    },

    //doublerecord-second-phase_houjin begin
    initeFly: function (jsonData, callback) {
      $.ajax({
        type: "POST",
        url: " REST/StartFly",
        datatype: "json",
        data: jsonData,
        success: function (data) {
          var JSON_RESULT_DATA = data.JSON_RESULT_DATA;
          var JSON_RESULT_ERROR = data.JSON_RESULT_ERROR;

          if (typeof JSON_RESULT_ERROR == "undefined") {
            alert("网络异常，请稍后再试~");
            app.isLoading = false;
          } else {
            if (JSON_RESULT_ERROR.length > 0) {
              alert("网络不稳定");
              app.isLoading = false;
            } else if (callback instanceof Function) {
              callback(JSON_RESULT_DATA);
            }
          }
        },
        error: function () {
          alert("网络异常，请稍后再试~");
          app.isLoading = false;
        },
      });
    },
    //doublerecord-second-phase_houjin end

    //弹窗显示错误信息
    showErrorMsg(messages) {
      app.$Modal.error({
        title: "信息",
        content: app.convertMsgArrayOrStringToString(messages),
        onOk: function () {},
      });
    },

    //弹窗显示错误信息(iview坑)
    //iview两层弹窗第二个一闪而过，只能在第二个弹窗加个延时
    showErrorMsgTicky(messages, callback) {
      var timer = setTimeout(function () {
        app.$Modal.error({
          title: "信息",
          content: app.convertMsgArrayOrStringToString(messages),
          onOk: function () {
            clearTimeout(timer);
            if (callback instanceof Function) {
              callback();
            }
          },
        });
        app.isLoading = false;
      }, 300);
    },

    //传入的messages不是数组就是字符串，统一转成字符串
    convertMsgArrayOrStringToString(messages) {
      var messageTotal = "";
      if (messages instanceof Array) {
        messages.forEach(function (val) {
          messageTotal = messageTotal + val.errorMessage + "<br/>";
        });
        console.log(messageTotal);
      } else {
        messageTotal = messages; //默认不是数组就是字符串
      }

      return messageTotal;
    },

    //跳转到指定页面
    redirectPage(url) {
      var form = $(
        '<form  id="edit"  action="' +
          url +
          '" method="post">' +
          '<input type="hidden" name="ApplicationNumber" value="' +
          app.ApplicationNum +
          '" />' +
          "</form>"
      );
      $("body").append(form);
      $(form).submit();
    },
  },
});
