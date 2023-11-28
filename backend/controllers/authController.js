const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const ErrorHandler=require('../utils/errorHandler');
const sendToken=require('../utils/jwt');
const crypto=require('crypto');
const dotenv=require('dotenv');

dotenv.config();

//register user-/api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const {name, email, password } = req.body;
    let avatar;
    if(req.file){
        avatar=`${process.env.BACKEND_URL}/uploads/user/${req.file.originalname}`
    }

    const user = await User.create({
        name,
        email,
        password,
        avatar
    });
    sendToken(user,201,res);
 
});

//login user- /api/v1/login
exports.loginUser=catchAsyncError(async(req,res,next)=>{

    const {email,password}=req.body;

    if(!email || !password) {
        return next(new ErrorHandler("please enter email and password"),400);
    }
    //finding the user from database
    const user=await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorHandler("invalid email or password"),401);
    }
    if(!await user.isValidPassword(password)){
        return next(new ErrorHandler("invalid email or password"),401);
    }
    sendToken(user,201,res);
});

//logout user- /api/v1/logout
exports.logOutUser=(req,res,next) =>{
    res.cookie('token',null,{
        expires:new Date (Date.now()),
        httpOnly:true
    })
    .status(200)
    .json({
        success:true,
        message:"Loggedout"
    })
}

//forgot password - /api/v1/password/forgot
exports.forgotPassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});

    if (!user) {
        return next (new ErrorHandler('user not found with this email',404));
    }

    const resetToken=user.getResetToken();
    await user.save({validateBeforeSave:false});

    //Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message=`your password reset token url is as follow \n\n ${resetUrl}\n\n if you have not requested please ignore it`

    try{
        sendEmail({
            email:user.email,
            subject:"subbu cart password recovery",
            message
        })
        res.status(200).json({
            success:true,
            message:`email sent to ${user.email}`
        })
    }
    catch(error){
        user.resetPasswordToken=undefined;
        user.resetPasswordTokenExpire=undefined;
        await user.save({validateBeforeSave:false});
        console.log("error block worked");
        return next(new ErrorHandler(err.message),500);

    }
})

//reset password-/api/v1/password/reset/:token
exports.resetPassword = catchAsyncError(async(req,res,next)=>{
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user= await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire:{
            $gt:Date.now()
        }
    })

    if (!user) {
        return next(new ErrorHandler('password reset token is expired or invalid'))
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('password does not match with confirm password'))
    }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordTokenExpire=undefined;
    await user.save({validateBeforeSave:false});

    sendToken(user,201,res);
})

//Get user profile- /api/v1/myprofile
exports.getUserProfile= catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user
    })
})

//change password- /api/v1/password/change
exports.changePassword= catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.user.id).select('+password');

    //check old password
    if(! await user.isValidPassword(req.body.oldPassword)){
        return next(new ErrorHandler ('old password is incorrect'),401);
    }

    //assiging new password
    user.password=req.body.password;
    await user.save();

    res.status(200).json({
        success:true
    })
})

//update profile-/api/v1/update
exports.updateProfile= catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.name
    }
    const user= await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        success:true
    })
})

//Admin- Get all the users /api/v1/admin/users
exports.getAllUsers= catchAsyncError(async(req,res,next)=>{
    const users=await User.find();
    res.status(200).json({
        success:true,
        users
    })
})

//Admin- Get specific user /api/v1/admin/user/:id
exports.getSpecificUser= catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.params.id);
    if(!user) {
        return next(new ErrorHandler(`user not found with this id ${req.params.id}`),401)
    }
    res.status(200).json({
        success:true,
        user
    })
})

//Admin- Update user /api/v1/admin/user/:id
exports.updateUser= catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }
    const user= await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        success:true,
        user
    })
})

//Admin- Delete user /api/v1/admin/user/:id
exports.deleteUser= catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.params.id);
    if(!user) {
        return next(new ErrorHandler(`user not found with this id ${req.params.id}`),401)
    }

    user.deleteOne();
    res.status(200).json({
        success:true
    })
})