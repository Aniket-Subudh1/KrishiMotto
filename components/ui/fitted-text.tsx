import { type TextProps } from 'react-native';

import { Text } from '@/components/ui/text';

type FittedTextProps = TextProps & {
  className?: string;
  maxLines?: number;
  shrink?: boolean;
  fit?: boolean;
  minScale?: number;
};

/** Text tuned for i18n: wraps, shrinks in flex rows, and optionally scales down to fit. */
export function FittedText({
  maxLines,
  shrink = false,
  fit = false,
  minScale = 0.85,
  className = '',
  style,
  ...props
}: FittedTextProps) {
  return (
    <Text
      {...props}
      numberOfLines={maxLines}
      adjustsFontSizeToFit={fit}
      minimumFontScale={fit ? minScale : undefined}
      ellipsizeMode="tail"
      className={className}
      style={[shrink ? { flexShrink: 1, minWidth: 0 } : undefined, style]}
    />
  );
}
