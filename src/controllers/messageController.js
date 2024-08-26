import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";


export const sendMessage = async (req, res) => {
    try {
        const {recepient} = req.params
        const {message} = req.body
        const sender = req.user.userName

        let conversation = await Conversation.findOne({
            participants:{$all:[sender, recepient ]}
        })

        if (!conversation) {
            conversation = new Conversation({
                participants:[sender, recepient],
                lastMessage:{
                    text: message,
                    sender: sender
                 }
            })
         await conversation.save()
        }

        const newMessage = new Message({
            conversationId: conversation._id,
            sender: sender,
            text : message
        })

        await Promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage:{
                    text: message,
                    sender: sender
                }
            })
        ])

        const recievedMessage = getRecipientSocketId(recepient)
        if (recievedMessage) {
            io.to(recievedMessage).emit('newMessage', newMessage)
        }

        res.status(200).json(newMessage)
    } catch (error) {
        res.status(500).json(error.message)
        console.log(error);
    }
}

export const getConversations = async (req, res) => {
    const user = req.user.userName;
    try {
        const conversations = await Conversation.find({ participants: user}).populate({
            path: 'participants',
            select: 'username profilePic',
        });

        conversations.forEach((conversation) => {
            conversation.participants = conversation.participants.filter(
                (participant) => participant.userName !== user
            )
        })
        res.status(200).json(conversations)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getMessage = async (req, res) => {
    const { conversationId } = req.params;
    const user = req.user.userName;
    try {
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        const recipient = messages.length ? messages[0].conversationId.participants.find(id => userName !== user) : null;

        if (recipient && recipient === user) {
            await Message.updateMany({ conversationId, sender: { $ne: user }, isSeen: false }, { isSeen: true });
        }

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};