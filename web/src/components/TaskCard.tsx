import dayjs from "dayjs";
import { useDeleteTask, useEditTask, type SubmitTaskType, type TaskType } from "#/api/task";
import { DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import { Card, message, Modal } from "antd";
import { Meta } from "antd/es/list/Item";
import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { TaskForm } from "./TaskForm";

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

  return (
    <div>
      <Card
        style={{ width: 600 }}
        title={task.title}
        extra={
          <EditCard task={task} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
            <SettingOutlined key="ellipsis" onClick={showModal} />
          </EditCard>
        }
        actions={[
          <SettingOutlined key="setting" />,
          <DeleteOutlined key="edit" onClick={deleteTaskWithId} />,
        ]}
      >
        <Meta
          title={`${dayjs(task.startAt).format("YYYY-MM-DD HH:mm")} - ${dayjs(task.dueAt).format("YYYY-MM-DD HH:mm:ss")}`}
          description={task.description}
        />
        <p>{task.status}</p>
        <p>{task.priority}</p>
      </Card>
    </div>
  );
};
