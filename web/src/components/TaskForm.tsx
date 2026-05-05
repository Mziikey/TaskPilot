import type { SubmitTaskType, TaskType } from "#/api/task";
import { Button, DatePicker, Form, Input, Radio, type FormProps } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

type TaskFieldType = {
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  rangeTime: any;
};

export const TaskForm = ({
  initialTask,
  onSubmit,
}: {
  initialTask?: TaskType;
  onSubmit: (values: SubmitTaskType) => void;
}) => {
  const task = initialTask;

  const handleFinish = (values: TaskFieldType) => {
    const submitData = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      startAt: values.rangeTime[0].valueOf(),
      dueAt: values.rangeTime[1].valueOf(),
    };

    onSubmit(submitData);
  };

  const onFinishFailed: FormProps<TaskFieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <div>
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
        initialValues={
          task
            ? {
                ...task,
                rangeTime: [dayjs(task.startAt), dayjs(task.dueAt)],
              }
            : undefined
        }
        onFinish={handleFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item<TaskFieldType>
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please input your task title!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<TaskFieldType> label="Description" name="description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item<TaskFieldType>
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please choose status" }]}
        >
          <Radio.Group>
            <Radio value="todo">Todo</Radio>
            <Radio value="doing">Doing</Radio>
            <Radio value="done">Done</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item<TaskFieldType>
          label="Priority"
          name="priority"
          rules={[{ required: true, message: "Please choose priority" }]}
        >
          <Radio.Group>
            <Radio value="high">High</Radio>
            <Radio value="medium">Medium</Radio>
            <Radio value="low">Low</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="RangeTime"
          name="rangeTime"
          rules={[{ required: true, message: "Please choose range time" }]}
        >
          <RangePicker showTime />
        </Form.Item>
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
