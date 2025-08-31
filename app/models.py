from .extensions import db
from enum import Enum
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(100), unique=True, nullable=False)
    display_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    access_token = db.Column(db.String(255))
    refresh_token = db.Column(db.String(255))
    expires_at = db.Column(db.Integer)
    genres = db.relationship('UserGenre', backref='user', lazy=True)

    def __init__(self, user_id, display_name=None):
        self.user_id = user_id
        self.display_name = display_name

class UserGenre(db.Model):
    __tablename__ = 'user_genres'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey('users.user_id'), nullable=False)
    genre = db.Column(db.String, nullable=False)

    def __init__(self, user_id, genre):
        self.user_id = user_id
        self.genre = genre

playlist_songs = db.Table('playlist_songs',
    db.Column('playlist_id', db.Integer, db.ForeignKey('playlist.id'), primary_key=True),
    db.Column('song_id', db.Integer, db.ForeignKey('song.id'), primary_key=True)
)