import uuid

import pytest

import datetime as dt

from fastapi import FastAPI
from fastapi.testclient import TestClient

from modules.routes import router
from modules import relational_model


@pytest.fixture(scope='module')
def test_client():
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


def test_health(test_client):
    response = test_client.get('/')
    assert response.status_code == 200
    assert response.json() == {'message': 'OK!'}


def test_get_form_messages(monkeypatch, test_client):
    created_at = dt.datetime.now()
    monkeypatch.setattr(
        'modules.db.get_form_messages',
        lambda *_, **__: [
            relational_model.FormMessage(
                id='1',
                name='test',
                email='test',
                message='test',
                created_at=created_at,
            ),
        ]
    )
    response = test_client.get('/form-messages')
    assert response.status_code == 200
    assert response.json() == [
        {
            'name': 'test',
            'email': 'test',
            'message': 'test',
            'created_at': str(created_at).replace(' ', 'T'),
            'id': '1'
        }
    ]


def test_get_form_messages_no_messages(monkeypatch, test_client):
    monkeypatch.setattr(
        'modules.db.get_form_messages',
        lambda *_, **__: [],
    )
    response = test_client.get('/form-messages')
    assert response.status_code == 200
    assert response.json() == []


def test_post_form_message(monkeypatch, test_client):
    req = {'name': 'test', 'email': 'test', 'message': 'test'}
    extra = {'created_at': '2020-01-01T00:00:00', 'id': str(uuid.uuid1())}
    want = {**req, **extra}

    monkeypatch.setattr(
        'modules.db.store_form_message',
        lambda *_, **__: {**__, **extra},
    )

    response = test_client.post('/form-message', json=req)
    assert response.status_code == 200
    assert response.json() == want


def test_get_work_experience(monkeypatch, test_client):
    start_date = dt.date.today()
    end_date = dt.date.today() + dt.timedelta(days=1)
    monkeypatch.setattr(
        'modules.db.get_work_experience',
        lambda *_, **__: [
            relational_model.WorkExperience(
                id='1',
                company='test',
                position='test',
                description='test',
                start_date=start_date,
                end_date=end_date,
            ),
        ]
    )
    response = test_client.get('/work-experience')
    assert response.status_code == 200
    assert response.json() == [
        {
            'company': 'test',
            'position': 'test',
            'description': 'test',
            'start_date': str(start_date),
            'end_date': str(end_date),
            'id': '1'
        }
    ]


def test_get_work_experience_no_experience(monkeypatch, test_client):
    monkeypatch.setattr(
        'modules.db.get_work_experience',
        lambda *_, **__: [],
    )
    response = test_client.get('/work-experience')
    assert response.status_code == 200
    assert response.json() == []


def test_post_work_experience(monkeypatch, test_client):
    req = {
        'company': 'test',
        'position': 'test',
        'description': 'test',
        'start_date': '2020-01-01',
        'end_date': '2020-01-02',
    }
    extra = {'id': str(uuid.uuid1())}
    want = {**req, **extra}

    monkeypatch.setattr(
        'modules.db.store_work_experience',
        lambda *_, **__: {**__, **extra},
    )

    response = test_client.post('/work-experience', json=req)
    assert response.status_code == 200
    assert response.json() == want


def test_get_personal_projects(monkeypatch, test_client):
    monkeypatch.setattr(
        'modules.db.get_personal_projects',
        lambda *_, **__: [
            relational_model.PersonalProject(
                id='1',
                name='test',
                description='test',
                skills=['test'],
                url='test',
            ),
        ]
    )
    response = test_client.get('/personal-projects')
    assert response.status_code == 200
    assert response.json() == [
        {
            'name': 'test',
            'description': 'test',
            'skills': ['test'],
            'url': 'test',
            'id': '1'
        }
    ]


def test_get_personal_projects_no_projects(monkeypatch, test_client):
    monkeypatch.setattr(
        'modules.db.get_personal_projects',
        lambda *_, **__: [],
    )
    response = test_client.get('/personal-projects')
    assert response.status_code == 200
    assert response.json() == []


def test_post_personal_project(monkeypatch, test_client):
    req = {
        'name': 'test',
        'description': 'test',
        'skills': ['test'],
        'url': 'test',
    }
    extra = {'id': str(uuid.uuid1())}
    want = {**req, **extra}

    monkeypatch.setattr(
        'modules.db.store_personal_project',
        lambda *_, **__: {**__, **extra},
    )

    response = test_client.post('/personal-project', json=req)
    assert response.status_code == 200
    assert response.json() == want
