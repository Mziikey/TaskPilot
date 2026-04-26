import { useAddTask } from "#/api/task";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, DatePicker, Form, Input, message, Radio, type FormProps } from "antd";
import TextArea from "antd/es/input/TextArea";

export const Route = createFileRoute("/_app/new")({
  component: RouteComponent,
});

type TaskFieldType = {
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  rangeTime: any;
};
const { RangePicker } = DatePicker;

function RouteComponent() {
  const { mutateAsync: addTask } = useAddTask();
  const navigate = useNavigate({ from: "/new" });
  const onFinish: FormProps<TaskFieldType>["onFinish"] = async (values) => {
    const startAt = values.rangeTime[0].valueOf();
    const dueAt = values.rangeTime[1].valueOf();
    const newTask = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      startAt: startAt,
      dueAt: dueAt,
    };
    console.log(newTask);
    try {
      await addTask(newTask, {
        onSuccess: () => {
          message.success("创建任务成功！", 3);
          setTimeout(() => navigate({ to: "/" }), 5000);
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const onFinishFailed: FormProps<TaskFieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <div className="flex-1 flex justify-center items-center">
      <Form
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
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
            <Radio value="high">Todo</Radio>
            <Radio value="medium">Doing</Radio>
            <Radio value="low">Done</Radio>
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
        <Form.Item label="RangePicker" name="rangeTime">
          <RangePicker showTime />
        </Form.Item>
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
