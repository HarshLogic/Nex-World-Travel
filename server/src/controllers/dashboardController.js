import { store } from '../services/storeService.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await store.getDashboardMetrics();
    const auditLogs = await store.getAuditLogs(20);

    res.json({
      success: true,
      ...metrics,
      metrics,
      recentAuditLogs: auditLogs,
    });
  } catch (error) {
    next(error);
  }
};

