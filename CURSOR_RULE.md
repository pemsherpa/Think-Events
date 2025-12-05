# 📝 Cursor Rule: Code Quality & UI/UX Excellence

All code in this project must adhere to the following principles:

## 1. Scalability & Architecture
- Design with modularity and separation of concerns (e.g., clear separation of frontend and backend).
- Use environment variables for secrets and configuration.
- Prefer stateless, reusable components and services.
- Write code that is easy to extend for future features.

## 2. Clean, Readable, and Understandable Code
- Use descriptive variable, function, and class names.
- Add comments and docstrings where logic is non-obvious.
- Follow language/framework style guides (e.g., PEP8 for Python, Airbnb/Prettier for JS/TS).
- Remove dead code and unnecessary comments.
- Keep functions and files focused and concise.

## 3. UI/UX Excellence
- Prioritize accessibility (ARIA, keyboard navigation, color contrast).
- Use responsive design for all screen sizes.
- Follow modern UI/UX patterns and best practices.
- Ensure fast load times and smooth interactions.
- Use consistent design tokens (spacing, colors, typography).

## 4. Testing & Validation
- Write unit and integration tests for critical logic.
- Validate user input on both client and server.
- Use type checking (TypeScript, mypy, etc.) where possible.

## 5. Documentation
- Document all public APIs, components, and modules.
- Update README and in-code docs with every major change.

## 6. Backend Code Standards

### Error Handling
- **ALWAYS** use `asyncHandler` wrapper for all async controller functions
- **NEVER** use try-catch blocks in controllers - errors are handled centrally
- Use `AppError` class for custom errors when needed
- Example:
  ```javascript
  export const myController = asyncHandler(async (req, res) => {
    // No try-catch needed - asyncHandler handles it
    const result = await someAsyncOperation();
    return successResponse(res, result, 'Operation successful');
  });
  ```

### Response Formatting
- **ALWAYS** use response helpers from `utils/response.js`
- Use `successResponse(res, data, message, statusCode)` for success responses
- Use `errorResponse(res, message, statusCode)` for errors
- Use `validationErrorResponse(res, errors)` for validation errors
- **NEVER** manually format responses with `res.json()` or `res.status().json()`
- Response format: Objects are spread at top level, arrays wrapped in `data` field

### Logging
- **NEVER** use `console.log`, `console.error`, or `console.warn`
- **ALWAYS** use the logger from `utils/logger.js`
- Use appropriate log levels:
  - `logger.error()` - For errors and exceptions
  - `logger.warn()` - For warnings and deprecations
  - `logger.info()` - For informational messages
  - `logger.debug()` - For debug information (development only)
- Example:
  ```javascript
  import logger from '../utils/logger.js';
  logger.error('Operation failed:', error);
  logger.info('User logged in:', userId);
  ```

### Constants & Configuration
- **ALWAYS** use constants from `utils/constants.js` instead of magic strings/numbers
- Extract hard-coded values to constants file
- Use config from `config/config.js` for environment-based values
- Example:
  ```javascript
  import { OTP_EXPIRY_MINUTES, BOOKING_STATUS } from '../utils/constants.js';
  const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  ```

### File Uploads
- **ALWAYS** use upload utilities from `utils/upload.js`
- Use `avatarUpload` for avatar uploads
- Use `eventImageUpload` for event image uploads
- **NEVER** create new multer configurations - extend existing ones if needed

### Database Queries
- Use `query()` helper from `config/database.js` for all database operations
- Use parameterized queries (always use `$1, $2, etc.`) - **NEVER** string concatenation
- Handle transactions properly with BEGIN/COMMIT/ROLLBACK
- Example:
  ```javascript
  import { query } from '../config/database.js';
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  ```

### Code Organization
- Keep controllers focused - delegate business logic to services if complex
- One controller function = one responsibility
- Keep functions concise and readable
- Extract reusable logic to utility functions

### Import Order
1. External packages (express, bcrypt, etc.)
2. Internal config (database, config)
3. Internal utilities (logger, response, constants)
4. Internal services/middleware
5. Relative imports (same directory)

### Code Style
- Use async/await (no callbacks or .then())
- Use const/let (no var)
- Use arrow functions for callbacks
- Use template literals for strings
- No unnecessary comments - code should be self-explanatory

---

All pull requests and code reviews must check for these standards.
If in doubt, prioritize clarity, maintainability, and user experience. 