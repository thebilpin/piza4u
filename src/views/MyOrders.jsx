import React, { useEffect, useRef, useState, useCallback } from "react";
import api from "../interceptor/api";
import { Pagination } from "@heroui/react";
import UserOrderCardSkeleton from "@/components/Skeleton/UserOrderCardSkeleton";
import OrdersFilter from "@/components/Filter/OrdersFilter";
import UserOrderCard from "@/components/Cards/UserOrderCard";

const MyOrders = () => {
  const initialQuery = {
    offset: 0,
    limit: 8,
    active_status: "all",
    search: "",
  };
  const [query, setQuery] = useState(initialQuery);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [endReached, setEndReached] = useState(false);
  
  const debounceTimer = useRef(null);

  const request = useCallback(() => {
    const formData = new FormData();
    Object.keys(query).forEach((item) => {
      if (item === "active_status" && query[item] === "all") {
        // Skip adding "all" status
      } else {
        formData.append(item, query[item]);
      }
    });

    setLoading(true);

    return api
      .post("/get_orders", formData)
      .then((res) => {
        setLoading(false);
        const fetchedOrders = res.data.data;
        const newTotal = res.data.total;

        setOrders(fetchedOrders);
        setTotal(newTotal);
        setEndReached(fetchedOrders.length < query.limit);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [query]);

  useEffect(() => {
    request();
  }, [query, request]);

  const handleFilterChange = ({ type, value }) => {
    if (type === "search") {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setQuery((prev) => ({ ...prev, search: value, offset: 0 }));
      }, 1000);
    } else if (type === "status") {
      setQuery((prev) => ({ ...prev, active_status: value, offset: 0 }));
    }
  };

  const handlePageChange = (page) => {
    setQuery((prev) => ({ ...prev, offset: (page - 1) * query.limit }));
  };

  const totalPages = Math.ceil(total / query.limit);

  return (
    <div className="p-0">
      <OrdersFilter onFilterChange={handleFilterChange} />
      <div className="grid sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: query.limit }).map((_, index) => (
              <UserOrderCardSkeleton key={`skeleton-${index}`} />
            ))
          : orders?.map((item) => (
              <UserOrderCard
                key={item.id || `fallback-key-${item.name}-${item.date_added}`}
                status={item.status[item.status.length - 1][0]}
                image={
                  item?.order_items?.length && item.order_items[0].image_sm
                }
                id={item.id}
                name={item.name}
                amount={item.total_payable}
                type={item.type}
                qty={item?.order_items?.length && item.order_items[0].quantity}
                date={item?.date_added}
                email={item.user_email}
                payment_method={item.payment_method}
                wallet_balance={item.wallet_balance}
                isCancellable={
                  item.order_items.every(
                    (orderItem) =>
                      orderItem.is_cancelable === "1" &&
                      [
                        "pending",
                        "confirmed",
                        "preparing",
                        "ready_for_pickup",
                        "out_for_delivery",
                      ].indexOf(item.active_status) <=
                        [
                          "pending",
                          "confirmed",
                          "preparing",
                          "ready_for_pickup",
                          "out_for_delivery",
                        ].indexOf(orderItem.cancelable_till)
                  )
                    ? "1"
                    : "0"
                }
                OrderItems={item.order_items}
                item={item}
                request={() => request()}
                is_spicy={item.is_spicy}
                order_rider_rating={item.order_rider_rating}
                order_product_rating={item.order_product_rating}
              />
            ))}
      </div>

      {total > query.limit && (
        <div className="flex justify-center mt-6">
          <Pagination
            size="lg"
            showControls
            variant="bordered"
            total={totalPages}
            initialPage={1}
            onChange={handlePageChange}
          /> 
        </div>
      )}
    </div>
  );
};

export default MyOrders;
