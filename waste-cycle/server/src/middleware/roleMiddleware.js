// server/src/middleware/roleMiddleware.js

/**
 * Middleware สำหรับตรวจสอบ role ของผู้ใช้
 * @param {string[]} allowedRoles - Array ของ roles ที่อนุญาตให้เข้าถึง
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Helper functions สำหรับแต่ละ role
export const requireBuyer = requireRole(['buyer', 'admin']);
export const requireSeller = requireRole(['seller', 'admin']);
export const requireAdmin = requireRole(['admin']);