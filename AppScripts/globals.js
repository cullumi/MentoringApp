

// import { AsyncStorage } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {parseDateText, parseSimpleDateText} from './Helpers.js';

// export const cur = {user:{name:"null"}};
const apiKey = "364ec08dac33889d5ee1e15c86c0194bf91916938c5b64ea5055ac2fe6f281b5";
export const debug = false;
export const accountID = 1;
export const accountType = 0;
export const url = "https://mentorsapp.cs.wwu.edu";//"https://mentorship.cs.wwu.edu";//"http://mshipapp2.loca.lt";

export function globalParams() {
    var globals = {
        accountID: accountID,
        accountType: accountType,
        url: url
    }
    return globals;
}

export function longPressListener({ navigation }) {
    return {
        /* Fixes issue where tapping a tab registers as
        * a "long press" instead of a normal one.
        */
        tabLongPress: (e) => {
        navigation.jumpTo(e.target.split('-')[0]);
        },
    }
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
    console.log("LinkedIn Token get from " + source + ": \"" + token + "\"");
    return token;
}

export async function saveLocal(type, value) {
    try {
        await AsyncStorage.setItem(type, JSON.stringify(value));
    } catch (error) {
        console.log(error);
    }
}

export async function saveLocals(types, values) {
    for (let i = 0; i < types.length; i++) {
        await saveLocal(types[i], values[i])
    }
}

export async function loadLocal(type, fallback, test=(res)=>{return true;}) {
    try {
        var temp = JSON.parse(await AsyncStorage.getItem(type));
        if (temp != null && test(temp)) { return temp; }
        else { return fallback; }
    } catch (error) {
        console.log(error);
        return fallback;
    }
}

export async function loadLocalArray(type='Mentors', fallback=[]) {
    return loadLocal(type, fallback, (res) => Array.isArray(res));
}

export async function setLocalUser(user){
    setToken(user.Token);
    await AsyncStorage.setItem('User', JSON.stringify(user));
}

export async function getLocalUser(source='unknown'){
    if (debug) {
        return debugGlobals.users[0];
    }
    var user = JSON.parse(await AsyncStorage.getItem("User"));
    console.log("GetLocalUser:" + source);//:", user);
    return user;
}

// Debugging Variables
const AppStatuses = ["Pending", "Scheduled", "Done", "Completed", "Cancelled"];
const SumStatuses = ["Submitted", "Edited"]
var lastAppStatus = -1;
var lastSumStatus = -1;
const randAppStatus = () => { //return AppStatuses[Math.floor(Math.random() * AppStatuses.length)]; }
    const index = (lastAppStatus+=1)%(AppStatuses.length);
    return AppStatuses[index];
}
const randSumStatus = () => { //return SumStatuses[Math.floor(Math.random() * SumStatuses.length)]; }
    const index = (lastSumStatus+=1)%(SumStatuses.length)
    return SumStatuses[index];
}
const randomDate = () => {
    const start = new Date(2021, 1, 1);
    const end = new Date(2024, 1, 1);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toString();
}
const EN = 0;
const FN = 1;
const LN = 2;
const TT = 0;
const TD = 1;
export const debugGlobals = makeDebugGlobals(userDefs(), topicDefs(), summaryDefs()); //makeDebugGlobals(userDefs, topicDefs, summaryDefs);

function makeDebugGlobals (userDefs, topicDefs, summaryDefs) {
    const dGlob = {
        userAuths:[],
        users:[],
        userContacts:[],
        topics:[],
        pairs:[],
        appointments:[],
        summaries:[],
    }
    let UCIndex = 0;
    for (let i = 0; i < userDefs.length; i++) {
        const auth = debugUserAuth(i);
        dGlob.userAuths.push(auth);
        const def = userDefs[i];
        const user = debugUser(i, def[EN], def[FN], def[LN]);
        dGlob.users.push(user);
        const uContact = debugUserContact(UCIndex, i, def[EN]);
        UCIndex += 1;
        dGlob.userContacts.push(uContact);
    }
    for (let i = 0; i < topicDefs.length; i++) {
        const def = topicDefs[i];
        const topic = debugTopic(i, def[TT], def[TD], !!i);
        dGlob.topics.push(topic);
    }
    let PIndex = 0;
    let AIndex = 0;
    let SIndex = 0;
    for (let i = 0; i < dGlob.users.length; i++) {
        const user1 = dGlob.users[i];
        for (let j = 0; j < dGlob.users.length; j++) {
            // for (let z = 0; z < 2; z++) {
            //     const user1 = dGlob.users[(()=>{if (z == 0) {return i;} else {return j;}})()];
            //     const user2 = dGlob.users[(()=>{if (z == 0) {return j;} else {return i;}})()];
            const user1 = dGlob.users[i];
            const user2 = dGlob.users[j];
            if (user1 != user2) {
                const pair = debugPair(PIndex, user1.Id, user2.Id);
                dGlob.pairs.push(pair);
                PIndex += 1;
                
                for (let z = 0; z < dGlob.topics.length; z++) {
                    const topic = dGlob.topics[z];
                    // console.log('random test:', randAppStatus());
                    const appointment = debugAppointment(AIndex, pair.Id, topic.Id, randAppStatus());
                    dGlob.appointments.push(appointment);
                    AIndex += 1;
                    const summary1 = debugSummary(SIndex, appointment.Id, summaryDefs[0], user1.Id, randSumStatus());
                    dGlob.summaries.push(summary1);
                    SIndex += 1;
                    const summary2 = debugSummary(SIndex, appointment.Id, summaryDefs[1], user2.Id, randSumStatus());
                    dGlob.summaries.push(summary2);
                    SIndex += 1;
                }
            }
            // }
        }
    }
    return dGlob;
};

