import express from 'express';
import { connectDB } from '../../lib/db.js';

const router = express.Router();

/**
 * Get all conversations for admin
 * GET /api/chat/conversations
 */
router.get('/conversations', async (req, res) => {
    try {
        const db = await connectDB();
        const messages = db.collection('messages');
        const users = db.collection('users');

        // Aggregate unique developer IDs from messages
        const developerIds = await messages.distinct('senderId', { senderId: { $ne: 'ADMIN' } });
        const developerIdsFromRecipient = await messages.distinct('recipientId', { recipientId: { $ne: 'ADMIN' } });

        const allDevIds = [...new Set([...developerIds, ...developerIdsFromRecipient])];

        const { ObjectId } = await import('mongodb');

        const conversations = await Promise.all(allDevIds.map(async (devId) => {
            let queryId;
            try { queryId = new ObjectId(devId); } catch (e) { queryId = devId; }

            const dev = await users.findOne({ _id: queryId });
            const lastMessage = await messages.findOne({
                $or: [
                    { senderId: 'ADMIN', recipientId: devId },
                    { senderId: devId, recipientId: 'ADMIN' }
                ]
            }, { sort: { timestamp: -1 } });

            if (!dev && !lastMessage) return null;

            return {
                _id: devId,
                email: dev?.email || 'Unknown User',
                lastMessage: lastMessage?.message || '',
                timestamp: lastMessage?.timestamp || new Date(0)
            };
        }));

        const filteredConversations = conversations.filter(c => c !== null);

        // Sort by most recent
        filteredConversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        res.json(filteredConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get chat history with a specific user
 * GET /api/chat/history/:userId
 */
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const db = await connectDB();
        const messages = db.collection('messages');

        // Fetch messages between admin (conceptually "system") and user
        // We'll use 'ADMIN' as the sender/recipient ID for the admin side
        const history = await messages.find({
            $or: [
                { senderId: 'ADMIN', recipientId: userId },
                { senderId: userId, recipientId: 'ADMIN' }
            ]
        })
            .sort({ timestamp: 1 })
            .limit(100) // Limit to last 100 messages
            .toArray();

        res.json(history);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
