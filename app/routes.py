import os
import requests
from app import app
import pyrebase
from flask import flash, redirect, render_template, request, session, abort, url_for, make_response
from app.forms import LoginForm, RegisterForm
from datetime import datetime
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
import google.auth.transport.requests
from flask_toastr import Toastr
from config import Config
from flask import jsonify
from flask_socketio import SocketIO, emit
import json

toastr = Toastr(app)
socket = SocketIO(app)

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = Config.OAUTHLIB_INSECURE_TRANSPORT

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
REDIRECT_URI = os.environ.get('REDIRECT_URI')

flow = Flow.from_client_secrets_file(
    client_secrets_file=Config.CLIENT_SECRETS_FILE,
    scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
    redirect_uri=REDIRECT_URI,
)

fb = pyrebase.initialize_app(Config.FIREBASE_CONFIG)
auth = fb.auth()
db = fb.database()

def login_is_required(function):
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401)  
        else:
            return function()
        
    return wrapper

@app.route('/login/google')
def login_google():
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    return redirect(authorization_url)

@app.route('/callback')
def callback():
    try:
        flow.fetch_token(authorization_response=request.url)
        if not session["state"] == request.args["state"]:
            abort(500)

        credentials = flow.credentials
        request_session = requests.session()
        cached_session = cachecontrol.CacheControl(request_session)
        token_request = google.auth.transport.requests.Request(session=cached_session)
        user_info = id_token.verify_oauth2_token(
            id_token=credentials._id_token,
            request=token_request,
            audience=GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )

        if user_info:
            user_id = user_info.get("sub")
            session["is_logged_in"] = True
            session["email"] = user_info["email"]
            session["uid"] = user_id
            session["name"] = user_info.get("name")
            db.child("users").child(user_id).update({"last_logged_in": datetime.now().strftime("%m/%d/%Y, %H:%M:%S")})
            flash({'title': "Berhasil sign-in", 'message': f"Selamat datang, {session['name']}!"}, 'success')
            return redirect(url_for('dashboard'))
        else:
            flash("Terjadi kesalahan saat sign-in. Tolong coba kembali.", "error")
            return redirect(url_for('login'))

    except Exception as e:
        flash(f"Terjadi kesalahan saat sign-in: {e}", "error")
        return redirect(url_for('login'))

@app.route("/", methods=['GET', 'POST'])
@app.route("/login", methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        try:
            user = auth.sign_in_with_email_and_password(form.email.data, form.password.data)
            session["is_logged_in"] = True
            session['email'] = form.email.data
            session["uid"] = user["localId"]
            data = db.child("users").get().val()
            if data and session["uid"] in data:
                session["name"] = data[session["uid"]]["name"]
            else:
                session["name"] = "User"

            db.child("users").child(session["uid"]).update({"last_logged_in": datetime.now().strftime("%m/%d/%Y, %H:%M:%S")})

            if form.remember_me.data:
                session.permanent = True
            else:
                session.permanent = False
                
            flash({'title': "Berhasil sign-in", 'message': f"Selamat datang, {session['name']}!"}, 'success')
            return redirect(url_for('dashboard'))

        except Exception as e:
            flash(f"Terjadi kesalahan saat login: {e}", "error")

    else:
        if session.get("email"):
            form.email.data = session.get("email")

        if session.get("is_logged_in", False):
            return redirect(url_for('dashboard'))

    return render_template('login.html', title='Sign In', form=form)

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    register = RegisterForm()
    if register.validate_on_submit():
        try:
            auth.create_user_with_email_and_password(register.email.data, register.password.data)
            user = auth.sign_in_with_email_and_password(register.email.data, register.password.data)
            session["is_logged_in"] = False
            session['email'] = register.email.data
            session["name"] = register.nama_lengkap.data
            session["uid"] = user["localId"]
            data = {
                "name": register.nama_lengkap.data,
                "email": register.email.data,
                "last_logged_in": datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
            }
            db.child("users").child(session["uid"]).set(data)
            return redirect(url_for('login'))
        except Exception as e:
            flash(f"Terjadi error saat registrasi: {e}", "error")
    else:
        if session.get("is_logged_in", False):
            return redirect(url_for('dashboard'))

    return render_template('signup.html', title='Register', register=register)

@app.route("/logout")
def logout():
    global stream
    try:
        if "uid" in session:
            db.child("users").child(session["uid"]).update({"last_logged_out": datetime.now().strftime("%d-%m-%y")})
        if stream:
            stream.close()
        session["is_logged_in"] = False
        session.pop("email", None)
        session.pop("name", None)
        session.clear()
    except Exception as e:
        flash(f"Terjadi kesalahan saat logout: {e}", "error")
        
    return redirect(url_for('login'))

stream_1 = "pertama"
stream_2 = "kedua"

def stream_handler(message):
    global data

    if message["path"] == "/":
        date = f"{datetime.now().strftime('%d-%m-%Y')}"
        if message["stream_id"] == stream_1:
            data = {date: { 
                'shift1': message["data"]
                }
            }
            print(data)
            socket.emit('stream_update_shift1', data)
        if message["stream_id"] == stream_2:
            data = {date: { 
                'shift2': message["data"]
                }
            }
            print(data)
            socket.emit('stream_update_shift2', data)
    else:
        path_parts = message["path"].split("/")[1:]
        current_data = data

        for part in path_parts[:-1]:
            if part in current_data:
                current_data = current_data[part]
            else:
                return

        key = path_parts[-1]
        current_data[key] = message["data"]

        if message["stream_id"] == stream_1:
            socket.emit('stream_update_shift1', data)
        else:
            socket.emit('stream_update_shift2', data)
        
@app.route('/dashboard')
def dashboard():
    if session.get("is_logged_in", False):
        global stream
        date = datetime.now().strftime("%d-%m-%Y")
        
        for shift in ["shift1", "shift2"]:
            shift_ref = db.child("mesin").child(date).child(shift)
            shift_ref.update({"status": "aktif"})

        stream = db.child("mesin").child(date).child("shift1").stream(stream_handler, stream_id=stream_1)
        stream = db.child("mesin").child(date).child("shift2").stream(stream_handler, stream_id=stream_2)

        return render_template("dashboard.html", title='Dashboard', email=session["email"], name=session["name"])
    else:
        return redirect(url_for('login'))
    
if __name__ == '__main__':
    socket.run(app)
