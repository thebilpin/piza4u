import api from "@/interceptor/api";
import {getBranchId} from "../events/getters"

export const getProducts = async (data) => {
  const body = { branch_id: getBranchId(), ...data };
  const formData = new FormData();
  Object.keys(body).forEach((val) => {
    formData.append(val, body[val]);
  });
  const res = await api.post("/get_products", formData);
  
  return res.data;
};
