import logging
import os
from datetime import datetime
from typing import List, Optional

from modules.relational_model import (
    FormMessage,
    WorkExperience,
    PersonalProject,
)
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

log = logging.getLogger(__name__)


def _connection_string():
    mode = os.environ.get('SERVICE_MODE', 'local')
    local_db = 'cockroachdb://root@localhost:26257/defaultdb'

    if mode in {'dev', 'stag', 'prod'}:
        return os.environ.get('DATABASE_URL', local_db)
    else:
        return local_db


engine = create_engine(_connection_string())


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
    created_at: datetime = None,
) -> FormMessage:
    if created_at is None:
        created_at = datetime.now()
    form_message = FormMessage(
        name=name,
        email=email,
        message=message,
        created_at=created_at,
    )
    session.add(form_message)
    session.commit()

    return form_message


def get_work_experience(session: Session):
    return session.query(WorkExperience).all()


def store_work_experience(
    session: Session,
    company: str,
    position: str,
    description: str,
    start_date: datetime,
    end_date: Optional[datetime] = None,
) -> WorkExperience:
    if start_date is None:
        start_date = datetime.now()
    work_experience = WorkExperience(
        company=company,
        position=position,
        description=description,
        start_date=start_date,
        end_date=end_date,
    )
    session.add(work_experience)
    session.commit()

    return work_experience


def get_personal_projects(session: Session):
    return session.query(PersonalProject).all()


def store_personal_project(
    session: Session,
    name: str,
    description: str,
    skills: List[str],
    url: Optional[str] = None,
) -> PersonalProject:
    personal_project = PersonalProject(
        name=name,
        description=description,
        skills=skills,
        url=url,
    )
    session.add(personal_project)
    session.commit()

    return personal_project
