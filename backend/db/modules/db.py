import logging
import os
from datetime import datetime

from modules import utils
from modules.relational_model import (
    FormMessage,
    WorkExperience,
)
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

log = logging.getLogger(__name__)


def _connection_string():
    mode = utils.get_service_mode()
    if mode == 'local':
        return 'sqlite:///local.db'
    else:
        return os.environ.get('DATABASE_URL', 'sqlite:///local.db')


engine = create_engine(_connection_string())
log.info(f'Connecting to {_connection_string()}')


def get_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()


def get_form_messages(session: Session):
    return session.query(FormMessage).all()


def store_form_message(
    session: Session,
    name: str,
    email: str,
    message: str,
    created_at: datetime = None
) -> FormMessage:
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

    return form_message


def get_work_experience(session: Session):
    return session.query(WorkExperience).all()
