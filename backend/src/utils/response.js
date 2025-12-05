export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message
  };
  
  if (data) {
    if (typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }
  
  return res.status(statusCode).json(response);
};

export const errorResponse = (res, message = 'Error', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

export const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors
  });
};

