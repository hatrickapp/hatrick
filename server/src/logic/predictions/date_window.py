from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

def local_date_window(now_utc: datetime, timezone_name: str, selected_date: date | None = None) -> tuple[datetime, datetime]:
    tz = ZoneInfo(timezone_name)
    start_date = selected_date if selected_date is not None else now_utc.astimezone(tz).date()
    end_date = start_date + timedelta(days=1)
    start = datetime.combine(start_date, time.min, tzinfo=tz).astimezone(timezone.utc)
    end = datetime.combine(end_date, time.min, tzinfo=tz).astimezone(timezone.utc)
    return start, end
