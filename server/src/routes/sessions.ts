import { Router, Request, Response } from 'express';
import { sessionService } from '../services/sessionService.js';
import { isValidCode } from '../utils/codeGenerator.js';
import { requireApiKey } from '../middleware/apiKeyAuth.js';

const router = Router();

/**
 * POST /sessions
 * Create new session (driver initiates) - REQUIRES AUTH
 */
router.post('/', requireApiKey(), async (req: Request, res: Response) => {
  try {
    const { driverName, bookingRef } = req.body;

    if (!driverName || typeof driverName !== 'string') {
      return res.status(400).json({
        error: 'driverName is required and must be a string',
      });
    }

    const session = await sessionService.createSession(driverName.trim());

    // Generate share URL (frontend URL)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${frontendUrl}/${session.code}`;

    return res.status(201).json({
      code: session.code,
      shareUrl,
      visual: session.visual,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * GET /sessions/:code
 * Get session info (validates code exists)
 */
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    if (!isValidCode(code)) {
      return res.status(400).json({ error: 'Invalid session code format' });
    }

    const session = await sessionService.getSession(code);

    if (!session) {
      return res.status(404).json({
        exists: false,
        error: 'Session not found',
      });
    }

    return res.json({
      exists: true,
      driverName: session.driver.name,
      visual: session.visual,
      status: session.status,
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return res.status(500).json({ error: 'Failed to get session' });
  }
});

/**
 * POST /sessions/:code/join
 * Passenger joins session
 */
router.post('/:code/join', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    if (!isValidCode(code)) {
      return res.status(400).json({ error: 'Invalid session code format' });
    }

    const session = await sessionService.getSession(code);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    if (session.status === 'expired' || session.status === 'met') {
      return res.status(410).json({
        success: false,
        error: 'Session has ended',
      });
    }

    return res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Error joining session:', error);
    return res.status(500).json({ error: 'Failed to join session' });
  }
});

/**
 * POST /sessions/:code/end
 * Mark session as completed
 */
router.post('/:code/end', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { role } = req.body;

    if (!isValidCode(code)) {
      return res.status(400).json({ error: 'Invalid session code format' });
    }

    if (role !== 'driver' && role !== 'passenger') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const session = await sessionService.getSession(code);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    await sessionService.markAsMet(code);

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return res.status(500).json({ error: 'Failed to end session' });
  }
});

export default router;
