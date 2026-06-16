import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type InlineSegment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
};

type MarkdownBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bullet-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'heading'; level: 1 | 2 | 3; text: string };

type MarkdownTextProps = {
  content: string;
  className?: string;
  boldClassName?: string;
  italicClassName?: string;
};

/** Fix common AI markdown glitches before rendering. */
export function normalizeAiMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/([^\s])\*\*\s+/g, '$1**')
    .replace(/\s+\*\*([^\s])/g, '**$1')
    .replace(/([^\s])\*\s+/g, '$1*')
    .replace(/\s+\*([^\s*])/g, '*$1')
    .trim();
}

function parseInlineMarkdown(line: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let index = 0;

  while (index < line.length) {
    const rest = line.slice(index);
    const tripleMatch = rest.match(/^(\*{3}|_{3})(.+?)\1/);
    if (tripleMatch) {
      segments.push({ text: tripleMatch[2], bold: true, italic: true });
      index += tripleMatch[0].length;
      continue;
    }

    const boldMatch = rest.match(/^(\*{2}|_{2})(.+?)\1/);
    if (boldMatch) {
      segments.push({ text: boldMatch[2], bold: true });
      index += boldMatch[0].length;
      continue;
    }

    const italicMatch = rest.match(/^(\*|_)(?!\1)(.+?)\1/);
    if (italicMatch?.[2]) {
      segments.push({ text: italicMatch[2], italic: true });
      index += italicMatch[0].length;
      continue;
    }

    const nextMarker = rest.search(/(\*{1,3}|_{1,3})/);
    const plainLength = nextMarker === -1 ? rest.length : nextMarker;
    if (plainLength > 0) {
      segments.push({ text: rest.slice(0, plainLength) });
      index += plainLength;
      continue;
    }

    segments.push({ text: rest[0] });
    index += 1;
  }

  return segments.length > 0 ? segments : [{ text: line }];
}

function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  const lines = normalizeAiMarkdown(text).split('\n');
  const blocks: MarkdownBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let listType: 'bullet' | 'ordered' | null = null;

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push({ type: 'paragraph', text: paragraphLines.join('\n') });
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length === 0 || !listType) return;
    blocks.push({
      type: listType === 'ordered' ? 'ordered-list' : 'bullet-list',
      items: [...listItems],
    });
    listItems = [];
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
    const orderedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);

    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        level: Math.min(headingMatch[1].length, 3) as 1 | 2 | 3,
        text: headingMatch[2],
      });
      continue;
    }

    if (bulletMatch) {
      if (listType === 'ordered') flushList();
      listType = 'bullet';
      flushParagraph();
      listItems.push(bulletMatch[1]);
      continue;
    }

    if (orderedMatch) {
      if (listType === 'bullet') flushList();
      listType = 'ordered';
      flushParagraph();
      listItems.push(orderedMatch[2]);
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

function segmentClassName(
  segment: InlineSegment,
  className?: string,
  boldClassName?: string,
  italicClassName?: string,
): string | undefined {
  if (segment.bold && segment.italic) {
    return boldClassName && italicClassName
      ? `${boldClassName} italic`
      : `${className ?? ''} font-bold italic`.trim();
  }
  if (segment.bold) return boldClassName ?? `${className ?? ''} font-bold`.trim();
  if (segment.italic) return italicClassName ?? `${className ?? ''} italic`.trim();
  return className;
}

function InlineMarkdown({
  text,
  className,
  boldClassName,
  italicClassName,
}: {
  text: string;
  className?: string;
  boldClassName?: string;
  italicClassName?: string;
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
              className={segmentClassName(segment, className, boldClassName, italicClassName)}
            >
              {segment.text}
            </Text>
          ))}
        </Text>
      ))}
    </Text>
  );
}

const HEADING_CLASS: Record<1 | 2 | 3, string> = {
  1: 'text-[17px] leading-[24px] font-bold',
  2: 'text-[16px] leading-[23px] font-bold',
  3: 'text-[15px] leading-[22px] font-semibold',
};

export function MarkdownText({
  content,
  className,
  boldClassName,
  italicClassName,
}: MarkdownTextProps) {
  const blocks = parseMarkdownBlocks(content);

  if (blocks.length === 0) {
    return <Text className={className}>{content}</Text>;
  }

  return (
    <View className="gap-2">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const headingClass = `${HEADING_CLASS[block.level]} ${className ?? ''}`.trim();
          return (
            <InlineMarkdown
              key={`block-${index}`}
              text={block.text}
              className={headingClass}
              boldClassName={boldClassName ? `${HEADING_CLASS[block.level]} ${boldClassName}`.trim() : headingClass}
              italicClassName={italicClassName ? `${HEADING_CLASS[block.level]} ${italicClassName}`.trim() : `${headingClass} italic`}
            />
          );
        }

        if (block.type === 'bullet-list' || block.type === 'ordered-list') {
          return (
            <View key={`block-${index}`} className="gap-1.5">
              {block.items.map((item, itemIndex) => (
                <View key={`item-${itemIndex}`} className="flex-row gap-2">
                  <Text className={className}>
                    {block.type === 'ordered-list' ? `${itemIndex + 1}.` : '•'}
                  </Text>
                  <View className="min-w-0 flex-1">
                    <InlineMarkdown
                      text={item}
                      className={className}
                      boldClassName={boldClassName}
                      italicClassName={italicClassName}
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
            italicClassName={italicClassName}
          />
        );
      })}
    </View>
  );
}
