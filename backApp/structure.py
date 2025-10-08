from flask import Flask
from dotenv import load_dotenv
from flask import render_template
from flask import request, redirect, url_for, session
import os
import time

#Always create the a virtual enviorment in the backApp directory to run code

"""
  cd backApp
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  pip install -r requirements.txt

  two terminals in do
    yarn start
  the other do
    yarn start-app

"""

app = Flask(__name__)

@app.route("/")
def home():

    return "this is the home page"

@app.route('/time')
def get_current_time():
    return {'time': time.time()}
