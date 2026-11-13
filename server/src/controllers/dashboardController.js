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

export const getSystemMemoryDiagnostics = (req, res) => {
  const mem = process.memoryUsage();
  const mb = (bytes) => +(bytes / 1024 / 1024).toFixed(2);
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    pid: process.pid,
    memory: {
      rssMB: mb(mem.rss),
      heapTotalMB: mb(mem.heapTotal),
      heapUsedMB: mb(mem.heapUsed),
      externalMB: mb(mem.external),
      arrayBuffersMB: mb(mem.arrayBuffers),
      heapUsedPercent: +((mem.heapUsed / mem.heapTotal) * 100).toFixed(1),
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  });
};

