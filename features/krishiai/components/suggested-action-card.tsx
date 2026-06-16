import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { getServiceIconStyle } from '@/features/home/constants/service-icons';
import { resolveActionIconType } from '@/features/krishiai/utils/action-icons';
import { Palette } from '@/constants/theme';
import type { AiSuggestedAction } from '@/types/ai';

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    .trim();
}

type SuggestedActionCardProps = {
  action: AiSuggestedAction;
  onPress: () => void;
  ctaLabel: string;
};

export function SuggestedActionCard({ action, onPress, ctaLabel }: SuggestedActionCardProps) {
  const iconStyle = getServiceIconStyle(resolveActionIconType(action));
  const title = stripInlineMarkdown(action.label);
  const reason = action.reason ? stripInlineMarkdown(action.reason) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={reason ? `${title}. ${reason}` : title}
      onPress={onPress}
      className="w-full rounded-2xl border-2 bg-white"
      style={({ pressed }) => ({
        borderColor: `${iconStyle.iconColor}40`,
        shadowColor: Palette.indigo,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: pressed ? 0.05 : 0.09,
        shadowRadius: 10,
        elevation: 3,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <View className="p-3.5">
        <View className="flex-row items-start gap-3">
          <View
            className="h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: iconStyle.iconBg }}
          >
            <AppIcon name={iconStyle.icon} size={22} color={iconStyle.iconColor} />
          </View>

          <View className="min-w-0 flex-1 pt-0.5">
            <Text className="text-[15px] font-bold leading-[21px] text-indigo">{title}</Text>
            {reason ? (
              <Text className="mt-1 text-[13px] leading-[19px] text-muted">{reason}</Text>
            ) : null}
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between border-t border-border/70 pt-3">
          <Text className="text-[13px] font-semibold text-india-green">{ctaLabel}</Text>
          <View className="h-7 w-7 items-center justify-center rounded-full bg-india-green/10">
            <AppIcon name="arrow-right" size={16} color={Palette.indiaGreen} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
