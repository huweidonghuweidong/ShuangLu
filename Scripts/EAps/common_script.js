function getTextBoxHTML(my_name, my_id, my_value, other_option) {
    var text = '<input type="text" name="' + my_name + '" id="' + my_id + '" value="' + my_value + '" ' + other_option + ' />\n';
    return text;
}

function getSelectBoxHTML(my_name, my_id, my_option_value_arr, my_option_text_arr, selected_option_value, other_option) {
    var select_start = '<select name="' + my_name + '" id="' + my_id + '" ' + other_option + '>\n';
    var option_content = '';
    for (i = 0; i < my_option_value_arr.length; i++) {
        if (my_option_value_arr[i] == selected_option_value) {
            option_content += '<option value="' + my_option_value_arr[i] + '" selected="selected">' + my_option_text_arr[i] + '</option>\n';
        } else {
            option_content += '<option value="' + my_option_value_arr[i] + '" >' + my_option_text_arr[i] + '</option>\n';
        }
    }
    var select_end = '</select>';
    return select_start + option_content + select_end;
}

function getHorizontalRadioGroupHTML(my_name, my_id, my_value_arr, my_text_arr, selected_value, other_option) {

    var radio_html = '';
    for (i = 0; i < my_text_arr.length; i++) {
        radio_html += '<input type="radio" name="' + my_name + '" id="' + (my_id + '_' + i) + '" value="' + my_value_arr[i] + '" ' + other_option;
        if (selected_value == my_value_arr[i]) {
            radio_html += ' checked="checked" ';
        }
        radio_html += '/>' + my_text_arr[i] + '&nbsp;&nbsp;\n';
    }

    return radio_html;
}

function getHorizontalRadioGroupHTML2(my_name, my_id, my_value_arr, my_text_arr, selected_value, other_option) {

    var radio_html = '';
    for (i = 0; i < my_text_arr.length; i++) {
        radio_html += '<input type="radio" name="' + my_name + '" id="' + (my_id + '_' + i) + '" value="' + my_value_arr[i] + '" ' + other_option;
        if (selected_value == my_value_arr[i]) {
            radio_html += ' checked="checked" ';
        }
        if (my_value_arr[i] == '') {
            radio_html += ' style="display:none;" ';
        }
        radio_html += '/>' + my_text_arr[i] + '&nbsp;&nbsp;\n';
    }
    return radio_html;
}

function copyInputObject(obj_type, source_id, target_id) {
    source = document.getElementById(source_id);
    target = document.getElementById(target_id);
    if (obj_type == "text") {
        target.value = source.value;
    } else if (obj_type == "hidden") {
        target.value = source.value;
    } else if (obj_type == "radio") {
        source0 = document.getElementById(source_id + "_0");
        target0 = document.getElementById(target_id + "_0");
        radio_arr = document.getElementsByName(source0.name);
        for (curr_radio_num = 0; curr_radio_num < radio_arr.length; curr_radio_num++) {
            temp_source = document.getElementById(source_id + "_" + curr_radio_num);
            temp_target = document.getElementById(target_id + "_" + curr_radio_num);
            temp_target.checked = temp_source.checked;
        }
    } else if (obj_type == "checkbox") {
        target.checked = source.checked;
    } else if (obj_type == "select") {
        $('#' + target_id).val($('#' + source_id).val());
    } else if (obj_type == "select_option") {
        for (j = target.options.length - 1; j >= 0; j--) {//remove all options in target
            target.remove(j);
        }
        for (j = 0; j < source.options.length; j++) { //add options from source to target
            var optn = document.createElement("OPTION");
            optn.text = source.options[j].text;
            optn.value = source.options[j].value;
            target.options.add(optn);
        }
        target.selectedIndex = source.selectedIndex;
    }
}

function setDefaultTableRowStyle(table_obj, row_class_1, row_class_2){
    for (i = 0; i < table_obj.rows.length; i++) {
        row_obj = table_obj.rows[i];
        if (i % 2 == 0) {
            row_obj.className = row_class_1;
        } else {
            row_obj.className = row_class_2;
        }
    }
}

function setDefaultContentTableStyle(table_obj, row_class_1, row_class_2, first_cell_class, first_cell_width) {
    //default style for a table of showing data
    table_obj.border = "0";
    table_obj.height = "100%";
    table_obj.width = "100%";
    table_obj.setAttribute("cellPadding", "0");
    table_obj.setAttribute("cellSpacing", "0");

    setDefaultTableRowStyle(table_obj, row_class_1, row_class_2);

    for (i = 0; i < table_obj.rows.length; i++) {
        row_obj = table_obj.rows[i];

        /*if (i % 2 == 0) {
        row_obj.className = row_class_1;
        } else {
        row_obj.className = row_class_2;
        }*/
        if (row_obj.cells[0]) {
            row_obj.cells[0].className = first_cell_class;
            row_obj.cells[0].setAttribute("width", first_cell_width);
        }
    }
}

var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function encode64(input) {
    input = escape(input);
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;

    do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
           keyStr.charAt(enc1) +
           keyStr.charAt(enc2) +
           keyStr.charAt(enc3) +
           keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);

    return output;
}

function decode64(input) {
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    var base64test = /[^A-Za-z0-9\+\/\=]/g;
    if (base64test.exec(input)) {
        alert("There were invalid base64 characters in the input text.\n" +
              "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
              "Expect errors in decoding.");
    }
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

    } while (i < input.length);

    return unescape(output);
}
//处理千分位
function Convert(amtStr) {
    var a, renum = '';
    var j = 0;
    var a1 = '', a2 = '', a3 = '';
    var tes = /^-/;
    a = amtStr.replace(/,/g, "");
    a = a.replace(/[^-\.,0-9]/g, ""); //删除无效字符  
    a = a.replace(/(^\s*)|(\s*$)/g, ""); //trim  
    if (tes.test(a)) a1 = '-';
    else a1 = '';
    a = a.replace(/-/g, "");
    if (a != "0" && a.substr(0, 2) != "0.") a = a.replace(/^0*/g, "");
    j = a.indexOf('.'); if (j < 0) j = a.length; a2 = a.substr(0, j); a3 = a.substr(j); j = 0;
    for (i = a2.length; i > 3; i = i - 3) {
        renum = "," + a2.substr(i - 3, 3) + renum;
        j++;
    }
    renum = a1 + a2.substr(0, a2.length - j * 3) + renum + a3;
    return renum;
}  
