import type { TaskType } from "#/api/task";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Card, Tag, Typography } from "antd";
import dayjs from "dayjs";

const { Paragraph, Text } = Typography;

const statusMeta: Record<TaskType["status"], { label: string; color: string }> = {
  todo: { label: "Todo", color: "default" },
  doing: { label: "Doing", color: "processing" },
  done: { label: "Done", color: "success" },
};

const priorityMeta: Record<TaskType["priority"], { label: string; color: string }> = {
  low: { label: "Low", color: "blue" },
  medium: { label: "Medium", color: "gold" },
  high: { label: "High", color: "red" },
};

const fallbackStatus = { label: "Unknown", color: "default" };
const fallbackPriority = { label: "Normal", color: "default" };

type TaskSummaryCardProps = {
  task: TaskType;
  className?: string;
  onClick?: () => void;
  showDescription?: boolean;
};

export const TaskSummaryCard = ({
  task,
  className,
  onClick,
  showDescription = true,
}: TaskSummaryCardProps) => {
  const status = statusMeta[task.status] ?? fallbackStatus;
  const priority = priorityMeta[task.priority] ?? fallbackPriority;

  return (
    <Card
      size="small"
      hoverable={Boolean(onClick)}
      onClick={onClick}
      className={["w-full min-w-0", className].filter(Boolean).join(" ")}
      styles={{ body: { padding: 12 } }}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <Paragraph className="m-0 min-w-0 flex-1 font-medium" ellipsis={{ rows: 2 }}>
            {task.title}
          </Paragraph>
          <Tag color={priority.color} className="m-0 shrink-0">
            {priority.label}
          </Tag>
        </div>

        {showDescription && task.description ? (
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
