const Joi = require("joi");

module.exports.letterCreateValidationSchema = {
    body: Joi.object({
        requesterRole: Joi.string().valid("STAFF","ADMIN","STUDENT","ALUMNI").required(),
        letterType: Joi.string().valid("EMP_LETTER", "REC_LETTER", "ORG_DEGREE", "STUD_COPY", "OFFICIAL_TRANSCRIPT").required(),
    }).options({abortEarly:false})
}


