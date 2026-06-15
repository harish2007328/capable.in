import React from 'react';

export const Button = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  let baseClass = 'btn-primary';
  if (variant === 'secondary') {
    baseClass = 'btn-secondary';
  } else if (variant === 'secondary-black') {
    baseClass = 'btn-secondary-black';
  }
  return (
    <button
      className={`${baseClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const SecondaryBlackButton = (props) => <Button variant="secondary-black" {...props} />;

