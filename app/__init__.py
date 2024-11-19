from flask import Flask
from config import Config
import pyrebase
from flask_toastr import Toastr

app = Flask(__name__)
app.config.from_object(Config)

toastr = Toastr(app)
firebase = pyrebase.initialize_app(Config.FIREBASE_CONFIG)
fb_auth = firebase.auth()
db = firebase.database()

from app import routes