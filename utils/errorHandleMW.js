const AppExceptions = require("./AppExceptions.js");


const handleCastErrorDB = (err) => {
    return new AppExceptions(`Invalid ${err.path} with the value of { ${err.value} } `, 400);
}
const handleDuplicateErrorDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return new AppExceptions(`Duplicate field value: ${value} . Please use another value`, 400);
}
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err).map((item) =>
        item.message
    )
    return new AppExceptions(`Invalid input data ${errors.join(". ")}`, 400);
}
const sendErrorDev = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            err
        });
    }
    else {
        res.status(500).json({
            message: err
        });
    }
}
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            message: err.message
        });
    }
    else {
        res.status(500).json({
            message: "Something went very wrong!!!!" + `{${err}}`
        });
    }

}
module.exports =  (err, req, res, next) => {
    err.statusCode = err?.statusCode || 500;
    err.status = err?.status || 'Error';
    console.log("ERRRRRRRR ====>",err);
    if (process.env.Node_ENV == "development") {
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV == "production") {
        let error;
        error = err;
        if (err.name == "CastError") {
            error = handleCastErrorDB(err);
        }
        if (err.code == 11000) {
            error = handleDuplicateErrorDB(err);
        }
        if (err.name == "ValidationError") {
            // let errors = formatJoiErrors(err);
            // error = {
            //     statusCode: 400,
            //     message: errors,
            //     isOperational: true
            // }
            let message = " ";
            if (error?.errors) {
                
                Object.keys(err.errors).forEach((key) => (
                    message += `${key + " : " + err.errors[key].message}\n`
                ));
                error = new AppExceptions(message, 400)
            }
            else {
                console.log(err.details.body);
                error = handleValidationErrorDB(err.details.body);
            }
        }
        sendErrorProd(error, res);
    }


}