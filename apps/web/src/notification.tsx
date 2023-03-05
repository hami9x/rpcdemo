import { CheckIcon } from "@mantine/core";
import { showNotification, NotificationProps } from "@mantine/notifications";
import { IconLetterX } from "@tabler/icons-react";

export function showSuccess(props: NotificationProps) {
  return showNotification({
    color: "teal",
    icon: <CheckIcon height={10} />,
    ...props,
  });
}

export function showError(props: NotificationProps) {
  return showNotification({
    color: "red",
    title: "Error",
    icon: <IconLetterX height={10} />,
    ...props,
  });
}
