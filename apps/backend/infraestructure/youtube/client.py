from ytmusicapi import YTMusic
import yt_dlp

ytmusic = YTMusic()

def get_track_info(youtube_id: str):
    try:
        info = ytmusic.get_song(youtube_id)
        track_info = info["videoDetails"]
        return {
            "youtube_id": track_info.get("videoId"),
            "title": track_info.get("title"),
            "artist": track_info["author"] if track_info.get("author") else "Desconocido",
            "duration_seconds": track_info.get("lengthSeconds"),
            "thumbnail_url": track_info["thumbnail"]["thumbnails"][-1]["url"] if track_info.get("thumbnail") else None
        }
    except Exception as e:
        print(f"Error obteniendo información de la pista {youtube_id}: {e}")
        return None

def search_tracks(query: str):
    try:
        ytmusic = YTMusic()
        results = ytmusic.search(query=query, filter="songs")
        clean_results = []
        for item in results:
            clean_results.append({
                "youtube_id": item.get("videoId"),
                "title": item.get("title"),
                "artist": item["artists"][0]["name"] if item.get("artists") else "Desconocido",
                "duration_seconds": item.get("duration_seconds"),
                "thumbnail": item["thumbnails"][-1]["url"] if item.get("thumbnails") else None
            })
        return clean_results

    except Exception as e:
        print(f"Error buscando en YouTube Music: {e}")
        return []
def get_audio_stream_url(youtube_id: str) -> str:
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True, 
        'no_warnings': True,
        'noplaylist': True,
    }

    youtube_url = f"https://www.youtube.com/watch?v={youtube_id}"

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)            
            direct_url = info.get('url')
            return direct_url
    except Exception as e:
        print(f"Error extrayendo URL de streaming para {youtube_id}: {e}")
        return None
