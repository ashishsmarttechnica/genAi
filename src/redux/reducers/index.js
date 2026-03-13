import { combineReducers } from "redux";
import AdminReducer from "./adminReducer";
import CategoryDataReducer from "./categoryDataReducer";
import PromptReducer from './promptReducer'
import UsersDataReducer from "./usersDataReducer";

const rootReducer = combineReducers({
    adminDetails: AdminReducer,
    categoryData: CategoryDataReducer,
    prompt: PromptReducer,
    usersData: UsersDataReducer
})

export default rootReducer;
