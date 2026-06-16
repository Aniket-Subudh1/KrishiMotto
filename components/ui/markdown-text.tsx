import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type InlineSegment = {
  text: string;
  bold?: boolean;
};

type MarkdownBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

type MarkdownTextProps = {
  content: string;
  className?: string;
  boldClassName?: string;
};

/** Fix common AI markdown glitches before rendering. */
export function normalizeAiMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\*\*([.,;:!?])/g, '$1')
    .replace(/([.,;:!?])\*\*/g, '$1')
    .replace(/\*\*\s+/g, '**')
    .replace(/\s+\*\*/g, '**')
    .trim();
}

function parseInlineMarkdown(line: string): InlineSegment[] {
  if (!line.includes('**')) {
    return [{ text: line }];
  }

  const segments: InlineSegment[] = [];
  const pattern = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: line.slice(lastIndex, match.index) });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < line.length) {
    const trailing = line.slice(lastIndex).replace(/\*\*/g, '');
    if (trailing) {
      segments.push({ text: trailing });
    }
  }

  return segments.length > 0 ? segments : [{ text: line.replace(/\*\*/g, '') }];
}

function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  const lines = normalizeAiMarkdown(text).split('\n');
  const blocks: MarkdownBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push({ type: 'paragraph', text: paragraphLines.join('\n') });
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: 'list', items: [...listItems] });
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
    const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)/);

    if (bulletMatch) {
      flushParagraph();
      listItems.push(bulletMatch[1]);
      continue;
    }

    if (orderedMatch) {
      flushParagraph();
      listItems.push(orderedMatch[1]);
      continue;
    }

    if (trimmed === '') {
      flushParagraph();
      flushList();
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function InlineMarkdown({
  text,
  className,
  boldClassName,
}: {
  text: string;
  className?: string;
  boldClassName?: string;
}) {
  const lines = text.split('\n');

  return (
    <Text className={className}>
      {lines.map((line, lineIndex) => (
        <Text key={`line-${lineIndex}`}>
          {lineIndex > 0 ? '\n' : null}
          {parseInlineMarkdown(line).map((segment, segmentIndex) => (
            <Text
              key={`segment-${lineIndex}-${segmentIndex}`}
              className={segment.bold ? boldClassName : className}
            >
              {segment.text}
            </Text>
          ))}
        </Text>
      ))}
    </Text>
  );
}

export function MarkdownText({ content, className, boldClassName }: MarkdownTextProps) {
  const blocks = parseMarkdownBlocks(content);

  if (blocks.length === 0) {
    return <Text className={className}>{content}</Text>;
  }

  return (
    <View className="gap-2">
      {blocks.map((block, index) => {
        if (block.type === 'list') {
          return (
            <View key={`block-${index}`} className="gap-1.5">
              {block.items.map((item, itemIndex) => (
                <View key={`item-${itemIndex}`} className="flex-row gap-2">
                  <Text className={className}>•</Text>
                  <View className="min-w-0 flex-1">
                    <InlineMarkdown
                      text={item}
                      className={className}
                      boldClassName={boldClassName}
                    />
                  </View>
                </View>
              ))}
            </View>
          );
        }

        return (
          <InlineMarkdown
            key={`block-${index}`}
            text={block.text}
            className={className}
            boldClassName={boldClassName}
          />
        );
      })}
    </View>
  );
}
