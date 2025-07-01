import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  banner: [],
  sections: [],
  categories: [],
  popularSections: [],
  delightfullSections: [],
  update: false,
  offers: [],
};

const branchSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setHomeBanner: (state, action) => {
      state.banner = action.payload;
    },
    setHomeSection: (state, action) => {
      state.sections = action.payload;
    },
    setHomeCategories: (state, action) => {
      state.categories = action.payload;
    },
    setHomeOffers: (state, action) => {
      state.offers = action.payload;
    },
    setHomePopularSection: (state, action) => {
      state.popularSections = action.payload;
    },
    setHomeDelightfullSection: (state, action) => {
      state.delightfullSections = action.payload;
    },
  },
});

export const {
  setHomeBanner,
  setHomeSection,
  setHomeCategories,
  setHomeOffers,
  setHomePopularSection,
  setHomeDelightfullSection,
} = branchSlice.actions;

export default branchSlice.reducer;
