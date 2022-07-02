import os

from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from relational_model import (
    FormMessage,
    WorkExperience,
)


def _connection_string():
    return os.environ.get('DATABASE_URL', 'sqlite:///local.db')


def get_engine():
    return create_engine(_connection_string())


def store_form_message(
    session: Session,
    name: str,
    email: str,
    message: str,
    created_at: datetime = None
):
    if created_at is None:
        created_at = datetime.now()
    form_message = FormMessage(
        name=name,
        email=email,
        message=message,
        created_at=created_at
    )
    session.add(form_message)
    session.commit()
