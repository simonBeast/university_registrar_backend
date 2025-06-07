const AppExceptions = require("../utils/AppExceptions");
const Filter = require('../utils/filter');
const catchAsync = require("../utils/catchAsync");
const letterModel = require("../models/letterModel");
const { disallow } = require("joi");


exports.createLetter = catchAsync(async (req,res,next)=>{

  const data = req.body;

  data.requestedBy = req.user.id;

  const createdLetter = (await letterModel.create(data));
  
  const newCreatedLetter = await letterModel.findById(createdLetter.id).populate(
      [
        {
          path:"requestedBy",
          select: "id username fullName"
        },
        {
          path:"declinedBy",
          select: "id username fullName"
        },
        {
          path:"approvedBy",
          select: "id username fullName"
        },
      ]);


  return res.status(201).json(newCreatedLetter);

});

exports.getLetter = catchAsync(async(req,res,next)=>{

  foundLetter = await letterModel.findById(req.params.id).populate(["requestedBy","declinedBy","approvedBy"]);
  
  if(!foundLetter){
    return next(new AppExceptions("No letter was found by this Id",500))
  }

  return res.status(200).json(
    foundLetter
  );

});

exports.getLetters = catchAsync(async(req,res,next)=>{
  let foundLetters;
  
    foundLetters = letterModel.find({isApproved: null ,isDeclined: null}).populate(
      [
        {
          path:"requestedBy",
          select: "id username fullName"
        },
        {
          path:"declinedBy",
          select: "id username fullName"
        },
        {
          path:"approvedBy",
          select: "id username fullName"
        },

      ]
    );

    let filter = new Filter(foundLetters,req.query).filter().limitFields().sort().paginate().query;

    foundLetters = await filter;

    return res.status(200).json(
      foundLetters
    );

});
exports.getMyLetters = catchAsync(async(req,res,next)=>{

  let foundLetters;

    foundLetters = await letterModel.find({requestedBy: req.user.id}).populate(
      [
        {
          path:"requestedBy",
          select: "id username fullName"
        },
        {
          path:"declinedBy",
          select: "id username fullName"
        },
        {
          path:"approvedBy",
          select: "id username fullName"
        },

      ]
    );

    return res.status(200).json(
      foundLetters
    );

});
exports.getMyApprovedLetters = catchAsync(async(req,res,next)=>{

  let foundLetters;

  foundLetters = await letterModel.find({ isApproved: true,requestedBy: req.user.id }).populate(
    [
      {
        path:"requestedBy",
        select: "id username fullName"
      },
      {
        path:"declinedBy",
        select: "id username fullName"
      },
      {
        path:"approvedBy",
        select: "id username fullName"
      },

    ]
  );

  return res.status(200).json(
    foundLetters
  );

});
exports.getLettersApprovedByMe = catchAsync(async(req,res,next)=>{

  let foundLetters;

  foundLetters = await letterModel.find({ isApproved: true,approvedBy: req.user.id }).populate(
    [
      {
        path:"requestedBy",
        select: "id username fullName"
      },
      {
        path:"declinedBy",
        select: "id username fullName"
      },
      {
        path:"approvedBy",
        select: "id username fullName"
      },

    ]
  );

  return res.status(200).json(
    foundLetters
  );

});
exports.getMyDeclinedLetters = catchAsync(async(req,res,next)=>{

  let foundLetters;

  foundLetters = await letterModel.find({ isDeclined: true,requestedBy: req.user.id }).populate(
    [
      {
        path:"requestedBy",
        select: "id username fullName"
      },
      {
        path:"declinedBy",
        select: "id username fullName"
      },
      {
        path:"approvedBy",
        select: "id username fullName"
      },

    ]
  );;

  return res.status(200).json(
    foundLetters
  );

});
exports.getLettersDeclinedByMe = catchAsync(async(req,res,next)=>{
  let foundLetters;

  foundLetters = await letterModel.find({ isDeclined: true,declinedBy: req.user.id }).populate(
    [
      {
        path:"requestedBy",
        select: "id username fullName"
      },
      {
        path:"declinedBy",
        select: "id username fullName"
      },
      {
        path:"approvedBy",
        select: "id username fullName"
      },

    ]
  );

  return res.status(200).json(
    foundLetters
  );
});

exports.approveLetter = catchAsync(async(req,res,next)=>{
 const updatedLetter = await letterModel.findByIdAndUpdate(req.params.id,
    {
      approvedBy: req.user.id,
      approvedDate: new Date(Date.now()),
      isApproved: true,
      file: req?.file?.filename
    },
    {new:true}).populate(
      [
        {
          path:"requestedBy",
          select: "id username fullName"
        },
        {
          path:"declinedBy",
          select: "id username fullName"
        },
        {
          path:"approvedBy",
          select: "id username fullName"
        },

      ]
    );;
  return res.status(200).json(
    updatedLetter
  );
});

exports.declineLetter = catchAsync(async(req,res,next)=>{
  const updatedLetter = await letterModel.findByIdAndUpdate(req.params.id,
    {
      declinedBy: req.user.id,
      declinedDate: new Date(Date.now()),
      isDeclined: true,
    },
    {new:true}).populate(
      [
        {
          path:"requestedBy",
          select: "id username fullName"
        },
        {
          path:"declinedBy",
          select: "id username fullName"
        },
        {
          path:"approvedBy",
          select: "id username fullName"
        },

      ]
    );;
  return res.status(200).json(
    updatedLetter
  );
});
