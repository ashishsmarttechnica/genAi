import axiosClient from "utils/axios";

export const getPromptAction = (page = 1, limit = 10, categoryId = "", isLoadMore = false) => {
    return async (dispatch) => {
        if (isLoadMore) {
            dispatch({ type: "PROMPT_DATA_LOAD_MORE_LOADING" });
        } else {
            dispatch({ type: "PROMPT_DATA_LOADING" });
        }

        try {
            const res = await axiosClient.get(`/prompt?page=${page}&limit=${limit}&categoryId=${categoryId}`)

            if (res && res.data && res.data.success) {
                if (isLoadMore) {
                    dispatch({ type: "PROMPT_DATA_LOAD_MORE_SUCCESS", payload: res.data, meta: { categoryId } })
                } else {
                    dispatch({ type: "PROMPT_DATA_SUCCESS", payload: res.data, meta: { categoryId } })
                }
                return {
                    success: true,
                    message: res.data.message || "Prompt data fetched successfully!",
                    data: res.data,
                };
            }
            else {
                dispatch({ type: "PROMPT_DATA_ERROR", payload: res.data?.message || "Failed to fetch prompt data" })
                return {
                    success: false,
                    message: res.data?.message || "Failed to fetch prompt data"
                };
            }
        } catch (error) {
            dispatch({ type: "PROMPT_DATA_ERROR", payload: error.response?.data?.message })
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch prompt data"
            }

        }
    }
}


export const createPromptAction = (promptData, categoryId = "") => {
    return async (dispatch) => {
        dispatch({ type: "PROMPT_DATA_CREATE_LOADING" })
        try {
            const res = await axiosClient.post("/prompt", promptData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            )

            if (res && res.data && res.data.success) {
                dispatch({ type: "PROMPT_DATA_CREATE_SUCCESS", payload: res.data, meta: { categoryId } })
                return {
                    success: true,
                    message: res.data.message || "prompt created successfully",
                    data: res.data
                }
            }
            else {
                dispatch({ type: "PROMPT_DATA_CREATE_ERROR", payload: res.data?.message || "Failed to create prompt" })
                return {
                    success: false,
                    message: res.data?.message || "Failed to create prompt"
                }
            }
        } catch (error) {
            dispatch({ type: "PROMPT_DATA_CREATE_ERROR", payload: error.response?.data?.message })
            return {
                success: false,
                message: error.response?.data?.message || "Failed to create prompt"
            }
        }
    }
}


export const movePromptAction = (categoryId, promptId, newIndex, targetDbIndex, cacheKey = 'ALL') => {
    return async (dispatch, getState) => {
        const previousDataBackup = getState().prompt?.cache?.[cacheKey];
        try {

            // instant feedback (ui update - array position mapping)
            dispatch({
                type: "PROMPT_DATA_MOVE",
                payload: { categoryId, promptId, toIndex: newIndex, targetDbIndex, cacheKey }
            })

            // api call (Database index mapping)
            const res = await axiosClient.put('/prompt/move', {
                categoryId: categoryId,
                promptId: promptId,
                toIndex: targetDbIndex
            });

            if (res && res.data && res.data.success) {
                // DON'T dispatch PROMPT_DATA_SUCCESS here because the move API response 
                // doesn't contain the full prompts array. The optimistic update already 
                // fixed the UI, so we just return success.
                return {
                    success: true,
                    message: res.data.message || "Prompt data move successfully!",
                    data: res,
                };
            } else {
                dispatch({ type: "PROMPT_DATA_ERROR", payload: { data: previousDataBackup, cacheKey } });
                console.error("move Failed reverting ui back");
            }
        }
        catch (error) {
            dispatch({ type: "PROMPT_DATA_ERROR", payload: { data: previousDataBackup } });
            console.error("Move Api error ", error)
        }
    }
}



export const updatePromptAction = (promptId, formData, categoryId = "") => {
    return async (dispatch, getState) => {
        const cacheKey = categoryId || 'ALL';
        const previousDataBackup = getState().prompt?.cache?.[cacheKey];
        
        try {
            // instant feedback (ui update)
            dispatch({
                type: "PROMPT_DATA_UPDATE",
                payload: { 
                    promptId, 
                    isActive: formData instanceof FormData ? formData.get('isActive') === 'true' : formData.isActive,
                    // If we have title in formData, update it too for optimistic UI
                    title: formData instanceof FormData ? formData.get('title') : formData.title,
                    cacheKey 
                }
            })

            // Construct FormData if it's a plain object (to ensure consistent handling)
            let body = formData;
            let headers = {};
            
            if (!(formData instanceof FormData)) {
                body = new FormData();
                Object.keys(formData).forEach(key => {
                    if (key === 'thumbnail' && typeof formData[key] === 'string') {
                        // Skip if it's a URL string (no change to image)
                        return;
                    }
                    body.append(key, formData[key]);
                });
                headers = { "Content-Type": "multipart/form-data" };
            } else {
                headers = { "Content-Type": "multipart/form-data" };
            }

            const res = await axiosClient.put(`/prompt/${promptId}`, body, { headers });

            if (res && res.data && res.data.success) {
                return {
                    success: true,
                    message: res.data.message || "Prompt updated successfully!",
                    data: res.data,
                };
            } else {
                dispatch({ type: "PROMPT_DATA_ERROR", payload: { data: previousDataBackup, cacheKey } });
                return { success: false, message: res.data?.message || "Failed to update prompt" };
            }
        }
        catch (error) {
            dispatch({ type: "PROMPT_DATA_ERROR", payload: { data: previousDataBackup, cacheKey } });
            return {
                success: false,
                message: error.response?.data?.message || "Something went wrong"
            };
        }
    }
}



export const deletePromptAction = (promptId, categoryId = "") => {
    return async (dispatch, getState) => {
        const cacheKey = categoryId || 'ALL';
        const previousDataBackup = getState().prompt?.cache?.[cacheKey];
        try {
            // instant feedback (ui update - array position mapping)
            dispatch({
                type: "PROMPT_DATA_DELETE",
                payload: { promptId, cacheKey }
            })

            // api call (Database index mapping)
            const res = await axiosClient.delete(`/prompt/${promptId}`);

            if (res && res.data && res.data.success) {
                return {
                    success: true,
                    message: res.data.message || "Prompt data delete successfully!",
                    data: res,
                };
            } else {
                dispatch({ type: "PROMPT_DATA_ERROR", payload: { data: previousDataBackup, cacheKey } });
                console.error("delete Failed reverting ui back");
            }
        }
        catch (error) {
            dispatch({ type: "PROMPT_DATA_ERROR", payload: { data: previousDataBackup, cacheKey } });
            console.error("Delete Api error ", error)
        }
    }
}