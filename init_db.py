#!/usr/bin/env python
"""
Script to initialize the database for local development.
"""
import os
import sys

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db

def init_db():
    app = create_app('development')
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")

if __name__ == '__main__':
    init_db()