import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ children, required, className = '', ...props }) => {
  return (
    <label 
      className={`block text-[12.5px] font-semibold text-slate-700 mb-1.5 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

export default Label;
