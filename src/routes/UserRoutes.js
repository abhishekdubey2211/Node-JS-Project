const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

// User routes
router.post("/", UserController.createUser);
router.put("/:userId", UserController.updateUser);
router.get("/:userId", UserController.getUserById);
router.get("/search/:emailOrUsername", UserController.getUserByEmailOrUsername);
router.get("/", UserController.getAllUsers);
router.delete("/:userId", UserController.deleteUser);

// Address routes
router.post("/:userId/address", UserController.addAddressByUserId);
router.put("/address/:addressId", UserController.updateAddressById);
router.get("/:userId/address", UserController.getAddressByUserId);
router.delete("/:userId/address/:addressId", UserController.deleteAddressByUserIdAndAddressId);

// UserDetails routes
router.post("/:userId/details", UserController.addUserDetailsByUserId);
router.put("/:userId/details/:parameterId", UserController.updateUserDetailsByUserIdAndParameterId);
router.get("/:userId/details", UserController.getUserDetailsByUserId);
router.delete("/:userId/details/:parameterId", UserController.deleteSingleUserParameterDetailsByUserIdAndParameterId);

module.exports = router;
