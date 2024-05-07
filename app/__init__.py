from flask import Flask
from config import Config
import pyrebase
from flask_toastr import Toastr
from google_auth_oauthlib.flow import Flow
import google.auth.transport.requests
import os

app = Flask(__name__)
app.config.from_object(Config)

toastr = Toastr(app)

firebase = pyrebase.initialize_app(Config.FIREBASE_CONFIG)
auth = firebase.auth()
db = firebase.database()

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = Config.OAUTHLIB_INSECURE_TRANSPORT
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
REDIRECT_URI = os.environ.get('REDIRECT_URI')

flow = Flow.from_client_secrets_file(
    client_secrets_file=Config.CLIENT_SECRETS_FILE,
    scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
    redirect_uri=REDIRECT_URI,
)

from app import routes