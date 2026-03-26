from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend")

# Endpoints de los datos (API)
@app.get("/api/loca")
def get_loca():
    return FileResponse(os.path.join(BASE_DIR, "loca.geojson"))

@app.get("/api/paraderos")
def get_paraderos():
    return FileResponse(os.path.join(BASE_DIR, "paraderos.json"))

# Montar el frontend en la raíz para que el mapa abra de una vez en el navegador
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
