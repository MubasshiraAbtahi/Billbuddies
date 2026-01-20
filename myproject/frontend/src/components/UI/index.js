import React from 'react';

// ColorfulButton Component - Main CTA button with gradients and animations
export const ColorfulButton = ({
  children,
  variant = 'gradient', // 'gradient', 'outline', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  gradient = 'sunset', // 'sunset', 'ocean', 'warm', 'success', 'danger', 'playful'
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  const gradientClasses = {
    sunset: 'bg-gradient-sunset',
    ocean: 'bg-gradient-ocean',
    warm: 'bg-gradient-warm',
    success: 'bg-gradient-success',
    danger: 'bg-gradient-danger',
    playful: 'bg-gradient-playful',
  };

  const baseClasses = 'font-semibold rounded-full transition-all duration-250 cursor-pointer';
  const hoverClasses = 'hover:scale-105 hover:shadow-medium active:scale-95';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  let classes = baseClasses;

  if (variant === 'gradient') {
    classes += ` ${gradientClasses[gradient]} text-white ${hoverClasses} ${disabledClasses} ${sizeClasses[size]}`;
  } else if (variant === 'outline') {
    classes += ` border-2 border-brand-pink text-brand-pink bg-white ${hoverClasses} ${disabledClasses} ${sizeClasses[size]}`;
  } else if (variant === 'ghost') {
    classes += ` text-brand-pink hover:bg-brand-lightPink ${disabledClasses} ${sizeClasses[size]}`;
  }

  return (
    <button
      className={`${classes} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// GradientCard Component - Reusable card with gradient and shadow
export const GradientCard = ({
  children,
  gradient = 'sunset',
  className = '',
  interactive = false,
  onClick,
  ...props
}) => {
  const gradientClasses = {
    sunset: 'bg-gradient-sunset',
    ocean: 'bg-gradient-ocean',
    warm: 'bg-gradient-warm',
    success: 'bg-gradient-success',
    danger: 'bg-gradient-danger',
    playful: 'bg-gradient-playful',
    none: 'bg-white',
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:shadow-strong hover:scale-105 transition-all duration-250'
    : '';

  return (
    <div
      className={`${gradientClasses[gradient]} rounded-lg p-6 shadow-medium ${interactiveClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// ToggleSwitch Component - Modern toggle with smooth animations
export const ToggleSwitch = ({
  isOn,
  onToggle,
  disabled = false,
  color = 'brand-pink',
  className = '',
  ...props
}) => {
  const baseClasses = 'relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300';
  const bgClasses = isOn ? `bg-${color}` : 'bg-gray-300';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      onClick={() => !disabled && onToggle && onToggle(!isOn)}
      className={`${baseClasses} ${bgClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      role="switch"
      aria-checked={isOn}
      {...props}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          isOn ? 'translate-x-8' : 'translate-x-1'
        }`}
      >
        {isOn && (
          <svg
            className="h-5 w-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    </button>
  );
};

// ProfileCircle Component - Colored avatar with initials
export const ProfileCircle = ({
  name,
  image,
  color = 'bg-brand-pink',
  size = 'md',
  onClick,
  className = '',
  ring = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const initials = name
    ?.split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const ringClasses = ring ? 'ring-4 ring-offset-2 ring-brand-pink' : '';

  return (
    <div
      className={`${sizeClasses[size]} ${color} rounded-full flex items-center justify-center font-bold text-white cursor-pointer hover:shadow-medium transition-all duration-250 ${ringClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {image ? <img src={image} alt={name} className="w-full h-full rounded-full object-cover" /> : initials}
    </div>
  );
};

// LoadingSpinner Component - Animated loading indicator
export const LoadingSpinner = ({ size = 'md', color = 'brand-pink', className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin ${className}`}>
      <svg
        className={`h-full w-full text-${color}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// AnimatedTab Component - Tab with smooth indicator animation
export const AnimatedTab = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-4 px-6 font-medium transition-all duration-300 ${
            activeTab === tab.id
              ? 'text-brand-pink border-b-2 border-brand-pink'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// ProgressIndicator Component - Step progress bar
export const ProgressIndicator = ({
  steps,
  currentStep,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              index < currentStep
                ? 'bg-brand-green scale-125'
                : index === currentStep
                ? 'bg-brand-pink scale-125'
                : 'bg-gray-300'
            }`}
          />
          {index < steps.length - 1 && (
            <div
              className={`h-1 w-8 transition-all duration-300 ${
                index < currentStep ? 'bg-brand-green' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// SkeletonLoader Component - Animated skeleton loading
export const SkeletonLoader = ({ width = 'w-full', height = 'h-4', className = '' }) => {
  return (
    <div className={`${width} ${height} bg-gray-200 rounded animate-shimmer ${className}`} />
  );
};

// EmptyState Component - Illustration-based empty state
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionText = 'Get Started',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">{description}</p>
      {action && (
        <ColorfulButton onClick={action} gradient="playful">
          {actionText}
        </ColorfulButton>
      )}
    </div>
  );
};

// Badge Component - Status badge with colors
export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const variantClasses = {
    primary: 'bg-brand-pink text-white',
    success: 'bg-brand-green text-white',
    warning: 'bg-brand-yellow text-gray-800',
    error: 'bg-brand-magenta text-white',
    info: 'bg-brand-teal text-white',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={`inline-block rounded-full font-semibold ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};
