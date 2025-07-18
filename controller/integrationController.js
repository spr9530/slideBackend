
const  Integration = require('../models/integration.model.js')
const handleIntegrationUpdate = async(req,res) =>{
    try{

    }catch(error){

    }
}

const createIntegration = async (req, res) => {
  try {
    const { userId } = req.user;
    const { token, instagramId, expireAt } = req.body;

    // Optional: Check if integration already exists to avoid duplicates
    const existing = await Integration.findOne({ userId, instagramId });
    if (existing) {
      return res.status(400).json({ message: 'Integration already exists' });
    }

    const integration = await Integration.create({
      userId,
      token,
      instagramId,
      expireAt,
      name: 'INSTAGRAM', // If you're categorizing integrations
    });

    res.status(201).json({
      message: 'Integration created successfully',
      integration,
    });
  } catch (error) {
    console.error('Error creating integration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getIntegration = async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;

        const integration = await Integration.findOne({
            userId,
            automationId: id,
            name: 'INSTAGRAM',
        });

        if (!integration) {
            return res.status(404).json({
                message: 'Integration not found',
                type: 'error',
            });
        }

        res.status(200).json({
            message: 'Integration fetched successfully',
            type: 'success',
            data: integration,
        });
    } catch (error) {
        console.error("Error fetching integration:", error);
        res.status(500).json({
            message: 'Internal server error',
            type: 'error',
        });
    }
};



module.exports = {handleIntegrationUpdate, getIntegration, createIntegration} 