

import { AsyncStorage } from "react-native";

// export const cur = {user:{name:"null"}};
const apiKey = "364ec08dac33889d5ee1e15c86c0194bf91916938c5b64ea5055ac2fe6f281b5";
export const debug = true;
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

export async function setLocalUser(user){
    setToken(user.Token);
    await AsyncStorage.setItem('User', JSON.stringify(user));
}

export async function getLocalUser(){
    var user = JSON.parse(await AsyncStorage.getItem("User"));
    console.log("GetLocalUser:", user);
    return user;
}

// Debugging Variables
export const debugGlobals = makeDebugGlobals(userDefs(), topicDefs(), summaryDefs()); //makeDebugGlobals(userDefs, topicDefs, summaryDefs);

const AppStatuses = ["Pending", "Scheduled", "Done", "Completed", "Cancelled"];
const SumStatuses = ["Submitted", "Edited"]
const EN = 0;
const FN = 1;
const LN = 2;
const TT = 0;
const TD = 1;

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
    for (let i = 0; i < dGlob.users.length; i++) {
        const user1 = dGlob.users[i];
        for (let j = 0; j < dGlob.users.length; j++) {
            const user2 = dGlob.users[j];
            const pair = debugPair(PIndex, user1, user2);
            dGlob.pairs.push(pair);
            PIndex += 1;
            let AIndex = 0;
            let SIndex = 0;
            for (let z = 0; z < dGlob.topics.length; z++) {
                const topic = dGlob.topics[z];
                const appointment = debugAppointment(AIndex, pair.Id, topic.Id, AppStatuses[1]);
                dGlob.appointments.push(appointment);
                AIndex += 1;
                const summary1 = debugSummary(SIndex, appointment.Id, summaryDefs[0], user1.Id, SumStatuses[0]);
                dGlob.summaries.push(summary1);
                SIndex += 1;
                const summary2 = debugSummary(SIndex, appointment.Id, summaryDefs[1], user2.Id, SumStatuses[0]);
                dGlob.summaries.push(summary2);
                SIndex += 1;
            }
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
function debugUpdatePrivacy (Id, PrivacyAccepted) {
    debugGlobals[Id].PrivacyAccepted = PrivacyAccepted;
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
        Created:null,
        LastUpdate:null,
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
        Created:null,
        LastUpdate:null,
    };
}

// Topics
function debugTopic (Id, Title, Description, ActiveTopic) {
    return {
        Id:Id,
        PostedBy:0,
        DueDate:null,
        Title:Title,
        Description:Description,
        Created:null,
        LastUpdate:null,
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
        Created:null,
        LastUpdate:null,
        PrivacyAccepted:1,
    };
}

// Appointment Summaries
export function addDebugSummary(AppointmentId, SummaryText, UserId) {
    const newIndex = debugGlobals.summaries.length;
    const summary = debugSummary(newIndex, AppointmentId, SummaryText, UserId, sumStatuses[0]);
    debugGlobals.summaries.push(summary)
}
function debugSummary (Id, AppointmentId, SummaryText, UserId, Status) {
    return {
        Id:Id,
        AppointmentId:AppointmentId,
        SummaryText:SummaryText,
        UserId:UserId,
        Status:Status,
        Created:null,
        LastUpdate:null,
    };
}

// Appointments
export function addDebugAppointment (PairId, TopicId, ScheduledAt) {
    const newIndex = debugGlobals.appointments.length;
    const appointment = debugAppointment(newIndex, PairId, TopicId, appStatuses[0], ScheduledAt);
    debugGlobals.appointments.push(appointment);
}
function debugUpdateAppointmentStatus (Id, Status) {
    debugGlobals[Id].Status = Status;
}
function debugAppointment (Id, PairId, TopicId, Status, ScheduledAt=null) {
    return {
        Id:Id,
        PairId:PairId,
        TopicId:TopicId,
        ScheduledAt:ScheduledAt,
        Status:Status,
        Created:null,
        LastUpdate:null,
    };
}