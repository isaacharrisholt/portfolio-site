import uuid

from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

from modules import utils


Base = declarative_base()


class FormMessage(Base):
    __tablename__ = 'form_messages'

    # Allow using SQLite for local development
    if utils.get_service_mode() != 'local':
        id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid1)
    else:
        id = Column(Integer, primary_key=True)
    name = Column(String(320))
    email = Column(String(320))
    message = Column(String)
    created_at = Column(TIMESTAMP)

    def __repr__(self):
        return (
            f'FormMessage('
            f'id={repr(self.id)}, '
            f'name={repr(self.name)}, '
            f'email={repr(self.email)}, '
            f'message={repr(self.message)}, '
            f'created_at={repr(self.created_at.isoformat())}'
            f')'
        )


class WorkExperience(Base):
    __tablename__ = 'work_experience'

    # Allow using SQLite for local development
    if utils.get_service_mode() != 'local':
        id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid1)
    else:
        id = Column(Integer, primary_key=True)
    company = Column(String(255))
    position = Column(String(255))
    start_date = Column(TIMESTAMP)
    end_date = Column(TIMESTAMP, default=None)
    description = Column(String)

    def __repr__(self):
        return (
            f'WorkExperience('
            f'company={repr(self.company)}, '
            f'position={repr(self.position)},'
            f'start_date={repr(self.start_date.isoformat())}, '
            f'end_date={repr(self.end_date.isoformat())}, '
            f'description={repr(self.description)}'
            f')'
        )
