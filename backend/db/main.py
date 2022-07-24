from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from modules import routes, db

import os

app = FastAPI()
app.include_router(routes.router)

if os.environ.get('USE_TRUSTED_HOSTS', False):
    hosts = [
        os.environ.get('API_HOST', 'localhost'),
    ]
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=hosts,
    )


@app.on_event('startup')
def startup():
    db.set_up_engine()
