function OnSearch() {
    if ($("#AMName").val() == "") {
        $("#errorMsg").text("请选择客户经理编号.");
        return false;
    }
    if ($("#JDCName").val() == "") {
        $("#errorMsg").text("请选择经纪或代理公司.");
        return false;
    }
    $('#amform').submit();
}

function AddNew() {
    if ($("#AMName").val() == "") {
        $("#errorMsg").text("请选择客户经理编号.");
        return false;
    }
    if ($("#JDCName").val() == "") {
        $("#errorMsg").text("请选择经纪或代理公司.");
        return false;
    }
    $('#amform').submit();
}

function ChanageJDName() {
    $("#errorMsg").text("");
}
function ChanageAMName(rurl) {
    var amCode = $("#AMName").val();
    $("#errorMsg").text("");
    if (amCode != "") {
        $.ajax({
            async: false,
            type: "POST",
            url: rurl,
            datatype: "json",
            data: "amCode=" + amCode,
            success: function (jdList) {
                $("#InsuAgent").text(jdList.terrnm);
                $('#JDCName option').remove();
                $('#JDCName').append('<option value="" selected="selected">请选择</option>');
                $.each(jdList.listu, function (index, item) {
                    $('#JDCName').append('<option value="' + item.BkAgentCode + '">' + item.BkAgentCode + " - " + item.BkAgentName + '</option>');
                });
            }
        });
    }
    else {
        $("#InsuAgent").text("");
        $('#JDCName option').remove();
        $('#JDCName').append('<option value="" selected="selected">请选择</option>');
    }
}