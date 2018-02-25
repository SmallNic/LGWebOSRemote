var express = require('express')
var app = express()
var morgan = require('morgan')
var exec = require('child_process').exec, child;

state_on = false

app.use(morgan("dev", {
	"format": "default",
	"stream": {
		write: function (str) { console.log(str); }
	}
}))

app.get('/tv/state', function (req, res) {
	console.log("state")
	msg = "Off"
	if (state_on) {
		msg = "On"
	}
	res.status(200).send(msg)
})

app.post('/tv/on', function (req, res) {
	console.log('Turning TV on...')
	var testscript = exec('python2 lgtv.py on');
	testscript.stdout.on('data', function (data) {
		console.log('ondata', data)
	})
	testscript.stderr.on('data', function (data) {
		console.error('onerror', data)
	})
	testscript.on('close', function (code) {
		console.log('close', code)
		if (code != 0) {
			res.status(500).send("Err")
			return;
		}
		state_on = true
		res.status(200).send("I'm on!")
	})
})

app.post('/tv/off', function (req, res) {
	console.log('Turning TV off...')
	var testscript = exec('python2 lgtv.py off');
	testscript.stdout.on('data', function (data) {
		console.log('ondata', data)
	})
	testscript.stderr.on('data', function (data) {
		console.error('onerror', data)
	})
	testscript.on('close', function (code) {
		console.log('close', code)
		if (code != 0) {
			res.status(500).send("Err")
			return;
		}
		state_on = false
		res.status(200).send("I'm on!")
	})
})

app.listen(3000, function () {
	console.log('Listending to port 3000')
})
