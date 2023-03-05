import { CheckIcon } from "@mantine/core";
import { showNotification, NotificationProps } from "@mantine/notifications";

export function showSuccess(props: NotificationProps) {
  return showNotification({
    color: "teal",
    icon: <CheckIcon height={10} />,
    ...props,
  });
}
