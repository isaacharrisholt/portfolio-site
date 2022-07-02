from typing import List

from fastapi import APIRouter, Depends
from modules import db
from modules.api_model import (
    FormMessageCreate,
    FormMessage,
)
from sqlalchemy.orm import Session

router = APIRouter()


@router.get('/')
def root():
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
        form_message.name,
        form_message.email,
        form_message.message,
    )


@router.get('/work-experience')
def get_work_experience(session: Session = Depends(db.get_session)):
    return db.get_work_experience(session)
