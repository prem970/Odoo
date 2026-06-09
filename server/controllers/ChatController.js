const OpenAI = require("openai");
const { getDb } = require('../config/db');

const chat = async (req, res) => {
    try {
        const { messages } = req.body;
        const userId = req.user ? req.user.id : null;

        let contextPrompt = "";
        if (userId) {
            try {
                const db = getDb();

                const userRes = await db.query('SELECT full_name, role, points FROM users WHERE id = $1', [userId]);
                const user = userRes.rows[0] || {};

                const enrollRes = await db.query(`
                    SELECT c.title, e.progress 
                    FROM enrollments e 
                    JOIN courses c ON e.course_id = c.id 
                    WHERE e.user_id = $1 AND c.published = true
                `, [userId]);
                const enrollments = enrollRes.rows;

                const assignRes = await db.query(`
                    SELECT a.title, a.due_date 
                    FROM assignments a
                    LEFT JOIN submissions s ON a.id = s.assignment_id AND s.user_id = $1
                    WHERE s.id IS NULL
                    LIMIT 3
                `, [userId]);
                const assignments = assignRes.rows;

                const liveRes = await db.query(`
                    SELECT ls.title, ls.start_time 
                    FROM live_sessions ls
                    WHERE ls.start_time > now()
                    ORDER BY ls.start_time ASC
                    LIMIT 2
                `);
                const liveSessions = liveRes.rows;

                contextPrompt = `
User Context:
- Name: ${user.full_name} (${user.role})
- Points: ${user.points}
- Enrolled Courses: ${enrollments.map(e => `${e.title} (${e.progress}%)`).join(', ') || "None"}
- Pending Assignments: ${assignments.map(a => `${a.title} (Due: ${new Date(a.due_date).toLocaleDateString()})`).join(', ') || "None"}
- Upcoming Live Classes: ${liveSessions.map(l => `${l.title} (at ${new Date(l.start_time).toLocaleString()})`).join(', ') || "None"}
`;
            } catch (err) {
                console.error("Context fetch error (non-fatal):", err.message);
            }
        }

        const apiKey = process.env.GROK_API_KEY;
        if (!apiKey || apiKey.includes('YOUR_GROK_API_KEY') || apiKey.length < 10) {
            console.log("Using Mock AI (Key missing or invalid)");
            return res.json(getMockResponse(messages, contextPrompt));
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.x.ai/v1",
        });

        const completion = await openai.chat.completions.create({
            model: "grok-beta",
            messages: [
                {
                    role: "system",
                    content: `You are LearnSphere AI. Assist students briefly. ${contextPrompt}`
                },
                ...messages
            ],
        });

        res.json(completion.choices[0].message);

    } catch (error) {
        console.error("Critical Chat Error:", error.message);
        try {
            res.json(getMockResponse(req.body.messages || []));
        } catch (e) {
            res.status(500).json({ error: "Service unavailable." });
        }
    }
};

const getMockResponse = (messages, context = "") => {
    const lastMsg = messages[messages.length - 1].content.toLowerCase();

    const pointsMatch = context.match(/Points: (\d+)/);
    const userPoints = pointsMatch ? pointsMatch[1] : '0';

    let content = "I'm currently running in demo mode (Mock AI). Add your Grok API key to unlock full potential!";

    if (lastMsg.includes('hello') || lastMsg.includes('hi')) {
        content = `Hello! I see you have ${userPoints} points. I can help you navigate your courses or assignments.`;
    } else if (lastMsg.includes('course') || lastMsg.includes('learn')) {
        content = "You are currently enrolled in items listed in your dashboard. Check 'My Learning' for details.";
        if (context.includes('Enrolled Courses:')) {
            const courses = context.split('Enrolled Courses:')[1].split('Pending Assignments:')[0].trim();
            content += ` Your active courses are: ${courses}`;
        }
    } else if (lastMsg.includes('assignment') || lastMsg.includes('work')) {
        if (context.includes('Pending Assignments:')) {
            const asmiso = context.split('Pending Assignments:')[1].split('Platform Capabilities:')[0].trim();
            content = `Here are your pending assignments: ${asmiso}`;
        } else {
            content = "You can view and submit your work in the 'Assignments' section.";
        }
    } else if (lastMsg.includes('help')) {
        content = "I can help you find your courses, quizzes, or profile settings. Try asking 'What courses am I taking?'";
    } else if (lastMsg.includes('badge') || lastMsg.includes('rank')) {
        content = `You have ${userPoints} total points. View your full achievements in the User Profile.`;
    } else {
        content = "I didn't quite catch that. Since I'm in demo mode, try asking about 'courses', 'assignments', or 'profile'.";
    }

    return { role: "assistant", content };
};

module.exports = { chat };
