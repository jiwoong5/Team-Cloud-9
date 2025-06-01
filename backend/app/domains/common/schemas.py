import datetime

from pydantic import BaseModel


class ServerTimeRead(BaseModel):
    date: datetime.date
    time: datetime.time



