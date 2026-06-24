from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import PRODUCTION

import uvicorn

#Routers ###########################################
from routers.auth.router import router as auth_router

app = FastAPI(
    title="Flowstream API",
    docs_url=None if PRODUCTION else "/docs",
    redoc_url=None if PRODUCTION else "/redoc",
    openapi_url=None if PRODUCTION else "/openapi.json",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router=auth_router)

@app.get("/")
def root():
    return {"message":"Flowstream API Is Working"}

if __name__ == "__main__":
    uvicorn.run("main:app",host="10.0.0.100",reload=True)