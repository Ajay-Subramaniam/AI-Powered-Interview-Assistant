//schema of InterviewDB
// objectStore : interviewee 
// {
//     id, 
//     profile: { name, phone, email },
//     resume ,
//     questions:[],
//     que_ans_score = [
//       {
//         id,
//         question,
//         candidate_answer,
//         difficulty: "easy" | "medium" | "hard",
//         timeLimit,
//         spentTime,
//         score
//       }
//     ],
//     totalScore ,
//     messages: [],       
//     aiSummary,
//     section,
//     subSection,
//     timeSpent,
//     duration,
//     addedAt,
//     currentUserResponse,
//   }

//   objectStore : onGoing
//   { intervieweeId}

import { openDB } from "idb";
const DB_NAME = "InterviewDB";
const DB_VERSION = 1;
let dbInstance = null;

export async function initDB() {
  if (!dbInstance) {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("interviewees")) {
          db.createObjectStore("interviewees", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("ongoing_interview")) {
          db.createObjectStore("ongoing_interview", {
            keyPath: "id",
          });
        }
      },
    });
  }
  return dbInstance;
}


export async function addInterviewee(interviewee) {
  try {
    const db = await initDB();
    return await db.put("interviewees", {
      ...interviewee,
      addedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error adding interviewee:", err);
    window.location.reload()
  }
}

export async function getInterviewee(id) {
  try {
    const db = await initDB();
    return await db.get("interviewees", id);
  } catch (err) {
    console.error("Error fetching interviewee:", err);
    window.location.reload()
  }
}

export async function updateTimeSpentInDb(id,timeSpent) {
  try {
    const db = await initDB();
    let interviewee =  await db.get("interviewees", id);
    if (!interviewee) {
      throw new Error("Interviewee not found");
    }
    interviewee.timeSpent = timeSpent
    await db.put("interviewees", interviewee);
  } catch (err) {
    console.error("Error in incrementing time spent:", err);
    window.location.reload()
  }
}

export async function updateCurrentUserResponseInDb(id,currentUserResponse) {
  try {
    const db = await initDB();
    let interviewee =  await db.get("interviewees", id);
    if (!interviewee) {
      throw new Error("Interviewee not found");
    }
    interviewee.currentUserResponse = currentUserResponse
    await db.put("interviewees", interviewee);
  } catch (err) {
    console.error("Error in updating current user response:", err);
    window.location.reload()
  }
}

export async function updateDurationInDb(id,duration) {
  try {
    const db = await initDB();
    let interviewee =  await db.get("interviewees", id);
    if (!interviewee) {
      throw new Error("Interviewee not found");
    }
    interviewee.duration = duration
    await db.put("interviewees", interviewee);
  } catch (err) {
    console.error("Error in updating duration:", err);
    window.location.reload()
  }
}

export async function updateMessageInDb(id,msg) {
  try {
    const db = await initDB();
    let interviewee =  await db.get("interviewees", id);
    if (!interviewee) {
      throw new Error("Interviewee not found");
    }
    interviewee.messages = [...interviewee.messages,msg]
    await db.put("interviewees", interviewee);
  } catch (err) {
    console.error("Error in updating messages in db:", err);
    window.location.reload()
  }
}

export async function incrementSectionInDb(id) {
  try {
    const db = await initDB();
    let interviewee =  await db.get("interviewees", id);
    if (!interviewee) {
      throw new Error("Interviewee not found");
    }
    interviewee.section++
    interviewee.subSection = -1
    await db.put("interviewees", interviewee);
  } catch (err) {
    console.error("Error in incrementing section:", err);
    window.location.reload()
  }
}

export async function incrementSubSectionInDb(id) {
  try {
    const db = await initDB();
    let interviewee =  await db.get("interviewees", id);
    if (!interviewee) {
      throw new Error("Interviewee not found");
    }
    interviewee.subSection++
    await db.put("interviewees", interviewee);
  } catch (err) {
    console.error("Error in incrementing subsection:", err);
    window.location.reload()
  }
}

export async function updateProfileInDb(id,profile) {
  try {
    const db = await initDB();
    let interviewee =  await db.get("interviewees", id);
    if (!interviewee) {
      throw new Error("Interviewee not found");
    }
    interviewee.profile = profile
    await db.put("interviewees", interviewee);
  } catch (err) {
    console.error("Error in updating profile:", err);
    window.location.reload()
  }
}

export async function updateEvaluationResultInDb(id,que_ans_score,totalScore,aiSummary) {
  try {
    const db = await initDB();
    let interviewee =  await db.get("interviewees", id);
    if (!interviewee) {
      throw new Error("Interviewee not found");
    }
    interviewee.que_ans_score = que_ans_score
    interviewee.totalScore = totalScore
    interviewee.aiSummary = aiSummary
    await db.put("interviewees", interviewee);
  } catch (err) {
    console.error("Error in updating evalution result:", err);
    window.location.reload()
  }
}

export async function getAllInterviewees() {
  try {
    const db = await initDB();
    return await db.getAll("interviewees");
  } catch (err) {
    console.error("Error fetching all interviewees:", err);
    window.location.reload()
  }
}

export async function setOngoingInterview(id) {
  try {
    const db = await initDB();
    return await db.put("ongoing_interview", {
      id,
    });
  } catch (err) {
    console.error("Error setting ongoing interview:", err);
    window.location.reload()
  }
}

export async function clearOngoingInterview(id) {
  try {
    const db = await initDB();
    return await db.delete("ongoing_interview", id);
  } catch (err) {
    console.error("Error clearing ongoing interview:", err);
    window.location.reload()
  }
}

export async function getAllOngoingInterviews() {
  try {
    const db = await initDB();
    return await db.getAll("ongoing_interview");
  } catch (err) {
    console.error("Error fetching all ongoing interviews:", err);
    window.location.reload()
  }
}
