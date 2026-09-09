const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500

    let message = err.message || "Internal Server Error"

    // CastError for invalid MongoDB ObjectIds
    if (err.name === "CastError") {
        statusCode = 404
        message = `Resource not found with ID: ${err.value}`
    }

    // Duplicate key in MongoDB
    if (err.code === 11000) {
        statusCode = 400
        const field = Object.keys(err.keyValue || {})[0] || "field"
        message = `User with this ${field} already exists`
    }

    // Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400
        message = Object.values(err.errors).map(val => val.message).join(", ")
    }

    res.status(statusCode).json({
        message,
        stack: process.env.MODE_ENV === "production" ? null : err.stack
    })
}

export default errorHandler