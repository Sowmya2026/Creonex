const { db } = require('../config/firebase-admin');
const firestoreService = require('../services/firestore.service');

/**
 * @desc    Track visitor
 * @route   POST /api/visitors/track
 * @access  Public
 */
exports.trackVisitor = async (req, res) => {
    try {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const { userAgent, page } = req.body;

        // Query for existing visitor by IP
        const existingVisitors = await firestoreService.query('visitors', [
            ['ip', '==', ip]
        ]);

        let visitor;
        const timestamp = new Date();

        if (existingVisitors.length > 0) {
            // Update existing visitor
            visitor = existingVisitors[0];
            const visitCount = (visitor.visitCount || 0) + 1;
            const visits = visitor.visits || [];
            visits.push({ page: page || '/', timestamp });

            await firestoreService.update('visitors', visitor.id, {
                visitCount,
                lastVisit: timestamp,
                visits,
                userAgent: userAgent || visitor.userAgent
            });

            visitor = { ...visitor, visitCount, lastVisit: timestamp };
        } else {
            // Create new visitor
            visitor = await firestoreService.create('visitors', {
                ip,
                userAgent,
                visitCount: 1,
                firstVisit: timestamp,
                lastVisit: timestamp,
                visits: [{ page: page || '/', timestamp }]
            });
        }

        res.status(200).json({ success: true, count: visitor.visitCount });
    } catch (error) {
        console.error('Tracking Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get visitor statistics
 * @route   GET /api/visitors/stats
 * @access  Private
 */
exports.getStats = async (req, res) => {
    try {
        // Get all visitors
        const visitors = await firestoreService.getAll('visitors');

        const totalVisitors = visitors.length;

        // Calculate total page views
        let totalPageViews = 0;
        visitors.forEach(visitor => {
            totalPageViews += (visitor.visits || []).length;
        });

        // Active users (last 15 mins)
        const activeThreshold = new Date(Date.now() - 15 * 60 * 1000);
        const activeUsers = visitors.filter(visitor => {
            const lastVisit = visitor.lastVisit?.toDate ? visitor.lastVisit.toDate() : new Date(visitor.lastVisit);
            return lastVisit >= activeThreshold;
        }).length;

        res.status(200).json({
            totalVisitors,
            totalPageViews,
            activeUsers
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get all visitors
 * @route   GET /api/visitors
 * @access  Private
 */
exports.getVisitors = async (req, res) => {
    try {
        const visitors = await firestoreService.getAll('visitors', {
            orderBy: ['lastVisit', 'desc'],
            limit: 100
        });

        res.status(200).json(visitors);
    } catch (error) {
        console.error('Get Visitors Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get analytics data for charts
 * @route   GET /api/visitors/analytics
 * @access  Private
 */
exports.getAnalytics = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // Get all visitors
        const visitors = await firestoreService.getAll('visitors');

        // Process visits by date
        const visitsByDate = {};

        visitors.forEach(visitor => {
            (visitor.visits || []).forEach(visit => {
                const visitDate = visit.timestamp?.toDate ? visit.timestamp.toDate() : new Date(visit.timestamp);

                if (visitDate >= sevenDaysAgo) {
                    const dateStr = visitDate.toISOString().split('T')[0];

                    if (!visitsByDate[dateStr]) {
                        visitsByDate[dateStr] = {
                            views: 0,
                            visitorIps: new Set()
                        };
                    }

                    visitsByDate[dateStr].views++;
                    visitsByDate[dateStr].visitorIps.add(visitor.ip);
                }
            });
        });

        // Fill in missing days and format data
        const chartData = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            const dayData = visitsByDate[dateStr];
            chartData.push({
                name: dayName,
                date: dateStr,
                visitors: dayData ? dayData.visitorIps.size : 0,
                views: dayData ? dayData.views : 0
            });
        }

        res.status(200).json(chartData);
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get top viewed pages
 * @route   GET /api/visitors/analytics/pages
 * @access  Private
 */
exports.getTopPages = async (req, res) => {
    try {
        // Get all visitors
        const visitors = await firestoreService.getAll('visitors');

        // Process page views
        const pageStats = {};

        visitors.forEach(visitor => {
            (visitor.visits || []).forEach(visit => {
                const page = visit.page || '/';

                if (!pageStats[page]) {
                    pageStats[page] = {
                        page,
                        views: 0,
                        visitorIps: new Set()
                    };
                }

                pageStats[page].views++;
                pageStats[page].visitorIps.add(visitor.ip);
            });
        });

        // Convert to array and format
        const topPages = Object.values(pageStats)
            .map(stat => ({
                page: stat.page,
                views: stat.views,
                visitors: stat.visitorIps.size
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        res.status(200).json(topPages);
    } catch (error) {
        console.error('Top Pages Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
/**
 * @desc    Clear all visitor data
 * @route   DELETE /api/visitors/clear
 * @access  Private
 */
exports.clearVisitors = async (req, res) => {
    try {
        const batchSize = 100; // Small batch size for safety
        const visitors = await firestoreService.getAll('visitors');

        if (visitors.length === 0) {
            return res.status(200).json({ success: true, message: 'No data to clear' });
        }

        // Firestore batch limit is 500
        const chunkedVisitors = [];
        for (let i = 0; i < visitors.length; i += 400) {
            chunkedVisitors.push(visitors.slice(i, i + 400));
        }

        for (const chunk of chunkedVisitors) {
            const operations = chunk.map(v => ({
                type: 'delete',
                collection: 'visitors',
                id: v.id
            }));
            await firestoreService.batchWrite(operations);
        }

        res.status(200).json({ success: true, message: `Cleared ${visitors.length} visitor records` });
    } catch (error) {
        console.error('Clear Visitors Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
