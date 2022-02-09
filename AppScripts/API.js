



// import {AsyncStorage} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLocalUser, setLocalUser, url, getToken, setToken, getLinkedInToken, isUserTokenPresent, 
  debug, debugGlobals, addDebugAppointment, addDebugSummary, debugUpdatePrivacy, debugUpdateAppointmentStatus} from './globals.js';
import {parseDateText, parseSimpleDateText, capitalize} from './Helpers.js';
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

    if (debug) {
      return debugGlobals.topics.find((topic) => {return topic.ActiveTopic == 1});
    }

    const topicRes = await fetch(url + '/topic/' + topicId + '/' + await getToken('retTopic'), {
      method: 'GET'
    });
    const topicPayload = await topicRes.json();
    var topic = JSON.parse(JSON.stringify(topicPayload["recordset"][0]));
    topic.DueDateText = parseDateText(new Date(topic["DueDate"]));
    topic.CreatedText = parseSimpleDateText(new Date(topic["Created"]));
    return topic;
}

// Gets all pairs containing the given user as a mentor, then gets a list of mentees using those pairs.
function assignMenteeDecorations(mentee) {
  mentee.homeBoxStyle = styles.homeMenteeBox;
  mentee.contactButtonStatus = true;
  mentee.contactButtonStyle = styles.hiddenButton;
}
export async function getMenteesOf (userId) {

    if (debug) {
      var relevantPairs = debugGlobals.pairs.filter((pair) => {return pair.MentorId == userId});
      const mentees = []
      for (let i = 0; i < relevantPairs.length; i++) {
        const mentee = debugGlobals.users.find((user) => {return relevantPairs[i].MenteeId == user.Id;});
        mentee = {...mentee};
        assignMenteeDecorations(mentee);
        mentees.push(mentee);
      }
      return mentees;
    }

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
function assignMentorDecorations(mentor) {
  mentor.homeBoxStyle = styles.homeMentorBox;
  mentor.contactButtonStatus = false;
  mentor.contactButtonStyle = styles.summaryButton;
}
export async function getMentorsOf (userId) {

    if (debug) {
      var relevantPairs = debugGlobals.pairs.filter((pair) => {return pair.MenteeId == userId});
      const mentors = []
      for (let i = 0; i < relevantPairs.length; i++) {
        const mentor = debugGlobals.users.find((user) => {return relevantPairs[i].MentorId == user.Id;});
        mentor = {...mentor};
        assignMentorDecorations(mentor);
        mentors.push(mentor);
      }
      return mentors;
    }

    const pairs = await getMPairsOf('mentee', userId);
    console.log("getMentorsOf: ", pairs);
    const mentors = [];
    for (var i = 0; i < pairs.length; i++) {
      const index = i;
      const mentor = await getPairedUser(pairs[index]["MentorId"], userId);
      assignMentorDecorations(mentor);
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

  if (debug) {
    // console.log("Debug - getPairsOf", debugGlobals.pairs.length);
    return debugGlobals.pairs.filter((pair) => {return pair.MentorId == userId || pair.MenteeId == userId;});
  }

  const pairsres = await fetch(url + '/pair/' + userId + '/' + await getToken('getPairsOf'), {
    method: 'GET'
  });
  const pairsPayload = await pairsres.json();
  return pairsPayload["recordset"];
}

export async function getPair(mentorId, menteeId) {

  if (debug) {
    return debugGlobals.pairs.find((pair) => {return pair.MentorId == mentorId && pair.MenteeId == menteeId;});
  }

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

  if (debug) {
    return debugGlobals.users.find((user) => {return user.Id == targetId;});
  }

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

  if (debug) {
    const user = debugGlobals.users[0];
    console.log("getCurrentUser (" + source + ")");
    return user;
  }

  const userPayload = await ensureUserExists(source);
  return createLocalUser(userPayload);
}

// Gets a user based on a certain user id.
export async function getUserByID(id) {

    if (debug) {
      const user = debugGlobals.users.find((user) => {return user.Id == id;});
      setLocalUser(user);
      return user;
    }

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

  if (debug) {
    return debugGlobals.userAuths[0];
  }

  const authres = await fetch(url + '/user/access/' + await getLinkedInToken('getAuthorizedUser'), {
    method: 'GET'
  });
  if (authres.status != 200){
    console.log("(" + source + ") Non-200 User Authorization Payload Received: ", authres);
    return null;
  }
  const authPayload = await authres.json();
  return authPayload;
}

// Fetches a User Payload using a User Email.
export async function getUserIdPayloadByEmail(email) {

    if (debug) {
      return debugGlobals.users.find((user) => {return user.Email == email;}).Id;
    }

    var fetchUrl = url + '/user/email/' + email + '/' + await getToken('getUserIdPayloadByEmail');
    const userres = await fetch(fetchUrl, {
      method: 'GET'
    });
    const userPayload = await userres.json();
    return userPayload;
}

// Fetches a User Payload using a User ID.
export async function getUserPayloadByID(id) {

    if (debug){
      return debugGlobals.users.find((user) => {return user.Id == id;});
    }

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

// Create Meeting
export async function createMeeting(mentorId, menteeId, scheduledAt) {

  console.log("Getting meeting topic and pair.");
  const topicId = (await getCurrentTopic()).Id;
  console.log("Gotten.", topicId);
  const pairId = (await getPair(mentorId, menteeId)).Id;
  console.log("Gotten.", pairId);

  if (debug) {
    addDebugAppointment(pairId, topicId, new Date(scheduledAt).toString());
    return;
  }

  const userId = (await getLocalUser()).Id;
  const userToken = await getToken("createMeeting");

  // Create appointment.
  console.log("Posting appointment:", pair.Id, scheduledAt, topic.Id, userId, userToken);
  const post = await fetch(url + '/create-appointment', {
    method: 'POST',
    body: JSON.stringify({
      PairId: pairId,
      ScheduledAt: scheduledAt,
      TopicId: topicId,
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
export async function createSummary(appId, curSummary, userID) {

  if (debug) {
    addDebugSummary(appId, curSummary, userID);
    return;
  }

  const postres = fetch (url + '/create-summary' + '/' + await getToken('createSummary'), {
    method: 'POST',
    body: JSON.stringify({
      AppointmentId: appId,
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

export async function updateSummary(appId, curSummary, userId) {

  if (debug) {
    const summary = debugGlobals.summaries.find((summary) => {
      return summary.AppointmentId == appId && summary.UserId == userId;
    })
    summary.SummaryText = curSummary;
    return;
  }

  const postres = fetch (url + '/update-summary', {
    method: 'POST',
    body: JSON.stringify({
      AppointmentId: appId,
      SummaryText: curSummary,
      UserId: userId
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

export async function getSummary(id) {

  if (debug) {
    return debugGlobals.summaries.find((summary) => { return summary.Id == id; });
  }

  const summaryres = await fetch(url + '/summary/appointment/' + id, {
    method: 'GET'
  });
  const summaryPayload = await summaryres.json();
  var summary = summaryPayload['recordset'][0].SummaryText;
  return summary;
}

export async function deleteSummary(appId, userId) {

  if (debug) {
    const summary = debugGlobals.summaries.findIndex((summary) => {
      return summary.AppointmentId && summary.UserId; 
    });
    const index = debugGlobals.summaries.indexOf(summary);
    debugGlobals.summaries.splice(index, 1);
    return;
  }

  const postres = fetch (url + '/delete-summary', {
    method: 'POST',
    body: JSON.stringify({
      AppointmentId: appId,
      UserId: userId,
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

  if (debug) {
    const user = debugGlobals.users.find((usr) => {return usr.Email == email;});
    debugUpdatePrivacy(user.Id, privacyAccepted);
    return;
  }

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

    if (debug) {
      return debugGlobals.userContacts.filter((cInfo) => {return cInfo.UserId == userID;});
    }

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

  if (debug) {
    return debugGlobals.topics.find((topic) => {return topic.ActiveTopic == 1;});
  }

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

  if (debug) {
    const topics = debugGlobals.topics;
    for (let i = 0; i < topics.length; i++) {
      let topic = topics[i];
      topic.DueDateText = parseDateText(new Date(topic.DueDate));
      topic.CreatedText = parseSimpleDateText(new Date(topic.Created));
    }
    return topics;
  }

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

  if (debug) {
    const topic = debugGlobals.topics.find((topic) => {return topic.Id == topicId;});
    topic.DueDateText = parseDateText(new Date(topic.DueDate));
    topic.CreatedText = parseSimpleDateText(new Date(topic.Created));
    return topic;
  }

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

  if (debug) {
    return debugGlobals.appointments.filter((app) => {
      return app.PairId == pairId && (app.Status == "Done" || app.Status == "Completed" || app.Status == "Canceled");
    });
  }

  return await getAppointmentsFor('past', pairId, userId, source);
}

// Gets upcoming appointments
export async function getUpcomingAppointments(pairId, userId, source='unknownUpcoming') {

  if (debug) {
    return debugGlobals.appointments.filter((app) => {
      return app.PairId == pairId && (app.Status == "Pending" || app.Status == "Scheduled");
    });
  }

  return await getAppointmentsFor('upcoming', pairId, userId, source);
}

export async function getAppointmentsFor(type='upcoming', pairId, userId, source='unknown') {

  if (debug) {
    switch (type) {
      case 'upcoming':
        return await getUpcomingAppointments(pairId, userId, source);
      case 'past':
        return await getPastAppointments(pairId, userId, source);
    }
    return [];
    // const isPast = (app) => {
    //   const appDate = app.ScheduledAt;
    //   console.log('past date? ', appDate);
    //   return type == 'past' && appDate <= Date();};
    // const isUpcoming = (app) => {return type == 'upcoming' && app.ScheduledAt > Date();};
    // return debugGlobals.appointments.filter((app) => {return app.PairId == pairId && (isPast(app) || isUpcoming(app));});
  }

  const res = await fetch(url + '/appointment/' + type + '/' + pairId + '/' + userId + '/' + await getToken('checkMeetingsHome(pastapts)'), {
    method: 'GET'
  });
  const payload = await res.json();
  return payload.recordset;
}

// Updates appointment status
export async function updateAppointmentStatus(meetingId, status, userId) {

  if (debug) {
    debugUpdateAppointmentStatus(meetingId, status);
    return;
  }

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

    console.log('checkMeetings');
    var meetings = [];
    var user = await getCurrentUser('checkMeetings');
    // console.log('got user');
    var pairs = await getPairsOf(user.Id);
    // console.log('got user and pairs');
    // console.log(user);
    // console.log(pairs);

    // Get appointments for each pair the user is a part of.
    for (var i = 0; i < pairs.length; i++) {
      // console.log('Get appointments for pair ' + i)
      const pairId = pairs[i].Id;
      const userId = user.Id;
      const menteeId = pairs[i].MenteeId;
      const pastAppointments = await getPastAppointments(pairId, userId, 'checkMeetings');
      // console.log('got past appointments');
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
            // console.log('AppointmentStatus updated');
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
            meeting.topic.DueDateText = parseDateText(new Date(meeting.topic.DueDate));
          }
          meetings.push(meeting);
        }
      }
    }
    return meetings;
}

// I'm certain this can be broken up into smaller, more descriptive methods.
// (It takes up half of the API file, after all)

export function assignMeetingUser(meeting, type='mentor', otherUser) {
  meeting.isMentor = type == 'mentor';
  meeting.titleText = capitalize(type) + " Meeting";
  meeting.Avatar = otherUser.Avatar;
  meeting.summaryTitle = "Reflect on your conversation with " + otherUser.FirstName + ":";
  assignMeetingStyle(type, meeting.Status, meeting);
}

export async function getAppointments(type) {

    var meetings = [];
    var user = await getCurrentUser('getAppointments');
    var pairs = await getPairsOf(user.Id);

    // Get appointments for each pair the user is a part of.
    for (var i = 0; i < pairs.length; i++) {
      const appointments = await getAppointmentsFor(type, pairs[i].Id, user.Id, 'getMeetings');
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
            const mentee = await getPairedUser(pairs[i].MenteeId, user.Id);
            assignMeetingUser(meeting, 'mentee', mentee);
          } else {
            const mentor = await getPairedUser(pairs[i].MentorId, user.Id);
            assignMeetingUser(meeting, 'mentor', mentor);
          }
          meetings.push(meeting);
        }
      }
    }
    meetings.sort((a,b) => new Date(b.dateText) - new Date(a.dateText));
    return meetings;
}
