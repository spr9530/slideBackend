const {Automation, Keyword, Trigger, Listener, Post} = require('../models/automation.model.js');
const User = require('../models/user.model.js')

const getAllAutomations = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user; // In case `req.user` is an object or string

    const automations = await Automation.find({ userId })
      .select('-dms')
      .select('-posts')
      .select('-trigger')

    if (!automations || automations.length === 0) {
      return res.status(404).json({
        message: "No automations found for the current user",
        type: 'error',
      });
    }

    return res.status(200).json({
      message: "Automations found",
      type: 'success',
      automations,
    });

  } catch (error) {
    console.error("Automation fetch error:", error);
    return res.status(500).json({
      message: "Error fetching automations",
      type: 'error',
    });
  }
};

const getAutomationInfo = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id)

    if (!id) {
      return res.status(400).json({ message: 'Automation ID is required', type: 'error' });
    }

    const automation = await Automation.findById(id)
    .populate('trigger')
    .populate('keywords')
    .populate('posts')
    .populate('listener');

    if (!automation) {
      return res.status(404).json({ message: 'No automation found', type: 'error' });
    }

    return res.status(200).json({
      message: "Automation found",
      type: 'success',
      automation
    });

  } catch (error) {
    console.error("Fetching automation error:", error.message);
    return res.status(500).json({
      message: "Server error while fetching automation",
      type: 'error'
    });
  }
};

const handleCreateAutomation = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: userId missing', type: 'error' });
    }

    const newAutomation = await Automation.create({
      name: 'Untitled',
      userId
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { automations: newAutomation._id } },
      { new: true }
    );

    return res.status(201).json({
      message: "Automation created with name 'Untitled'",
      type: 'success',
      user: updatedUser
    });

  } catch (error) {
    console.error("Create Automation Error:", error);
    return res.status(500).json({
      message: 'Error creating automation',
      type: 'error',
    });
  }
};


const updateAutomation = async (req, res) => {
  try {
    const { name, active } = req.body;
    const { id } = req.params;

    const update = await Automation.findByIdAndUpdate(
      id,
      { $set: { name, active } },
      { new: true }
    );

    if (!update) {
      return res.status(500).json({ message: 'Error updating automation', type: 'error' });
    }

    return res.status(200).json({
      message: 'Automation updated successfully',
      type: 'success',
      automation: update,
    });
  } catch (error) {
    console.log("Update error:", error);
    return res.status(500).json({ message: 'Error in update automation', type: 'error' });
  }
};


const saveListener = async (req, res) => {
  try {
    const { prompt, reply, listener } = req.body;
    const { id } = req.params;

    const automation = await Automation.findById(id);
    if (!automation) {
      return res.status(404).json({ message: 'No automation found', type: 'error' });
    }

    const newListener = await Listener.create({
      listener,
      prompt,
      commentReply: reply,
      automationId: id,
    });

    const updatedAutomation = await Automation.findByIdAndUpdate(
      id,
      { listener: newListener._id },
      { new: true }
    );

    if (!updatedAutomation) {
      return res.status(500).json({ message: 'Error in saving listener', type: 'error' });
    }

    return res.status(200).json({
      message: 'Listener saved successfully',
      type: 'success',
      automation: updatedAutomation,
    });

  } catch (error) {
    console.error("Listener Save Error:", error);
    return res.status(500).json({ message: "Error in saving listener", type: 'error' });
  }
};


const saveTrigger = async (req, res) => {
  try {
    const  types  = req.body;  
    const { id } = req.params;

    if (!types || !Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ message: 'No trigger(s) provided', type: 'error' });
    }

    const automation = await Automation.findById(id);
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found', type: 'error' });
    }

    const newTriggers = await Promise.all(
      types.map((type) =>
        Trigger.create({ type, automationId: id })
      )
    );

    const update = await Automation.findByIdAndUpdate(
      id,
      { $push: { trigger: { $each: newTriggers } } },
      { new: true }
    );

    return res.status(200).json({
      message: 'Trigger(s) saved successfully',
      type: 'success',
      automation: update,
    });

  } catch (error) {
    console.error("Save Trigger Error:", error);
    return res.status(500).json({ message: 'Error in saving trigger', type: 'error' });
  }
};


