import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Endpoint to submit an experiment result
router.post('/submit', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { titrationData, calculatedConcentration, techniqueErrors, completionTimeSeconds } = req.body;

        // Default expected concentration
        const expectedConcentration = 0.1;

        // Grade logic mirroring the frontend grading.ts spec but processed on backend
        // 1. concentrationAccuracy (40 pts)
        const percentError = Math.abs(calculatedConcentration - expectedConcentration) / expectedConcentration * 100;
        let concentrationScore = 0;
        if (percentError <= 1) concentrationScore = 40;
        else if (percentError <= 2) concentrationScore = 35;
        else if (percentError <= 5) concentrationScore = 25;
        else concentrationScore = 10;

        // 2. dataQuality (30 pts)
        const dataPoints = Array.isArray(titrationData) ? titrationData.length : 0;
        let qualityScore = 0;
        if (dataPoints >= 30) qualityScore = 30;
        else if (dataPoints >= 20) qualityScore = 20;
        else if (dataPoints >= 10) qualityScore = 10;
        else qualityScore = 5;

        // 3. techniqueScore (20 pts)
        const numErrors = Array.isArray(techniqueErrors) ? techniqueErrors.length : 0;
        const techniqueScore = Math.max(0, 20 - (numErrors * 2));

        // 4. timeBonus (10 pts)
        const minutes = (completionTimeSeconds || 0) / 60;
        let timeBonus = 4; // Default > 45min
        if (minutes < 30) timeBonus = 10;
        else if (minutes <= 45) timeBonus = 7;

        const totalScore = concentrationScore + qualityScore + techniqueScore + timeBonus;

        // Create DB Entry
        const experiment = await prisma.experiment.create({
            data: {
                userId,
                score: totalScore,
                percentageError: percentError,
                feedback: techniqueErrors || [],
                titrationData: titrationData || [],
                calculatedConcentration,
                techniqueErrors: techniqueErrors || []
            }
        });

        res.status(201).json({
            id: experiment.id,
            score: totalScore,
            percentageError: percentError,
            breakdown: {
                concentrationScore,
                qualityScore,
                techniqueScore,
                timeBonus
            },
            feedback: techniqueErrors
        });
    } catch (error) {
        console.error('Submit experiment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to fetch user's past experiments
router.get('/mine', authenticateToken, async (req: AuthRequest, res: any) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const experiments = await prisma.experiment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                score: true,
                percentageError: true,
                calculatedConcentration: true,
                createdAt: true
            }
        });

        res.json(experiments);
    } catch (error) {
        console.error('Fetch experiments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
