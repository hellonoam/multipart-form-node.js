$(document).ready(function() { init(); });
function init() {
	CFInstall.check({
		mode: "overlay",
		destination: "http://ec2-50-16-138-59.compute-1.amazonaws.com/"
	});
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
	console.log("update percent was called")
	$.ajax({
		url: "/percent",
		data: { session: uploadId },
		type: "GET",
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
		type: "GET"
	});
	$("form").hide();
	var path = $("iframe").contents().find(".output").text() || "";
	if (path == "") {
		setTimeout(done, 1000);
		return;
	}
	$(".box").html("<p class='path'> path to file: <a href='" + 
		path.substring(0,path.indexOf("<")) +
		"'>here</a> </p>");
}