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

var errors = {
	invalidData: "The API returned invalid data. 😵<br>Please tell me about this, this is not supposed to happen.",
	noPermission: "Without your permission, Wayback Weather can't find your location.<br>Please consider granting it.",
	positionUnavailable: "Wayback Weather can't find your location. 🤔",
	timeout: "Finding your location took too long.<br>Please try finding an area with better connection.",
	unknown: "An error occurred."
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
		navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
	}, false);

	document.getElementById("btn-reload").addEventListener("click", function() {
		window.location.reload(true);
	}, false);

	if (false) {
		var options = { year: "numeric", month: "long",	day: "2-digit" };
		document.querySelector(".weather.historical h3").innerHTML = (new Date()).toLocaleDateString(options);
		document.querySelector(".weather.current h3").innerHTML = (new Date()).toLocaleDateString(options);
		document.querySelector(".weather.historical .icon").innerHTML = conditions["hail"];
		document.querySelector(".weather.current .icon").innerHTML = conditions["rain"];

		document.querySelector(".weather.historical").classList.add("c");
		document.querySelector(".weather.current").classList.add("f");

		document.body.className = "weather";
	}

}

function makeCamelCase(str) {
	return myString.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
}

function geoSuccess(pos) {
	var lat = pos.coords.latitude;
	var lon = pos.coords.longitude;

	var xhr = new XMLHttpRequest();
	// xhr.addEventListener("load", geoLoaded);
	xhr.addEventListener("readystatechange", geoStateChange);
	xhr.open("GET", `./weather/${lat},${lon}`);
	xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	xhr.send();
}

function geoStateChange(evt) {
	if (evt.target.readyState === 4) {
		if (evt.target.status === 200) {
			geoLoaded(evt.target);
		} else {
			geoLoadedError(errors.invalidData);
		}
	}
}

function geoLoaded(xhr) {
	console.log(xhr);
	var response = JSON.parse(xhr.responseText);

	if (!("success" in response) || !response["success"]) {
		geoLoadedError(errors.invalidData);
		return;
	}

	var oldDate = new Date(...response["dateOld"]);
	var nowDate = new Date(...response["dateNow"]);

	var oldWeather = response["old"];
	var nowWeather = response["now"];

	var options = {
		year: "numeric",
		month: "long",
		day: "2-digit"
	};

	var unknownStr = "--";

	document.querySelector(".weather.historical h3").innerHTML = oldDate.toLocaleDateString(options);
	document.querySelector(".weather.current h3").innerHTML = nowDate.toLocaleDateString(options);

	document.querySelector(".weather.historical .icon").innerHTML = conditions[oldWeather["icon"] || "unknown"];
	document.querySelector(".weather.current .icon").innerHTML = conditions[nowWeather["icon"] || "unknown"];

	document.querySelector(".weather.historical .temperature").innerHTML = oldWeather["temp"] || unknownStr;
	document.querySelector(".weather.current .temperature").innerHTML    = nowWeather["temp"] || unknownStr;

	document.querySelector(".weather.historical .extremes .high").innerHTML = oldWeather["high"] || unknownStr;
	document.querySelector(".weather.historical .extremes .low").innerHTML  = oldWeather["low"] || unknownStr;
	document.querySelector(".weather.current .extremes .high").innerHTML    = nowWeather["high"] || unknownStr;
	document.querySelector(".weather.current .extremes .low").innerHTML     = nowWeather["low"] || unknownStr;

	document.querySelector(".weather.historical").classList.add(oldWeather["unit"]);
	document.querySelector(".weather.current").classList.add(oldWeather["unit"]);

	document.body.className = "weather";
}

function geoLoadedError(msg) {
	document.getElementById("errorMessage").innerHTML = msg;
	document.body.className = "error";
}

function geoError(err) {
	var errMsg = "";
	switch(err.code) {
		case err.PERMISSION_DENIED:
			errMsg = errors.noPermission;
			break;
		case err.POSITION_UNAVAILABLE:
			errMsg = errors.positionUnavailable;
			break;
		case err.TIMEOUT:
			errMsg = errors.timeout;
			break;
		default:
			errMsg = errors.unknown;
	}

	document.getElementById("errorMessage").innerHTML = errMsg;
	document.body.className = "error";
	console.log("ERROR", err, errMsg);
}

window.addEventListener("DOMContentLoaded", domLoaded, false);