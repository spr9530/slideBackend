const express = require('express');
const { matchKeyword, getKeywordAutomation, trackResponses, sendPrivateMessage, sendDM } = require('./actions');

const instagramRouter = express.Router();


instagramRouter.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
        console.log('✅ Webhook verified');
        return res.status(200).send(challenge);
    } else {
        console.log('❌ Verification failed');
        return res.sendStatus(403);
    }
});

instagramRouter.post('/', async (req, res) => {
    try {
        const webhook_payload = req.body;
        let matcher;

        const entry = webhook_payload.entry?.[0];

        if (!entry) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        // Handle messaging (DM)
        if (entry.messaging) {
            const messageText = entry.messaging[0]?.message?.text;
            matcher = await matchKeyword(messageText);
        }

        // Handle comments or changes
        if (entry.changes) {
            const changeText = entry.changes[0]?.value?.text;
            matcher = await matchKeyword(changeText);
        }

        if (matcher && matcher.automationId) {
            const isDM = !!entry.messaging;
            console.log('got matchd keyword')

            const automation = await getKeywordAutomation({
                automationId: matcher.automationId,
                dm: isDM
            });



            if (!automation || !automation.trigger) {
                console.log("Automation not found")
                return res.status(404).json({ message: 'Automation not found' });
            }

            const listener = automation.listener;


            if (listener?.listener === 'MESSAGE') {
                if (entry.messaging) {
                    const directMessage = await sendDM({
                        userId: entry.id,
                        receiverId: entry.messaging?.[0]?.sender?.id,
                        prompt: listener?.prompt,
                        token: automation.userId?.integrations?.[0]?.token
                    });
                    if (directMessage.message_id) {
                        const tracked = await trackResponses({
                            automationId: automation._id,
                            type: 'MESSAGE'
                        });

                        if (tracked) {
                            console.log('tracked')
                            return res.status(200).json({
                                message: 'Message sent successfully',
                                type: 'success'
                            });
                        }
                    }
                } 
                if(entry.changes) {
                    const directMessage = await sendPrivateMessage({
                        userId: entry.id,
                        receiverId: entry.changes?.[0]?.value?.id ,
                        prompt: listener?.prompt,
                        token: automation.userId?.integrations?.[0]?.token
                    });
                    if (directMessage?.status === 200) {
                        const tracked = await trackResponses({
                            automationId: automation._id,
                            type: 'MESSAGE'
                        });

                        if (tracked) {
                            console.log('tracked')
                            return res.status(200).json({
                                message: 'Message sent successfully',
                                type: 'success'
                            });
                        }
                    }
                }


            }

            if (listener?.listener === 'SMARTAI') {
                console.log('SMARTAI logic to be implemented');
                return res.status(200).json({
                    message: 'SMARTAI trigger logged',
                    type: 'info'
                });
            }
        }

        return res.status(204).end(); // No action taken

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = instagramRouter

