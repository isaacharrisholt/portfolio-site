"""
Tests the db module.

Note: you must have the local CockroachDB instance running on localhost:26257.
(`docker-compose up -d`)
"""

import datetime as dt

import pytest

from modules import db, relational_model

import sqlalchemy as sa
from sqlalchemy.orm import Session


class CockroachDBNotRunningError(Exception):
    pass


def _recreate_testdb(engine: sa.engine.Engine):
    with engine.connect() as conn:
        conn.execution_options(autocommit=True)
        try:
            conn.execute('DROP DATABASE testdb')
        except (sa.exc.OperationalError, sa.exc.ProgrammingError):
            # Database does not exist.
            pass
        conn.execute('CREATE DATABASE IF NOT EXISTS testdb')


@pytest.fixture(scope='session')
def local_db_session():
    """
    A Pytest fixture that returns a SQLAlchemy session for the local
    CockroachDB instance.

    It creates a test database, dropping it if it already exists to avoid
    conflicts.
    """
    try:
        setup_engine = db.create_engine(
            'cockroachdb://root@localhost:26257/defaultdb',
        )
        _recreate_testdb(setup_engine)
        setup_engine.dispose()
    except sa.exc.OperationalError:
        raise CockroachDBNotRunningError(
            'CockroachDB instance not found on localhost:26257. Have you run '
            '`docker-compose up -d`?'
        )

    test_engine = db.create_engine(
        'cockroachdb://root@localhost:26257/testdb',
    )
    relational_model.Base.metadata.create_all(test_engine)

    yield Session(test_engine)

    # Teardown code
    test_engine.dispose()


def test_connection_string_no_mode():
    assert db._connection_string() == (
        'cockroachdb://root@localhost:26257/defaultdb'
    )


def test_connection_string_with_mode(monkeypatch):
    monkeypatch.setenv('DATABASE_URL', 'not_the_real_url')
    assert db._connection_string() == (
        'not_the_real_url'
    )


def test_store_form_message(local_db_session):
    local_db_session.query(relational_model.FormMessage).delete()
    created_at = dt.datetime.now()
    got = db.store_form_message(
        local_db_session,
        name='name',
        email='email',
        message='message',
        created_at=created_at,
    )

    want = relational_model.FormMessage(
        name='name',
        email='email',
        message='message',
        created_at=created_at,
    )

    assert got.id is not None
    assert got.name == want.name
    assert got.email == want.email
    assert got.message == want.message
    assert got.created_at == want.created_at == created_at


def test_store_form_message_no_created_at(local_db_session):
    local_db_session.query(relational_model.FormMessage).delete()
    got = db.store_form_message(
        local_db_session,
        name='name',
        email='email',
        message='message',
    )

    want = relational_model.FormMessage(
        name='name',
        email='email',
        message='message',
    )

    assert got.id is not None
    assert got.name == want.name
    assert got.email == want.email
    assert got.message == want.message
    assert got.created_at is not None


def test_store_form_message_no_name(local_db_session):
    local_db_session.query(relational_model.FormMessage).delete()
    with pytest.raises(TypeError):
        db.store_form_message(
            local_db_session,
            email='email',
            message='message',
        )


def test_store_form_message_invalid_timestamp(local_db_session):
    local_db_session.query(relational_model.FormMessage).delete()
    with pytest.raises(sa.exc.DataError):
        db.store_form_message(
            local_db_session,
            name='name',
            email='email',
            message='message',
            created_at='invalid',
        )

    local_db_session.rollback()


def test_get_form_messages(local_db_session):
    local_db_session.query(relational_model.FormMessage).delete()
    form_message = relational_model.FormMessage(
        name='name',
        email='email',
        message='message',
        created_at=dt.datetime.now(),
    )
    local_db_session.add(form_message)
    local_db_session.commit()
    assert len(db.get_form_messages(local_db_session)) == 1


def test_get_form_messages_no_messages(local_db_session):
    local_db_session.query(relational_model.FormMessage).delete()
    assert len(db.get_form_messages(local_db_session)) == 0


def test_store_work_experience(local_db_session):
    local_db_session.query(relational_model.WorkExperience).delete()
    start_date = dt.date.today()
    end_date = dt.date.today() + dt.timedelta(days=1)
    got = db.store_work_experience(
        local_db_session,
        company='company',
        position='position',
        skills=['skill', 'skill2'],
        start_date=start_date,
        end_date=end_date,
        description='description',
    )

    want = relational_model.WorkExperience(
        company='company',
        position='position',
        skills=['skill', 'skill2'],
        start_date=start_date,
        end_date=end_date,
        description='description',
    )

    assert got.id is not None
    assert got.company == want.company
    assert got.position == want.position
    assert got.start_date == want.start_date == start_date
    assert got.end_date == want.end_date == end_date
    assert got.description == want.description


def test_store_work_experience_no_end_date(local_db_session):
    local_db_session.query(relational_model.WorkExperience).delete()
    start_date = dt.date.today()
    got = db.store_work_experience(
        local_db_session,
        company='company',
        position='position',
        skills=['skill', 'skill2'],
        start_date=start_date,
        description='description',
    )

    want = relational_model.WorkExperience(
        company='company',
        position='position',
        skills=['skill', 'skill2'],
        start_date=start_date,
        end_date=None,
        description='description',
    )

    assert got.id is not None
    assert got.company == want.company
    assert got.position == want.position
    assert got.start_date == want.start_date == start_date
    assert got.end_date == want.end_date
    assert got.description == want.description


