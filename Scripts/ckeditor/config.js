/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.on('dialogDefinition', function (ev) {
    ev.data.definition.resizable = CKEDITOR.DIALOG_RESIZE_NONE;
});

CKEDITOR.editorConfig = function (config) {
    // Define changes to default configuration here. For example:
    config.language = 'zh-cn';
    config.uiColor = '#005027';
    config.width = 740;
    config.height = 200;

    // Resizable
    config.resize_enabled = false;

    config.disableObjectResizing = false;

    //font size
    config.fontSize_defaultLabel = '14';
    config.fontSize_sizes = "14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px";
    config.font_defaultLabel = '宋体';

    // Plugin setting
    CKEDITOR.config.toolbar_Custom = [['Maximize', 'ShowBlocks', '-', 'Bold', 'Italic', 'Underline', 'Subscript', 'Superscript', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'Link', 'Unlink', 'Image', 'Table', 'SpecialChar', 'TextColor', 'BGColor', 'FontSize', 'Font']];
    config.font_names = '宋体/宋体;黑体/黑体;方正舒体/方正舒体;华文行楷/华文行楷;隶书/隶书;幼圆/幼圆;微软雅黑/微软雅黑;' + config.font_names;
    config.toolbar = 'Custom';

    //去除超链接【高级】【目标】【链接】选项卡;插入图片去除选项卡时
    config.removeDialogTabs = 'link:advanced;link:target;image:advanced;image:target;image:Link;';
    //编辑器的下方 总显示body 和 p的标签
    config.removePlugins = 'elementspath';
};
