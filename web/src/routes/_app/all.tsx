import { useGetTasks, type TaskType } from "#/api/task";
import { TaskCard } from "#/components/TaskCard";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Card, Empty, Select, Segmented, Spin, Tag, Timeline, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/_app/all")({
  component: RouteComponent,
});

type DateMode = "all" | "year" | "month" | "day";
type StatusFilter = "all" | TaskType["status"];
type PriorityFilter = "all" | TaskType["priority"];

const { Text } = Typography;

const dateFormat: Record<Exclude<DateMode, "all">, string> = {
  year: "YYYY",
  month: "YYYY-MM",
  day: "YYYY-MM-DD",
};

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "All status", value: "all" },
  { label: "Todo", value: "todo" },
  { label: "Doing", value: "doing" },
  { label: "Done", value: "done" },
];

const priorityOptions: { label: string; value: PriorityFilter }[] = [
  { label: "All priority", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const statusMeta: Record<TaskType["status"], { label: string; color: string }> = {
  todo: { label: "Todo", color: "default" },
  doing: { label: "Doing", color: "processing" },
  done: { label: "Done", color: "success" },
};

const priorityColor: Record<TaskType["priority"], string> = {
  high: "red",
  medium: "gold",
  low: "blue",
};

const getTaskDateKeys = (task: TaskType, mode: Exclude<DateMode, "all">) => {
  const keys = new Set<string>();
  let cursor = dayjs(task.startAt).startOf("day");
  const end = dayjs(Math.max(task.startAt, task.dueAt)).startOf("day");

  for (let i = 0; i < 370 && (cursor.isBefore(end) || cursor.isSame(end, "day")); i++) {
    keys.add(cursor.format(dateFormat[mode]));
    cursor = cursor.add(1, "day");
  }

  return keys;
};

const isTaskInDate = (task: TaskType, mode: Exclude<DateMode, "all">, value: string) => {
  const start = dayjs(task.startAt);
  const end = dayjs(Math.max(task.startAt, task.dueAt));
  const target = dayjs(value);
  const periodStart = target.startOf(mode);
  const periodEnd = target.endOf(mode);

  return (
    (start.isBefore(periodEnd) || start.isSame(periodEnd)) &&
    (end.isAfter(periodStart) || end.isSame(periodStart))
  );
};

function RouteComponent() {
  const { isPending, isError, data: allTasks } = useGetTasks();
  const [dateMode, setDateMode] = useState<DateMode>("all");
  const [dateValue, setDateValue] = useState<string>();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState<PriorityFilter>("all");

  const dateOptions = useMemo(() => {
    if (!allTasks || dateMode === "all") return [];

    const countMap = new Map<string, number>();
    for (const task of allTasks) {
      for (const key of getTaskDateKeys(task, dateMode)) {
        countMap.set(key, (countMap.get(key) ?? 0) + 1);
      }
    }

    return [...countMap.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([value, count]) => ({
        value,
        label: `${value} (${count})`,
      }));
  }, [allTasks, dateMode]);

  useEffect(() => {
    if (dateMode === "all") {
      setDateValue(undefined);
      return;
    }

    if (!dateOptions.some((option) => option.value === dateValue)) {
      setDateValue(dateOptions[0]?.value);
    }
  }, [dateMode, dateOptions, dateValue]);

  const filteredTasks = useMemo(() => {
    return (allTasks ?? [])
      .filter((task) => {
        const matchDate =
          dateMode === "all" || !dateValue ? true : isTaskInDate(task, dateMode, dateValue);
        const matchStatus = status === "all" || task.status === status;
        const matchPriority = priority === "all" || task.priority === priority;

        return matchDate && matchStatus && matchPriority;
      })
      .sort((a, b) => a.startAt - b.startAt);
  }, [allTasks, dateMode, dateValue, status, priority]);
  const showTimeline = dateMode === "day" && Boolean(dateValue);

  if (isPending) {
    return (
      <div className="grid flex-1 place-items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !allTasks) {
    return (
      <div className="grid flex-1 place-items-center p-6">
        <Card className="w-full max-w-xl rounded-2xl">
          <Empty description="Sign in to view your tasks" />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto w-full max-w-6xl">
        <Card className="rounded-lg">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              value={dateMode}
              options={[
                { label: "All", value: "all" },
                { label: "Year", value: "year" },
                { label: "Month", value: "month" },
                { label: "Day", value: "day" },
              ]}
              onChange={(value) => setDateMode(value as DateMode)}
            />

            <Select
              className="w-44"
              disabled={dateMode === "all" || dateOptions.length === 0}
              placeholder="Select date"
              value={dateValue}
              options={dateOptions}
              onChange={setDateValue}
            />

            <Select className="w-36" value={status} options={statusOptions} onChange={setStatus} />
            <Select
              className="w-36"
              value={priority}
              options={priorityOptions}
              onChange={setPriority}
            />
          </div>
        </Card>

        <div
          className={[
            "mt-4 grid gap-4",
            showTimeline ? "xl:grid-cols-[minmax(0,1fr)_380px]" : "",
          ].join(" ")}
        >
          <div
            className={
              showTimeline
                ? "flex min-w-0 flex-col gap-3"
                : "mx-auto flex w-full max-w-3xl flex-col gap-3"
            }
          >
            {allTasks.length === 0 ? (
              <Card className="w-full rounded-lg">
                <Empty description="No tasks yet" />
              </Card>
            ) : filteredTasks.length === 0 ? (
              <Card className="w-full rounded-lg">
                <Empty description="No tasks match current filters" />
              </Card>
            ) : (
              filteredTasks.map((task) => <TaskCard task={task} key={task.id} />)
            )}
          </div>

          {showTimeline && dateValue ? (
            <Card title={`${dateValue} timeline`} className="rounded-lg">
              {filteredTasks.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No timeline items" />
              ) : (
                <Timeline
                  items={filteredTasks.map((task) => {
                    const status = statusMeta[task.status] ?? statusMeta.todo;
                    const selectedDay = dayjs(dateValue);
                    const formatTimelineTime = (value: number) => {
                      const time = dayjs(value);
                      return time.isSame(selectedDay, "day")
                        ? time.format("HH:mm")
                        : time.format("MM-DD HH:mm");
                    };

                    return {
                      color:
                        task.status === "done"
                          ? "green"
                          : task.priority === "high"
                            ? "red"
                            : "blue",
                      content: (
                        <div className="min-w-0">
                          <div className="mb-1 flex min-w-0 items-start justify-between gap-2">
                            <Text className="min-w-0 font-medium" ellipsis>
                              {task.title}
                            </Text>
                            <Tag color={status.color} className="m-0 shrink-0">
                              {status.label}
                            </Tag>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span>
                              <CalendarOutlined /> {formatTimelineTime(task.startAt)}
                            </span>
                            <span>
                              <ClockCircleOutlined /> {formatTimelineTime(task.dueAt)}
                            </span>
                          </div>
                          <Tag color={priorityColor[task.priority]} className="mt-2">
                            {task.priority}
                          </Tag>
                        </div>
                      ),
                    };
                  })}
                />
              )}
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
