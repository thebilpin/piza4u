import {
  updateUserAddresses,
  updateUserCart,
  updateUserSettings,
} from "./actions";
import {
  updateHomeBannerData,
  updateHomeCategories,
  updateHomeDelightfull,
  updateHomeOffers,
  updateHomePopular,
  updateHomeSectionData,
} from "../repository/home/home_repo";
import { isLogged } from "./getters";

export const onAppLoad = async () => {
  updateUserSettings();
};

export const onLoggedIn = async () => {
  if (isLogged()) {
    updateUserAddresses();
    updateUserCart();
  }
};

export const onBranchIdChange = ({ branch_id } = {}) => {
  if (!branch_id) {
    return;
  }
  updateHomeBannerData(branch_id);
  updateHomeCategories(branch_id);
  updateHomeOffers(branch_id);
  updateHomeDelightfull(branch_id);
  updateHomePopular(branch_id);
  updateHomeSectionData(branch_id);
};
