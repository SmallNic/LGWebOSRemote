var express = require('express')
var app = express()
var morgan = require('morgan')
var exec = require('child_process').exec, child;

//
// var lookupTable = {
// 	tv:{
// 		enablingMessage:"Turning TV on...",
//     enablingScript:"python2 lgtv.py on",
// 		enabledConfirmation:"... TV is turned on",
// 		disablingMessage:"Turning TV off...",
//     disablingScript:"python2 lgtv.py off",
// 		disabledConfirmation:"... TV is turned off"
// 	},
// 	netflix:{
// 		enablingMessage:"Turning Netflix on...",
//     enablingScript:"python2 lgtv.py startApp netflix",
// 		enabledConfirmation:"... Netflix is turned on"
// 		disablingMessage:"Turning Netflix off...",
//     disablingScript:"python2 lgtv.py closeApp netflix",
// 		disabledConfirmation:"... Netflix is turned off"
//
// 	}
// };
//

var appLookup = {
	netflix:{
		name:"Netflix",
		id:"netflix"
	},
	plex:{
		name:"Plex",
		id:"cdp-30"
	},
	amazon:{
		name:"Amazon",
		id:"amazon.html"
	},
	youtube:{
		name:"YouTube",
		id:"youtube.leanback.v4"
	},
	fireplace:{
		name:"Fireplace",
		id:"com.xstars.app.fireplace"
	}
}

state_on = false
// TODO add states for all of the devices:


app.use(morgan("dev", {
	"format": "default",
	"stream": {
		write: function (str) { console.log(str); }
	}
}))

app.get('/tv/state', function (req, res) {
	console.log("Getting state...")
	msg = "Off"
	if (state_on) {
		msg = "On"
	}
	res.status(200).send(msg)
})

app.post('/tv/on', function (req, res) {
  scriptData = {
    startingMessage:"Turning TV on...",
    script:"python2 lgtv.py on",
		confirmationMessage:"... TV is turned on"
  };

  executeScript(scriptData, res, turnStateOn);
})

app.post('/tv/off', function (req, res) {

  scriptData = {
    startingMessage:"Turning TV off...",
    script:"python2 lgtv.py off",
		confirmationMessage:"... TV is turned off"

  };

  executeScript(scriptData, res, turnStateOff);
})

app.post('/tv/mute', function (req, res) {

  scriptData = {
    startingMessage:"Muting TV...",
    script:"python2 lgtv.py setVolume 0",
		confirmationMessage:"... TV is muted"
  };

  executeScript(scriptData, res);
})

app.post('/tv/unmute', function (req, res) {

  scriptData = {
    startingMessage:"Unmuting TV...",
    script:"python2 lgtv.py setVolume 15",
		confirmationMessage:"... TV is unmuted"

  };

  executeScript(scriptData, res);
})

app.post('/apps/:app/on', function (req, res) {
	app = lookup(req.params.app);

  scriptData = {
    startingMessage:"Turning " + app.name + " in...",
    script:"python2 lgtv.py startApp " + app.id,
		confirmationMessage:"... " + app.name + " is on"
  };

  executeScript(scriptData, res);
})

app.post('/apps/:app/off', function (req, res) {
	app = lookup(req.params.app);

  scriptData = {
		startingMessage:"Turning " + app.name + " off...",
    script:"python2 lgtv.py closeApp " + app.id,
		confirmationMessage:"... " + app.name + " is off"
  };

  executeScript(scriptData, res);
})

function executeScript(scriptData, res, setState){
	console.log('-----------------------------')
	console.log(scriptData.startingMessage);

  var testscript = exec(scriptData.script);

  testscript.stdout.on('data', function (data) {
    console.log('ondata', data);
  })

  testscript.stderr.on('data', function (data) {
    console.error('onerror', data);
  })

	var successStatus;
  testscript.on('close', function (code) {
    console.log('close', code);
    if (code != 0) {
			res.status(500).send("Err")
      return;
    }
    if (typeof setState === "function"){
      setState();
    }
		res.status(200).send(scriptData.confirmationMessage)
  })

}

function turnStateOn(){
  state_on = true
}

function turnStateOff(){
  state_on = false
}

function lookup(app){
	return {
		name:appLookup[app]["name"],
		id:appLookup[app]["id"]
	};
}


app.listen(3000, function () {
	console.log('Listening to port 3000')
})
