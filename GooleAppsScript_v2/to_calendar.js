/**
 * Registers an event in the specified Google Calendar with a given title, date, location, and description.
 *
 * @param {string} title - The title of the calendar event.
 * @param {string|Date} dateStr - The start date/time of the event. Accepts a date string or Date object.
 * @param {string} locationStr - The location of the event.
 * @param {string} descriptionStr - The description or memo for the event.
 */
function registerCalendarEvent(title, dateStr, locationStr, descriptionStr) {
  try {
    Logger.log("Start registerCalendarEvent");

    const calendarId = '438aa4de8b4355a98b91e74c0744c3b97c1b14c38a74d9093c89ef7cf7d4446f@group.calendar.google.com';
    const calendar = CalendarApp.getCalendarById(calendarId);

    if (!calendar) {
      Logger.log("❌ Calendar not found: " + calendarId);
      throw new Error("Calendar not found. Check calendar ID and permissions.");
    }

    const startDate = (dateStr instanceof Date) ? dateStr : new Date(dateStr);
    if (isNaN(startDate.getTime())) {
      Logger.log("❌ Invalid date string: " + dateStr);
      throw new Error("Invalid date format: " + dateStr);
    }

    Logger.log("✅ Parsed startDate: " + startDate);

    const durationMs = 10 * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    Logger.log("📅 Creating event: " + title);
    Logger.log("Start: " + startDate + ", End: " + endDate);
    Logger.log("Location: " + locationStr + ", Description: " + descriptionStr);

    const eventOptions = {
      description: descriptionStr,
      location: locationStr
    };

    calendar.createEvent(title, startDate, endDate, eventOptions);

    Logger.log("✅ Event successfully created");

  } catch (e) {
    Logger.log("🔥 Error: " + e.message);
    throw e; // 再スローしてスクリプトエディタのエラー表示にも反映
  }
}


// function test(){
// // Usage example with valid ISO 8601 format: "YYYY-MM-DDTHH:MM:SS"
// registerCalendarEvent("A", "2025-03-30:23:00", "Sendai", "memo");
// }