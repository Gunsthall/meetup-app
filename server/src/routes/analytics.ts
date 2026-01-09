import { Router, Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService.js';

const router = Router();

/**
 * GET /v1/analytics/stats
 * Get usage statistics
 *
 * Returns:
 * - Total sessions, joins, completions
 * - Today's stats
 * - Last 7 days breakdown
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await analyticsService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * GET /v1/analytics/events
 * Get recent events (last 24 hours)
 *
 * Query params:
 * - limit: Number of events to return (default: 100)
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const events = await analyticsService.getRecentEvents(limit);
    res.json({ events, count: events.length });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * GET /v1/analytics/anomalies
 * Detect unusual usage patterns
 *
 * Returns:
 * - suspiciousActivity: boolean
 * - reason: string (if suspicious)
 * - details: object with specifics
 */
router.get('/anomalies', async (req: Request, res: Response) => {
  try {
    const anomalies = await analyticsService.detectAnomalies();
    res.json(anomalies);
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    res.status(500).json({ error: 'Failed to detect anomalies' });
  }
});

/**
 * GET /v1/analytics/dashboard
 * Get combined dashboard data
 *
 * Returns all analytics data in one response
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [stats, recentEvents, anomalies] = await Promise.all([
      analyticsService.getStats(),
      analyticsService.getRecentEvents(50),
      analyticsService.detectAnomalies(),
    ]);

    res.json({
      stats,
      recentEvents,
      anomalies,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
