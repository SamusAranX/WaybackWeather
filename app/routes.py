#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import sys
import json
import pytz
import argparse
from time import sleep
from datetime import date, datetime
from random import randint, uniform as randfloat
from dateutil.relativedelta import relativedelta

from darksky import DarkSkyAPI
from flask import Flask, request, Response, render_template, jsonify, redirect, url_for
from app import app

# Dark Sky API object
api = DarkSkyAPI()

#
# Helper methode
#
def hyphenated_to_camelCase(hyphenated):
	return re.sub("-([a-z])", lambda match: match.group(1).upper(), hyphenated)

def offset_from_iana(iana):
	return datetime.now(pytz.timezone(iana)).strftime('%z')

def bogus_data():
	randtz = f"{randint(0,21)-11:+03}00"
	date_now = date.today()

	now_low  = randfloat(-10, 14)
	now_high = now_low + randfloat(1, 20)
	now_temp = randfloat(now_low, now_high)

	old_low  = randfloat(-15, 10)
	old_high = old_low + randfloat(1, 16)
	old_temp = randfloat(old_low, old_high)

	return jsonify({
		"dateNow": [date_now.year, date_now.month-1, date_now.day],
		"dateOld": [date_now.year-50, date_now.month-1, date_now.day],
		"now": {
			"temp": "{:0.1f}".format(now_temp),
			"high": "{:0.1f}".format(now_high),
			"low":  "{:0.1f}".format(now_low),
			"icon": "cloudy"
		},
		"old": {
			"temp": "{:0.1f}".format(old_temp),
			"high": "{:0.1f}".format(old_high),
			"low":  "{:0.1f}".format(old_low),
			"icon": "cloudy"
		},
		"tz":  randtz,
		"success": True,
		"hello": "You can get API keys for free, so please don't use up my API calls. :("
	})

#
# Flask server methods
#

@app.errorhandler(500)
def internal_error(error):
    return "This shouldn't have happened. Please try reloading the page."

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/weather/<lat>,<lon>")
def info(lat, lon):
	ua = request.user_agent
	referrer = request.headers.get("Referer")
	legit = request.is_xhr and \
		"curl" not in ua.string.lower() and \
		"wget" not in ua.string.lower() and \
		referrer == "https://peterwunder.de/playground/waybackweather/"

	# legit = True

	if not legit:
		sleep(randfloat(0.4, 0.8))
		return bogus_data()

	forecast_now = api.forecast(lat, lon)
	forecast_tz  = offset_from_iana(forecast_now["timezone"])
	date_now     = date.today()
	date_old     = date_now - relativedelta(years=50)

	forecast_now_json = {
		"temp": "{:d}".format(int(forecast_now["currently"]["apparentTemperature"])),
		"high": "{:0.1f}".format(forecast_now["daily"]["data"][0]["apparentTemperatureHigh"]),
		"low":  "{:0.1f}".format(forecast_now["daily"]["data"][0]["apparentTemperatureLow"]),
		"icon": hyphenated_to_camelCase(forecast_now["currently"]["icon"]),
		"unit": "f" if forecast_now["flags"]["units"] == "us" else "c"
	}

	try:
		yearsago = date_old.strftime("%Y-%m-%dT%H:%M:%S")
		forecast_old = api.forecast_historical(lat, lon, yearsago)

		forecast_old_json = {
			"temp": "{:d}".format(int(forecast_old["currently"]["apparentTemperature"])),
			"high": "{:0.1f}".format(forecast_old["daily"]["data"][0]["apparentTemperatureHigh"]),
			"low": "{:0.1f}".format(forecast_old["daily"]["data"][0]["apparentTemperatureLow"]),
			"icon": hyphenated_to_camelCase(forecast_old["currently"]["icon"]),
			"unit": "f" if forecast_old["flags"]["units"] == "us" else "c"
		}
	except Exception as e:
		forecast_old_json = {
			"temp": None,
			"high": None,
			"low": None,
			"icon": None,
			"unit": None
		}
	
	return jsonify({
		"dateNow": [date_now.year, date_now.month-1, date_now.day],
		"dateOld": [date_old.year, date_old.month-1, date_old.day],
		"now": forecast_now_json,
		"old": forecast_old_json,
		"tz":  forecast_tz,
		"success": True
	})

@app.route("/crash/")
@app.route("/crash/<key>")
def crash(key=None):
	if key == "mrbluesky":
		sys.exit(1)

	return redirect(url_for("index"))

@app.route("/error/")
def error():
	return "wat".encode("ascii").encode("ascii")
