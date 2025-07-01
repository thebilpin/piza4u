// api.js
import { getUserData, isLogged } from "@/events/getters";
import axios from "axios";
import { store } from "../store/store";


const api = axios.create();
const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;

api.interceptors.request.use(
  (config) => {
    config.url = `${backendUrl}${config.url}`;
    if (isLogged()) {
      const token = store.getState()?.authentication?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  async function (response) {
    try {
      if (response?.status === 201) {
        const token = localStorage.getItem("accessToken");
        axios
          .post(`${backendUrl}/api/admin/permissions/get`, null, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            store.dispatch(updatePermissions(res.data));
          });
      }
      
      return response;
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 401) {
        // handleLogout();
      }
    
      return Promise.reject(error);
    }
  },
  function (error) {
    if (error?.response?.status === 401) {
      // handleLogout();
    }
   
    return Promise.reject(error);
  }
);

export default api;
