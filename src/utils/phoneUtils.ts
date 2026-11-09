/**
 * Utility functions for Uzbekistan phone number formatting and validation
 * Standard format: +998 (XX) XXX-XX-XX (9 digits after +998)
 */

export const formatUzbekPhone = (input: string): string => {
  if (!input) return '+998 ';
  
  let digits = input.replace(/\D/g, '');
  // If user pasted with 998 prefix, strip it to extract the local 9 digits
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }
  
  // Exactly max 9 digits after +998
  const local = digits.slice(0, 9);
  
  if (local.length === 0) return '+998 ';
  if (local.length <= 2) return `+998 (${local}`;
  if (local.length <= 5) return `+998 (${local.slice(0, 2)}) ${local.slice(2)}`;
  if (local.length <= 7) return `+998 (${local.slice(0, 2)}) ${local.slice(2, 5)}-${local.slice(5)}`;
  return `+998 (${local.slice(0, 2)}) ${local.slice(2, 5)}-${local.slice(5, 7)}-${local.slice(7, 9)}`;
};

export const getRawPhoneDigits = (phone: string): string => {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }
  return digits.slice(0, 9);
};

export const isCompleteUzbekPhone = (phone: string): boolean => {
  return getRawPhoneDigits(phone).length === 9;
};
