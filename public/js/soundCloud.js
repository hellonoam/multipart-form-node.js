$(document).ready(function() { init(); });
function init() {
	//adding a listener to the submit event
	$(".submit").click(function(event) {
		if ($("input[type=file]").val() == "") {
			//in case a file wasn't chosen
			alert("you forgot to choose a file");
			return;
		}
		//the session id
		var rand = Math.random();
		$("form").attr("action", "/upload?session=" + rand);
		//start asking for percent once the form is sent
		updatePercent(rand);
	});
}

//updates the percent field until it reaches 100 percent.
//uploadId is the session id
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
				//is not done continue after 200 miliseconds
				setTimeout(function() { updatePercent(uploadId); }, 200);
			else { //done with upload
				$(".percent").text("100%");
				done();
			}
		}
	});
}

//sends the text field and shows path to uploaded file
function done() {
	//sending the text field
	$.ajax({
		url: "/text",
		data: { text: $("input[type=text]").val() },
		type: "GET",
		cache: false
	});
	//hiding form
	$("form").hide();
	//finding the path which is in the hidden iframe since the result was sent to there
	var path = $("#frame").contents().find(".output").text() || "";
	if (path == "") {
		//if path wasn't updated yet
		setTimeout(done, 1000);
		return;
	}
	//presenting the path
	$(".box").html("<p class='path'> path to file: <a href='" + 
		path.substring(0,path.indexOf("<")) +
		"'>here</a> </p>");
}