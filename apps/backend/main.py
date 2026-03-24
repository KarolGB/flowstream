from fastapi import FastAPI
import uvicorn

from routers.auth.router import router as auth_router
from routers.playlists.router import router as playlist_router
from routers.streaming.router import router as streaming_router
from routers.catalog.router import router as catalog_router

app = FastAPI()
app.include_router(auth_router)
app.include_router(playlist_router)
app.include_router(streaming_router)
app.include_router(catalog_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)