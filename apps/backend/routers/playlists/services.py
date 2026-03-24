
from db.database import db_connection
import csv
import io

def get_csv_tracks(content: bytes):
    decoded = content.decode("utf-8-sig")
    csv_file = io.StringIO(decoded)
    reader = csv.DictReader(csv_file)
    tracks = []
    for row in reader:
            track_name = row.get("Track name", "").strip()
            artist_name = row.get("Artist name", "").strip()            
            if track_name and artist_name:
                tracks.append({
                    "title": track_name,
                    "artist": artist_name
                })
    return tracks

def create_playlist_db(user_id,name,description = ""):
    with db_connection() as cursor:
        cursor.execute("INSERT INTO playlists (name, description, user_id) VALUES (%s, %s, %s)", (name, description, user_id))
        playlist_id = cursor.lastrowid
    return playlist_id