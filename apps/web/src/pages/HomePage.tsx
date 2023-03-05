import { useDisclosure } from "@mantine/hooks";
import { Button, SegmentedControl, Table } from "@mantine/core";
import { useMemo, useState } from "react";
import { FindItemsResult, ItemStatus, paginatedListDefault } from "@assignment1/core";

import AppLayout from "../components/AppLayout";
import useEffectAsync from "../hooks/useEffectAsync";
import useRpcService from "../hooks/useRpcService";
import { formatDuration } from "../utils";

function HomePage() {
  const [loading, { close, open }] = useDisclosure(true);
  const [statusFilter, setStatusFilter] = useState<ItemStatus>(ItemStatus.Active);
  const [itemLIst, setItemList] = useState<FindItemsResult>(paginatedListDefault());

  const { findItems } = useRpcService();
  useEffectAsync(async () => {
    open();
    const list = await findItems({ filter: { status: statusFilter } });
    setItemList(list);
    close();
  }, [statusFilter]);
  const isActive = useMemo(() => statusFilter == ItemStatus.Active, [statusFilter]);

  return (
    <AppLayout loading={loading} requireAuth>
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
              const startTime = isActive ? new Date() : item.createdAt!;
              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.startingPrice}</td>
                  <td>{formatDuration(item.endingAt.getTime() - startTime.getTime())}</td>
                  <td>{isActive && <Button variant="outline">Bid</Button>}</td>
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
