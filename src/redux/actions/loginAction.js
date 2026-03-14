import axiosInstance from "utils/axios";

export const loginAdmin = (data) => {
    return async (dispatch) => {
        try {
            const response = await axiosInstance.post("/admin/login",
                {
                    email: data.email,
                    password: data.password
                });

            if (response.data.success === true) {
                localStorage.setItem("id", response.data.data.admin._id);
                dispatch({ type: "LOGIN_SUCCESS", payload: response.data.data.admin });
                return response.data;
            } else {
                dispatch({ type: "LOGIN_ERROR", payload: response.data.message });
                return response.data;
            }

        } catch (error) {
            dispatch({ type: "LOGIN_ERROR", payload: error.response?.data?.message });
            return error.response?.data;
        }
    };
};