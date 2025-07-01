import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    value: []
}; 

const settingsSlice = createSlice({
    name:"settings",
    initialState,
    reducers: {
        setUserSettings: (state,action) => {
            state.value =  action.payload;
        }
    }
})

export const {setUserSettings} = settingsSlice.actions;

export default settingsSlice.reducer