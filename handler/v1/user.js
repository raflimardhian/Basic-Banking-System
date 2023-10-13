const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getPagination } = require("../../helpers");

module.exports = {
  // Create User
  createUser: async (req, res, next) => {
    try {
      let { name, email, password, identity_type, identity_number, address } = req.body;

      const existingUser = await prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "Email already exists",
        });
      }

      let newUser = await prisma.users.create({
        data: {
          name,
          email,
          password,
        },
      });

      let newProfile = await prisma.profiles.create({
        data: {
          userId: newUser.id,
          identity_type,
          identity_number,
          address,
        },
      });

      res.status(201).json({
        status: true,
        message: "User and Profile Created Successfully",
        Data: { newUser, newProfile },
      });
    } catch (err) {
      next(err);
    }
  },

  // Get All Users
  getAllUsers: async (req, res, next) => {
    try {
      let { limit = 5, page = 1 } = req.query;
      limit = Number(limit);
      page = Number(page);

      let users = await prisma.users.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });

      const { _count } = await prisma.users.aggregate({
        _count: { id: true },
      });

      let pagination = getPagination(req, _count.id, page, limit);

      res.status(200).json({
        status: true,
        message: "Get All Users Successfully",
        data: { pagination, users },
      });
    } catch (err) {
      next(err);
    }
  },

  // Get User Detail
  getUserDetail: async (req, res, next) => {
    try {
      let id = req.params.id;

      const user = await prisma.users.findUnique({
        where: { id: Number(id) },
        include: {
          profile: true,
        },
      });

      if (!user) {
        return res.status(400).json({
          status: false,
          message: "Bad Request",
          data: `No user found with ID ${id}`,
        });
      }

      res.status(200).json({
        status: true,
        message: "Get User Detail Successfully",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },
};
