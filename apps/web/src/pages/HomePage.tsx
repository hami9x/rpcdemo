import { useDisclosure } from "@mantine/hooks";
import {
  Button,
  SegmentedControl,
  Table,
  Modal,
  Group,
  ModalProps,
  TextInput,
} from "@mantine/core";
import { useMemo, useState } from "react";
import {
  FindItemsResult,
  ItemStatus,
  getEmptyPaginatedList,
  CreateBidInput,
  Item,
  Override,
} from "@auctiondemo/core";

import AppLayout from "../components/AppLayout";
import useEffectAsync from "../hooks/useEffectAsync";
import useRpcService from "../hooks/useRpcService";
import { formatDuration } from "../utils";
import { useForm } from "@mantine/form";
import { showSuccess } from "../notification";
import useSession from "../hooks/useSession";
import useUserInfo from "../hooks/useUserInfo";

interface BidDialogProps {
  onSubmit: (values: CreateBidInput) => Promise<any>;
  item: Item | null;
}

function BidDialog({ onSubmit, item, ...props }: Override<ModalProps, BidDialogProps>) {
  const form = useForm<{ price: string }>({
    initialValues: {
      price: "",
    },
    validate: {
      price: (value) => {
        if (!value) return "Bid price is required";
        if (isNaN(Number(value))) return "Bid price must be a number";
        if (Number(value) <= (item?.currentPrice ?? 0))
          return "Bid price too low, must be higher than current price";
        return false;
      },
    },
  });

  if (!item) return null;
  return (
    <Modal
      title={`Bid on ${item.name}`}
      size="xs"
      {...props}
      centered
      onClose={() => {
        form.reset();
        props.onClose();
      }}>
      <form
        className="space-y-3"
        onSubmit={form.onSubmit((values) =>
          onSubmit({
            price: Number(values.price),
            itemId: item.id,
          }).then(() => form.reset()),
        )}>
        <TextInput withAsterisk label="Bid Price" placeholder="" {...form.getInputProps("price")} />

        <Group position="center">
          <Button onClick={props.onClose} variant="default">
            Cancel
          </Button>
          <Button type="submit">Bid</Button>
        </Group>
      </form>
    </Modal>
  );
}

function HomePage() {
  const [loading, { close: closeLoading, open: openLoading }] = useDisclosure(true);
  const [statusFilter, setStatusFilter] = useState<ItemStatus>(ItemStatus.Active);
  const [itemLIst, setItemList] = useState<FindItemsResult>(getEmptyPaginatedList());
  const [bidDialogVisible, { open: openBidDialog, close: closeBidDialog }] = useDisclosure(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);

  const userInfo = useUserInfo();
  const { findItems, createBid } = useRpcService();
  const fetchData = async () => {
    openLoading();
    const list = await findItems({ filter: { status: statusFilter } });
    setItemList(list);
    closeLoading();
  };
  useEffectAsync(fetchData, [statusFilter]);

  const isActive = useMemo(() => statusFilter == ItemStatus.Active, [statusFilter]);
  const submitBid = async (values: CreateBidInput) => {
    await createBid(values);
    showSuccess({ message: "Bid created successfully" });
    closeBidDialog();
    fetchData();
    userInfo.reload();
  };

  return (
    <AppLayout loading={loading} requireAuth>
      <BidDialog
        opened={bidDialogVisible}
        onClose={closeBidDialog}
        onSubmit={submitBid}
        item={currentItem}
      />
      <div>
        <SegmentedControl
          data={[
            { label: "Ongoing", value: ItemStatus.Active },
            { label: "Completed", value: ItemStatus.Ended },
          ]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as ItemStatus)}
          className="my-5"
        />
      </div>
      {itemLIst.items.length === 0 ? (
        <div>No items found</div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Current Price</th>
              <th>Duration{isActive ? ` (remaining)` : ""}</th>
              <th>Bid</th>
            </tr>
          </thead>
          <tbody>
            {itemLIst.items.map((item) => {
              const startTime = isActive ? new Date() : item.createdAt;
              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.currentPrice}</td>
                  <td>{formatDuration(item.endingAt.getTime() - startTime.getTime())}</td>
                  <td>
                    {isActive && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentItem(item);
                          openBidDialog();
                        }}>
                        Bid
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </AppLayout>
  );
}

export default HomePage;
