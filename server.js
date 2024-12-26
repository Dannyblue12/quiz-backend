const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const fs = require("fs");
const cors = require("cors");

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for cross-origin requests

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to the Quiz Backend!");
});

// Seed quiz data to Firestore
app.post("/seed-data", async (req, res) => {
    try {
        // Read data from the local JSON file
        const rawData = fs.readFileSync("./seed-data.json");
        const quizData = JSON.parse(rawData);

        // Save partial quiz
        await db.collection("quizzes").doc("partial").set({
            questions: quizData.partial
        });

        // Save complete quiz
        await db.collection("quizzes").doc("complete").set({
            questions: quizData.complete
        });

        res.json({ success: true, message: "Quiz data seeded successfully" });
    } catch (error) {
        console.error("Error seeding quiz data:", error.message);
        res.status(500).json({ success: false, message: "Error seeding quiz data" });
    }
});

// Fetch partial quiz
app.get("/quizzes/partial", async (req, res) => {
    try {
        const doc = await db.collection("quizzes").doc("partial").get();
        if (doc.exists) {
            res.json({ success: true, questions: doc.data().questions });
        } else {
            res.status(404).json({ success: false, message: "Partial quiz not found" });
        }
    } catch (error) {
        console.error("Error fetching partial quiz:", error.message);
        res.status(500).json({ success: false, message: "Error fetching partial quiz" });
    }
});

// Fetch complete quiz
app.get("/quizzes/complete", async (req, res) => {
    try {
        const doc = await db.collection("quizzes").doc("complete").get();
        if (doc.exists) {
            res.json({ success: true, questions: doc.data().questions });
        } else {
            res.status(404).json({ success: false, message: "Complete quiz not found" });
        }
    } catch (error) {
        console.error("Error fetching complete quiz:", error.message);
        res.status(500).json({ success: false, message: "Error fetching complete quiz" });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
