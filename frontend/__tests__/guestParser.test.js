import { parseGuestInput, validateGuestList } from '@/lib/guestParser';

describe('guestParser', () => {
  describe('parseGuestInput', () => {
    it('parses one-per-line format', () => {
      const input = 'John Smith\nJane Doe';
      const result = parseGuestInput(input);
      expect(result).toEqual([
        { first_name: 'John', last_name: 'Smith' },
        { first_name: 'Jane', last_name: 'Doe' },
      ]);
    });

    it('parses comma-separated format', () => {
      const input = 'John, Smith\nJane, Doe';
      const result = parseGuestInput(input);
      expect(result).toEqual([
        { first_name: 'John', last_name: 'Smith' },
        { first_name: 'Jane', last_name: 'Doe' },
      ]);
    });

    it('handles mixed whitespace', () => {
      const input = '  John Smith  \n  Jane Doe  ';
      const result = parseGuestInput(input);
      expect(result).toEqual([
        { first_name: 'John', last_name: 'Smith' },
        { first_name: 'Jane', last_name: 'Doe' },
      ]);
    });

    it('returns empty array for empty input', () => {
      expect(parseGuestInput('')).toEqual([]);
      expect(parseGuestInput('   ')).toEqual([]);
    });

    it('handles middle names (all after first become last_name)', () => {
      const input = 'John Michael Smith';
      const result = parseGuestInput(input);
      expect(result).toEqual([
        { first_name: 'John', last_name: 'Michael Smith' },
      ]);
    });
  });

  describe('validateGuestList', () => {
    it('validates correct guests', () => {
      const guests = [
        { first_name: 'John', last_name: 'Smith' },
        { first_name: 'Jane', last_name: 'Doe' },
      ];
      const { validGuests, errors } = validateGuestList(guests);
      expect(validGuests).toHaveLength(2);
      expect(errors).toHaveLength(0);
    });

    it('rejects guests with missing last_name', () => {
      const guests = [
        { first_name: 'John', last_name: '' },
      ];
      const { validGuests, errors } = validateGuestList(guests);
      expect(validGuests).toHaveLength(0);
      expect(errors).toContain('Ligne 1: prénom et nom requis');
    });
  });
});
