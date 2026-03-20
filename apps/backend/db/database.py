from contextlib import contextmanager
import mysql.connector
from core.config import DB_CONFIG

@contextmanager
def db_connection():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    try:
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()