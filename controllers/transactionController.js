const Transaction = require('../model/transactionModel');

exports.saveTransaction = async (req, res) => {
  try {
    const { userId, transactionData } = req.body;
    const transaction = new Transaction({ ...transactionData, userId });
    await transaction.save();
    res.status(201).json({ message: 'Transaction saved successfully', transaction });
  } catch (error) {
    res.status(400).json({ message: 'Error saving transaction', error });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ userId });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};