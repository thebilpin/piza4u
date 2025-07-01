import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AddressSelector from "@/components/AddressSelector/AddressSelector";
import { getUserData } from "@/events/getters";
import { getUserAddress } from "@/interceptor/routes";
import { setUserAddresses } from "@/store/reducers/userAddressSlice";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const AddressView = () => {
  const dispatch = useDispatch();
  const userAddresses = useSelector((state) => state.userAddresses)?.values;
  const userData = getUserData();
  const userId = userData.id;

  const [selectedAddressId, setSelectedAddressId] = useState();
  // const [isLoading, setIsLoading] = useState(true);

  const { t } = useTranslation();

  // useEffect(() => {
  //   const fetchAddresses = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await getUserAddress({ user_id: userId });
  //       if (!response.error) {
  //         dispatch(setUserAddresses(response.data));
  //       } else {
  //         toast.error(response.message || "Failed to fetch addresses");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching addresses:", error);
  //       toast.error("Failed to load addresses");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   if (userId) {
  //     fetchAddresses();
  //   }
  // }, [userId, dispatch]);



  return (
    <div className="rounded-md gap-6">
      <AddressSelector
        addresses={userAddresses}
        selectedAddressId={selectedAddressId}
        onAddressSelect={(id) => setSelectedAddressId(id)}
        onAddNewClick={() => router.push("/user/address")}
        compact={true}
        showAddNew={true}
        isCartPage={false}
        userId={userId}
      />
    </div>
  );
};

export default AddressView;
