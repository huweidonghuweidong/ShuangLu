
    var targetUrl = "../NGLHApplication/GetClients";
	var searchCond;
    var isClientSearched = false;

    function getClientsByID(idx, num) { 
		//alert(num);
		searchCond = { Type: "1", ClientIDNum: num };
		getClients("ClientIDNum", idx);
	}

    function getClientsByName(idx, sname,ssex,sdob) { 
		searchCond = { Type: "2", ClientName: sname, ClientSex: ssex, ClientDOB: sdob };
		getClients("ClientName", idx)
	}

	function disableTabs(index, len) {
	    for (var i = index + 1; i <= len; i++) {
	        $("#liStep_" + i).addClass("locked");
        }
    }
	
    function OnClientSearchStart() {
        $('#SearchLoader').show();
    }

    function OnClientSearchSuccess() {
        $('#SearchLoader').hide();
    }

    function getClients(id, num) {
        $("#ResultDiv").hide();
        var url = "GetClients";

        $.ajax({
            async: true,
            type: "POST",
            url: targetUrl,
            datatype: "json",
            data: searchCond,
            contentType: "application/x-www-form-urlencoded;charset=utf-8",
            beforeSend: function () { OnClientSearchStart(); },
            success: function (result) {
                if (result != null && result["RowCount"] != null && result["RowCount"] > 0 && $("#txtShowPopWin").val() == "F") {
                    $("#txtShowPopWin").val("F");
                    //alert(1);
                    openDialog(id, num, result["RowCount"]);
                }
                else {
                    $("#txtShowPopWin").val("F");
                    //openDialog(id,num,0);
                }
            },
            complete: function () { OnClientSearchSuccess(); }
        });
    }

    function openDialog(id, num, rowcount) {
        isSearchSucceed = false;
        var dialogheight = 510; // 215 + 28 * rowcount;

        $("#txtCtlType").val(id);
        $("#txtClientNum").val(num);

        if (rowcount > 0) {
            forzeeView();
            $("#dlg").load("ClientList");
        }
        else {
            $("#dlg").load('BlankResult');
            $("#dlg").css("overflow", "hidden");
            dialogheight = 200;
        }

        $("#dlg").dialog({
            title: "客户列表",
            autoOpen: true,
            resizable: false,
            position: "center",
            height: dialogheight,
            modal: true,
            width: 620,
            close: function () {
                if (isClientSearched == true) {
                    $("#ResultDiv").show();
                    isClientSearched = false;
                }
                else {
                    $("#ResultDiv").hide();
                }
                unForzeeView();
                resetDialog();
            }
        });
    }

    function resetDialog() {
        $("#dlg").html("");
        $("#txtShowPopWin").val("F");
        $("#txtCtlType").val("");
        $("txtClientNum").val("");
    }


    function onCheck(obj) {
        var ck = $(obj).find("input[type='checkbox']")[0].checked;
        $(obj).find("input[type='checkbox']")[0].checked = !ck;
    }


    function onMoveTo(stepId) {
        if (stepId > 0) {
            formSubmit(stepId, "1");
        }
    }

    function confirmSubmit() {
        return true;
    }

    function doBeforeSubmit() {
        return true;
    }

    function formSubmit(id, flag) {
        var do_before_submit_flag = true;
        if (flag == "1") {
            try {
                do_before_submit_flag = doBeforeSubmit(); 
            } catch (e) {
                do_before_submit_flag = false;
                //ShowErrorDialog("Exception:cannot found function doBeforeSubmit()", null);
            }
            if (do_before_submit_flag) {
                document.getElementById("step_id").value = id;
                document.getElementsByTagName("form")[0].submit();
            }
        }
    };

    function IsMobileBrowser() {
//        var isiPad = navigator.userAgent.match(/iPad/i) != null;
//        if (isiPad) {
//            return true;
        //        }
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
    };

    function navigateToForm(targetId, isAnimateScroll, isFirst) {
        if ($('#' + targetId).length > 0) {
            var vPos = $('#' + targetId).offset().top - 122;
            if (vPos < 100 || isFirst == 1) {
                vPos = 0;
            }

            if (!IsMobileBrowser()) {
                $('body,html').animate({
                    scrollTop: vPos
                }, (isAnimateScroll ? 400 : 0), 'swing', function () {

                });
            } else {
                var ele = $('.main-panel').get(0);
                ele.style.webkitTransitionDuration = "1000ms";
                ele.style.webkitTransform = "translateY(" + ($(document).scrollTop() - vPos) + "px)";

                var onTransitionEnd = function () {
                    ele.style.webkitTransitionDuration = "0ms";
                    ele.style.webkitTransform = "translateY(0px)";
                    $('body').animate({
                        scrollTop: vPos
                    }, 0);
                    $('.main-panel').off("webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd", onTransitionEnd);
                }
                $('.main-panel').on("webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd", onTransitionEnd);
            }
        } else {
            $('body,html').animate({
                scrollTop: 0
            }, (isAnimateScroll ? 400 : 0), 'swing', function () {

            });
        }
    };

    function ShowErrorDialog(errMessage, closeCallBack) {
        var _dialog_id = "system-error-message-dialog";
        var _dialog = $('#' + _dialog_id).clone();
        $('body').css('overflow-y', 'hidden');
        var setting = {}
        setting.open = function (event, ui) {
            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#errorMessages').html(errMessage);
            // $(this).find('iframe').attr('height', $(this).innerHeight() - 50);
            $('div.ui-widget-overlay').click(function (e) {
                _dialog.dialog('close');
            });
            $('#system-error-message-dialog-close').click(function (e) {
                _dialog.dialog('close');
            });
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function () {
            $(this).css("maxHeight", 500);
        };
        setting.close = function (event, ui) {
            if (closeCallBack) {
                closeCallBack();
            }
            $('body').css('overflow-y', 'auto');
            $('div.ui-widget-overlay').off('click');
            $('#system-error-message-dialog-close').off('click');
        };

        var buttons = {}
        var button1 = {}
        button1["text"] = '确定';
        button1["class"] = 'buttonGreen buttonSmall';
        button1["click"] = function () {
            _dialog.dialog('close');
        };
        buttons["Ok"] = button1;
        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };

    function ShowMessageDialog(message, btnText, closeCallBack) {
        var _dialog_id = "system-error-message-dialog";
        var _dialog = $('#' + _dialog_id).clone();
        $('body').css('overflow-y', 'hidden');
        var setting = {}
        setting.open = function (event, ui) {
            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#errorMessages').html(message);
            $('div.ui-widget-overlay').click(function (e) {
                _dialog.dialog('close');
            });
            $('#system-error-message-dialog-close').click(function (e) {
                _dialog.dialog('close');
            });
            // _dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function () {
            $(this).css("maxHeight", 500);
        };
        setting.close = function (event, ui) {
            if (closeCallBack) {
                closeCallBack();
            }
            $('body').css('overflow-y', 'auto');
            $('div.ui-widget-overlay').off('click');
            $('#system-error-message-dialog-close').off('click');
        };

        var buttons = {}
        var button1 = {}
        button1["text"] = (btnText) ? btnText : '确定';
        button1["class"] = 'buttonGreen buttonSmall';
        button1["click"] = function () {
            _dialog.dialog('close');
        };
        buttons["Ok"] = button1;

        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };

    function ShowConfirmErrorDialog(errMessage, continueCallBack, stayCallback) {
        var _dialog_id = "system-confirm-error-dialog";
        var _dialog = $('#' + _dialog_id);
        $('body').css('overflow-y', 'hidden');

        var setting = {}
        setting.open = function (event, ui) {
            disableTouchMove();

            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#errorMessages').html(errMessage);
            $('div.ui-widget-overlay').click(function (e) {
                _dialog.dialog('close');
                if (stayCallback) {
                    stayCallback();
                }
            });
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function () {
            $(this).css("maxHeight", 500);
        };
        setting.close = function (event, ui) {
            // $(this).find('iframe').attr('src', '');
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
            $('div.ui-widget-overlay').off('click');
        };

        var buttons = {}
        var button1 = {}
        button1["text"] = '返回';
        button1["class"] = 'buttonOrange buttonSmall';
        button1["click"] = function () {
            _dialog.dialog('close');
            if (stayCallback) {
                stayCallback();
            }
        };
        button1['style'] = 'float:center;margin-left:20px';
        buttons["Stay"] = button1;
        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };

    function ShowConfirmationDialog(confirmationMsg, yesMsg, noMsg, yesCallBack, noCallback) {
        var _dialog_id = "system-confirm-dialog";
        var _dialog = $('#' + _dialog_id);
        $('body').css('overflow-y', 'hidden');

        var setting = {}
        setting.open = function (event, ui) {
            disableTouchMove();

            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#confirmMessage').html(confirmationMsg);
            $('div.ui-widget-overlay').click(function (e) {
                _dialog.dialog('close');
                if (noCallback) {
                    noCallback();
                }
            });
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function () {
            $(this).css("maxHeight", 500);
        };
        setting.close = function (event, ui) {
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
            $('div.ui-widget-overlay').off('click');
        };

        var buttons = {}
        var button1 = {}
        //var yesClicked = false;
        button1["text"] = yesMsg;
        button1["class"] = 'buttonGreen buttonSmall';
        button1["click"] = function () {
            //yesClicked = true;
            _dialog.dialog('close');
            if (yesCallBack) {
                yesCallBack();
            }
        };
        button1['style'] = 'float:left;margin-left:20px';
        buttons["Yes"] = button1;

        var button2 = {}
        button2["text"] = noMsg;
        button2["class"] = 'buttonOrange buttonSmall';
        button2["click"] = function () {
            _dialog.dialog('close');
            if (noCallback) {
                noCallback();
            }
        };
        button2['style'] = 'float:right;margin-right:20px';
        buttons["No"] = button2;

        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };

    function ShowEnclosedConfirmationDialog (confirmationMsg, yesMsg, noMsg, yesCallBack, noCallback) {
        var _dialog_id = "system-confirm-dialog";
        var _dialog = $('#' + _dialog_id);
        $('body').css('overflow-y', 'hidden');

        var setting = {}
        setting.open = function (event, ui) {
            disableTouchMove();

            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#confirmMessage').html(confirmationMsg);
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function () {
            $(this).css("maxHeight", 500);
        };
        setting.close = function (event, ui) {
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
            $('div.ui-widget-overlay').off('click');
        };

        var buttons = {}
        var button1 = {}
        //var yesClicked = false;
        button1["text"] = yesMsg;
        button1["class"] = 'buttonGreen buttonSmall';
        button1["click"] = function () {
            //yesClicked = true;
            _dialog.dialog('close');
            if (yesCallBack) {
                yesCallBack();
            }
        };
        button1['style'] = 'float:left;margin-left:20px';
        buttons["Yes"] = button1;

        var button2 = {}
        button2["text"] = noMsg;
        button2["class"] = 'buttonOrange buttonSmall';
        button2["click"] = function () {
            _dialog.dialog('close');
            if (noCallback) {
                noCallback();
            }
        };
        button2['style'] = 'float:right;margin-right:20px';
        buttons["No"] = button2;

        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };

    function forzeeView() {
        $('body').css('overflow-y', 'hidden');
    }

    function unForzeeView() {
        $('body').css('overflow-y', '');
    }

    //20190057
    function formatDate(str) { 
        return str.replace("-", "").replace("-", "").replace("年", "").replace("月", "").replace("日", "")
    }
