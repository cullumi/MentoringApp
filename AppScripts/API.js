



import {AsyncStorage} from 'react-native';
import {getLocalUser, setLocalUser, url, getToken, setToken, getLinkedInToken, isUserTokenPresent} from './globals.js';
import {parseDateText, parseSimpleDateText} from './Helpers.js';
import {assignMeetingStyle, styles, colors} from './Styles.js';
import * as Crypto from 'expo-crypto';

// API GET and POST Methods


// Register Push Token
export async function updatePushToken() {
  var user = await getLocalUser();
  var pushToken = user.expoPushToken;
  var token = user.token;
  var email = user.email;
  var uID = user.id;
  const postres = fetch(url + '/update-expo-push-token' + '/' + token, {
    method: 'POST',
    body: JSON.stringify({
      email,
      pushToken,
      uID,
      token,
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .catch((error) => {
    console.error(error);
  });
}

// Gets a topic based on it's ID.
export async function retTopic(topicId) {
    const topicRes = await fetch(url + '/topic/' + topicId + '/' + await getToken('retTopic'), {
      method: 'GET'
    });
    const topicPayload = await topicRes.json();
    var topic = JSON.parse(JSON.stringify(topicPayload["recordset"][0]));
    topic['dueDateText'] = parseDateText(new Date(topic["DueDate"]));
    topic['createdText'] = parseSimpleDateText(new Date(topic["Created"]));
    return topic;
}

// Gets all pairs containing the given user as a mentor, then gets a list of mentees using those pairs.
export async function getMenteesOf (userId) {

    const pairs = await getMPairsOf('mentor', userId);
    const mentees = [];
    for (var i = 0; i < pairs.length; i++) {
      const index = i;
      const mentee = await getPairedUser(pairs[index]["MenteeId"], userId);
      mentee.homeBoxStyle = styles.homeMenteeBox;
      mentee.contactButtonStatus = true;
      mentee.contactButtonStyle = styles.hiddenButton;
      mentees.push(mentee);
    }
    return mentees;
}

// Gets all pairs containing the given user as a mentee, then gets a list of mentors from those pairs.
export async function getMentorsOf (userId) {

    const pairs = await getMPairsOf('mentee', userId);
    console.log("getMentorsOf: ", pairs);
    const mentors = [];
    for (var i = 0; i < pairs.length; i++) {
      const index = i;
      const mentor = await getPairedUser(pairs[index]["MentorId"], userId);
      mentor.homeBoxStyle = styles.homeMentorBox;
      mentor.contactButtonStatus = false;
      mentor.contactButtonStyle = styles.summaryButton;
      mentors.push(mentor);
    }
    return mentors;
}

// Gets all pairs relative to a user's Role and a user's ID.
export async function getMPairsOf(mType, userID) {

    const pairsres = await fetch(url + '/pair/' + mType + '/' + userID + '/' + userID + '/' + await getToken('getPairsOf'), {
      method: 'GET'
    });
    const pairsPayload = await pairsres.json();
    return pairsPayload["recordset"];
}

export async function getPairsOf(userId) {

  const pairsres = await fetch(url + '/pair/' + userId + '/' + await getToken('getPairsOf'), {
    method: 'GET'
  });
  const pairsPayload = await pairsres.json();
  return pairsPayload["recordset"];
}

export async function getPair(mentorId, menteeId) {

  const userID = (await getLocalUser()).Id;
  const userToken = await getToken('createMeeting(pairId)');
  console.log("getPair:", mentorId, menteeId, userID, userToken);
  const pairres = await fetch(url + '/pair/both/' + mentorId + "/" + menteeId + '/' + userID + '/' + userToken, {
    method: 'GET'
  });
  const ppayload = await pairres.json();
  console.log("Pair:", ppayload);
  return JSON.parse(JSON.stringify(ppayload.recordset[0]));
}

// Gets basic semi-public information about a paired user.
export async function getPairedUser(targetId, userId) {

  const fullUrl = url + '/user/other/' + targetId + '/' + userId + '/' + await getToken('getUserPayloadByID');
  const userres = await fetch(fullUrl, {
    method: 'GET'
  });
  const userPayload = await userres.json();
  return JSON.parse(JSON.stringify(userPayload.recordset[0]));
}

// Gets the Current User via the ensureUserExists method and the createLocalUser method.
// Should Phase Out the CreateLocalUser method in favor of a simple .json() call on the payload.
export async function getCurrentUser (source="unknown") {

  const userPayload = await ensureUserExists(source);
  return createLocalUser(userPayload);
}

// Gets a user based on a certain user id.
export async function getUserByID(id) {

    const userPayload = await getUserPayloadByID(id);
    return createLocalUser(userPayload);
}

// Creates a javascript object out of a user payload for use elsewhere in the React Native app.
// Note:  this should probably be replaced with a .json() call or otherwise by using JSON.parse().
export function createLocalUser(userPayload) {

    const recordSet = userPayload["recordset"][0];
    const user = JSON.parse(JSON.stringify(recordSet));
    setLocalUser(user);
    return user;
}

// Finds the current user if it can, creates a new user and adds it to the database if needed.
// All in all, Effectively accounts for when the user was created offline, or for when the API is offline.
export async function ensureUserExists (source="unknown") {

  var userId = null;
  if (!await isUserTokenPresent()){
    const email = await AsyncStorage.getItem("Email");
    const first = await AsyncStorage.getItem('FirstName');
    const last = await AsyncStorage.getItem('LastName');
    const pic = await AsyncStorage.getItem('Avatar');

    let authPayload = await getAuthorizedUser('ensureUserExists');

    // check if this user needs to be added to DB.
    while (authPayload.rowsAffected == 0) {
      await postNewUser(email, first, last, pic);
      authPayload = await getAuthorizedUser('ensureUserExists');
    }
    // Set the user
    const userToken = authPayload["recordset"][0]["Token"];
    userId = authPayload["recordset"][0]["Id"]
    await setToken(userToken);
  } else {
    var user = await getLocalUser()
    userId = user.Id;
  }
  let userPayload = await getUserPayloadByID(userId);
  const payload = userPayload
  return payload;
}

export async function getAuthorizedUser(source='unknown') {
  const authres = await fetch(url + '/user/access/' + await getLinkedInToken('getAuthorizedUser'), {
    method: 'GET'
  });
  if (authres.status != 200){
    console.log("(" + source + ") Non-200 User Authorization Payload Received: ", authres);
  }
  const authPayload = await authres.json();
  return authPayload;
}

// Fetches a User Payload using a User Email.
export async function getUserIdPayloadByEmail(email) {

    var fetchUrl = url + '/user/email/' + email + '/' + await getToken('getUserIdPayloadByEmail');
    const userres = await fetch(fetchUrl, {
      method: 'GET'
    });
    const userPayload = await userres.json();
    return userPayload;
}

// Fetches a User Payload using a User ID.
export async function getUserPayloadByID(id) {

    const fullUrl = url + '/user/id/' + id + '/' + await getToken('getUserPayloadByID');
    const userres = await fetch(fullUrl, {
      method: 'GET'
    });
    const userPayload = await userres.json();
    const value = JSON.parse(JSON.stringify(userPayload));
    return value;
}

// Creates a User via POST
export async function postNewUser(email, first, last, pic) {

    var created = new Date();
    var token = await Crypto.digestStringAsynce(
      Crypto.CryptoDigestAlgorith, SHA256,
      email + first + last + parseDateText(created)
    );
    const postres = fetch(url + '/create-user', {
      method: 'POST',
      body: JSON.stringify({
        Email: email,
        Token: token,
        FirstName: first,
        LastName: last,
        Avatar: pic,
        PrivacyAccepted: 0,
        PushToken: 0
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function createMeeting(mentorId, menteeId, scheduledAt) {

  console.log("Getting meeting topic and pair.");
  const topic = await getCurrentTopic();
  console.log("Gotten.", topic);
  const pair = await getPair(mentorId, menteeId);
  console.log("Gotten.", pair);
  const userId = (await getLocalUser()).Id;
  const userToken = await getToken("createMeeting");

  // Create appointment.
  console.log("Posting appointment:", pair.Id, scheduledAt, topic.Id, userId, userToken);
  const post = await fetch(url + '/create-appointment', {
    method: 'POST',
    body: JSON.stringify({
      PairId: pair.Id,
      ScheduledAt: scheduledAt,
      TopicId: topic.Id,
      UserId: userId,
      Token: userToken,
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .catch((error) => {
    console.error(error);
  });
  console.log("Finished posting appointment.", post);
}

// Create Summary
export async function createSummary(id, curSummary, userID) {

  const postres = fetch (url + '/create-summary' + '/' + await getToken('createSummary'), {
    method: 'POST',
    body: JSON.stringify({
      AppointmentId: id,
      SummaryText: curSummary,
      UserId: userID
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .catch((error) => {
    console.error(error);
  });
  
}

// Updates the privacy setting of a user, based on a given email.
export async function updatePrivacy(email, privacyAccepted) {

    const postres = fetch (url + '/update-privacy' + '/' + await getToken('updatePrivacy'), {
      method: 'POST',
      body: JSON.stringify({
        Email: email,
        PrivacyAccepted: privacyAccepted
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

// Returns All of the Contact Info for a given UserID. ("cInfos" refers to various forms of contact)
export async function getContactInfoOf(userID) {

    const cInfores = await fetch(url + '/contact/' + userID + '/' + await getToken('getContactInfoOf'), {
      method: 'GET'
    });
    const cInfoPayload = await cInfores.json();
    const recordSet = JSON.parse(JSON.stringify(cInfoPayload["recordset"]));
    var cInfos = [];
    for (var i = 0; i < recordSet.length; i++) {
      const index = i;
      var cInfo = JSON.parse(JSON.stringify(recordSet[index]));
      cInfo.LastUpdateText = parseSimpleDateText(new Date(cInfo.LastUpdate));
      cInfo.CreatedText = parseSimpleDateText(new Date(cInfo.Created));
      cInfos.push(cInfo);
    }
    return cInfos;
}

// Returns the current topic from the database.
export async function getCurrentTopic() {

  var user = await getLocalUser();
  var userId = user.Id;
  const topicres = await fetch(url + '/current-topic' + '/' + userId + '/' + await getToken('getCurrentTopic'), {
    method: 'GET'
  });
  const topicPayload = await topicres.json();
  var topic = JSON.parse(JSON.stringify(topicPayload['recordset'][0]));
  topic.DueDateText = parseDateText(new Date(topic.DueDate));
  topic.CreatedText = parseSimpleDateText(new Date(topic.Created));
  return topic;
}

// Returns a list of all topics from the database
// NOTE: excludes the current topic?  The API could use a more descriptive rename if this is the case.
export async function getAllTopics() {

  var user = await getLocalUser();
  var userId = user.Id;
  const topicsres = await fetch(url + '/all-topics' + '/' + userId + '/' + await getToken('getAllTopics'), {
    method: 'GET'
  });
  const topicsPayload = await topicsres.json();
  const recordSet = topicsPayload["recordset"];
  var topics = [];
  for (var i = 0; i < recordSet.length; i++) {
    var topic = JSON.parse(JSON.stringify(recordSet[i]));
    topic.DueDateText = parseDateText(new Date(topic.DueDate));
    topic.CreatedText = parseSimpleDateText(new Date(topic.Created));
    topics.push(topic);
  }
  return topics;
}

export async function getTopic(topicId) {

  var user = await getLocalUser();
  var userId = user.Id;
  const topicres = await fetch(url + "/topic/" + topicId + '/' + userId + '/' + await getToken('getTopic'), {
    method: 'GET'
  });
  const topicPayload = await topicres.json();
  const topic = topicPayload.recordset[0];
  return topic;
}

// Gets past appointments
export async function getPastAppointments(pairId, userId, source='unknownPast') {

  return await getAppointments('past', pairId, userId, source);
}

// Gets upcoming appointments
export async function getUpcomingAppointments(pairId, userId, source='unknownUpcoming') {

  return await getAppointments('upcoming', pairId, userId, source);
}

export async function getAppointments(type, pairId, userId, source='unknown') {

  const res = await fetch(url + '/appointment/' + type + '/' + pairId + '/' + userId + '/' + await getToken('checkMeetingsHome(pastapts)'), {
    method: 'GET'
  });
  const payload = await res.json();
  return payload.recordset;
}

// Updates appointment status
export async function updateAppointmentStatus(meetingId, status, userId) {

  const statusupdateres = await fetch(url + '/update-appointment-status' + '/' + userId + '/' + await getToken('updateAppointmentStatus'), {
    method: 'POST',
    body: JSON.stringify({
      Id: meetingId,
      Status: status
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .catch((error) => {
    console.error(error);
  });
}

// Is this redundant?  (I'm not entirely sure what it does yet...)
// Does it return a different set of meetings than the getAppointments() method?
// Either way, it's likely we can split it up into smaller methods.
export async function checkMeetings() {

    var meetings = [];
    var user = await getCurrentUser('checkMeetings');
    var pairs = await getPairsOf(user.Id);

    // Get appointments for each pair the user is a part of.
    for (var i = 0; i < pairs.length; i++) {
      const pairId = pairs[i].Id;
      const userId = user.Id;
      const menteeId = pairs[i].MenteeId;
      const pastAppointments = await getPastAppointments(pairId, userId, 'checkMeetings');
      if (pastAppointments.length !== 0) {
        // Add each appointment to the meetings array with other necessary data.
        for (var j = 0; j < pastAppointments.length; j++) {
          var meeting = JSON.parse(JSON.stringify(pastAppointments[j]));
          let date = new Date(meeting.ScheduledAt);
          let cur = new Date();
          meeting.updated = false;

          // Check if we should process this meeting (user should be Mentee, meeting should be newly Done)...
          if (menteeId === userId && cur > date && meeting.Status === 'Scheduled') {
            await updateAppointmentStatus(meeting.Id, 'Done', userId);
            meeting.updated = true;
            meeting.Status = 'Done';
            meeting.dateText = parseDateText(date);

            // Get mentor/mentee avatar, and mark whether this user is the mentor/mentee, and provide title/prompt text.
            meeting.titleText = "Mentor Meeting";
            const mentor = await getPairedUser(pairs[i].MentorId, userId);
            meeting.Avatar = mentor.Avatar;
            meeting.MentorFirstName = mentor.FirstName;

            // Get associated topic information and store it.
            meeting.topic = await getTopic(meeting.TopicId);
            meeting.topic.dueDateText = parseDateText(new Date(meeting.topic.DueDate));
          }
          meetings.push(meeting);
        }
      }
    }
    return meetings;
}

// I'm certain this can be broken up into smaller, more descriptive methods.
// (It takes up half of the API file, after all)
export async function getMeetings(type) {

    var meetings = [];
    var user = await getCurrentUser('getAppointments');
    var pairs = await getPairsOf(user.Id);

    // Get appointments for each pair the user is a part of.
    for (var i = 0; i < pairs.length; i++) {
      const appointments = getAppointments(type, pairs[i].Id, user.Id, 'getMeetings');
      if (appointments.length !== 0) {

        // Add each appointment to the meetings array with other necessary data.
        for (var j = 0; j < appointments.length; j++) {
          var meeting = JSON.parse(JSON.stringify(appointments[j]));
          let date = new Date(meeting.ScheduledAt);
          let cur = new Date();
          
          //Check if Status needs to be updated due to this meeting happening.
          if (type === 'past' && cur > date && meeting.Status === 'Scheduled') {
            await updateAppointmentStatus(meeting.Id, 'Done', user.Id);
            meeting.Status = 'Done';
          }
          meeting.dateText = parseDateText(date);
          
          // Get mentor/mentee avatar, and mark whether this user is the mentor/mentee, and provide title/date text.
          if (pairs[i].MentorId === user.Id) {
            meeting.isMentor = true;
            meeting.titleText = "Mentee Meeting";
            const mentee = await getPairedUser(pairs[i].MenteeId, user.Id);
            meeting.Avatar = mentee.Avatar;
            meeting.summaryTitle = "Reflect on your conversation with " + mentee.FirstName + ":";
            assignMeetingStyle('mentee', meeting.Status, meeting);
          } else {
            meeting.isMentor = false;
            meeting.titleText = "Mentor Meeting";
            const mentor = await getPairedUser(pairs[i].MentorId, user.Id);
            meeting.Avatar = mentor.Avatar;
            meeting.summaryTitle = "Reflect on your conversation with " + mentor.FirstName + ":";
            assignmeetingStyle('mentor', meeting.Status, meeting);
          }
          meetings.push(meeting);
        }
      }
    }
    meetings.sort((a,b) => new Date(b.dateText) - new Date(a.dateText));
    return meetings;
}
