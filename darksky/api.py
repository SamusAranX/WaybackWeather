#!/usr/bin/env python3
# -*- coding: utf-8 -*-

try:
	import requests
except ImportError as e:
	raise ImportError("You need the Requests library for this. Try \"pip3 install requests\".")

from os.path import expanduser as eu
import json
import requests
import darksky

# import urllib.parse as urlparse
from urllib.parse import urlencode, urlsplit, urlunparse

class DarkSkyAPI():

	API_ROOT = "https://api.darksky.net/forecast"
	API_PARAMS = {
		"exclude": ["minutely", "hourly", "alerts"],
		"lang": "en",
		"units": "auto"
	}

	def __init__(self):
		try:
			with open(eu("darksky_config.json"), "r", encoding="utf8") as conf_json:
				conf = json.load(conf_json)
				self.API_KEY = conf["key"]
		except Exception as e:
			raise e

		self.session = requests.Session()
		self.session.headers.update({"User-Agent": f"WaybackWeather/{darksky.__version__}"})

	def forecast(self, latitude, longitude):
		endpoint = f"{self.API_ROOT}/{self.API_KEY}/{latitude},{longitude}"
		endpoint = urlsplit(endpoint)._replace(query=urlencode(self.API_PARAMS)).geturl()

		r = self.session.get(endpoint)
		if r.status_code == requests.codes.ok:
			return r.json()
		else:
			return {"success": False}

	def forecast_historical(self, latitude, longitude, time):
		endpoint = f"{self.API_ROOT}/{self.API_KEY}/{latitude},{longitude},{time}"
		endpoint = urlsplit(endpoint)._replace(query=urlencode(self.API_PARAMS)).geturl()

		r = self.session.get(endpoint)
		if r.status_code == requests.codes.ok:
			return r.json()
		else:
			return {"success": False}
