
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import mongoose, { Types } from "mongoose";
import bcrypt from "bcrypt";
import Session from "../models/sessionModel.js";
import File from "../models/fileModel.js";


export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  let hashed_Password = await bcrypt.hash(password, 10);
  const foundUser = await User.findOne({ email });
  if (foundUser) {
    return res
      .status(409)
      .json({ error: "A user with this email address already exists" });
  }
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (foundUser.isDeleted) {
    res.clearCookie("sid");
    return res.status(403).json({ error: "Your account has been deleted or blocked. Please contact the admin." });
  }
  const session = await mongoose.startSession();

  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    session.startTransaction();
    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session }
    );

    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        password: hashed_Password,
        rootDirId,
      },
      { session }
    );

    session.commitTransaction();
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    session.abortTransaction();
    // console.error("Error in register:", err.errorResponse.errInfo.details.schemaRulesNotSatisfied);
    //in the upper case we can debug the error and find out the exact error
    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
    } else if (err.code === 11000) {
      if (err.keyValue.email) {
        return res.status(409).json({ error: "A user with this email address already exists" });
      }
    } else {
      next(err);
    }
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "Invalid Credentials , User not found" });
  }
  if (user.isDeleted) {
    res.clearCookie("sid");
    return res.status(403).json({ error: "Your account has been deleted or blocked. Please contact the admin." });
  }

  try {
    let enteredPassword = await bcrypt.compare(password, user.password);

    if (!enteredPassword) {
      return res.status(401).json({ error: "Invalid Credentials  , User not found" });
    }

    const session = await Session.create({ userId: user._id });
    const userSession = await Session.find({ userId: user._id });
    if (userSession.length >= 3) {
      await Session.findByIdAndDelete(userSession[0]._id);
    } //logout user if he login more than 3 times

    res.cookie("sid", session._id, {
      httpOnly: true,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.status(200).json({ message: "Logged In" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error at login time" });
  }
};

export const getCurrentUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
    role: req.user.role
  });
};

export const logout = async (req, res) => {
  res.clearCookie("sid");
  await Session.findByIdAndDelete(req.signedCookies.sid);
  res.status(204).end();
};

// export const continueWithGoogle = async (req, res) => {
//   const { token } = req.body;
//   if (!token) {
//     return res.status(400).json({ error: "Token is required" });
//   }

//   let userInfo = await loginWithGoogle(token);
//    const {name , email , picture } = userInfo;
//    console.log(name , email , picture);
//     const user = await User.findOne({email});
//     if (!user) {
//       return ;
//     }else{
//       const newUser =   await User.create({
//         name,
//         email,
//         profile: picture
//       });
//       res.json({ newUser });
//     }


// }



export const logoutAll = async (req, res) => {
  try {
    await Session.deleteMany({ userId: req.user._id });
    res.clearCookie("sid");
    console.log("All sessions deleted");
    return res.status(204).end();
  } catch (error) {
    console.error("Error in logoutAll:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({ isDeleted: false }).select("-password -__v").lean();
    const allSession = await Session.find().lean();
    //when we fetch in .lean() it retrun as object /. otherwise in normal it return as array
    const allSessionUserIds = allSession.map(({ userId }) => userId.toString());
    const transformedUsers = allUsers.map(({ _id, name, email, isDeleted }) => ({
      name,
      email,
      // isDeleted,
      id: _id,
      isLoggedIn: allSessionUserIds.includes(_id.toString()),
    }
    ));
    return res.status(200).json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching users",
    });
  }
};


export const roleBaseActionPerform = async (req, res, next) => {
  try {
    const { _id } = req.body;

    const session = await Session.find({ userId: _id });
    session.forEach(async (session) => {
      await Session.findByIdAndDelete(session._id);
    })
    return res.json("user logout Successfully by admin");

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

}

export const deleteUserByAdmin = async (req, res) => {
  try {
    const { _id } = req.body;

    const user_Tobe_Delete = await User.findById(_id);
    if (!user_Tobe_Delete) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent deleting self
    if (user_Tobe_Delete._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ error: "You can't delete yourself" });
    }

    // Prevent deleting action according to role
    if (user_Tobe_Delete.role === "admin") {
      // Block the requester is not a higher role
      if (req.user.role === "admin") {
        return res.status(403).json({ error: "Admins can't delete other admins" });
      }
      if (req.user.role === "manager") {
        return res.status(403).json({ error: "Managers can't delete admins" });
      }
    }

    if (req.user.role === "manager" && user_Tobe_Delete.role === "manager") {
      return res.status(403).json({ error: "Managers can't delete other managers" });
    }

    // its real delete
    // await Directory.deleteMany({ userId: _id });
    // await File.deleteMany({ userId: _id });
    // await Session.deleteMany({ userId: _id });
    // await User.findByIdAndDelete(_id);

    //soft deleted apply
    await user_Tobe_Delete.updateOne({ isDeleted: true });

    return res.json({ message: "User deleted successfully by admin" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
