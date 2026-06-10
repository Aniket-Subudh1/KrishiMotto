import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { Text } from './text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = PressableProps & {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  textClassName?: string;
};

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: { container: 'bg-primary', text: 'text-white' },
  secondary: { container: 'bg-surface border border-border', text: 'text-indigo' },
  ghost: { container: 'bg-transparent', text: 'text-primary' },
  danger: { container: 'bg-red-500', text: 'text-white' },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-3 py-1.5 rounded-lg', text: 'text-sm' },
  md: { container: 'px-5 py-3 rounded-xl', text: 'text-base' },
  lg: { container: 'px-6 py-4 rounded-2xl', text: 'text-lg' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  textClassName = '',
  ...props
}: ButtonProps) {
  const { container, text } = variantStyles[variant];
  const { container: sizeContainer, text: sizeText } = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${container} ${sizeContainer} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : '#46962F'} />
      ) : (
        <Text
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          className={`shrink text-center font-semibold ${text} ${sizeText} ${textClassName}`}
          style={{ flexShrink: 1 }}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
