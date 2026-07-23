/* =========================================================
   CALENDAR GRID HELPERS
   Pure date math — builds the day arrays for week/month views.
   Shared by chore-board.html (display) and chore-admin.html (edit).
   ========================================================= */

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // back up to Sunday
  return d;
}

function buildWeekDays(offsetWeeks = 0) {
  const start = startOfWeek(new Date());
  start.setDate(start.getDate() + offsetWeeks * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// Returns a flat array of 42 cells (6 weeks) for a standard month grid.
// Cells outside the target month are still real Dates (for continuity)
// but flagged with inMonth: false.
function buildMonthDays(offsetMonths = 0) {
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + offsetMonths);
  const targetMonth = base.getMonth();

  const gridStart = startOfWeek(base);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    return { date: d, inMonth: d.getMonth() === targetMonth };
  });
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function eventsOnDate(events, date) {
  const target = isoDate(date);
  return events
    .filter(e => e.date === target)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
}

// Expands events (including recurring ones) into individual occurrences
// falling within [rangeStart, rangeEnd]. Non-recurring events pass through
// unchanged if their date is in range. Recurring events step forward from
// their anchor date using the same addRepeatToDate() engine chores use.
// Relies on addRepeatToDate() from recurrence.js being loaded first.
function expandOccurrences(events, rangeStart, rangeEnd) {
  const out = [];
  const guardMax = 500; // safety cap so a bad interval can't loop forever

  events.forEach(e => {
    const anchor = new Date(e.date + "T00:00:00");

    if (!e.repeat) {
      if (anchor >= rangeStart && anchor <= rangeEnd) out.push({ event: e, date: anchor });
      return;
    }

    let occ = anchor;
    let guard = 0;
    while (occ <= rangeEnd && guard < guardMax) {
      if (occ >= rangeStart) out.push({ event: e, date: new Date(occ) });
      occ = addRepeatToDate(occ, e.repeat);
      guard++;
    }
  });

  return out;
}

function occurrencesOnDate(occurrences, date) {
  return occurrences
    .filter(o => isSameDay(o.date, date))
    .sort((a, b) => (a.event.time || "").localeCompare(b.event.time || ""));
}

function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function addMinutesToTime(time, minutes) {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + minutes + 1440) % 1440; // wrap within a day
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// Returns "7:00 PM" or, if a duration is set, "7:00 – 8:30 PM"
function formatEventTime(event) {
  if (!event.time) return "";
  if (!event.durationMinutes) return formatTime(event.time);
  const end = addMinutesToTime(event.time, event.durationMinutes);
  return `${formatTime(event.time)} – ${formatTime(end)}`;
}
