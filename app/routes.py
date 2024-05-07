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
from app import app, toastr, auth, db, flow, GOOGLE_CLIENT_ID

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
    try:
        if "uid" in session:
            db.child("users").child(session["uid"]).update({"last_logged_out": datetime.now().strftime("%d-%m-%y")})
        session["is_logged_in"] = False
        session.pop("email", None)
        session.pop("name", None)
        session.clear()
    except Exception as e:
        flash(f"Terjadi kesalahan saat logout: {e}", "error")
        
    return redirect(url_for('login'))
                
@app.route('/dashboard')
def dashboard():
    if session.get("is_logged_in", False):
        return render_template("dashboard.html", title='Dashboard', email=session["email"], name=session["name"])
    else:
        return redirect(url_for('login'))