const saveKeyword = async (req, res) => {
  try {
    const { keyword } = req.body;
    const { id } = req.params;

    if (!keyword || !id) {
      return res.status(400).json({
        message: 'Missing keyword or automation ID',
        type: 'error'
      });
    }

    const automation = await Automation.findById(id);
    if (!automation) {
      return res.status(404).json({
        message: 'Automation not found',
        type: 'error'
      });
    }

    const newKeyword = await Keyword.create({
      word: keyword,
      automationId: id,
    });

    const updatedAutomation = await Automation.findByIdAndUpdate(
      id,
      { $push: { keywords: newKeyword._id } },
      { new: true }
    ); 

    return res.status(200).json({
      message: 'Keyword saved successfully',
      type: 'success',
      automation: updatedAutomation,
    });

  } catch (error) {
    console.error("Save keyword error:", error);
    return res.status(500).json({
      message: 'Error in saving keyword',
      type: 'error'
    });
  }
};


const deleteKeyword = async (req, res) => {
  try {
    const { keywordId } = req.body;
    const { id } = req.params; 
    console.log(id, keywordId, req.data)

    if (!id || !keywordId) {
      return res.status(400).json({ message: 'Automation ID or keyword ID missing', type: 'error' });
    }

    const automation = await Automation.findById(id);
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found', type: 'error' });
    }

    const updatedKeywords = automation.keywords.filter(
      (kwId) => kwId.toString() !== keywordId
    );

    const updatedAutomation = await Automation.findByIdAndUpdate(
      id,
      { keywords: updatedKeywords },
      { new: true }
    );

    await Keyword.findByIdAndDelete(keywordId);

    return res.status(200).json({
      message: 'Keyword deleted successfully',
      type: 'success',
      automation: updatedAutomation,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting keyword', type: 'error' });
  }
};


const savePosts = async (req, res) => {
  try {
    const posts = req.body;
    const { id } = req.params;

    if (!Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({ message: 'No posts provided', type: 'error' });
    }

    const automation = await Automation.findById(id);
    if (!automation) {
      return res.status(404).json({ message: 'No automation found', type: 'error' });
    }

    const newPosts = await Promise.all(
      posts.map((post) =>
        Post.create({
          postId: post.postId,
          caption: post.caption,
          media: post.media,
          mediaType: post.mediaType,
          automationId: id,
        })
      )
    );

    const updateAutomation = await Automation.findByIdAndUpdate(
      id,
      { $push: { posts: { $each: newPosts } } },
      { new: true }
    );

    if (!updateAutomation) {
      return res.status(500).json({ message: 'Error in saving posts', type: 'error' });
    }

    return res.status(200).json({
      message: 'Posts saved successfully',
      type: 'success',
      automation: updateAutomation,
    });

  } catch (error) {
    console.error("Save Post Error:", error);
    return res.status(500).json({ message: 'Server error while saving posts', type: 'error' });
  }
};


const handleToggelAutomation = async (req, res) => {
  try {
    const { id } = req.params;

    const automation = await Automation.findById(id);
    if (!automation) {
      return res.status(404).json({ message: 'No automation found', type: 'error' });
    }

    const updated = await Automation.findByIdAndUpdate(
      id,
      { active: !automation.active },
      { new: true }
    );

    return res.status(200).json({
      message: `Automation has been ${updated.active ? 'activated' : 'deactivated'}`,
      type: 'success',
    });

  } catch (error) {
    console.error('Error toggling automation:', error);
    return res.status(500).json({ message: 'Server error while toggling automation', type: 'error' });
  }
};






module.exports = {
  getAllAutomations, handleCreateAutomation, getAutomationInfo,
  updateAutomation, saveListener, saveTrigger, saveKeyword, deleteKeyword, savePosts, handleToggelAutomation
};
