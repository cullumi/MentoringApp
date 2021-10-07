

import { AsyncStorage } from "react-native";

// export const cur = {user:{name:"null"}};
const apiKey = "364ec08dac33889d5ee1e15c86c0194bf91916938c5b64ea5055ac2fe6f281b5";
export const accountID = 1;
export const accountType = 0;
export const url = "https://mentorship.cs.wwu.edu"//"http://mshipapp2.loca.lt";
<<<<<<< HEAD
=======

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

export async function getToken(source='unknown'){
    var token = await AsyncStorage.getItem('Token');
    if (token == null) {
        token = apiKey;
    }
    // console.log("Token get from " + source + ": \"" + token + "\"");
    return token;
}

export async function isUserTokenPresent() {
    let present = await AsyncStorage.getItem('Token') != null
    // console.log("Token Present? ", present);
    return present;
}

export async function setLinkedInToken(token){
    await AsyncStorage.setItem('LinkedInToken', token);
}

export async function getLinkedInToken(source='unknown'){
    var token = await AsyncStorage.getItem('LinkedInToken');
    // console.log("LinkedIn Token get from " + source + ": \"" + token + "\"");
    return token;
}

export async function setLocalUser(user){
    setToken(user.Token);
    await AsyncStorage.setItem('User', JSON.stringify(user));
}

export async function getLocalUser(){
    var user = JSON.parse(await AsyncStorage.getItem("User"));
    console.log("GetLocalUser:", user);
    return user;
}
>>>>>>> push-notifs
