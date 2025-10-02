import { GoogleGenAI, Type } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

//returns [{name,email,phone},[6 questions]]
// question = {question,difficulty,time}
export async function infoExtractionAndQuestionGeneration(file) {
  if (!file) {
    console.error('No file selected.');
    return;
  }


  try {
    const uploadedFile = await ai.files.upload({
      file: file,
      config: { mimeType: file.type },
    });


    const prompt = `Parse the attached resume file and extract the following fields: name, email, and phone number. 

    **Important extraction rules:**
    - Only extract a field if it is **explicitly written in the resume text itself**.
    - Do NOT infer or guess the name, email, or phone number from:
      - LinkedIn URLs
      - GitHub usernames
      - File names
      - Email handles
      - Image names
      - Any indirect reference or social media profile
    - If any field is **not explicitly mentioned** in the resume content, assign it a value of null.

    Next, generate six interview questions, 3 React and 3 Node.js, following these rules:
    
    - 2 Easy questions (1 React, 1 Node.js):
      * Questions must be answerable with one word or a very short phrase.
      * Time limit: 20 seconds each.
    
    - 2 Medium questions (1 React, 1 Node.js):
      * Questions require a short explanation or reasoning (one or two sentences).
      * Time limit: 60 seconds each.
    
    - 2 Hard questions (1 React, 1 Node.js):
      * Questions are debugging, code interpretation, or problem-solving type, presented as text (no code editor).
      * Time limit: 120 seconds each.
      * Important: Frame the questions to be more thinkable than type-heavy – i.e., avoid requiring long code-writing. Instead, emphasize logic, architecture understanding, or error diagnosis that the candidate can reason through and answer concisely within the time frame.
      * Questions should challenge depth of knowledge but allow for short or structured responses (e.g., picking the right explanation, identifying the bug, or selecting the best approach).
      
    Each question should be an object containing the following fields:
    - "question": the text of the question
    - "duration": the time limit in seconds (20, 60, or 120)
    - "difficulty": "easy", "medium", or "hard"
    
    The final output must be a single JSON array with two elements:
    1. At index 0: an object with the fields "name", "email", and "phone"
    2. At index 1: an array of 6 question objects as described above (in the order: easy React, easy Node, medium React, medium Node, hard React, hard Node)
    
    Do not return any text, explanation, or formatting outside of the array. The output must only be the raw JSON array, with no leading or trailing text or spacing.I need to input this response in JSON.parse() so dont include the backticks & json word in teh front and the backticks at the back of that array`;

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        oneOf: [
          {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, nullable: true },
              email: { type: Type.STRING, nullable: true },
              phone: { type: Type.STRING, nullable: true },
            },
            required: ["name", "email", "phone"],
            propertyOrdering: ["name", "email", "phone"],
          },
          {
            type: Type.ARRAY,
            minItems: 6,
            maxItems: 6,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                difficulty: {
                  type: Type.STRING,
                  enum: ["easy", "medium", "hard"],
                },
              },
              required: ["question", "duration", "difficulty"],
              propertyOrdering: ["question", "duration", "difficulty"],
            },
          },
        ],
      },
    };

    const filePart = {
      fileData: {
        mimeType: uploadedFile.mimeType,
        fileUri: uploadedFile.uri,
      },
    };

    const textPart = {
      text: prompt,
    };

    const contents = {
      parts: [filePart, textPart]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });
    const jsonText = response.text.replace('```json', '').replace('```', '')
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('Error during file upload or API request:', error);
    throw Error(error)
  }
}


export async function AI_ScoreGeneration(messages) {
  if (!messages || !Array.isArray(messages)) {
    console.error("No messages provided for scoring.");
    return null;
  }

  const conversationJson = JSON.stringify(messages, null, 2);

  const prompt = `
You are acting as an AI interview evaluator.

You are given a conversation log between the "system" (AI interviewer) and the "user" (candidate).
Each "system" message is a question, and the following "user" message is the candidate's answer.
Each message also contains metadata: the time allowed (duration) and the actual time taken (timeSpent).

Your task is to carefully evaluate each answer according to these rules:

### Evaluation Criteria
1. ✅ Correctness: Is the answer technically right or mostly accurate?
   - Easy: max 3 points
   - Medium: max 6 points
   - Hard: max 9 points

2. 💡 Clarity & Logic: Is the explanation logical, concise, and well-structured?
   - Easy: max 1 point
   - Medium: max 2 points
   - Hard: max 3 points

3. ⏱️ Completeness / Timeliness: Did they answer within time and address the full question (even partially)?
   - Easy: max 1 point
   - Medium: max 2 points
   - Hard: max 3 points

The score for easy,medium,hard question is 5,10,15 respectively 

### Required Output
You must return ONLY a raw JSON array (no extra text, no backticks).
The array must have exactly 3 elements:

- Index 0: An array of 6 objects, one for each question, each object containing:
  - "id" : question number number
  - "question": system question text
  - "answer": candidate's answer text
  - "difficulty": "easy" | "medium" | "hard"
  - "Duration": number (duration)
  - "timeSpent": number (timeSpent)
  - "obtained_score": number
  - "maximum_score":number
- Index 1: Total score obtained by the candidate (sum of all 6 totals), out of 60.

- Index 2: A short summary (2–3 sentences) describing the candidate’s overall performance and skill level.

### Example Output Structure
[
  [
    {
      "id":1,
      "question": "What is React?",
      "answer": "React is a JS library",
      "difficulty": "easy",
      "Duration": 20,
      "timeSpent":16,
      "obtained_score": 4,
      "maximum_score": 5
    }
  ],
  42,
  "The candidate demonstrated solid React fundamentals but struggled with deeper Node.js concepts."
]

### Conversation Data
Use the following conversation JSON as your input:
${conversationJson}
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      oneOf: [
        {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              difficulty: {
                type: Type.STRING,
                enum: ["easy", "medium", "hard"],
              },
              Duration: { type: Type.NUMBER },
              timeSpent: { type: Type.NUMBER },
              obtained_score: { type: Type.NUMBER },
              maximum_score: { type: Type.NUMBER },
            },
            required: [
              "id",
              "question",
              "answer",
              "difficulty",
              "Duration",
              "timeSpent",
              "obtained_score",
              "maximum_score"
            ],
          },
        },
        { type: Type.NUMBER },
        { type: Type.STRING },
      ],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const jsonText = response.text;
    const result = JSON.parse(jsonText);

    // result[0] = detailed question evaluations
    // result[1] = total score
    // result[2] = summary string
    return result
  } catch (error) {
    console.error("Error during scoring:", error);
  }
}