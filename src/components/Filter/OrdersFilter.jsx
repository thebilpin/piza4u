import React from "react";
import {
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { RiSearch2Line, RiFilter2Line } from "@remixicon/react";
import { useTranslation } from "react-i18next";

const OrdersFilter = ({ onFilterChange }) => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");

  const statusOptions = [
    { key: "all", label: t("all_orders") },
    { key: "Delivered", label: t("delivered") },
    { key: "pending", label: t("pending") },
    { key: "preparing", label: t("preparing") },
    { key: "confirmed", label: t("confirmed") },
    { key: "out_for_delivery", label: t("out_for_delivery") },
    { key: "cancelled", label: t("cancelled") },
    { key: "ready_for_pickup", label: t("ready_for_pickup") },

  ];

  const handleSearch = (e) => {
    const value = e.target.value;

    if (/^\d*$/.test(value)) {
      setSearchQuery(value);

      onFilterChange({
        type: "search",
        value: value,
      });
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    onFilterChange({
      type: "status",
      value: status,
    });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
      <div className="flex items-center justify-between">
        <Input
          placeholder={t("search_by_order_id")}
          value={searchQuery}
          onChange={handleSearch}
          startContent={<RiSearch2Line className="text-default-400" />}
          size="md"
          variant="flat"
        />
      </div>

      <div className="flex gap-2">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="flat"
              className="capitalize"
              startContent={<RiFilter2Line />}
              size="md"
            >
              {selectedStatus === "all"
                ? t("all_orders")
                : statusOptions.find((status) => status.key === selectedStatus)
                    ?.label}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Filter by status"
            selectionMode="single"
            selectedKeys={[selectedStatus]}
            onSelectionChange={(keys) =>
              handleStatusChange(Array.from(keys)[0])
            }
          >
            {statusOptions.map((status) => (
              <DropdownItem key={status.key}>{status.label}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default OrdersFilter;
