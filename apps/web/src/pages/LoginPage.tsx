import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { TextInput, Button, Box, Group } from "@mantine/core";
import { UserLoginInput, Validator } from "@auctiondemo/core";

import AppLayout from "../components/AppLayout";
import useSession from "../hooks/useSession";
import useRpcService from "../hooks/useRpcService";
import { toFormValidator } from "../utils";

function LoginForm({
  onSubmit,
}: {
  onSubmit: (values: UserLoginInput) => Promise<{ ok: boolean; message?: string }>;
}) {
  const form = useForm<UserLoginInput>({
    initialValues: {
      identifier: "",
      password: "",
    },
    validate: toFormValidator(Validator.userLogin()),
  });

  return (
    <Box maw={300} mx="auto">
      <form
        className="space-y-3"
        onSubmit={form.onSubmit(async (values) => {
          const result = await onSubmit(values);
          if (result.message) {
            form.setFieldError("identifier", result.message);
          }
        })}>
        <TextInput
          withAsterisk
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps("identifier")}
        />
        <TextInput
          withAsterisk
          label="Password"
          placeholder="********"
          type="password"
          {...form.getInputProps("password")}
        />

        <Group position="right" mt="md">
          <Link to="/register">Register</Link>
          <Button type="submit">Login</Button>
        </Group>
      </form>
    </Box>
  );
}

function LoginPage() {
  const { user, authenticate } = useSession();
  const navigate = useNavigate();
  const { userLogin } = useRpcService();
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <AppLayout title="Login">
      <div>
        <LoginForm
          onSubmit={async (values) => {
            const result = await userLogin(values);
            if (result.ok) {
              authenticate(result.authToken!);
              navigate("/");
            }
            return result;
          }}
        />
      </div>
    </AppLayout>
  );
}

export default LoginPage;
