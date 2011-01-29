$(document).ready(function() { init(); });
function init() {
	$(".submit").click(function(event) {
		if ($("input[type=file]").val() == "") {
			alert("you forgot to choose a file");
			return;
		}
		var rand = Math.random();
		$("form").attr("action", "/upload?session=" + rand);
		updatePercent(rand);
	});
}

function updatePercent(uploadId) {
	$.ajax({
		url: "/percent",
		data: { session: uploadId },
		type: "GET",
		cache: false,
		success: function(data){
			if (data != "undefined")
				$(".percent").text(data + "%");
			if (data != "100")
				setTimeout(function() { updatePercent(uploadId); }, 200);
			else {
				$(".percent").text("100%");
				done();
			}
		}
	});
}

function done() {
	$.ajax({
		url: "/text",
		data: { text: $("input[type=text]").val() },
		type: "GET",
		cache: false
	});
	$("form").hide();
	var path = $("#frame").contents().find(".output").text() || "";
	if (path == "") {
		setTimeout(done, 1000);
		return;
	}
	$(".box").html("<p class='path'> path to file: <a href='" + 
		path.substring(0,path.indexOf("<")) +
		"'>here</a> </p>");
}