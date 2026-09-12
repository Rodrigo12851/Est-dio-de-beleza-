import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  textAlign?: 'left' | 'center';
  leftIcon?: React.ReactNode;
  theme?: 'dark' | 'light';
  required?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  value,
  onChange,
  placeholder = '••••',
  maxLength,
  className = '',
  autoFocus = false,
  disabled = false,
  autoComplete = 'current-password',
  textAlign = 'left',
  leftIcon,
  theme = 'dark',
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isDark = theme === 'dark';

  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D756D] pointer-events-none z-10">
          {leftIcon}
        </div>
      )}

      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        className={`w-full py-2.5 rounded-xl transition-colors ${
          leftIcon ? 'pl-10' : 'pl-3'
        } pr-11 ${
          textAlign === 'center' ? 'text-center' : 'text-left'
        } ${
          isDark
            ? 'bg-[#141414] border border-[#2A2A2A] text-[#F8F5F2] placeholder-[#555555] focus:border-[#D8A47F]'
            : 'bg-[#FAF8F5] border border-[#E8DFD5] text-[#2D2926] placeholder-[#8A7E76] focus:border-[#9B4B5A]'
        } text-sm focus:outline-none ${className}`}
      />

      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={disabled}
        aria-label={showPassword ? 'Ocultar senha' : 'Ver senha digitada'}
        title={showPassword ? 'Ocultar senha' : 'Ver senha digitada'}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer ${
          isDark
            ? 'text-[#A0A0A0] hover:text-[#F8F5F2] hover:bg-white/10'
            : 'text-[#7D756D] hover:text-[#2D2926] hover:bg-black/5'
        }`}
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4 text-[#D8A47F]" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
