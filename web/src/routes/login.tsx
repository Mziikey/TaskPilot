import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { FormProps } from "antd";
import { Button, Form, Input, message } from "antd";
import { useLogin, type LoginCredentials } from "#/api/auth";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { mutateAsync: login } = useLogin();
  const [form] = Form.useForm();
  const navigate = useNavigate({ from: "/login" });

  const onFinish: FormProps<LoginCredentials>["onFinish"] = async (values: LoginCredentials) => {
    try {
      await login(values, {
        onSuccess: () => {
          message.success("登陆成功", 1);
          setTimeout(() => navigate({ to: "/" }), 1000);
        },
      });
    } catch (e: any) {
      if (e.error === "userName") {
        form.setFields([{ name: "username", errors: ["用户名不存在"] }]);
      }
      if (e.error === "password") {
        form.setFields([{ name: "password", errors: ["密码错误"] }]);
      }
    }
  };

  const onFinishFailed: FormProps<LoginCredentials>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="flex-1 flex items-center justify-center m-4">
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
          <Form.Item<LoginCredentials>
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<LoginCredentials>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item label={null}>
            <div className="flex justify-between">
              <Button type="primary" htmlType="submit">
                Login
              </Button>
              <Button htmlType="button">注册新用户</Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
