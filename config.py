from dotenv import load_dotenv
import os
class Config:
    FIREBASE_CONFIG = {
        "apiKey": os.environ.get('FIREBASE_API_KEY'),
        "authDomain": os.environ.get('FIREBASE_AUTH_DOMAIN'),
        "databaseURL": os.environ.get('FIREBASE_DATABASE_URL'),
        "projectId": os.environ.get('FIREBASE_PROJECT_ID'),
        "storageBucket": os.environ.get('FIREBASE_STORAGE_BUCKET'),
        "messagingSenderId": os.environ.get('FIREBASE_MESSAGING_SENDER_ID'),
        "appId": os.environ.get('FIREBASE_APP_ID'),
    }
    OAUTHLIB_INSECURE_TRANSPORT = "1"
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'birjon'