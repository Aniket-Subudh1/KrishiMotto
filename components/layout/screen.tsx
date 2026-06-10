import { SafeAreaView } from 'react-native-safe-area-context';
import type { ViewProps } from 'react-native';

type ScreenProps = ViewProps & {
  className?: string;
  edges?: React.ComponentProps<typeof SafeAreaView>['edges'];
};

export function Screen({ className, edges, ...props }: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 bg-background ${className ?? ''}`}
      {...props}
    />
  );
}
