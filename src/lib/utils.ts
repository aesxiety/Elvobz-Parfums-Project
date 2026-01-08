import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const WHATSAPP_NUMBER = '6285172272514'


export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Check if it starts with 62 (without +)
  if (cleaned.startsWith('62')) {
    cleaned = cleaned.substring(2);
  }
  
  // Check if it starts with 0
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Format: +62 812 3456 7890
  if (cleaned.length >= 10) {
    const part1 = cleaned.substring(0, 3);
    const part2 = cleaned.substring(3, 7);
    const part3 = cleaned.substring(7, 11);
    return `+62 ${part1} ${part2} ${part3}`.trim();
  } else if (cleaned.length >= 7) {
    const part1 = cleaned.substring(0, 3);
    const part2 = cleaned.substring(3, 7);
    return `+62 ${part1} ${part2}`.trim();
  } else if (cleaned.length >= 3) {
    return `+62 ${cleaned.substring(0, 3)}`;
  }
  
  return cleaned;
};

export const normalizePhoneNumber = (phone: string, forceNormalize: boolean = false): string => {
  if (!phone) return '';
  
  // Jika forceNormalize false, dan sudah dalam format +62 xxx xxx xxxx, kembalikan seperti itu
  if (!forceNormalize && phone.startsWith('+62 ')) {
    return phone;
  }
  
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Jika kosong, return empty
  if (cleaned.length === 0) return '';
  
  // Jika sudah dimulai dengan 62, biarkan
  if (cleaned.startsWith('62')) {
    return cleaned;
  }
  
  // Jika dimulai dengan 0, ganti dengan 62
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.substring(1);
  }
  
  // Jika panjang 9-13 digit (tanpa kode negara), tambahkan 62
  if (cleaned.length >= 9 && cleaned.length <= 13 && !cleaned.startsWith('62')) {
    return '62' + cleaned;
  }
  
  return cleaned;
};

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  
  // Accept both formatted and normalized
  const normalized = normalizePhoneNumber(phone, true);
  
  // Validasi minimal untuk Indonesia
  if (!normalized.startsWith('62')) return false;
  if (normalized.length < 10 || normalized.length > 15) return false;
  
  // Pastikan digit setelah 62 valid (8 untuk mobile, atau area code)
  const after62 = normalized.substring(2);
  return after62.length >= 8 && after62.length <= 13;
};

// Helper untuk memformat ke display
export const toDisplayFormat = (phone: string): string => {
  if (!phone) return '';
  
  // Jika sudah format +62, kembalikan
  if (phone.startsWith('+62 ')) return phone;
  
  // Jika normalized (hanya angka), format
  const normalized = normalizePhoneNumber(phone, true);
  if (normalized.startsWith('62')) {
    const digits = normalized.substring(2);
    if (digits.length >= 10) {
      return `+62 ${digits.substring(0, 3)} ${digits.substring(3, 7)} ${digits.substring(7, 11)}`.trim();
    } else if (digits.length >= 7) {
      return `+62 ${digits.substring(0, 3)} ${digits.substring(3, 7)}`.trim();
    } else if (digits.length >= 3) {
      return `+62 ${digits.substring(0, 3)}`.trim();
    }
    return `+62 ${digits}`;
  }
  
  return phone;
};
// Auto format while typing
export const autoFormatPhone = (value: string): string => {
  let input = value.replace(/\D/g, '');
  
  // Remove leading 0 if user types it
  if (input.startsWith('0')) {
    input = input.substring(1);
  }
  
  // Limit to 13 digits (after removing 62)
  if (input.length > 13) {
    input = input.substring(0, 13);
  }
  
  // Format as user types
  if (input.length > 0) {
    // Check if user typed +62 or 62
    if (input.startsWith('62')) {
      input = input.substring(2);
    }
    
    // Re-add 62 for formatting
    const with62 = '62' + input;
    
    // Format based on length
    if (input.length <= 3) {
      return '+62 ' + input;
    } else if (input.length <= 7) {
      return '+62 ' + input.substring(0, 3) + ' ' + input.substring(3);
    } else {
      return '+62 ' + 
             input.substring(0, 3) + ' ' + 
             input.substring(3, 7) + ' ' + 
             input.substring(7, 11);
    }
  }
  
  return value;
};