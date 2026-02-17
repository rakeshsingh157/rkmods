import express from 'express';

const router = express.Router();

// Shared auth routes
router.post('/refresh', (req, res) => {
    res.json({ message: 'Token refresh endpoint - to be implemented' });
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Logout endpoint - to be implemented' });
});

export default router;
