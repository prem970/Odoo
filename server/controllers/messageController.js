const { getDb } = require('../config/db');

const sendMessage = async (req, res) => {
    const { content } = req.body;
    const { id: sender_id, role: sender_role } = req.user;

    try {
        const db = getDb();
        const result = await db.query(
            'INSERT INTO messages (sender_id, content, status) VALUES ($1, $2, $3) RETURNING *',
            [sender_id, content, 'pending']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending message' });
    }
};

const getUserMessages = async (req, res) => {
    const { id: userId } = req.user;

    try {
        const db = getDb();
        const result = await db.query(
            'SELECT * FROM messages WHERE sender_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user messages' });
    }
};

const getAllMessagesForAdmin = async (req, res) => {
    try {
        const db = getDb();
        const result = await db.query(
            `SELECT m.*, u.full_name as sender_name 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       ORDER BY m.created_at DESC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching messages for admin' });
    }
};

const updateMessage = async (req, res) => {
    const { id } = req.params;
    const { content, status } = req.body;

    try {
        const db = getDb();
        const result = await db.query(
            'UPDATE messages SET content = COALESCE($1, content), status = COALESCE($2, status) WHERE id = $3 RETURNING *',
            [content, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating message' });
    }
};

module.exports = {
    sendMessage,
    getUserMessages,
    getAllMessagesForAdmin,
    updateMessage
};
