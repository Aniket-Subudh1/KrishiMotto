import { View } from 'react-native';

type Props = {
  count: number;
  activeIndex: number;
};

export function PaginationDots({ count, activeIndex }: Props) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeIndex;

        return (
          <View
            key={index}
            className={
              isActive
                ? 'h-2 w-7 rounded-full bg-india-green'
                : 'h-2 w-2 rounded-full bg-border'
            }
          />
        );
      })}
    </View>
  );
}
