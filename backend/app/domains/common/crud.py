import datetime
from typing import Optional

from app.domains.common.schemas import ServerTimeRead


def get_date_and_time() -> Optional[ServerTimeRead]:
    korean_timezone = datetime.timezone(datetime.timedelta(hours=9))
    korean_datetime = datetime.datetime.now(korean_timezone)
    ServerTimeRead.time = korean_datetime.time()
    ServerTimeRead.date = korean_datetime.date()
    return ServerTimeRead
