$(document).ready(function () {
    var this_js_script = $('script[src*=commentsList]');
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "../videos/"+this_js_script.attr('data-videoId')+"/comments",
        success: function (data) {
            $.each(data, function (i, singleComment) {
                $("#list_of_comments").append('<BR>'+escapeHtml(singleComment.content));
            });
        }
    });
});