import sqlite3
import requests
import time
import subprocess
import os
import json

# Start the server
print("Starting backend server...")
server = subprocess.Popen(["go", "run", "backend/main.go"], cwd="C:\\Users\\aryan\\repos\\PCMaxing_Go")
time.sleep(3) # wait for server to start

try:
    users = []
    # Create 4 users
    for i in range(1, 5):
        email = f"test{i}@pcmaxing.xyz"
        username = f"test{i}"
        password = "password123"
        print(f"Creating user {username}...")
        resp = requests.post("http://localhost:8080/api/auth/signup", json={
            "email": email,
            "username": username,
            "password": password
        })
        if resp.status_code == 200:
            print(f"Success creating {username}")
        else:
            print(f"Failed or already exists {username}:", resp.text)
            # Try to login instead to get token if needed, but we don't need token for popular builds
        users.append(username)
    
    # Now we insert 10 builds into popular_builds
    db_path = "C:\\Users\\aryan\\repos\\PCMaxing_Go\\pcmaxing.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM popular_builds") # clear existing
    
    # We need some parts, let's fetch one from API
    parts = []
    resp = requests.get("http://localhost:8080/api/components")
    if resp.status_code == 200:
        comps = resp.json()
        if comps:
            cpu = next((c for c in comps if c['category'] == 'CPU'), None)
            gpu = next((c for c in comps if c['category'] == 'GPU'), None)
            if cpu: parts.append(cpu)
            if gpu: parts.append(gpu)
    
    parts_json = json.dumps(parts) if parts else "[]"
    
    tiers = ["Budget", "Mid", "High", "Enthusiast"]
    
    for i in range(1, 11):
        user = users[i % 4]
        name = f"Build #{i} by {user}"
        tier = tiers[i % 4]
        price = 50000 + i * 10000
        
        cursor.execute('''
            INSERT INTO popular_builds (name, description, parts, total_price, tier)
            VALUES (?, ?, ?, ?, ?)
        ''', (name, f"A great {tier} PC build created by our user {user}.", parts_json, price, tier))
    
    conn.commit()
    conn.close()
    print("Successfully populated 10 popular builds.")
    
finally:
    server.terminate()
