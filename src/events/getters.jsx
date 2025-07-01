import { store } from "../store/store";

export const getBranchId = () => {
    // return 7;
    const state = store.getState()
    return state.branch.id
}
export const getAuthToken = () => {

    const state = store.getState();
    const authStoreData = state.authentication;

    if(!authStoreData.isLogged){
        return false
    }
    return authStoreData.accessToken
}

export const getUserData = () => {

    const authStoreData = store.getState().authentication;
    if(!authStoreData.isLogged){
        return false
    }
    return authStoreData.userData
}

export const isLogged = () => {
    const state = store.getState().authentication
    return state.isLogged
}
