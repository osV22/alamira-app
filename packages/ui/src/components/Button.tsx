import { Pressable, Text, type PressableProps } from 'react-native';

type ButtonVariant = 'solid' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  solid: 'bg-primary',
  ghost: 'bg-primary-dim border border-primary',
  outline: 'border border-border-bright bg-transparent',
};

const variantTextClasses: Record<ButtonVariant, string> = {
  solid: 'text-background font-semibold',
  ghost: 'text-primary font-medium',
  outline: 'text-foreground font-medium',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 rounded-md',
  md: 'px-5 py-2.5 rounded-lg',
  lg: 'px-7 py-3.5 rounded-xl',
};

const sizeTextClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  children,
  variant = 'solid',
  size = 'md',
  disabled = false,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  return (
    <Pressable
      className={`items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50' : 'active:opacity-80'} ${className ?? ''}`}
      disabled={disabled}
      {...props}
    >
      <Text className={`${variantTextClasses[variant]} ${sizeTextClasses[size]}`}>
        {children}
      </Text>
    </Pressable>
  );
}
