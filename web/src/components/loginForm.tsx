import React from "react";
import type { FormProps } from "antd";
import { Button, Form, Input } from "antd";
import { useLogin, useLogout, type LoginCredentials } from "#/api/auth";

const onFinish: FormProps<LoginCredentials>["onFinish"] = (values) => {
  useLogin(values);
};

const onFinishFailed: FormProps<LoginCredentials>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const LoginForm: React.FC = () => (
  <div>
    <Form
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
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
    <Button onClick={useLogout}>Logout</Button>
  </div>
);

export default LoginForm;
