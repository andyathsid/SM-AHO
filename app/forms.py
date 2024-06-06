from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Email

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()], id='password')
    remember_me = BooleanField('Ingatkan Saya')
    submit = SubmitField('Sign In')
    show_password = BooleanField('Show password', id='check')
    
class RegisterForm(FlaskForm):
    nama_lengkap = StringField('Nama Lengkap', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()], id='password')
    confirm_password = PasswordField('Konfirmasi Password', validators=[DataRequired()], id='confirm_password')
    submit = SubmitField('Tambah')
    show_password = BooleanField('Show password', id='check')

class EditForm(FlaskForm):
    nama_pengguna = StringField('Nama Pengguna', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()], render_kw={'readonly': True})
    submit = SubmitField('Edit')

