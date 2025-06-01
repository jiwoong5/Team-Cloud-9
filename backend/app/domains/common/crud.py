import datetime
from typing import Optional

from app.domains.common.schemas import ServerTimeRead


def get_date_and_time() -> ServerTimeRead:
    korean_timezone = datetime.timezone(datetime.timedelta(hours=9))
    korean_datetime = datetime.datetime.now(korean_timezone)
    return ServerTimeRead(
        time=korean_datetime.time(),
        date=korean_datetime.date()
    )
