const express = require('express');
const { default: connectDb } = require('./database/dbConnect');
const userRouter = require('./routes/userRoutes');
const cors = require('cors');
const automationRouter = require('./routes/automationRoutes');
const integrationRouter = require('./routes/integrationRoutes');
const instagramRouter = require('./api/webhooks/instagram');
require('dotenv').config(); 

const server = express();
connectDb()
server.use(cors())
server.use(express.json());
server.get('/',(req,res)=>{
    res.end('hello')
})
server.use('/api/v1/user', userRouter);
server.use('/api/v1/user/automations', automationRouter)
server.use('/api/v1/user/integration', integrationRouter)

server.use('/api/v1/webhook/instagram', instagramRouter)




const port = process.env.PORT;

server.listen(port,(()=>{
    console.log('server runnig')
}))