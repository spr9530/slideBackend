const express = require('express');
const { handleIntegrationUpdate, getIntegration, createIntegration } = require('../controller/integrationController');

const integrationRouter = express.Router();

integrationRouter.put('/update',handleIntegrationUpdate)
integrationRouter.post('/', createIntegration)

integrationRouter.get('/', getIntegration)

module.exports = integrationRouter