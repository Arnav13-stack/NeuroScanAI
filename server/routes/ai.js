const express = require("express");
const router = express.Router();
const axios = require("axios");

// Use these verified working models
const MODELS = {
  medical: "HuggingFaceH4/zephyr-7b-beta", // No special permissions needed
  general: "mistralai/Mistral-7B-Instruct-v0.1",
};

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Simple prompt for better compatibility
    const prompt = `[INST] <<SYS>>
    You are a medical assistant. Provide helpful but cautious health advice.
    Always recommend consulting a doctor.
    <</SYS>>
    ${message} [/INST]`;

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODELS.medical}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 25000,
      }
    );

    // Simple response extraction
    const aiResponse =
      response.data[0]?.generated_text ||
      "I couldn't process that. Please try again.";

    res.json({ reply: aiResponse.replace(prompt, "").trim() });
  } catch (error) {
    console.error("API Error:", {
      status: error.response?.status,
      error: error.response?.data?.error || error.message,
    });

    res.status(500).json({
      error:
        "Our medical assistant is currently unavailable. Please try again shortly.",
      retryable: true,
    });
  }
});

module.exports = router;
