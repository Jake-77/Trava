from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date
import sqlite3
import time 

app = Flask(__name__)
app.secret_key = 'development-key'
CORS(app, supports_credentials=True)

DB_PATH = 'database.db'

def query_db(query, args=(), one=False):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.commit()
    conn.close()
    return (rv[0] if rv else None) if one else rv

@app.post('/api/auth/signup')
def signup():
    data = request.json
    email = data['email'].lower()
    password = data['password']

    existing = query_db("SELECT * FROM users WHERE email = ?", [email], one=True)
    if existing:
        return jsonify({'error': 'Email already exists'}), 400

    password_hash = generate_password_hash(password)
    createdAt = date.today().isoformat()

    query_db(
        "INSERT INTO users (email, password, created_at) VALUES (?, ?, ?)",
        [email, password_hash, createdAt]
    )

    user = query_db("SELECT id, email FROM users WHERE email = ?", [email], one=True)
    session['user_email'] = email

    return jsonify({'user': dict(user)}), 200

@app.post('/api/auth/login')
def login():
    data = request.json
    email = data['email'].lower()
    password = data['password']

    user = query_db("SELECT * FROM users WHERE email = ?", [email], one=True)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    session['user_email'] = email
    return jsonify({'user': {'id': user['id'], 'email': user['email']}}), 200

@app.get('/api/auth/me')
def me():
    email = session.get('user_email')
    if not email:
        return jsonify({'user': None}), 200

    user = query_db("SELECT id, email FROM users WHERE email = ?", [email], one=True)
    return jsonify({'user': dict(user) if user else None}), 200

@app.post('/api/auth/logout')
def logout():
    session.clear()
    return jsonify({'message': 'logged out'}), 200

@app.get('/api/services')
def get_services():
    email = session.get('user_email')
    if not email:
        return jsonify([]), 200

    user = query_db("SELECT id FROM users WHERE email = ?", [email], one=True)
    services = query_db("SELECT * FROM services WHERE user_id = ?", [user['id']])
    return jsonify([dict(s) for s in services]), 200

@app.get('/api/services/<service_id>')
def get_service(service_id):
    service = query_db("SELECT * FROM services WHERE id = ?", [service_id], one=True)
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    return jsonify(dict(service)), 200

@app.post('/api/services')
def create_service():
    data = request.json
    service_id = str(int(time.time() * 1000))  
    #update like create_appointment
    query_db(
        "INSERT INTO services (id, user_id, title, description, price) VALUES (?, ?, ?, ?, ?)",  
        [
            service_id,
            data['user_id'],
            data['title'],  
            data['description'],
            data['price'],
        ]
    )

    service = query_db("SELECT * FROM services WHERE id = ?", [service_id], one=True)
    return jsonify(dict(service)), 201

@app.put('/api/services/<service_id>')
def update_service(service_id):
    data = request.json
    query_db(
        "UPDATE services SET title=?, description=?, price=? WHERE id=?",  
        [data.get('title'), data.get('description'), data.get('price'), service_id]
    )
    service = query_db("SELECT * FROM services WHERE id = ?", [service_id], one=True)
    return jsonify(dict(service)), 200

@app.delete('/api/services/<service_id>')
def delete_service(service_id):
    query_db("DELETE FROM services WHERE id = ?", [service_id])
    return jsonify({'message': 'Service deleted'}), 200

@app.get('/api/appointments')
def get_appointments():
    email = session.get('user_email')
    if not email:
        return jsonify([]), 200

    user = query_db("SELECT id FROM users WHERE email = ?", [email], one=True)
    appointments = query_db("SELECT * FROM appointments WHERE user_id = ?", [user['id']])
    return jsonify([dict(a) for a in appointments]), 200

@app.get('/api/appointments/<appointment_id>')
def get_appointment(appointment_id):
    appointment = query_db("SELECT * FROM appointments WHERE id = ?", [appointment_id], one=True)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    return jsonify(dict(appointment)), 200

@app.post('/api/appointments')
def create_appointment():
    #data = request.json
    data = request.get_json(force=True)  # force parsing JSON
    print("DEBUG appointment payload:", data)
    appointment_id = str(int(time.time() * 1000)) 

    email = session.get('user_email')
    if not email:
        return jsonify({'error': 'Unauthorized'}), 401

    # 2. Look up the user_id from the database
    user = query_db("SELECT id FROM users WHERE email = ?", [email], one=True)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    user_id = user['id']

    query_db(
        "INSERT INTO appointments (id, user_id, serviceId, date, time, notes, customerName, customerPhone, customerEmail, status, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
        [
            appointment_id,
            user_id,
            data['serviceId'],
            data['date'],
            data['time'],
            data.get('notes', ''),
            data.get('customerName', ''),
            data.get('customerPhone', ''),
            data.get('customerEmail', ''),
            data.get('status', 'scheduled'),
            data.get('paymentStatus', 'pending')
        ]
    )

    appointment = query_db("SELECT * FROM appointments WHERE id = ?", [appointment_id], one=True)
    return jsonify(dict(appointment)), 201

@app.put('/api/appointments/<appointment_id>')
def update_appointment(appointment_id):
    data = request.json
    query_db(
        "UPDATE appointments SET date=?, time=?, notes=?, customerName=?, customerPhone=?, customerEmail=?, status=?, paymentStatus=? WHERE id=?",
        [
            data['date'],
            data['time'],
            data.get('notes', ''),
            data.get('customerName', ''),
            data.get('customerPhone', ''),
            data.get('customerEmail', ''),
            data.get('status', 'scheduled'),
            data.get('paymentStatus', 'pending'),
            appointment_id
        ]
    )
    appointment = query_db("SELECT * FROM appointments WHERE id = ?", [appointment_id], one=True)
    return jsonify(dict(appointment)), 200

@app.delete('/api/appointments/<appointment_id>')
def delete_appointment(appointment_id):
    query_db("DELETE FROM appointments WHERE id = ?", [appointment_id])
    return jsonify({'message': 'Appointment deleted'}), 200
