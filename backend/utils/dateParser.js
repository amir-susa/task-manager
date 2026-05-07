/**
 * Natural Language Date Parser
 * Converts human-readable dates to ISO format (YYYY-MM-DD)
 */

const parseNaturalLanguageDate = (input) => {
  if (!input || typeof input !== 'string') return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const normalized = input.toLowerCase().trim();

  // Direct matches
  const matches = {
    'today': today,
    'tomorrow': tomorrow,
    'next week': nextWeek,
    'next month': nextMonth,
    'in 1 week': nextWeek,
    'in a week': nextWeek,
    'in 1 month': nextMonth,
    'in a month': nextMonth,
  };

  if (matches[normalized]) {
    return formatDate(matches[normalized]);
  }

  // Relative days: "in 3 days", "5 days", etc.
  const daysMatch = normalized.match(/(?:in\s+)?(\d+)\s+days?/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return formatDate(date);
  }

  // Day of week: "Monday", "next Friday", etc.
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (const [index, day] of daysOfWeek.entries()) {
    if (normalized.includes(day)) {
      const targetDate = new Date(today);
      let daysAhead = index - targetDate.getDay();
      
      // If day has already occurred or is today
      if (daysAhead <= 0) daysAhead += 7;
      
      // If "next" is specified, ensure it's next week
      if (normalized.includes('next')) {
        if (daysAhead <= 7) daysAhead += 7;
      }
      
      targetDate.setDate(targetDate.getDate() + daysAhead);
      return formatDate(targetDate);
    }
  }

  // ISO format or other standard formats
  try {
    const date = new Date(input);
    if (!isNaN(date.getTime())) {
      return formatDate(date);
    }
  } catch (e) {
    // Continue to return null
  }

  return null;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

module.exports = { parseNaturalLanguageDate, formatDate };
