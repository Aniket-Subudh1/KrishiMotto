import { SafeAreaView } from 'react-native-safe-area-context';
import type { ViewProps } from 'react-native';

type ScreenProps = ViewProps & {
  className?: string;
  /** Edges to apply safe-area insets on. Defaults to all edges. */
  edges?: React.ComponentProps<typeof SafeAreaView>['edges'];
};

/**
 * A full-screen container that respects safe-area insets.
 * Use this as the root view of every screen instead of a raw View.
 */
export function Screen({ className, edges, ...props }: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 bg-background ${className ?? ''}`}
      {...props}
    />
  );
}
