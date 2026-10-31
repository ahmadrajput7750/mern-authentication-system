import User from "../models/userModel.js";

export const getUserData = async (req, res) => {
  const userId = req.userId; // <-- Read from req.userId instead of req.body

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
      success: false,
    });
  }

  const findUser = await User.findById(userId);

  if (!findUser) {
    return res.status(404).json({
      success: false,
      message: "User Not Found",
    });
  }

  return res.status(200).json({
    message: "User data fetched successfully",
    success: true,
    userData: {
      name: findUser.name,
      email: findUser.email,
      isAccountVerified: findUser.isAccountVerified,
      avatar: findUser.avatar,
    },
  });
};

export const deleteUser = async (req, res) => {
  const userId = req.userId; // <-- Read from req.userId instead of req.body

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
      success: false,
    });
  }

  const findUser = await User.findById(userId);

  if (!findUser) {
    return res.status(404).json({
      message: "User not found",
      success: false,
    });
  }

  await User.findByIdAndDelete(userId);

  return res.status(200).json({
    message: "User deleted successfully",
    success: true,
  });
};
