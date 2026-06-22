from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Flowstream API")

@app.get("/")
def root():
    return {"message":"Flowstream API Is Working"}

if __name__ == "__main__":
    uvicorn.run("main:app",host="10.0.0.100",reload=True)