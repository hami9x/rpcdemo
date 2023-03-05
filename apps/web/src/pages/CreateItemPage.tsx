import { CreateItemInput, Override } from "@assignment1/core";
import { Box, Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import useRpcService from "../hooks/useRpcService";
import { DateTimePicker } from "@mantine/dates";
import { showSuccess } from "../notification";
import ms from "ms";

function CreateItemForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: CreateItemInput) => void;
  onCancel: () => void;
}) {
  const form = useForm<Override<CreateItemInput, { startingPrice: string }>>({
    initialValues: {
      name: "",
      startingPrice: "",
      endingAt: new Date(Date.now() + ms("1h")),
    },
    validate: {
      name: (value) =>
        value.length < 3 || value.length > 256
          ? "Name must be between 3 and 256 characters long"
          : null,
      endingAt: (value) =>
        value.getTime() < Date.now() ? "Ending date must be in the future" : null,
      startingPrice: (value) =>
        isNaN(Number(value)) || Number(value) < 0
          ? "Starting price must be a number greater than or equal to 0"
          : null,
    },
  });

  return (
    <Box maw={300} mx="auto">
      <form
        className="space-y-3"
        onSubmit={form.onSubmit((values) => {
          return onSubmit({ ...values, startingPrice: Number(values.startingPrice) });
        })}>
        <TextInput withAsterisk label="Name" placeholder="" {...form.getInputProps("name")} />
        <TextInput
          withAsterisk
          label="staringPrice"
          placeholder=""
          {...form.getInputProps("startingPrice")}
        />
        <DateTimePicker
          withAsterisk
          label="Ending Time"
          placeholder=""
          {...form.getInputProps("endingAt")}
        />

        <Group position="right" mt="md">
          <Button type="button" variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </Group>
      </form>
    </Box>
  );
}

function CreateItemPage() {
  const navigate = useNavigate();
  const { createItem } = useRpcService();
  const goBack = () => navigate(-1);

  return (
    <AppLayout title="Create Item" requireAuth>
      <CreateItemForm
        onCancel={goBack}
        onSubmit={(values) => {
          createItem(values).then(() => {
            showSuccess({
              message: "Created item successfully",
            });
            goBack();
          });
        }}
      />
    </AppLayout>
  );
}

export default CreateItemPage;
