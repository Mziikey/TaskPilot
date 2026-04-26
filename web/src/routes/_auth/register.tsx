import { useRegister, type RegisterInfo } from "#/api/auth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Form, Input, message, type FormProps } from "antd";

export const Route = createFileRoute("/_auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const { mutateAsync: register } = useRegister();
  const [form] = Form.useForm();
  const navigate = useNavigate({ from: "/register" });

  const onFinish: FormProps<RegisterInfo>["onFinish"] = async (values: RegisterInfo) => {
    try {
      await register(values, {
        onSuccess: () => {
          message.success("注册成功", 1);
          setTimeout(() => navigate({ to: "/login" }), 5000);
        },
      });
    } catch (e: any) {
      if (e.error === "isExisted") {
        form.setFields([{ name: "username", errors: ["用户名已存在"] }]);
      }
    }
  };

  const onFinishFailed: FormProps<RegisterInfo>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-96 bg-white p-8 rounded-lg shadow-lg">
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<RegisterInfo>
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<RegisterInfo>
            label="Nickname"
            name="nickname"
            rules={[{ required: true, message: "Please input your nickname!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<RegisterInfo>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              Sign Up
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