// Defs
function summaryDefs () {
    return [
        ["I had a really good time talking w/ such and such about such and such."],
        ["This guy was pretty lame, tbh"]
    ];
}
function topicDefs () {
    return [
        ["Talking", "Discuss how talking works."],
        ["Walking", "Discuss how walking works."],
        ["Running", "Discuss how running works."],
    ];
}
function userDefs () {
    return [
        ["ian", "Ian", "Test"],
        ["jared", "Jared", "Test"],
        ["isaiah", "Isaiah", "Test"],
    ];
}

// Users
function debugUserAuth (Id) {
    return {
        Id:Id,
        Token:null,
    };
}
export function debugUpdatePrivacy (Id, PrivacyAccepted) {
    debugGlobals.users[Id].PrivacyAccepted = PrivacyAccepted;
}
function debugUser (Id, EmailName, FirstName, LastName) {
    return {
        Id:Id,
        Token:null,
        Email:EmailName+"@debugging.com",
        FirstName:FirstName,
        LastName:LastName,
        Avatar:"https://media.licdn.com/media/AAYQAQSOAAgAAQAAAAAAAB-zrMZEDXI2T62PSuT6kpB6qg.png",
        ExpoPushToken:null,
        Created:randomDate(),
        LastUpdate:randomDate(),
        PrivacyAccepted:1,
        Approved:1,
        Type:0,
    };
}

// UserContacts
function debugUserContact (Id, UserId, EmailName) {
    return {
        Id:Id,
        UserId:UserId,
        ContactValue:EmailName+"@debugging.com",
        ContactType:"Email",
        Created:randomDate(),
        LastUpdate:randomDate(),
    };
}

// Topics
function debugTopic (Id, Title, Description, ActiveTopic) {
    return {
        Id:Id,
        PostedBy:0,
        DueDate:randomDate(),
        Title:Title,
        Description:Description,
        Created:randomDate(),
        LastUpdate:randomDate(),
        ActiveTopic:ActiveTopic,
        Archived:0,
    };
}

// Pairs
function debugPair (Id, MentorId, MenteeId) {
    return {
        Id:Id,
        MentorId:MentorId,
        MenteeId:MenteeId,
        Created:randomDate(),
        LastUpdate:randomDate(),
        PrivacyAccepted:1,
    };
}

// Appointment Summaries
export function addDebugSummary(AppointmentId, SummaryText, UserId) {
    const newIndex = debugGlobals.summaries.length;
    const summary = debugSummary(newIndex, AppointmentId, SummaryText, UserId, SumStatuses[0]);
    debugGlobals.summaries.push(summary)
}
export function debugUpdateSummaryText(Id, SummaryText) {
    const summary = debugGlobals.summaries.find((summary) => {return summary.Id == Id})
    if (summary != null) {
        console.log("Changing summary ", summary.Id, " to ", SummaryText);
        summary.SummaryText = SummaryText;
    }
    else { console.log("summary doesn't exist?"); }
}
function debugSummary (Id, AppointmentId, SummaryText, UserId, Status) {
    return {
        Id:Id,
        AppointmentId:AppointmentId,
        SummaryText:SummaryText,
        UserId:UserId,
        Status:Status,
        Created:randomDate(),
        LastUpdate:randomDate(),
    };
}

// Appointments
export function addDebugAppointment (PairId, TopicId, ScheduledAt) {
    const newIndex = debugGlobals.appointments.length;
    const appointment = debugAppointment(newIndex, PairId, TopicId, AppStatuses[0], ScheduledAt);
    debugGlobals.appointments.push(appointment);
}
export function debugUpdateAppointmentStatus (Id, Status) {
    const app = debugGlobals.appointments.find((app) => {return app.Id == Id;})
    if (app != null) {
        console.log("Changing app ", app.Id, " to ", Status);
        app.Status = Status;
    }
    else { console.log("appointment doesn't exist?"); }
}
function debugAppointment (Id, PairId, TopicId, Status, ScheduledAt=randomDate()) {
    return {
        Id:Id,
        PairId:PairId,
        TopicId:TopicId,
        ScheduledAt:ScheduledAt,
        Status:Status,
        Created:randomDate(),
        LastUpdate:randomDate(),
    };
}