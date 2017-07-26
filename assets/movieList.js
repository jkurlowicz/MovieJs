$(document).ready(function () {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "./videos",
        success: function (data) {
            $.each(data, function (i, singleMovie) {
                $("#list_of_movies").append('<BR><a href=\'./view_movie/'+singleMovie.id+'\'>' + escapeHtml(singleMovie.title) + '</a>');
            });
        }
    });
});
