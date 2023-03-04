import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { TextInput, Button, Box, Group } from "@mantine/core";
import { UserRegisterInput, Validator } from "@assignment1/core";

import { useRpcSession, useRpcService } from "../rpc/hooks";
import { toFormValidator } from "../utils";
import { JSONRPCErrorException } from "json-rpc-2.0";
import AppLayout from "../components/AppLayout";

function RegisterForm({ onSubmit }: { onSubmit: (values: UserRegisterInput) => Promise<void> }) {
  const form = useForm<UserRegisterInput>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: toFormValidator(Validator.userRegister()),
  });

  return (
    <Box maw={300} mx="auto">
      <form
        className="space-y-3"
        onSubmit={form.onSubmit(async (values) => {
          try {
            await onSubmit(values);
          } catch (err: any) {
            if (err instanceof JSONRPCErrorException) {
              form.setFieldError("email", err.message);
            }
          }
        })}>
        <TextInput
          withAsterisk
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps("email")}
        />
        <TextInput
          withAsterisk
          label="Password"
          placeholder="********"
          type="password"
          {...form.getInputProps("password")}
        />

        <Group position="right" mt="md">
          <Link to="/login">Login</Link>
          <Button type="submit">Register</Button>
        </Group>
      </form>
    </Box>
  );
}

function RegisterPage() {
  const { user, authenticate } = useRpcSession();
  const { userRegister } = useRpcService();
  const navigate = useNavigate();
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <AppLayout title="Register">
      <div>
        <RegisterForm
          onSubmit={async (values) => {
            const result = await userRegister(values);
            authenticate(result.authToken);
            navigate("/");
          }}
        />
      </div>
    </AppLayout>
  );
}

export default RegisterPage;
