const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getPagination } = require("../../helpers");

module.exports = {
  // Create Account
  createAccount: async (req, res, next) => {
    try {
      let { user_id, bank_name, bank_account_number, balance } = req.body;

      const user = await prisma.users.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        return res.status(400).json({
          status: false,
          message: "User not found",
        });
      }

      let newAccount = await prisma.bank_accounts.create({
        data: {
          user: {
            connect: { id: user_id },
          },
          bank_name,
          bank_account_number,
          balance,
        },
      });

      res.status(201).json({
        status: true,
        message: "Bank Account Created Successfully",
        data: newAccount,
      });
    } catch (err) {
      next(err);
    }
  },

  //   Get All Accounts
  getAllAccounts: async (req, res, next) => {
    try {
      let { limit = 5, page = 1 } = req.query;
      limit = Number(limit);
      page = Number(page);

      const accounts = await prisma.bank_accounts.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });

      const { _count } = await prisma.bank_accounts.aggregate({
        _count: { id: true },
      });

      let pagination = getPagination(req, _count.id, page, limit);

      res.status(200).json({
        status: true,
        message: "Get All Account Successfully",
        data: { pagination, accounts },
      });
    } catch (err) {
      next(err);
    }
  },

  //   Get Account Detail
  getAccountDetail: async (req, res, next) => {
    try {
      let id = req.params.id;

      const account = await prisma.bank_accounts.findUnique({
        where: { id: Number(id) },
        include: {
          user: true,
        },
      });

      res.status(200).json({
        status: true,
        message: "Get Account Detail Successfully",
        data: account,
      });
    } catch (err) {
      next(err);
    }
  },
};
