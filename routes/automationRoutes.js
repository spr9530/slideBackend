const express = require('express');
const { getAllAutomations, handleCreateAutomation, getAutomationInfo, updateAutomation, saveListener, saveTrigger, saveKeyword, deleteKeyword, savePosts, handleToggelAutomation } = require('../controller/automationController');
const verifyToken = require('../middelware/verifyToken');

const automationRouter = express.Router();

automationRouter.get('/',verifyToken, getAllAutomations)
automationRouter.post('/', verifyToken, handleCreateAutomation)
automationRouter.get('/:id', verifyToken, getAutomationInfo)
automationRouter.patch('/update/:id', verifyToken, updateAutomation)
automationRouter.post('/savelistener/:id', verifyToken, saveListener)
automationRouter.post('/savetrigger/:id', verifyToken, saveTrigger)
automationRouter.post('/savekeyword/:id', verifyToken, saveKeyword)
automationRouter.post('/savepost/:id', verifyToken, savePosts)
automationRouter.delete('/deletekeyword/:id', verifyToken, deleteKeyword)
automationRouter.get('/toggleautomation/:id', verifyToken, handleToggelAutomation)












module.exports = automationRouter;