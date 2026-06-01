import {
  MarkdownTaskCardBlockSchema,
  MarkdownTaskListBlockSchema,
  type MarkdownTask,
} from "#/schemas/markdownTask";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Alert, Card, Tag, Typography } from "antd";
import dayjs from "dayjs";
import Markdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";

const { Paragraph, Text } = Typography;

const statusMeta: Record<MarkdownTask["status"], { label: string; color: string }> = {
  todo: { label: "Todo", color: "default" },
  doing: { label: "Doing", color: "processing" },
  done: { label: "Done", color: "success" },
};

const priorityMeta: Record<MarkdownTask["priority"], { label: string; color: string }> = {
  low: { label: "Low", color: "blue" },
  medium: { label: "Medium", color: "gold" },
  high: { label: "High", color: "red" },
};

type MarkdownRendererProps = {
  children: string;
  className?: string;
};

const readJsonBlock = (content: string) => {
  try {
    return JSON.parse(content);
  } catch {
    return undefined;
  }
};

const InvalidTaskBlock = () => (
  <Alert
    type="warning"
    showIcon
    message="Invalid task block"
    description="This task block did not pass validation."
  />
);

const MarkdownTaskCard = ({ task }: { task: MarkdownTask }) => {
  const status = statusMeta[task.status];
  const priority = priorityMeta[task.priority];

  return (
    <Card size="small" className="my-3 w-full min-w-0" styles={{ body: { padding: 12 } }}>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <Paragraph className="m-0 min-w-0 flex-1 font-medium" ellipsis={{ rows: 2 }}>
            {task.title}
          </Paragraph>
          <Tag color={priority.color} className="m-0 shrink-0">
            {priority.label}
          </Tag>
        </div>

        {task.description ? (
          <Paragraph type="secondary" className="m-0 text-sm" ellipsis={{ rows: 2 }}>
            {task.description}
          </Paragraph>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <Text type="secondary" className="text-xs">
            <CalendarOutlined /> {dayjs(task.startAt).format("MM-DD HH:mm")}
          </Text>
          <Text type="secondary" className="text-xs">
            <ClockCircleOutlined /> {dayjs(task.dueAt).format("MM-DD HH:mm")}
          </Text>
        </div>

        <div>
          <Tag color={status.color} className="m-0">
            {status.label}
          </Tag>
        </div>
      </div>
    </Card>
  );
};

const codeBlockRenderers: Record<string, (content: string) => ReactNode> = {
  "task-card": (content) => {
    const result = MarkdownTaskCardBlockSchema.safeParse(readJsonBlock(content));
    if (!result.success) return <InvalidTaskBlock />;

    return <MarkdownTaskCard task={result.data.task} />;
  },
  "task-list": (content) => {
    const result = MarkdownTaskListBlockSchema.safeParse(readJsonBlock(content));
    if (!result.success) return <InvalidTaskBlock />;

    return (
      <div className="my-3 flex flex-col gap-3">
        {result.data.tasks.map((task, index) => (
          <MarkdownTaskCard task={task} key={task.id ?? `${task.title}-${index}`} />
        ))}
      </div>
    );
  },
};

const getCodeBlockLanguage = (node: ReactNode): string | undefined => {
  if (!node || typeof node !== "object" || !("props" in node)) return undefined;

  const props = node.props as { className?: string };
  return /language-([\w-]+)/.exec(props.className || "")?.[1];
};

export const MarkdownRenderer = ({ children, className }: MarkdownRendererProps) => {
  return (
    <div className={className}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre(props) {
            const language = getCodeBlockLanguage(props.children);
            if (language && codeBlockRenderers[language]) return <>{props.children}</>;

            return <pre>{props.children}</pre>;
          },
          code(props) {
            const content = String(props.children).replace(/\n$/, "");
            const language = /language-([\w-]+)/.exec(props.className || "")?.[1];
            const customRenderer = language ? codeBlockRenderers[language] : undefined;

            if (customRenderer) return customRenderer(content);

            return language ? (
              <SyntaxHighlighter language={language}>{content}</SyntaxHighlighter>
            ) : (
              <code>{props.children}</code>
            );
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  );
};
