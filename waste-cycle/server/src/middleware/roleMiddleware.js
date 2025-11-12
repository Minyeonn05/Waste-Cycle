// server/src/middleware/roleMiddleware.js

/**
 * Middleware สำหรับตรวจสอบ role ของผู้ใช้
 * Role ที่มี: user, admin
 * 
 * @param {string[]} allowedRoles - Array ของ roles ที่อนุญาตให้เข้าถึง
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role || 'user'; // default เป็น user

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}`,
        required: allowedRoles,
        current: userRole,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

/**
 * Helper: ต้องการ user หรือ admin (ทุกคนที่ login แล้ว)
 */
export const requireAuth = requireRole(['user', 'admin']);

/**
 * Helper: ต้องการ admin เท่านั้น
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware: ตรวจสอบว่าเป็นเจ้าของ resource หรือเป็น admin
 * @param {string} resourceUserIdField - ชื่อฟิลด์ที่เก็บ userId ของ resource (เช่น 'userId', 'ownerId')
 */
export const requireOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role || 'user';
    
    // Admin สามารถทำอะไรก็ได้
    if (userRole === 'admin') {
      req.isAdmin = true;
      return next();
    }

    // User ธรรมดาต้องเป็นเจ้าของ
    req.isAdmin = false;
    next();
  };
};