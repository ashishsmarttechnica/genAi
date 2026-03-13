import axiosInstance from "utils/axios";

export const getCategoryDataAction = (page = 1, limit = 10) => {
    return async (dispatch) => {

        dispatch({ type: "CATEGORY_DATA_LOADING" });

        try {
            const res = await axiosInstance.get(`category/get-all?page=${page}&limit=${limit}`);
            // console.log(res, "res Data ");

            if (res && res.data && res.data.success) {

                dispatch({ type: "CATEGORY_DATA_SUCCESS", payload: { data: res.data, limit } });

                return {
                    success: true,
                    message: res.data.message || "Category data fetched successfully!",
                    data: res.data,
                };
            }
            else {
                dispatch({ type: "CATEGORY_DATA_ERROR", payload: res.data?.message || "Failed to fetch category data" });
                return {
                    success: false,
                    message: res.data?.message || "Failed to fetch category data"
                };
            }
        } catch (error) {
            dispatch({ type: "CATEGORY_DATA_ERROR", payload: error.response?.data?.message });
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch category data"
            };
        }
    };
};

export const createCategory = (categoryName) => {
    return async (dispatch) => {
        dispatch({ type: "CATEGORY_DATA_MUTATION_LOADING" });

        try {
            const res = await axiosInstance.post("category/create", { name: categoryName });

            if (res && res.data && res.data.success) {
                dispatch({ type: "CATEGORY_DATA_CREATE", payload: { data: res.data } });
                return {
                    success: true,
                    message: res.data.message || "Category created successfully!",
                    data: res.data,
                };
            }
            else {
                dispatch({ type: "CATEGORY_DATA_ERROR", payload: res.data?.message || "Failed to create category data" });
                return {
                    success: false,
                    message: res.data?.message || "Failed to create category data"
                };
            }
        } catch (error) {
            dispatch({ type: "CATEGORY_DATA_ERROR", payload: error.response?.data?.message });
            return {
                success: false,
                message: error.response?.data?.message || "Failed to create category data"
            };
        }
    }
}


export const deleteCategory = (categoryId) => {
    return async (dispatch) => {
        dispatch({ type: "CATEGORY_DATA_MUTATION_LOADING" });

        try {
            const res = await axiosInstance.delete(`category/delete/${categoryId}`);

            if (res && res.data && res.data.success) {
                dispatch({ type: "CATEGORY_DATA_DELETE", payload: { data: res.data, categoryId } });
                return {
                    success: true,
                    message: res.data.message || "Category deleted successfully!",
                    data: res.data,
                };
            }
            else {
                dispatch({ type: "CATEGORY_DATA_ERROR", payload: res.data?.message || "Failed to delete category data" });
                return {
                    success: false,
                    message: res.data?.message || "Failed to delete category data"
                };
            }
        } catch (error) {
            dispatch({ type: "CATEGORY_DATA_ERROR", payload: error.response?.data?.message });
            return {
                success: false,
                message: error.response?.data?.message || "Failed to delete category data"
            };
        }
    }
}


export const moveCategoryDataAction = (categoryId, toIndex) => {
    return async (dispatch, getState) => {
        const previousDataBackup = getState().categoryData.data;
        try {

            // instant feedback (ui update)
            dispatch({
                type: "CATEGORY_DATA_MOVE",
                payload: { categoryId, toIndex }
            })

            // api call
            const res = await axiosInstance.put('category/move', {
                categoryId: categoryId,
                toIndex: toIndex
            });

            if (res && res.data && res.data.success) {
                // DON'T dispatch CATEGORY_DATA_SUCCESS here because the move API response 
                // doesn't contain the full categories array. The optimistic update already 
                // fixed the UI, so we just return success.
                return {
                    success: true,
                    message: res.data.message || "Category data move successfully!",
                    data: res,
                };
            } else {
                dispatch({ type: "CATEGORY_DATA_ERROR", payload: { data: previousDataBackup } });
                console.error("move Failed reverting ui back");
            }
        }
        catch (error) {
            dispatch({ type: "CATEGORY_DATA_ERROR", payload: { data: previousDataBackup } });
            console.error("Move Api error ", error)
        }
    }
}



export const updateCategoryDataAction = (categoryId, categoryName, isActive) => {
    return async (dispatch, getState) => {
        const previousDataBackup = getState().categoryData.data;
        try {

            // instant feedback (ui update)
            dispatch({
                type: "CATEGORY_DATA_UPDATE",
                payload: { categoryId, categoryName, isActive }
            })

            // api call
            const res = await axiosInstance.put(`category/update/${categoryId}`, {
                categoryName: categoryName,
                isActive: isActive
            });

            if (res && res.data && res.data.success) {
                return {
                    success: true,
                    message: res.data.message || "Category data updated successfully!",
                    data: res,
                };
            } else {
                dispatch({ type: "CATEGORY_DATA_ERROR", payload: { data: previousDataBackup } });
                console.error("update Failed reverting ui back");
            }
        }
        catch (error) {
            dispatch({ type: "CATEGORY_DATA_ERROR", payload: { data: previousDataBackup } });
            console.error("Update Api error ", error)
        }
    }
}