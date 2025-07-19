const { Keyword, Automation, Listener } = require('../../models/automation.model.js');

const axios = require('axios');

const matchKeyword = async (keyword) => {
  try {
    const result = await Keyword.findOne({
      word: { $regex: new RegExp(`^${keyword}$`, 'i') } // case-insensitive exact match
    });
    return result;
  } catch (error) {
    console.error('Error matching keyword:', error.message);
    throw error;
  }
};


const getKeywordAutomation = async ({ automationId, dm }) => {
  try {
    let automation = await Automation.findOne({ _id: automationId })
      .populate({
        path: 'trigger',
        match: { type: dm ? 'MESSAGE' : 'COMMENT' },
      })
      .populate('listener')
      .populate({
        path: 'userId',
        select: 'integrations',
        populate: {
          path: 'integrations',
          model: 'Integration'
        }
      })
      console.log(automation)
    // .populate('integration');

    if (dm) {
      automation = automation.populate('dms')
    }

    return automation;
  } catch (error) {
    console.error('Error in getKeywordAutomation:', error.message);
    throw error;
  }
};

const sendDM = async ({ userId, receiverId, prompt, token }) => {
  try {
    console.log({ userId, receiverId, prompt, token })
    const res = await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/${userId}/messages`,
      {
        recipient: {
          id: receiverId,
        },
        message: {
          text: prompt,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // 🔁 Fixed "Beare" to "Bearer"
          'Content-Type': 'application/json', // 🔁 Fixed key to 'Content-Type'
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error('Error sending DM:', error.response?.data || error.message);
    throw error;
  }
};

const sendPrivateMessage = async ({ userId, receiverId, prompt, token }) => {
  try {
    console.log({ userId, receiverId, prompt, token })
    const res = await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/${userId}/messages`,
      {
        recipient: {
          comment_id: receiverId,
        },
        message: {
          text: prompt,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // 🔁 Fixed "Beare" to "Bearer"
          'Content-Type': 'application/json', // 🔁 Fixed key to 'Content-Type'
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error('Error sending DM:', error.response?.data || error.message);
    throw error;
  }
};

const trackResponses = async ({ automationId, type }) => {
  try {
    const updateField = type === 'COMMENT' ? { commentCount: 1 } : type === 'DM' ? { dmCount: 1 } : null;

    if (!updateField) return;

    const updatedListener = await Listener.findByIdAndUpdate(
      automationId,
      { $inc: updateField },
      { new: true }
    );

    return updatedListener;
  } catch (error) {
    console.error('Error tracking responses:', error.message);
    throw error;
  }
};


module.exports = { matchKeyword, getKeywordAutomation, sendDM, trackResponses, sendPrivateMessage };
