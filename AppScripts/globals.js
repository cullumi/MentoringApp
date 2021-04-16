

import { AsyncStorage } from "react-native";

// export const cur = {user:{name:"null"}};
export const accountID = 1;
export const accountType = 0;
export const url = "https://mentorship.cs.wwu.edu"//"http://mshipapp2.loca.lt";

export function globalParams() {
    var globals = {
        accountID: accountID,
        accountType: accountType,
        url: url
    }
    return globals;
}

export async function setToken(token){
    await AsyncStorage.setItem('Token', token);
}

export async function getToken(){
    return await AsyncStorage.getItem('Token');
}

export async function setLocalUser(user){
    token = user.token;
    await AsyncStorage.setItem('User', JSON.stringify(user));
}

export async function getLocalUser(){
    return await AsyncStorage.getItem("User");
}