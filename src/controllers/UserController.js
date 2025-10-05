// controllers/UserController.js
const UserService = require("../service/UserService");

class UserController {
  // -------------------- USER --------------------
  static async createUser(req, res, next) {
    try {
      const user = await UserService.createUser(req.body);
      return res.sendResponse(user, "User created successfully", 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await UserService.updateUser(userId, req.body);
      return res.sendResponse(user, "User updated successfully");
    } catch (err) {
      next(err);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await UserService.getUserById(userId);
      if (!user) throw { statusCode: 404, message: "User not found" };
      return res.sendResponse(user);
    } catch (err) {
      next(err);
    }
  }

  static async getUserByEmailOrUsername(req, res, next) {
    try {
      const { emailOrUsername } = req.params;
      const user = await UserService.getUserByEmailOrUsername(emailOrUsername);
      if (!user) throw { statusCode: 404, message: "User not found" };
      return res.sendResponse(user);
    } catch (err) {
      next(err);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      return res.sendResponse(users);
    } catch (err) {
      next(err);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      await UserService.deleteUser(userId);
      return res.sendResponse(null, "User deleted successfully");
    } catch (err) {
      next(err);
    }
  }

  // -------------------- ADDRESS --------------------
  static async addAddressByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      const address = await UserService.addAddressByUserId(userId, req.body);
      return res.sendResponse(address, "Address added successfully", 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateAddressById(req, res, next) {
    try {
      const { addressId } = req.params;
      const address = await UserService.updateAddressById(addressId, req.body);
      return res.sendResponse(address, "Address updated successfully");
    } catch (err) {
      next(err);
    }
  }

  static async getAddressByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      const addresses = await UserService.getAddressByUserId(userId);
      return res.sendResponse(addresses);
    } catch (err) {
      next(err);
    }
  }

  static async deleteAddressByUserIdAndAddressId(req, res, next) {
    try {
      const { userId, addressId } = req.params;
      await UserService.deleteAddressByUserIdAndAddressId(userId, addressId);
      return res.sendResponse(null, "Address deleted successfully");
    } catch (err) {
      next(err);
    }
  }

  // -------------------- USER DETAILS --------------------
  static async addUserDetailsByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      const details = await UserService.addUserDetailsByUserId(userId, req.body);
      return res.sendResponse(details, "User details added successfully", 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateUserDetailsByUserIdAndParameterId(req, res, next) {
    try {
      const { userId, parameterId } = req.params;
      const detail = await UserService.updateUserDetailsByUserIdAndParameterId(userId, parameterId, req.body);
      return res.sendResponse(detail, "User detail updated successfully");
    } catch (err) {
      next(err);
    }
  }

  static async getUserDetailsByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      const details = await UserService.getUserDetailsByUserId(userId);
      return res.sendResponse(details);
    } catch (err) {
      next(err);
    }
  }

  static async deleteSingleUserParameterDetailsByUserIdAndParameterId(req, res, next) {
    try {
      const { userId, parameterId } = req.params;
      await UserService.deleteSingleUserParameterDetailsByUserIdAndParameterId(userId, parameterId);
      return res.sendResponse(null, "User detail deleted successfully");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
