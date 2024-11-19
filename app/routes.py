import requests
from app import app
from flask import flash, redirect, render_template, render_template_string, request, session, abort, url_for, make_response
from app.forms import LoginForm, RegisterForm, EditForm
from datetime import datetime
from flask_toastr import Toastr
from flask import jsonify
from functools import wraps
import os

from app import app, fb_auth, db

@app.route("/", methods=['GET', 'POST'])
@app.route("/login", methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        try:
            user = fb_auth.sign_in_with_email_and_password(form.email.data, form.password.data)
            session["is_logged_in"] = True
            session['email'] = form.email.data
            session["uid"] = user["localId"]
            user_data = db.child("users").child(session["uid"]).get().val()
            if user_data and "is_super_admin" in user_data and user_data["is_super_admin"]:
                session["is_super_admin"] = True
            else:
                session["is_super_admin"] = False
            if user_data:
                session["name"] = user_data.get("name", "User")
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
            return render_template('login.html', title='Sign In', form=form)
            


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
            fb_auth.create_user_with_email_and_password(register.email.data, register.password.data)
            user = fb_auth.sign_in_with_email_and_password(register.email.data, register.password.data)
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
            db.child("users").child(session["uid"]).update({"last_logged_out": datetime.now().strftime("%m/%d/%Y, %H:%M:%S")})
        session["is_logged_in"] = False
        session.pop("email", None)
        session.pop("name", None)
        session.clear()
    except Exception as e:
        flash(f"Terjadi kesalahan saat logout: {e}", "error")
        
    return redirect(url_for('login'))

@app.route('/static/scripts/chart.js')
def chart_js():
    with open('app/static/scripts/chart.js', 'r') as file:
        template = file.read()
    
    js_content = template.replace('{{FIREBASE_API_KEY}}', os.environ.get('FIREBASE_API_KEY'))
    js_content = js_content.replace('{{FIREBASE_AUTH_DOMAIN}}', os.environ.get('FIREBASE_AUTH_DOMAIN'))
    js_content = js_content.replace('{{FIREBASE_DATABASE_URL}}', os.environ.get('FIREBASE_DATABASE_URL'))
    js_content = js_content.replace('{{FIREBASE_PROJECT_ID}}', os.environ.get('FIREBASE_PROJECT_ID'))
    js_content = js_content.replace('{{FIREBASE_STORAGE_BUCKET}}', os.environ.get('FIREBASE_STORAGE_BUCKET'))
    js_content = js_content.replace('{{FIREBASE_MESSAGING_SENDER_ID}}', os.environ.get('FIREBASE_MESSAGING_SENDER_ID'))
    js_content = js_content.replace('{{FIREBASE_APP_ID}}', os.environ.get('FIREBASE_APP_ID'))
    js_content = js_content.replace('{{FIREBASE_MEASUREMENT_ID}}', os.environ.get('FIREBASE_MEASUREMENT_ID'))
    
    response = make_response(js_content)
    response.headers['Content-Type'] = 'application/javascript'
    return response

@app.route('/static/scripts/table.js')
def table_js():
    with open('app/static/scripts/table.js', 'r') as file:
        template = file.read()
    
    js_content = template.replace('{{FIREBASE_API_KEY}}', os.environ.get('FIREBASE_API_KEY'))
    js_content = js_content.replace('{{FIREBASE_AUTH_DOMAIN}}', os.environ.get('FIREBASE_AUTH_DOMAIN'))
    js_content = js_content.replace('{{FIREBASE_DATABASE_URL}}', os.environ.get('FIREBASE_DATABASE_URL'))
    js_content = js_content.replace('{{FIREBASE_PROJECT_ID}}', os.environ.get('FIREBASE_PROJECT_ID'))
    js_content = js_content.replace('{{FIREBASE_STORAGE_BUCKET}}', os.environ.get('FIREBASE_STORAGE_BUCKET'))
    js_content = js_content.replace('{{FIREBASE_MESSAGING_SENDER_ID}}', os.environ.get('FIREBASE_MESSAGING_SENDER_ID'))
    js_content = js_content.replace('{{FIREBASE_APP_ID}}', os.environ.get('FIREBASE_APP_ID'))
    js_content = js_content.replace('{{FIREBASE_MEASUREMENT_ID}}', os.environ.get('FIREBASE_MEASUREMENT_ID'))
    
    response = make_response(js_content)
    response.headers['Content-Type'] = 'application/javascript'
    return response

@app.route('/static/scripts/dashboard.js')
def dashboard_js():
    with open('app/static/scripts/dashboard.js', 'r') as file:
        template = file.read()
    
    js_content = template.replace('{{FIREBASE_API_KEY}}', os.environ.get('FIREBASE_API_KEY'))
    js_content = js_content.replace('{{FIREBASE_AUTH_DOMAIN}}', os.environ.get('FIREBASE_AUTH_DOMAIN'))
    js_content = js_content.replace('{{FIREBASE_DATABASE_URL}}', os.environ.get('FIREBASE_DATABASE_URL'))
    js_content = js_content.replace('{{FIREBASE_PROJECT_ID}}', os.environ.get('FIREBASE_PROJECT_ID'))
    js_content = js_content.replace('{{FIREBASE_STORAGE_BUCKET}}', os.environ.get('FIREBASE_STORAGE_BUCKET'))
    js_content = js_content.replace('{{FIREBASE_MESSAGING_SENDER_ID}}', os.environ.get('FIREBASE_MESSAGING_SENDER_ID'))
    js_content = js_content.replace('{{FIREBASE_APP_ID}}', os.environ.get('FIREBASE_APP_ID'))
    js_content = js_content.replace('{{FIREBASE_MEASUREMENT_ID}}', os.environ.get('FIREBASE_MEASUREMENT_ID'))
    
    response = make_response(js_content)
    response.headers['Content-Type'] = 'application/javascript'
    return response
                
@app.route('/dashboard')
def dashboard():
    if session.get("is_logged_in", False):
        return render_template("dashboard.html", title='Dashboard', email=session["email"], name=session["name"])
    else:
        return redirect(url_for('login'))
    
@app.route('/chart')
def chart():
    if session.get("is_logged_in", False):
        return render_template("chart.html", title='chart', email=session["email"], name=session["name"])
    else:
        return redirect(url_for('login'))
    
@app.route('/table')
def table():
    if session.get("is_logged_in", False):
        return render_template("table.html", title='table', email=session["email"], name=session["name"])
    else:
        return redirect(url_for('login'))

def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if "is_super_admin" not in session or not session["is_super_admin"]:
            flash("Anda Tidak Punya Hak Akses ke Halaman Ini.", "error")
            return redirect(url_for('dashboard'))
        return func(*args, **kwargs)
    return wrapper
    
@app.route('/usersmanagement')
@admin_required
def usersmanagement():
    if session.get("is_logged_in", False):
        return render_template("usersmanagement.html", title='Users Management', email=session["email"], name=session["name"])
    else:
        return redirect(url_for('login'))
    
@app.route('/usersmanagement/createuser', methods=['GET', 'POST'])
@admin_required
def createuser():
    createUser = RegisterForm()
    if createUser.validate_on_submit():
        try:
            fb_auth.create_user_with_email_and_password(createUser.email.data, createUser.password.data)
            user = fb_auth.sign_in_with_email_and_password(createUser.email.data, createUser.password.data)
            data = {
                "name": createUser.nama_lengkap.data,
                "email": createUser.email.data,
            }
            db.child("users").child(user["localId"]).set(data)
            flash(f"Pengguna berhasil ditambahkan!", "success")
        except Exception as e:
            flash(f"Terjadi error saat registrasi: {e}", "error")
            
    return render_template('createuser.html', title='Create User', createUser=createUser, email=session["email"], name=session["name"])

@app.route('/usersmanagement/edit/<user_id>', methods=['GET', 'POST'])
@admin_required
def usersmanagementedit(user_id):
    user_ref = db.child(f'users/{user_id}')
    user_data = user_ref.get().val()

    if not user_data:
        flash('Pengguna tidak ditemukan!', 'danger')
        return redirect(url_for('usersmanagement'))
        
    form = EditForm(nama_pengguna=user_data['name'], email=user_data['email'])

    if form.validate_on_submit():
        new_name = form.nama_pengguna.data
        try:
            db.child(f'users/{user_id}').update({'name': new_name})
            flash('Pengguna berhasil diperbarui', 'success')
            return redirect(url_for('usersmanagement'))
        except Exception as e:
            flash(f'Terjadi kesalahan ketika memperbaharui pengguna: {e}', 'danger')

    return render_template('usersmanagementedit.html', form=form, user_id=user_id, email=user_data['email'])

@app.route('/usersmanagement/update/<user_id>', methods=['GET', 'POST'])
@admin_required
def usersmanagementupdate(user_id):
    user_ref = db.child(f'users/{user_id}')
    try:
        user_ref.update({'name': new_name})
        flash('Pengguna berhasil diperbarui', 'success')
        return redirect(url_for('usersmanagement'))
    except Exception as e:
        flash(f'Terjadi kesalahan ketika memperbaharui pengguna: {e}', 'danger')

    return render_template('usersmanagementedit.html', form=form, user_id=user_id, email=user_data['email'])


@app.route('/usersmanagement/delete/<user_id>', methods=['GET'])
@admin_required
def usersmanagementdelete(user_id):
    try:
        user_ref = db.child(f'users/{user_id}')
        user_ref.remove()
        auth.delete_user(user_id)
        flash(f"Data berhasil dihapus!", "success")
        return redirect(url_for('usersmanagement'))
    except Exception as e:
        flash(f"Terjadi kesalahan saat menghapus data: {e}", "error")
        return redirect(url_for('usersmanagement'))

@app.route('/resetpassword')
def resetpassword():
    return render_template('resetpassword.html')





