import axiosInstance from "utils/axios";

export const getUserDataAction = (page = 1, limit = 10, nameOrder = "", emailOrder = "", createdAtOrder = "") => {
    return async (dispatch) => {
        dispatch({ type: "USERS_DATA_LOADING" });
        try {
            const res = await axiosInstance.get(`admin/users?page=${page}&limit=${limit}&nameOrder=${nameOrder}&emailOrder=${emailOrder}&dateOrder=${createdAtOrder}`)
            if (res && res.data && res.data.success) {
                dispatch({
                    type: "USERS_DATA_SUCCESS",
                    payload: {
                        ...res.data,
                        sort: { nameOrder, emailOrder, createdAtOrder }
                    }
                })
                return {
                    success: true,
                    message: res.data.message || "User data fetched successfully!",
                    data: res.data,
                };
            } else {
                dispatch({ type: "USERS_DATA_ERROR", payload: res.data?.message || "Failed to fetch user data" })
                return {
                    success: false,
                    message: res.data?.message || "Failed to fetch user data"
                };
            }
        } catch (error) {
            dispatch({ type: "USERS_DATA_ERROR", payload: error.response?.data?.message || "Failed to fetch user data" })
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch user data"
            }
        }
    }
}