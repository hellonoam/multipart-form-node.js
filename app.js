//server that gets a multipart upload and has the ability to respond with the percent of
//the upload complete

require.paths.unshift(__dirname + "/hello");

var form     = require("./lib/connect-form"),
	express  = require("express"),
	fs       = require("fs"),
	util     = require("util");

var app = express.createServer( form({ keepExtensions: true }) );

//configuration file
app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyDecoder());
	app.use(app.router);
	app.use(express.staticProvider(__dirname + "/public"));
});

//holds the percent complete for all the active sessions
var percentComplete = {};

// '/' with get or post gets the index file in the public folder
app.get("/", index);
app.post("/", index);
function index(req, res) {
	res.writeHead(200, {"content-type": "text/html"});
	var rs = fs.createReadStream("./public/index.html");
	util.pump(rs, res);
}

//accepts text as a param
app.get("/text", function(req, res) {
	console.log("got text: " + req.param("text"));
	res.writeHead(200, {"Content-Type": "text/plain"});
	res.end();
});

//accepts a form with a file and a session id
//uploads the file to path public/uploads
app.post("/upload", function(req, res, next) {
	if (!req.form)
		return;
	var session = req.param("session");
	percentComplete[session] = 0;
	console.log("got upload request from session " + session);
	req.form.uploadDir = "./public/uploads/";
	//when form has completed uploading
	req.form.complete(function(err, fields, files){
		if (err) {
			next(err);
		} else if (files.file) {
			var path = files.file.path;
			console.log("\nuploaded %s to %s",  files.file.filename, path);
			res.writeHead(200, {"Content-Type": "text/plain"});
			//responds with the path
			res.send("<div class='output'>" + path.substr(path.indexOf("/"))
				   + "</div>");
			res.end();
		}
	});

	//when uploading is in progress
	req.form.on("progress", function(bytesReceived, bytesExpected){
		var percent = (bytesReceived / bytesExpected * 100) | 0;
		if (percent != percentComplete[session]) {
			process.stdout.write("Uploading: %" + percent + "\r");
			percentComplete[session] = percent;
		}
	});
	
});

//gets the percent complete of a certain session
app.get("/percent", function(req, res) {
	var session = req.param("session");
	console.log("got percent request from session " + session);
	res.writeHead(200, {});
	res.end("" + percentComplete[session]);
});

app.listen(8080);
console.log("Express app started on port 8080");