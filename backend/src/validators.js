const { body, param, validationResult } = require('express-validator');

/**
 * Extracts validation errors and returns a formatted error response.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

/** Validation rules for creating a task */
const createTaskRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed']).withMessage('Status must be todo, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('due_date')
    .optional({ values: 'null' })
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
];

/** Validation rules for updating a task */
const updateTaskRules = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed']).withMessage('Status must be todo, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('due_date')
    .optional({ values: 'null' })
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
];

/** Validation for :id param */
const idParamRule = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
];

module.exports = {
  handleValidationErrors,
  createTaskRules,
  updateTaskRules,
  idParamRule,
};
