/**
 * Parse bulk guest input in various formats:
 * - One per line: "John Smith\nJane Doe"
 * - Comma-separated: "John, Smith\nJane, Doe"
 * - Space-separated: "John Smith\nJane Doe"
 */
export const parseGuestInput = (input) => {
  if (!input || !input.trim()) return [];

  const lines = input
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line) => {
    // Try comma-separated first: "First, Last"
    if (line.includes(',')) {
      const [first, last] = line.split(',').map((s) => s.trim());
      if (first && last) return { first_name: first, last_name: last };
    }

    // Otherwise split by whitespace: "First Last"
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const first_name = parts[0];
      const last_name = parts.slice(1).join(' ');
      return { first_name, last_name };
    }

    // Single word: use as first name, empty last name (will fail validation)
    return { first_name: line, last_name: '' };
  });
};

/**
 * Validate parsed guest list
 */
export const validateGuestList = (guests) => {
  const errors = [];
  const validGuests = [];

  guests.forEach((guest, idx) => {
    if (!guest.first_name || !guest.last_name) {
      errors.push(`Ligne ${idx + 1}: prénom et nom requis`);
      return;
    }
    validGuests.push(guest);
  });

  return { validGuests, errors };
};
