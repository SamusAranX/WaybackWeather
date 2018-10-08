#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
from os.path import dirname

path = dirname(__file__)
if path not in sys.path:
	sys.path.insert(0, dirname(__file__))

from app import app as application