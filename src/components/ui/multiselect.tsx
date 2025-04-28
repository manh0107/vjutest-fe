import * as React from 'react';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<string[]>(selected || []);

  useEffect(() => {
    setValue(selected || []);
  }, [selected]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="relative">
      <div
        className="flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer"
        onClick={handleToggle}
      >
        {(value?.length === 0 || !value)
          ? <span className="text-gray-400">{placeholder || 'Chọn...'}</span>
          : options.filter(o => value.includes(o.value)).map(o => o.label).join(', ')
        }
        <ChevronDown className="w-4 h-4" />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {options.map(option => (
            <div
              key={option.value}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                value?.includes(option.value) ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 