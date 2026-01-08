
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { autoFormatPhone, validatePhoneNumber, normalizePhoneNumber, formatPhoneNumber } from '@/lib/utils';
import {Check} from 'lucide-react'
interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

// components/ui/phone-input.tsx (perbaikan)
export const PhoneInput: React.FC<PhoneInputProps> = ({
  value = '',
  onChange,
  onValidationChange,
  label,
  error,
  required = false,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Format initial value
    if (value) {
      // Jika value sudah normalized (hanya angka), format untuk display
      const isNormalized = /^62\d+$/.test(value) || /^0\d+$/.test(value);
      const formatted = isNormalized ? formatPhoneNumber(value) : autoFormatPhone(value);
      setDisplayValue(formatted);
      
      // Validate normalized value
      const normalized = normalizePhoneNumber(value);
      const valid = validatePhoneNumber(normalized);
      setIsValid(valid);
      if (onValidationChange) onValidationChange(valid);
    }
  }, [value, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Format untuk display
    const formatted = autoFormatPhone(input);
    setDisplayValue(formatted);
    
    // **PERBAIKAN: Jangan normalize di sini, hanya untuk validation**
    // Kirim formatted value ke parent
    if (onChange) onChange(formatted);
    
    // Validate
    const normalized = normalizePhoneNumber(input);
    const valid = validatePhoneNumber(normalized);
    setIsValid(valid);
    if (onValidationChange) onValidationChange(valid);
  };

  const handleBlur = () => {
    // Normalize hanya saat blur atau submit
    if (displayValue && isValid) {
      const normalized = normalizePhoneNumber(displayValue);
      // Update parent dengan normalized value
      if (onChange) onChange(normalized);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          {...props}
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`bg-background border-border ${error ? 'border-destructive' : ''} `}
          placeholder="+62 812 3456 7890"
        />
        
        {isValid && displayValue && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Check className='text-green-500 w-5 h-5'/>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {!error && displayValue && !isValid && (
        <p className="text-sm text-yellow-600">
          Format: +62 8xx xxxx xxxx
        </p>
      )}
    </div>
  );
};