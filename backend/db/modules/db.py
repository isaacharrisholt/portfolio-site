import datetime as dt
import logging
import os
from typing import List, Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from modules import relational_model as rm

log = logging.getLogger(__name__)


def _connection_string():
    mode = os.environ.get('SERVICE_MODE', 'local')
    local_db = 'cockroachdb://root@localhost:26257/defaultdb'

    if mode in {'dev', 'stag', 'prod'}:
        return os.environ.get('DATABASE_URL', local_db)
    elif mode == 'local':
        return local_db
    else:
        raise ValueError(f'Unknown service mode: {mode}')


engine = create_engine(_connection_string())


def get_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()


def get_form_messages(session: Session):
    return session.query(rm.FormMessage).all()


def store_form_message(
    session: Session,
    name: str,
    email: str,
    message: str,
    created_at: dt.datetime = None,
) -> rm.FormMessage:
    if created_at is None:
        created_at = dt.datetime.now()
    form_message = rm.FormMessage(
        name=name,
        email=email,
        message=message,
        created_at=created_at,
    )
    session.add(form_message)
    session.commit()

    return form_message


def get_work_experience(session: Session):
    return session.query(rm.WorkExperience).all()


def store_work_experience(
    session: Session,
    company: str,
    position: str,
    description: str,
    start_date: dt.date,
    end_date: Optional[dt.date] = None,
) -> rm.WorkExperience:
    work_experience = rm.WorkExperience(
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
    return session.query(rm.PersonalProject).all()


def store_personal_project(
    session: Session,
    name: str,
    description: str,
    skills: Optional[List[str]] = None,
    url: Optional[str] = None,
) -> rm.PersonalProject:
    if not skills:
        skills = None
    elif not isinstance(skills, list):
        skills = [skills]

    personal_project = rm.PersonalProject(
        name=name,
        description=description,
        skills=skills,
        url=url,
    )
    session.add(personal_project)
    session.commit()

    return personal_project
