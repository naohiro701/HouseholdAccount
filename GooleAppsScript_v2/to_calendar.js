/**
 * Google カレンダーへ家計イベントを登録する。
 * 目的: レシート登録と同時に「いつ・どこで支出したか」を時系列で見返せるようにする。
 */
function registerCalendarEvent(title, dateStr, locationStr, descriptionStr) {
  try {
    var calendarId = '@group.calendar.google.com';
    var calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) throw new Error("Calendar not found: " + calendarId);

    // 文字列/Date どちらで渡されても Date に正規化する。
    var startDate = (dateStr instanceof Date) ? dateStr : new Date(dateStr);
    if (isNaN(startDate.getTime())) throw new Error("Invalid date format: " + dateStr);

    // 支出記録イベントは短時間イベント(10分)として扱う。
    var endDate = new Date(startDate.getTime() + 10 * 60 * 1000);

    calendar.createEvent(title, startDate, endDate, {
      description: descriptionStr,
      location: locationStr
    });
  } catch (e) {
    Logger.log("registerCalendarEvent error: " + e.message);
    throw e;
  }
}
