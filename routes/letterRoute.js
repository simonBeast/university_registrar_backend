const express = require('express');
const router = express.Router();


const { validate } = require("express-validation");
const { letterCreateValidationSchema } = require('../validations/letterValidation');
const { createLetter, getLetter, getLetters, getMyLetters, getMyApprovedLetters, getMyDeclinedLetters, getLettersApprovedByMe, getLettersDeclinedByMe, approveLetter, declineLetter } = require('../controllers/letterController');
const { restrictTo } = require('../utils/AuthGuard');
const { ROLE_TYPE } = require('../utils/utils');
const AuthGuard = require('../utils/AuthGuard').guard;

router.post('/',AuthGuard,validate(letterCreateValidationSchema),createLetter);
router.get('/',AuthGuard,restrictTo(ROLE_TYPE.ADMIN),getLetters);
router.get('/myLetters',AuthGuard,getMyLetters);
router.get('/myApprovedLetters',AuthGuard,getMyApprovedLetters);
router.get('/myDeclinedLetters',AuthGuard,getMyDeclinedLetters);
router.get('/lettersIApproved',AuthGuard,restrictTo(ROLE_TYPE.ADMIN),getLettersApprovedByMe);
router.get('/lettersIDeclined',AuthGuard,restrictTo(ROLE_TYPE.ADMIN),getLettersDeclinedByMe);
router.get('/:id',AuthGuard,getLetter);
router.patch("/:id/approve",AuthGuard,restrictTo(ROLE_TYPE.ADMIN),approveLetter);
router.patch("/:id/decline",AuthGuard,restrictTo(ROLE_TYPE.ADMIN),declineLetter);
module.exports = router;