from flask import Flask
from dotenv import load_dotenv
from flask import render_template
from flask import request, redirect, url_for, session
import os
import time

app = Flask(__name__)

@app.route("/")
def home():

    return "this is the home page"

@app.route('/time')
def get_current_time():
    return {'time': time.time()}
