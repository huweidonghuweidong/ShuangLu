(function (__global, angular) {

    /*if (!angular) {
    throw new Error("window.angular is not defined.");
    }

    var coreScope;
    angular.injector(['ng']).invoke(['$rootScope',
    function($rootScope) {
    coreScope = $rootScope.$new();
    }
    ]);

    var framework = angular.module('framework', []);*/

    dialogSetting = {
        title: undefined,
        btnText: undefined,
        height: undefined,
        width: undefined
    };

    ShowListDialog = function (table, selectCallBack, settings) {
        var _dialog_id = "system-list-dialog";
        var _dialog = $('#' + _dialog_id);
        settings = $.extend({}, dialogSetting, settings);
        $('body').css('overflow', 'hidden');
        //var _parm = new ShowSelectListDialogParameter();
        //extend(_parm, parameter);
        var _buttons = {};
        if (settings.btnText != undefined) {
            _buttons.text = settings.btnText;
            _buttons.class = 'buttonOrange buttonSmall';
            _buttons.click = function () {
                if (settings.confirmCallBack != undefined) {
                    settings.confirmCallBack();
                }
                _dialog.dialog('close');
            };
        }
        var _settings = {};
        _settings.open = function (event, ui) {
            /*$(this).siblings('.ui-dialog-titlebar').remove();*/
            _dialog.html(table);
            //$compile($('.ui-dialog'))(scope);
            $('div.ui-widget-overlay').click(function (e) {
                _dialog.dialog('close');
            });
            _dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.find('tr').bind('click', function () {
                if (this.id && selectCallBack != undefined) {
                    selectCallBack(this.id);
                    _dialog.dialog('close');
                }
            });
        };
        _settings.create = function () {
            $(this).css("maxHeight", 500);
        };
        _settings.close = function (event, ui) {
            $('body').css('overflow', 'auto');
        };
        if (settings.btnText != undefined) {
            _settings.buttons = [_buttons];
        }
        else {
            _settings.buttons = undefined;
        }
        _settings.title = settings.title;
        _settings.width = settings.width ? settings.width : 'auto';
        _settings.height = settings.height ? settings.height : 'auto';
        _settings.closeOnEscape = true;
        _settings.position = 'center';
        _settings.modal = true;
        _settings.draggable = false;
        _settings.resizable = false;
        _settings.closable = false;
        _settings.dialogClass = 'ui-dialog-custom ui-dialog-table';
        _settings.minHeight = 'auto';

        _dialog.dialog(_settings);
    };

    ShowCalculatorDialog = function (returnCallBack) {
        var _calculator_id = "system-calculator-dialog";
        var _calculator = $('#' + _calculator_id);
        _calculator.calculator(returnCallBack);
    };

    //TODO 转账授权书页面使用
    ShowConfirmationDialog2 = function (confirmationMsg, yesMsg, noMsg, yesCallBack, noCallback) {
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
            _dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
        };
        setting.create = function () {
            $(this).css("maxHeight", 500);
        };
        setting.close = function (event, ui) {
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
            //            if (!yesClicked){
            //                if (noCallback) {
            //                    noCallback();
            //                }
            //            }
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
} (window, window.angular));