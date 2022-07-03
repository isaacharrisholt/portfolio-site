from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from modules import routes, db

app = FastAPI()
app.include_router(routes.router)

origins = [
    'http://localhost',
    'http://localhost:3000',
    'https://ihh.dev',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
def startup():
    db.set_up_engine()
