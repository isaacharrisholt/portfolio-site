import json

from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.orm import declarative_base

from utils import AppJSONEncoder


class DictMixin:
    __table__ = None

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def to_json(self):
        return json.dumps(self.to_dict(), cls=AppJSONEncoder)


Base = declarative_base(cls=DictMixin)


class WorkExperience(Base):
    __tablename__ = 'work_experience'

    id = Column(Integer, primary_key=True)
    company = Column(String(255))
    position = Column(String(255))
    start_date = Column(TIMESTAMP)
    end_date = Column(TIMESTAMP)
    description = Column(String)

    def __repr__(self):
        return (
            f'WorkExperience('
            f'company={repr(self.company)}, '
            f'position={repr(self.position)},'
            f'start_date={repr(self.start_date.isoformat())}, '
            f'end_date={repr(self.end_date.isoformat())}, '
            f'description={repr(self.description)})'
        )


class FormMessage(Base):
    __tablename__ = 'form_messages'

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
