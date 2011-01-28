require.paths.unshift(__dirname + "/hello");

var form     = require("./lib/connect-form"),
	express  = require("express"),
	fs = require("fs"),
	util = require("util");

var app = express.createServer( form({ keepExtensions: true }) );

app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyDecoder());
	app.use(app.router);
	app.use(express.staticProvider(__dirname + "/public"));
});

var percentComplete = {};

app.get("/", index);
app.post("/", index);
function index(req, res) {
	res.writeHead(200, {"content-type": "text/html"});
	var rs = fs.createReadStream("./public/index.html");
	util.pump(rs, res);
}

app.get("/text", function(req, res) {
	console.log("got text: " + req.param("text"));
	res.writeHead(200, {"Content-Type": "text/plain"});
	res.end();
});

app.post("/upload", function(req, res, next) {
	if (!req.form)
		return;
	var session = req.param("session");
	percentComplete[session] = 0;
	console.log("got upload request from session " + session);
	req.form.uploadDir = "./public/uploads/";
	req.form.complete(function(err, fields, files){
		if (err) {
			next(err);
		} else if (files.file) {
			var path = files.file.path;
			console.log("\nuploaded %s to %s",  files.file.filename, path);
			res.writeHead(200, {"Content-Type": "text/plain"});
			res.send("<div class='output'>" + path.substr(path.indexOf("/"))
				   + "</div>");
			res.end();
		}
	});

	req.form.on("progress", function(bytesReceived, bytesExpected){
		var percent = (bytesReceived / bytesExpected * 100) | 0;
		if (percent != percentComplete[session]) {
			process.stdout.write("Uploading: %" + percent + "\r");
			percentComplete[session] = percent;
		}
	});
	
});

app.get("/percent", function(req, res) {
	var session = req.param("session");
	console.log("got percent request from session " + session);
	res.writeHead(200, {});
	res.end("" + percentComplete[session]);
});

app.listen(8080);
console.log("Express app started on port 8080");