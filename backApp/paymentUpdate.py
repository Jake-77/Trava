# update_db.py
import sqlite3

DB_PATH = 'database.db'

def add_paypal_column():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    try:
        # Add the new column
        cur.execute("ALTER TABLE users ADD COLUMN paypal_handle TEXT")
        print("Success: Added paypal_handle column to users table.")
    except sqlite3.OperationalError as e:
        print(f"Note: {e} (Column might already exist)")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    add_paypal_column()