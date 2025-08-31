import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')

    # Database configuration
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(basedir, '..', 'instance', 'main.db')).replace("postgres://", "postgresql://")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
    SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
    SPOTIFY_REDIRECT_URI = os.environ.get('SPOTIFY_REDIRECT_URI', 'http://localhost:8000/callback')
    DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 't')

    # Songs and Playlists Track Numbers
    SONGS_PER_PAGE = 20
    MIN_PLAYLIST_TRACKS = 10
    MAX_PLAYLIST_TRACKS = 20

    # Session configuration
    PERMANENT_SESSION_LIFETIME = timedelta(hours=1)  # Set session lifetime to 1 hour
    SESSION_PERMANENT = True                         # Enable permanent sessions
    SESSION_COOKIE_SECURE = False                    # Secure cookies for HTTPS (False for local dev)
    SESSION_COOKIE_HTTPONLY = True                   # HttpOnly cookies
    SESSION_COOKIE_SAMESITE = 'Lax'                  # Cross-site cookie policy

class DevelopmentConfig(Config):
    DEBUG = Config.DEBUG
class ProductionConfig(Config):
    DEBUG = os.environ.get('DEBUG', 'False').lower() not in ('true', '1', 't')
class TestingConfig(Config):
    TESTING = Config.DEBUG
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(config_name='default'):
    return config.get(config_name, DevelopmentConfig)