import { UserDepositInput } from "@assignment1/core";
import { Box, Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import useRpcService from "../hooks/useRpcService";
import useSession from "../hooks/useSession";
import { showSuccess } from "../notification";

interface DepositFormInput {
  amount: string;
}

function DepositForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: UserDepositInput) => void;
  onCancel: () => void;
}) {
  const form = useForm<DepositFormInput>({
    initialValues: {
      amount: "",
    },
    validate: {
      amount: (value) => {
        if (!value) return "Amount is required";
        if (isNaN(Number(value))) return "Amount must be a number";
        if (Number(value) <= 0) return "Amount must be greater than 0";
        return false;
      },
    },
  });

  return (
    <Box maw={300} mx="auto">
      <form
        className="space-y-3"
        onSubmit={form.onSubmit((values) => {
          return onSubmit({ amount: Number(values.amount) });
        })}>
        <TextInput withAsterisk label="Amount" placeholder="" {...form.getInputProps("amount")} />

        <Group position="right" mt="md">
          <Button type="button" variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Deposit</Button>
        </Group>
      </form>
    </Box>
  );
}

function DepositPage() {
  const navigate = useNavigate();
  const { notifyUpdate } = useSession();
  const { userDeposit } = useRpcService();
  const goBack = () => navigate(-1);
  return (
    <AppLayout title="Deposit" requireAuth>
      <DepositForm
        onCancel={goBack}
        onSubmit={(values) => {
          userDeposit(values).then(() => {
            showSuccess({ message: "Deposit successful" });
            notifyUpdate();
            goBack();
          });
        }}
      />
    </AppLayout>
  );
}

export default DepositPage;
