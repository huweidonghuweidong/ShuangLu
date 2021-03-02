(function ($) {
    var template = '<div id="calculator">' +
                       '<p id="expression-all" style="display:none;"></p>' +
                       '<div class="zonedark">' +
                       '<p id="expression" class="expression"></p>' +
                       '<p id="result" class="zoneresult">0</p>' +
                       '</div>' +
                       '<div class="zoneopt">' +
                       '<div id="clear" class="clear orange"></div>' +
                       '<div id="divide" class="divide orange"></div>' +
                       '<div id="multiply" class="multiply orange "></div>' +
                       '<div id="minus" class="minus orange"></div>' +
                       '<div id="seven" class="seven gray"></div>' +
                       '<div id="eight" class="eight gray"></div>' +
                       '<div id="nine" class="nine gray"></div>' +
                       '<div id="plus" class="plus orange high"></div>' +
                       '<div id="four" class="four gray"></div>' +
                       '<div id="five" class="five gray"></div>' +
                       '<div id="six" class="six gray"></div>' +
                       '<div id="one" class="one gray"></div>' +
                       '<div id="two" class="two gray"></div>' +
                       '<div id="three" class="three gray"></div>  ' +
                       '<div id="backspace" class="backspace orange"></div>' +
                       '<div id="zero" class="zero gray wide"></div>' +
                       '<div id="point" class="point gray"></div>' +
                       '<div id="egal" class="egal orange" onclick="close()"></div>' +
                       '</div>' +
                       '</div>';

    var clear = function () {
        $("#expression").text("");
        $("#expression-all").text("");
        $("#result").text("0");
    };

    var point = function () {
        var text = $("#expression").text() + ".";
        var textAll = $("#expression-all").text() + '.';
        if (!isExpressionValid(text + '0')) {
            return;
        }
        $("#expression").text(text);
    };

    var backspace = function () {
        var textAll = $("#expression-all").text();
        var text = $("#expression").text();
        //var text = $("#expression").text();
        if (textAll == "") {
            return;
        }
        textAll = textAll.substr(0, textAll.length - 1);
        text = text.substr(0, text.length - 1);
        $("#expression-all").text(textAll);
        if (text.indexOf('+') < 0 && text.indexOf('-') < 0 && text.indexOf('*') < 0 && text.indexOf('/') < 0) {
            text = shrinkExpresson(textAll);
        }
        else {
            text = shrinkExpresson(text);
        }
        $("#expression").text(text);
        if (text.length == 0) {
            $("#result").text('0');
        }
        else {
            $("#result").text(eval(text).toFixed(2));
        }
    };

    var egal = function () {
        var text = $("#expression").text();
        $("#result").text(eval(text).toFixed(2));
    };

    var isOperator = function (o) {
        return '+-*/'.indexOf(o) >= 0;
    };

    var inputOperator = function (o) {
        var textAll = $("#expression-all").text();
        var text = $("#expression").text();
        if (text.length == 0) {
            return;
        }
        if (isOperator(text.charAt(text.length - 1))) {
            textAll = textAll.substr(0, text.length - 1) + o;
            text = text.substr(0, text.length - 1) + o;
        }
        else {
            text = text + o;
            textAll = textAll + o;
        }
        $("#expression-all").text(textAll);
        text = shrinkExpresson(text);
        $("#expression").text(text);
    };

    var inputNumber = function (n) {
        if ($("#system-calculator-dialog").is(':hidden')) {
            return;
        }
        var textAll = $("#expression-all").text() + n;
        var text = $("#expression").text() + n;
        $("#expression-all").text(textAll);
        text = shrinkExpresson(text);
        $("#expression").text(text);
        $("#result").text(eval(text).toFixed(2));
    };

    var isExpressionValid = function (str) {
        reg = /^[\+\-]?\d+(\.\d+)?([\+\-\*\/]\d+(\.\d+)?)*$/;
        return reg.test(str);
    };

    //refresh = function() {
    //    var text = $("#expression").text();
    //    if (text.length == 0) {
    //        $("#result").text("0");
    //        return;
    //    }
    //    if (isOperator(text.charAt(text.length - 1))) {
    //        text = text.substr(0, text.length - 1);
    //    }
    //    var result = Math.round(eval(text)*100)/100;
    //    if (text.length >= 24) {
    //        $("#expression").text(result);
    //    }
    //    $("#result").text(Math.round(eval(text)*100)/100);
    //};

    var shrinkExpresson = function (str) {
        var len = str.length;
        if (len < 20) {
            return str;
        }
        var lastOptPos = 0;
        var lastOpt = '';
        for (var i = len; i > 0; i--) {
            if (isOperator(str.charAt(i - 1))) {
                lastOptPos = i - 1;
                lastOpt = str.charAt(lastOptPos);
                break;
            }
        }
        var tmp1 = str.substr(0, lastOptPos);
        var tmp2 = str.substr(lastOptPos);
        var tmp = '';
        var cur = '';
        var c = '';
        var left = '';
        var right = '';
        //handle * /
        for (var i = 0; i < tmp1.length; i++) {
            c = tmp1.charAt(i);
            if (isOperator(c)) {
                if (c == '*' || c == '/') {
                    cur = Math.round(eval(cur) * 100) / 100;
                    cur = cur + c;
                }
                else if (c == '+' || c == '-') {
                    cur = Math.round(eval(cur) * 100) / 100;
                    tmp = tmp + cur + c;
                    cur = '';
                }
                else {
                    tmp = tmp + cur + c;
                    cur = '';
                }
            }
            else {
                cur = cur + c;
            }
        }
        cur = Math.round(eval(cur) * 100) / 100;
        tmp1 = tmp + cur;
        //handle + -
        tmp = '';
        cur = '';
        c = '';
        for (var i = 0; i < tmp1.length; i++) {
            c = tmp1.charAt(i);
            if (isOperator(c)) {
                if (c == '+' || c == '-') {
                    cur = Math.round(eval(cur) * 100) / 100;
                    cur = cur + c;
                }
                else {
                    tmp = tmp + cur + c;
                    cur = '';
                }
            }
            else {
                cur = cur + c;
            }
        }
        if (!(lastOpt == '*' || lastOpt == '/')) {
            cur = Math.round(eval(cur) * 100) / 100;
        }
        tmp1 = tmp + cur;
        return tmp1 + tmp2;
    };

    $.prototype.calculator = function (fn) {
        var element = $(this);
        var close = function () {
            if ($.isFunction(fn)) {
                fn($("#result").text());
            }
            element.dialog('close');
        }

        if ($("#calculator").length == 0) {
            element.html(template);
            $("#clear").bind("click", clear);
            $("#divide").bind("click", function () { inputOperator('/'); });
            $("#multiply").bind("click", function () { inputOperator('*'); });
            $("#minus").bind("click", function () { inputOperator('-'); });
            $("#plus").bind("click", function () { inputOperator('+'); });
            $("#backspace").bind("click", backspace);
            $("#one").bind("click", function () { inputNumber(1); });
            $("#two").bind("click", function () { inputNumber(2); });
            $("#three").bind("click", function () { inputNumber(3); });
            $("#four").bind("click", function () { inputNumber(4); });
            $("#five").bind("click", function () { inputNumber(5); });
            $("#six").bind("click", function () { inputNumber(6); });
            $("#seven").bind("click", function () { inputNumber(7); });
            $("#eight").bind("click", function () { inputNumber(8); });
            $("#nine").bind("click", function () { inputNumber(9); });
            $("#zero").bind("click", function () { inputNumber(0); });
            $("#point").bind("click", point);
            $("#egal").bind("click", function () { close(); });

            $(document).bind("keyup", function (event) {
                if (element.prop("display") != "none") {
                    switch (event.keyCode) {
                        case 8: backspace(); break;
                        case 48:
                        case 96: inputNumber(0); break;
                        case 49:
                        case 97: inputNumber(1); break;
                        case 50:
                        case 98: inputNumber(2); break;
                        case 51:
                        case 99: inputNumber(3); break;
                        case 52:
                        case 100: inputNumber(4); break;
                        case 53:
                        case 101: inputNumber(5); break;
                        case 54:
                        case 102: inputNumber(6); break;
                        case 55:
                        case 103: inputNumber(7); break;
                        case 56:
                        case 104: inputNumber(8); break;
                        case 57:
                        case 105: inputNumber(9); break;
                        case 106: inputOperator('*'); break;
                        case 107: inputOperator('+'); break;
                        case 108: break;
                        case 109: inputOperator('-'); break;
                        case 110: point(); break;
                        case 111: inputOperator('/'); break;
                        case 106: inputOperator('*'); break;
                        default: break;
                    }
                }
            });
        }

        var _dialog = element;
        $('body').css('overflow', 'hidden');
        var _settings = {};
        _settings.open = function (event, ui) {
            $(this).siblings('.ui-dialog-titlebar').remove();
            $('#system-error-message-dialog-close').click(function (e) {
                _dialog.dialog('close');
            });
            $('div.ui-widget-overlay').click(function (e) {
                _dialog.dialog('close');
            });
        };
        _settings.create = function () {
            //$(this).css("maxHeight", 500);
        };
        _settings.close = function (event, ui) {
            $('body').css('overflow', 'auto');
        };
        _settings.width = 'auto';
        _settings.height = 'auto';
        _settings.closeOnEscape = true;
        _settings.position = 'center';
        _settings.modal = true;
        _settings.draggable = false;
        _settings.resizable = false;
        _settings.closable = false;
        _settings.dialogClass = 'ui-dialog-calculator';
        _settings.minHeight = 'auto';

        _dialog.dialog(_settings);
    };
})(jQuery);