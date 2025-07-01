import { get_notifications } from "@/interceptor/routes";
import { RiNotification3Line } from "@remixicon/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Button,
  Avatar,
} from "@heroui/react";

const Notifications = () => {
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [limit, setLimit] = useState(10);

  const fetchNotifications = async (currentOffset) => {
    setLoading(true);
    try {
      const response = await get_notifications({
        sort: "id",
        order: "DESC",
        limit: limit,
        offset: currentOffset,
      });

      const newNotifications = response.data;

      setNotifications((prev) => {
        const combined = [...prev, ...newNotifications];
        const uniqueNotifications = combined.filter(
          (value, index, self) =>
            index === self.findIndex((n) => n.id === value.id)
        );
        return uniqueNotifications;
      });

      setHasMore(newNotifications.length === limit);
      setOffset(currentOffset + limit);
    } catch (err) {
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(offset);
    }
  };

  useEffect(() => {
    fetchNotifications(0);
  }, [limit]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
       
      </div>

      {error && <div>{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {notifications.length === 0 && !loading ? (
          <Card className="shadow-md col-span-1 sm:col-span-2">
            <CardBody className="p-6 text-center">
              No notifications to display
            </CardBody>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className="rounded">
              <CardHeader className="flex justify-between items-center">
                <div className="font-semibold">{notification.title}</div>
                <div className="text-xs">
                  {formatDate(notification.date_sent)}
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-4">
                <p>{notification.message}</p>
                {notification.image && (
                  <Avatar
                    src={notification.image}
                    alt="Notification image"
                    className="mt-3 max-h-40 object-contain rounded-md"
                  />
                )}
                {notification.type !== "default" && (
                  <div className="mt-2">
                    <span className="px-2 py-1 text-xs rounded-full">
                      {notification.type}
                    </span>
                  </div>
                )}
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {loading && (
        <div className="flex justify-center my-6">
          <Spinner color="primary" />
        </div>
      )}

      {hasMore && !loading && notifications.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button color="primary" variant="flat" onClick={loadMore}>
            Show More
          </Button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