def test_store_work_experience_no_company(local_db_session):
    local_db_session.query(relational_model.WorkExperience).delete()
    start_date = dt.date.today()
    end_date = dt.date.today() + dt.timedelta(days=1)
    with pytest.raises(TypeError):
        db.store_work_experience(
            local_db_session,
            position='position',
            skills=['skill', 'skill2'],
            start_date=start_date,
            end_date=end_date,
            description='description',
        )


def test_store_work_experience_no_skills(local_db_session):
    local_db_session.query(relational_model.WorkExperience).delete()
    start_date = dt.date.today()
    end_date = dt.date.today() + dt.timedelta(days=1)
    with pytest.raises(TypeError):
        db.store_work_experience(
            local_db_session,
            company='company',
            position='position',
            start_date=start_date,
            end_date=end_date,
            description='description',
        )


def test_store_work_experience_invalid_date(local_db_session):
    local_db_session.query(relational_model.WorkExperience).delete()
    with pytest.raises(sa.exc.DataError):
        db.store_work_experience(
            local_db_session,
            company='company',
            position='position',
            skills=['skill', 'skill2'],
            start_date='invalid',
            end_date='invalid',
            description='description',
        )

    local_db_session.rollback()


def test_get_work_experience(local_db_session):
    local_db_session.query(relational_model.WorkExperience).delete()
    work_experience = relational_model.WorkExperience(
        company='company',
        position='position',
        skills=['skill', 'skill2'],
        start_date=dt.date.today(),
        end_date=dt.date.today() + dt.timedelta(days=1),
        description='description',
    )
    local_db_session.add(work_experience)
    local_db_session.commit()
    assert len(db.get_work_experience(local_db_session)) == 1


def test_get_work_experience_no_experience(local_db_session):
    local_db_session.query(relational_model.WorkExperience).delete()
    assert len(db.get_work_experience(local_db_session)) == 0


def test_store_personal_project(local_db_session):
    local_db_session.query(relational_model.PersonalProject).delete()
    got = db.store_personal_project(
        local_db_session,
        name='name',
        description='description',
        skills=['skill', 'skill2'],
        url='url',
    )

    want = relational_model.PersonalProject(
        name='name',
        description='description',
        skills=['skill', 'skill2'],
        url='url',
    )

    assert got.id is not None
    assert got.name == want.name
    assert got.description == want.description
    assert got.skills == want.skills == ['skill', 'skill2']
    assert got.url == want.url


def test_store_personal_project_no_url(local_db_session):
    local_db_session.query(relational_model.PersonalProject).delete()
    got = db.store_personal_project(
        local_db_session,
        name='name',
        description='description',
        skills=['skill', 'skill2'],
    )

    want = relational_model.PersonalProject(
        name='name',
        description='description',
        skills=['skill', 'skill2'],
        url=None,
    )

    assert got.id is not None
    assert got.name == want.name
    assert got.description == want.description
    assert got.skills == want.skills == ['skill', 'skill2']
    assert got.url is want.url is None


def test_store_personal_project_empty_skills(local_db_session):
    local_db_session.query(relational_model.PersonalProject).delete()
    got = db.store_personal_project(
        local_db_session,
        name='name',
        description='description',
        skills=[],
        url='url',
    )

    want = relational_model.PersonalProject(
        name='name',
        description='description',
        skills=None,
        url='url',
    )

    assert got.id is not None
    assert got.name == want.name
    assert got.description == want.description
    assert got.skills is want.skills is None
    assert got.url == want.url


def test_store_personal_project_no_skills(local_db_session):
    local_db_session.query(relational_model.PersonalProject).delete()
    got = db.store_personal_project(
        local_db_session,
        name='name',
        description='description',
        url='url',
    )

    want = relational_model.PersonalProject(
        name='name',
        description='description',
        url='url',
    )

    assert got.id is not None
    assert got.name == want.name
    assert got.description == want.description
    assert got.skills is want.skills is None
    assert got.url == want.url


def test_store_personal_project_no_name(local_db_session):
    local_db_session.query(relational_model.PersonalProject).delete()
    with pytest.raises(TypeError):
        db.store_personal_project(
            local_db_session,
            description='description',
            skills=['skill', 'skill2'],
            url='url',
        )


def test_store_personal_project_one_skill(local_db_session):
    local_db_session.query(relational_model.PersonalProject).delete()
    # with pytest.raises(sa.exc.DataError):
    got = db.store_personal_project(
        local_db_session,
        name='name',
        description='description',
        skills='invalid',
        url='url',
    )

    want = relational_model.PersonalProject(
        name='name',
        description='description',
        skills=['invalid'],
        url='url',
    )

    assert got.id is not None
    assert got.name == want.name
    assert got.description == want.description
    assert got.skills == want.skills == ['invalid']
    assert got.url == want.url


def test_get_personal_projects(local_db_session):
    local_db_session.query(relational_model.PersonalProject).delete()
    personal_project = relational_model.PersonalProject(
        name='name',
        description='description',
        skills=['skill', 'skill2'],
        url='url',
    )
    local_db_session.add(personal_project)
    local_db_session.commit()
    assert len(db.get_personal_projects(local_db_session)) == 1


def test_get_personal_projects_no_projects(local_db_session):
    local_db_session.query(relational_model.PersonalProject).delete()
    assert len(db.get_personal_projects(local_db_session)) == 0
