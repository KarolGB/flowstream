from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth.router import router as auth_router
from routers.playlists.router import router as playlist_router
from routers.streaming.router import router as streaming_router
from routers.catalog.router import router as catalog_router

app = FastAPI(
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(playlist_router)
app.include_router(streaming_router)
app.include_router(catalog_router)

@app.get("/")
def index():
    return {"message": "API Is Working"}
