import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(({ className, label, error, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      ref={ref}
      className={cn(
        'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600',
        error && 'border-red-500',
        className
      )}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ className, label, error, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      className={cn(
        'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600',
        error && 'border-red-500',
        className
      )}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(({ className, label, error, options, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={cn(
        'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600',
        error && 'border-red-500',
        className
      )}
      {...props}
    >
      {options?.map((option, idx) => (
        <option key={idx} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

Select.displayName = 'Select';
