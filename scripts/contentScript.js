console.log("Loaded");

let currentVideo = "";
let subs = " ";
let summary = "";
let quiz = "";
let quizData = "";
let language = "";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from 'youtube-transcript';

const genAI = new GoogleGenerativeAI(""); // Replace with your API key
const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

// Listener for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "NEW") {
        currentVideo = request.videoID;
        console.log("Transcript function started");
        (async () => {
            try {
                // Fetch transcript and store it in `subs`
                const transcriptData = await YoutubeTranscript.fetchTranscript(currentVideo);
                subs = transcriptData.map(entry => entry.text).join(" ");
                console.log("Transcript fetched");
            } catch (error) {
                console.error("Error fetching transcript or processing:", error);
                // No need to send a response here as this action is not initiated by the popup
            }
        })();
        return true;
    } else if (request.action === 'getSummary') {
        const language = request.language || 'English';
        // Acknowledge the request
        sendResponse({ status: "processing" });

        (async () => {
            try {
                const summaryText = await summarizeTranscript(language);
                console.log("Summary generated:", summaryText);
                // Send the summary back to the popup
                chrome.runtime.sendMessage({ action: 'summaryReady', summary: summaryText });
            } catch (error) {
                console.error("Error generating summary:", error);
                chrome.runtime.sendMessage({ action: 'summaryError', error: "Error generating summary." });
            }
        })();
        // No need to return true here since we've already sent a response
    } else if (request.action === 'getQuiz') {
        const language = request.language || 'English';
        // Acknowledge the request
        sendResponse({ status: "processing" });

        (async () => {
            try {
                quizData = await quizifyTranscript(language);
                console.log("Quiz Generated:", quizData);
                // Send the quiz back to the popup
                chrome.runtime.sendMessage({ action: 'quizReady', quiz: quizData });
            } catch (error) {
                console.error("Error generating quiz:", error);
                chrome.runtime.sendMessage({ action: 'quizError', error: "Error generating quiz." });
            }
        })();
        // No need to return true here since we've already sent a response
    } else if (request.action === 'submitQuiz') {
        const userAnswers = request.userAnswers;
        const results = processQuizAnswers(userAnswers);
        sendResponse({ results: results });
    }
    return true; // Indicate that we will send a response asynchronously
});

async function summarizeTranscript(language) {
    console.log("summarize loaded");
    if (!subs || subs.trim() === "") {
        console.error("No transcript available to summarize.");
        return "No transcript available.";
    }
    const prompt = "Summarize the content in key points and in the following language" + language + "so that a student can understand the concepts by just reading your summary and not watching the video. Make sure to check what language the user is asking for:\n\n" + subs ;
    try {
        const result = await generativeModel.generateContent(prompt);
        const summaryText = await result.response.text();
        return summaryText;
    } catch (error) {
        console.error("Error generating summary:", error);
        return "Error generating summary.";
    }
}

async function quizifyTranscript(language) {
    console.log("quizify loaded");
    if (!subs || subs.trim() === "") {
        console.error("No transcript available to generate quiz.");
        return "No transcript available.";
    }

    const prompt = `
    Provide me with 10 multiple-choice questions about this video in ${language}. 
    Return your answer entirely in the form of a JSON object. 
    The JSON object should have a key named "questions" which is an array of the questions. 
    Each quiz question should include the "query", "choices", "answer", and "explanation". 
    Do not include anything other than the JSON. Do not include comments or any additional text. Also make sure to see what language the user is asking for

    The JSON should look like:
    {
      "questions": [
        {
          "query": "Question text",
          "choices": ["Choice1", "Choice2", "Choice3", "Choice4"],
          "answer": 0, // Index of the correct choice
          "explanation": "Explanation text"
        },
        // ... more questions
      ]
    }

    Now, based on the following content, generate the quiz:

    ${subs}
    `;

    try {
        const result = await generativeModel.generateContent(prompt);
         quiz= result.response.text();
        console.log(quiz);
        const cleanedText = quiz.replace(/```json\n/g, '').replace(/```/g, '').trim();
        console.log(cleanedText);
        try {
            quizData = JSON.parse(cleanedText);
            console.log(quizData);
            return quizData;
        } catch (e) {
            console.error("Error parsing quiz JSON:", e);
            return "Error generating quiz.";
        }
    } catch (error) {
        console.error("Error generating quiz:", error);
        return "Error generating quiz.";
    }
}


function processQuizAnswers(userAnswers) {
    const results = [];

    quizData.questions.forEach((question, index) => {
        // Retrieve the user's answer for the current question
        const userAnswer = userAnswers[`question${index}`];
        console.log('User Answer:', userAnswer);

        // Retrieve the correct answer index for the current question
        const correctAnswer = question.answer;
        console.log('Correct Answer:', correctAnswer);

        // Create the result object for the current question
        const result = {
            query: question.query,
            // Get the text of the user's selected choice
            userChoice: question.choices[userAnswer],
            // Compare the user's answer to the correct answer
            isCorrect: userAnswer === correctAnswer.toString(),
            // Include the explanation from the current question
            explanation: question.explanation
        };
        console.log('Result:', result);

        results.push(result);
    });

    return results;
}