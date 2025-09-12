export const errorHandler = (err, _req, res, _next) => {
    // Default error response
    let statusCode = 500;
    let message = "Internal Server Error";
    let errorType = "ServerError";
    // Handle MongoDB errors
    if (err.name === 'MongoServerError') {
        // Duplicate key error
        if (err.code === 11000) {
            statusCode = 409;
            message = `Duplicate field value entered: ${Object.keys(err.keyValue || {})}`;
            errorType = "DuplicateKeyError";
        }
    }
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors || []).map(val => val.message).join(', ');
        errorType = "ValidationError";
    }
    // Handle CastError (invalid ID format)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        errorType = "CastError";
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again!';
        errorType = "TokenError";
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your token has expired! Please log in again.';
        errorType = "TokenExpiredError";
    }
    // Handle custom application errors
    if (err.isOperational) {
        statusCode = err.statusCode || 500;
        message = err.message;
        errorType = err.errorType || "OperationalError";
    }
    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            type: errorType,
            message: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
    return;
};
