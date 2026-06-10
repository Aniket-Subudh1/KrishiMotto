import { Text as RNText, type TextProps } from 'react-native';

type Props = TextProps & { className?: string };

export function Text({ className, ...props }: Props) {
  return (
    <RNText
      {...props}
      className={className ? `font-sans ${className}` : 'font-sans'}
    />
  );
}
