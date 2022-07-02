from typing import List

from fastapi import APIRouter, Depends
from modules import db
from modules.api_model import (
    FormMessageCreate,
    FormMessage,
    WorkExperienceCreate,
    WorkExperience,
    PersonalProjectCreate,
    PersonalProject,
)
from sqlalchemy.orm import Session

router = APIRouter()


@router.get('/')
def health():
    return {'message': 'OK!'}


@router.get('/form-messages', response_model=List[FormMessage])
def get_form_messages(session: Session = Depends(db.get_session)):
    return db.get_form_messages(session)


@router.post('/form-message', response_model=FormMessage)
def post_form_message(
    form_message: FormMessageCreate,
    session: Session = Depends(db.get_session)
):
    return db.store_form_message(
        session,
        name=form_message.name,
        email=form_message.email,
        message=form_message.message,
    )


@router.get('/work-experience', response_model=List[WorkExperience])
def get_work_experience(session: Session = Depends(db.get_session)):
    return db.get_work_experience(session)


@router.post('/work-experience', response_model=WorkExperience)
def post_work_experience(
    work_experience: WorkExperienceCreate,
    session: Session = Depends(db.get_session)
):
    return db.store_work_experience(
        session,
        company=work_experience.company,
        position=work_experience.position,
        description=work_experience.description,
        start_date=work_experience.start_date,
        end_date=work_experience.end_date,
    )


@router.get('/personal-projects', response_model=List[PersonalProject])
def get_personal_projects(session: Session = Depends(db.get_session)):
    return db.get_personal_projects(session)


@router.post('/personal-project', response_model=PersonalProject)
def post_personal_project(
    personal_project: PersonalProjectCreate,
    session: Session = Depends(db.get_session)
):
    return db.store_personal_project(
        session,
        name=personal_project.name,
        description=personal_project.description,
        skills=personal_project.skills,
        url=personal_project.url,
    )
