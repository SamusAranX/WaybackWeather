var conditions = {
	clearDay: "☀️",
	clearNight: "🌙",
	rain: "🌧",
	snow: "❄️",
	sleet: "🌨",
	wind: "🌬",
	fog: "🌫",
	cloudy: "☁️",
	partlyCloudyDay: "⛅️",
	partlyCloudyNight: "☁️",

	hail: "❄️",
	thunderstorm: "🌩",
	tornado: "🌪",

	unknown: "❗"
}

function domLoaded(e) {
	"use strict";

	var geoOptions = {
		enableHighAccuracy: true,
		timeout: 8000,
		maximumAge: 1800000
	};

	document.getElementById("btn-start").addEventListener("click", function() {
		document.body.className = "loading";
		navigator.geolocation.getCurrentPosition(geoSuccess, geoErr, geoOptions);
	}, false);

	document.getElementById("btn-reload").addEventListener("click", function() {
		window.location.reload(true);
	}, false);
}

function makeCamelCase(str) {
	return myString.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
}

function geoSuccess(pos) {
	console.log(pos);
	var xhr = new XMLHttpRequest();
	xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	xhr.addEventListener("load", geoLoaded);
	xhr.open("GET", "./weather");
	xhr.send();
}

function geoLoaded() {
	var response = JSON.parse(this.responseText);

	if (!("success" in response) || !response["success"]) {
		geoLoadedError("The API returned invalid data. 😵");
		return;
	}

	oldDate = new Date(...response["dateOld"]);
	nowDate = new Date(...response["dateNow"]);

	dateFormatOptions = {
		year: "numeric",
		month: "long",
		day: "2-digit",
		weekday: "long"
	}

	document.querySelector(".weather.historical h3").innerHTML = oldDate.toLocaleDateString(options);
	document.querySelector(".weather.current h3").innerHTML = nowDate.toLocaleDateString(options);

	document.body.className = "weather";
}

function geoLoadedError(msg) {
	document.getElementById("errorMessage").innerHTML = msg;
	document.body.className = "error";
}

function geoErr(err) {
	var errMsg = "";
	switch(err.code) {
		case err.PERMISSION_DENIED:
			errMsg = "Without your permission, Wayback Weather can't find your location. Please consider granting it.";
			break;
		case err.POSITION_UNAVAILABLE:
			errMsg = "Wayback Weather can't find your location. 🤔";
			break;
		case err.TIMEOUT:
			errMsg = "Finding your location took too long. Please try finding an area with better connection.";
			break;
		default:
			errMsg = "An error occurred.";
	}

	document.getElementById("errorMessage").innerHTML = errMsg;
	document.body.className = "error";
	console.log("ERROR", err, errMsg);
}

window.addEventListener("DOMContentLoaded", domLoaded, false);