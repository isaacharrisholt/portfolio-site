import uuid

from sqlalchemy import Column, String, TIMESTAMP, ARRAY, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base


Base = declarative_base()


class FormMessage(Base):
    __tablename__ = 'form_messages'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid1)
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

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid1)
    company = Column(String(255))
    position = Column(String(255))
    skills = Column(ARRAY(String))
    start_date = Column(Date)
    end_date = Column(Date, default=None)
    description = Column(String)

    def __repr__(self):
        return (
            f'WorkExperience('
            f'company={repr(self.company)}, '
            f'position={repr(self.position)}, '
            f'skills={repr(self.skills)}, '
            f'start_date={repr(self.start_date.isoformat())}, '
            f'end_date={repr(self.end_date.isoformat())}, '
            f'description={repr(self.description)}'
            f')'
        )


class PersonalProject(Base):
    __tablename__ = 'personal_projects'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid1)
    name = Column(String(255))
    description = Column(String)
    skills = Column(ARRAY(String))
    url = Column(String, default=None)
