#!/usr/bin/env python3
import subprocess
import sys
import os
import time
from threading import Thread

def start_flask():
    """Start Flask backend"""
    os.chdir('api')
    subprocess.run([sys.executable, 'index.py'])

def start_react():
    """Start React frontend"""
    os.chdir('frontend')
    subprocess.run(['npm', 'start'])

if __name__ == '__main__':
    print("Starting local development servers...")
    
    # Start Flask in a separate thread
    flask_thread = Thread(target=start_flask)
    flask_thread.daemon = True
    flask_thread.start()
    
    # Give Flask time to start
    time.sleep(2)
    
    # Start React (this will block)
    start_react()
