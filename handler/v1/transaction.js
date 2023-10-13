const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getPagination } = require("../../helpers");

module.exports = {
  createTransaction: async (req, res, next) => {
    try {
      const { source_account_id, destination_account_id, amount } = req.body;

      if (source_account_id === destination_account_id) {
        return res.status(400).json({
          status: false,
          message: "Source and destination accounts cannot be the same",
        });
      }

      const sourceAccount = await prisma.bank_accounts.findUnique({
        where: { id: source_account_id },
      });

      const destinationAccount = await prisma.bank_accounts.findUnique({
        where: { id: destination_account_id },
      });

      if (!sourceAccount || !destinationAccount) {
        return res.status(400).json({
          status: false,
          message: "Source or destination account not found",
        });
      }

      if (sourceAccount.balance < amount) {
        return res.status(400).json({
          status: false,
          message: "Insufficient balance in the source account",
        });
      }

      const transaction = await prisma.transactions.create({
        data: {
          source_account_id,
          destination_account_id,
          amount,
        },
      });

      await prisma.bank_accounts.update({
        where: { id: source_account_id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      await prisma.bank_accounts.update({
        where: { id: destination_account_id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      res.status(201).json({
        status: true,
        message: "Transaction successful",
        data: transaction,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllTransactions: async (req, res, next) => {
    try {
      let { limit = 5, page = 1 } = req.query;
      limit = Number(limit);
      page = Number(page);

      let transactions = await prisma.transactions.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });

      const { _count } = await prisma.transactions.aggregate({
        _count: { id: true },
      });

      let pagination = getPagination(req, _count.id, page, limit);

      res.status(200).json({
        status: true,
        message: "Get All Transasctions Successfully",
        data: { pagination, transactions },
      });
    } catch (err) {
      next(err);
    }
  },

  getTransactionDetail: async (req, res, next) => {
    try {
      let id = req.params.id;

      const transaction = await prisma.transactions.findUnique({
        where: { id: Number(id) },
        include: {
          source_account: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          destination_account: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!transaction) {
        return res.status(404).json({
          status: false,
          message: "Transaction not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Get Transasctions Detail Successfully",
        data: transaction,
      });
    } catch (err) {
      next(err);
    }
  },
};
