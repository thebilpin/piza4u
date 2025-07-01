import {
  setHomeBanner,
  setHomeDelightfullSection,
  setHomeCategories,
  setHomePopularSection,
  setHomeSection,
  setHomeOffers,
} from "../../store/reducers/Home/homeslice";

import api from "../../interceptor/routes";
import { store } from "@/store/store";
import { getBranchId } from "@/events/getters";

export const updateHomeBannerData = async () => {
  const form = new FormData();
  form.append("branch_id", getBranchId());
  const res = await api.post("/get_slider_images", form);
  if (res.data.error) {
    return store.dispatch(setHomeBanner([]));
  }

  store.dispatch(setHomeBanner(res.data.data));
};

export const updateHomeDelightfull = async () => {
  const form = new FormData();
  form.append("branch_id", getBranchId());
  form.append("limit", 12);
  const res = await api.post("/get_products", form);
  if (res.data.error) {
    return store.dispatch(setHomeDelightfullSection([]));
  }
  store.dispatch(setHomeDelightfullSection(res.data.data));
};

export const updateHomeCategories = async () => {
  const form = new FormData();
  form.append("branch_id", getBranchId());
  form.append("limit", 100);
  form.append("offset", 0);

  // get_categories();
  const res = await api.post("/get_categories", form);
  if (res.data.error) {
    return store.dispatch(setHomeCategories([]));
  }
  store.dispatch(setHomeCategories(res.data.data));
};

export const updateHomeOffers = async () => {
  const form = new FormData();
  form.append("branch_id", getBranchId());
  const res = await api.post("/get_offer_images", form);
  if (res.data.error) {
    return store.dispatch(setHomeOffers([]));
  }

  store.dispatch(setHomeOffers(res.data.data));
};

export const updateHomePopular = async () => {
  const form = new FormData();
  form.append("branch_id", getBranchId());
  form.append("limit", 12);
  form.append("offset", 0);
  form.append("top_rated_foods", 1);

  // get_categories();
  const res = await api.post("/get_products", form);
  if (res.data.error) {
    return store.dispatch(setHomePopularSection([]));
  }
  store.dispatch(setHomePopularSection(res.data.data));
};

export const updateHomeSectionData = async () => {
  const form = new FormData();
  form.append("branch_id", getBranchId());
  const res = await api.post("/get_sections", form);
  if (res.data.error) {
    return store.dispatch(setHomeSection([]));
  }
  store.dispatch(setHomeSection(res.data.data));
};


