import dayjs from "dayjs";
import {
  useCompleteTask,
  useDeleteTask,
  useEditTask,
  type SubmitTaskType,
  type TaskType,
} from "#/api/task";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Card, message, Modal, Tag, Typography } from "antd";
import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { TaskForm } from "./TaskForm";

const { Paragraph, Text } = Typography;

const statusMeta: Record<TaskType["status"], { label: string; color: string }> = {
  todo: { label: "Todo", color: "default" },
  doing: { label: "Doing", color: "processing" },
  done: { label: "Done", color: "success" },
};

const priorityMeta: Record<TaskType["priority"], { label: string; color: string }> = {
  low: { label: "Low Priority", color: "blue" },
  medium: { label: "Medium Priority", color: "gold" },
  high: { label: "High Priority", color: "red" },
};

const EditCard = ({
  task,
  isModalOpen,
  setIsModalOpen,
  children,
}: {
  task: TaskType;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
}) => {
  const { mutateAsync: editTask } = useEditTask(task.id);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (newTask: SubmitTaskType) => {
    try {
      await editTask(newTask, {
        onSuccess: () => {
          message.success("已修改该任务信息", 1);
          setTimeout(() => {
            setIsModalOpen(false);
          }, 1000);
        },
      });
    } catch (e) {}
  };

  return (
    <>
      <Modal
        title="Basic Modal"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onCancel={handleCancel}
      >
        <TaskForm initialTask={task} onSubmit={onSubmit} />
      </Modal>
      <div>{children}</div>
    </>
  );
};

export const TaskCard = ({ task }: { task: TaskType }) => {
  const taskId = task.id;

  const { mutateAsync: deleteTask } = useDeleteTask(taskId);
  const { mutateAsync: completeTask, isPending: isCompleting } = useCompleteTask(taskId);

  const completeTaskWithId = async () => {
    try {
      await completeTask(undefined, {
        onSuccess: () => {
          message.success("已完成该任务", 1);
        },
      });
    } catch (e) {
      message.error("完成任务失败", 2);
    }
  };

  const deleteTaskWithId = async () => {
    try {
      await deleteTask(undefined, {
        onSuccess: () => {
          message.success("已成功删除该任务", 2);
        },
      });
    } catch (e) {}
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const status = statusMeta[task.status] ?? { label: task.status, color: "default" };
  const priority = priorityMeta[task.priority] ?? { label: task.priority, color: "default" };
  const actions = [
    task.status !== "done" ? (
      <Button
        key="complete"
        type="text"
        icon={<CheckCircleOutlined />}
        loading={isCompleting}
        onClick={completeTaskWithId}
      >
        Complete
      </Button>
    ) : null,
    <EditCard task={task} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} key="edit">
      <Button type="text" icon={<SettingOutlined />} onClick={showModal}>
        Edit
      </Button>
    </EditCard>,
    <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={deleteTaskWithId}>
      Delete
    </Button>,
  ].filter(Boolean) as ReactNode[];

  return (
    <div className="w-full">
      <Card
        className="w-full rounded-lg"
        title={
          <div className="flex min-w-0 items-start justify-between gap-3 py-1">
            <Paragraph className="m-0 min-w-0 flex-1 text-lg font-medium" ellipsis={{ rows: 2 }}>
              {task.title}
            </Paragraph>
            <div className="flex shrink-0 flex-wrap justify-end gap-2 pt-1">
              <Tag color={status.color} className="m-0">
                {status.label}
              </Tag>
              <Tag color={priority.color} className="m-0">
                {priority.label}
              </Tag>
            </div>
          </div>
        }
        actions={actions}
      >
        <div className="space-y-3">
          {task.description ? (
            <Paragraph className="m-0 text-base" ellipsis={{ rows: 3 }}>
              {task.description}
            </Paragraph>
          ) : (
            <Text type="secondary">No description</Text>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-sm">
            <Text type="secondary">
              <CalendarOutlined /> Start {dayjs(task.startAt).format("YYYY-MM-DD HH:mm")}
            </Text>
            <Text type="secondary">
              <ClockCircleOutlined /> Due {dayjs(task.dueAt).format("YYYY-MM-DD HH:mm")}
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};
