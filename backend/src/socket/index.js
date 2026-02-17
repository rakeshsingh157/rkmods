import { Server } from 'socket.io';
import { connectDB } from '../lib/db.js';

export const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join_chat', ({ userId, role }) => {
            if (role === 'ADMIN') {
                socket.join('admin_room');
                console.log(`Socket ${socket.id} joined admin_room`);
            } else {
                socket.join(`user_${userId}`);
                console.log(`Socket ${socket.id} joined user_${userId}`);
            }
        });

        socket.on('send_message', async (data) => {
            try {
                const { senderId, recipientId, message, senderRole } = data;

                // Save to DB
                const db = await connectDB();
                const messages = db.collection('messages');

                const newMessage = {
                    senderId,
                    recipientId,
                    message,
                    senderRole,
                    timestamp: new Date()
                };

                await messages.insertOne(newMessage);

                // Emit to recipient
                if (recipientId === 'ADMIN') {
                    io.to('admin_room').emit('receive_message', newMessage);
                } else {
                    io.to(`user_${recipientId}`).emit('receive_message', newMessage);
                }

                // Also emit back to sender (for confirmation/multi-device)
                if (senderId === 'ADMIN') {
                    io.to('admin_room').emit('receive_message', newMessage);
                } else {
                    io.to(`user_${senderId}`).emit('receive_message', newMessage);
                }

            } catch (error) {
                console.error('Socket message error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};
