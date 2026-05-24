import Feedback from "../models/Feedback.js";

export const submitFeedback = async (req, res) => {
  try {
    const { type, message, rating } = req.body;
    const userId = req.userId;

    if (!type || !message) {
      return res.status(400).json({ message: "Type and message are required" });
    }

    const feedback = new Feedback({
      userId,
      type,
      message,
      rating,
    });

    await feedback.save();

    res.status(201).json({ message: "Feedback submitted successfully", data: feedback });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeedback = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const feedbacks = await Feedback.find().populate("userId", "name email").sort("-createdAt");
    res.status(200).json({ data: feedbacks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
