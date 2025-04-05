import {createSlice} from '@reduxjs/toolkit';

const appSlice = createSlice({
    name: 'appSlice',
    initialState: {
        user: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
        }
    }
});

export const {setUser, logout} = appSlice.actions;
export default appSlice.reducer;