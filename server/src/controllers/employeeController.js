import { store } from '../services/storeService.js';
import { hashPassword } from '../services/authService.js';

export const getEmployees = async (req, res, next) => {
  try {
    const employees = await store.getEmployees();
    const withPerms = await Promise.all(
      employees.map(async (emp) => {
        const permissions = await store.getEmployeePermissions(emp._id || emp.id);
        const { passwordHash, ...clean } = emp;
        return { ...clean, permissions };
      })
    );

    res.json({
      success: true,
      count: withPerms.length,
      employees: withPerms,
    });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const { name, email, phone, password, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email address, and initial password are required.',
      });
    }

    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';
    const employee = await store.createEmployee(
      { name, email, phone, password, permissions },
      author
    );

    res.status(201).json({
      success: true,
      message: `Employee account '${employee.email}' created successfully.`,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployeePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be provided as an array of permission strings.',
      });
    }

    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';
    const updated = await store.updateEmployeePermissions(id, permissions, author);

    res.json({
      success: true,
      message: 'Employee permissions updated successfully.',
      permissions: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleEmployeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await store.getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    user.isActive = !user.isActive;
    res.json({
      success: true,
      message: `Employee account is now ${user.isActive ? 'Active' : 'Deactivated'}.`,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

