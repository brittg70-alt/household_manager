/* =========================================================
   UNIVERSAL RECURRENCE ENGINE
   Every chore is just: name, repeat interval, last completed.
   This file computes everything else from those three things.
   Shared by chore-board.html (display) and chore-admin.html (edit).
   ========================================================= */

function addRepeatToDate(date, repeat) {
  const next = new Date(date);
  switch (repeat.type) {
    case "days":
      next.setDate(next.getDate() + repeat.value);
      return next;
    case "rate": // e.g. 6 times per 10 days -> interval = 10/6 days
      next.setTime(next.getTime() + (repeat.perDays / repeat.times) * 86400000);
      return next;
    case "months":
      next.setMonth(next.getMonth() + repeat.value);
      return next;
    case "years":
      next.setFullYear(next.getFullYear() + repeat.value);
      return next;
    default:
      throw new Error("Unknown repeat type: " + repeat.type);
  }
}

function frequencyLabel(repeat) {
  if (repeat.type === "days") return repeat.value === 1 ? "Daily" : `Every ${repeat.value}d`;
  if (repeat.type === "rate") return `${repeat.times}x/${repeat.perDays}d`;
  if (repeat.type === "months") return repeat.value === 1 ? "Monthly" : `Every ${repeat.value}mo`;
  if (repeat.type === "years") return repeat.value === 1 ? "Annual" : `Every ${repeat.value}yr`;
  return "";
}

function getStatus(chore, today = new Date()) {
  const last = new Date(chore.lastCompleted + "T00:00:00");
  const due = addRepeatToDate(last, chore.repeat);
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((dueDay - midnight) / 86400000);

  // Rate-based chores ("X times per Y days") represent a flexible window rather
  // than one fixed deadline — widen how far ahead they surface as "soon" to
  // match their own cadence, instead of only appearing the day before due.
  let soonThreshold = 1;
  if (chore.repeat.type === "rate") {
    const intervalDays = chore.repeat.perDays / chore.repeat.times;
    soonThreshold = Math.max(1, Math.ceil(intervalDays));
  }

  let tier;
  if (diffDays < 0) tier = "overdue";
  else if (diffDays <= soonThreshold) tier = "soon";
  else tier = "ontrack";

  return { due, diffDays, tier };
}

function statusText({ diffDays, tier }) {
  if (tier === "overdue") return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due in ${diffDays}d`;
}
