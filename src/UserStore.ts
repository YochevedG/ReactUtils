import { create, StoreApi, UseBoundStore } from "zustand";
import { createAPI } from "./DataUtil";

interface User {
    userName: string,
    roleName: string,
    roleRank: number,
    sessionKey: string,
    errorMessage: string,
    isLoggedIn: boolean,
    login: (username: string, password: string) => Promise<void>,
    logout: () => void,
}

async function loginUser(apiUrl: string, username: string, password: string): Promise<User> {
    apiUrl = apiUrl + "user/";
    const postData = createAPI(apiUrl, "").postData;
    const user = await postData<User>("login", { username, password });
    return user;
}

let userstore: UseBoundStore<StoreApi<User>>

const keyname = "userstore";
export function getUserStore(apiUrl: string) {
    if (!userstore) {
        userstore = create<User>(
            (set) => {
                const storedvalue = sessionStorage.getItem(keyname);
                const initialvals = storedvalue ?
                    JSON.parse(storedvalue)
                    : { userName: "", roleName: "", roleRank: 0, sessionKey: "", errorMessage: "", isLoggedIn: false };
                return {
                    ...initialvals,
                    logout: () => {
                        const newstate = { userName: "", roleName: "", roleRank: 0, sessionKey: "", errorMessage: "", isLoggedIn: false };
                        sessionStorage.setItem(keyname, JSON.stringify(newstate));
                        set(newstate);
                    },
                    login: async (username: string, password: string) => {
                        const user = await loginUser(apiUrl, username, password);
                        const loggedin = !user.sessionKey ? true : false;
                        const newstate = { userName: user.userName, roleName: user.roleName, roleRank: user.roleRank, sessionKey: user.sessionKey, errorMessage: user.errorMessage, isLoggedIn: loggedin };
                        sessionStorage.setItem(keyname, JSON.stringify(newstate));
                        set(newstate);
                    }
                }
            }
        )
    }
    return userstore;
};