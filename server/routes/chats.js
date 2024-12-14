import express from 'express';
import { io } from '../config/instances.js';
import { writeFile } from '../utils/file.js';

const chatsRouter = express.Router();

chatsRouter.post('/:id/messages', (req, res) => {
  import("../db.json", { with: { type: "json" } }).then(module => {
    const dbFromImport = module.default;
    const newDb = { ...dbFromImport };
  
    const userIndex = newDb.users.findIndex(userDb => userDb.id === req.body.userId);
    const otherUserIndex = newDb.users.findIndex(userDb => userDb.id === req.body.otherUserId);
    const currentUser = newDb.users[userIndex];
    const currentOtherUser = newDb.users[otherUserIndex];
    let chatId = Number(req.params.id);
    let chatIndex = newDb.chats.findIndex(chatDb => chatDb.id === chatId);
    let userChatIndex = currentUser.chats.findIndex(chatDb => chatDb.participants.includes(req.body.otherUserId))
    let otherUserChatIndex = currentOtherUser.chats.findIndex(chatDb => chatDb.participants.includes(req.body.userId))
    
    if (!chatId) {
      const newChatId = newDb.chats[newDb.chats.length - 1].id + 1;
      chatId = newChatId;

      newDb.chats.push({
        id: newChatId,
        type: 'chat',
        participants: [req.body.userId, req.body.otherUserId],
        messages: [{
          text: req.body.text,
          name: req.body.name,
          userId: req.body.userId,
          date: req.body.date,
        }],
      })
      const otherUserNewChat = {
        id: newChatId,
        unreadMessages: 1,
        participants: [req.body.userId, req.body.otherUserId],
        name: currentUser.name,
        image: currentUser.image
      };
      if (otherUserChatIndex !== -1) {
        Object.assign(
          currentOtherUser.chats[otherUserChatIndex],
          otherUserNewChat
        )
      } else {
        otherUserChatIndex = currentOtherUser.chats.push(otherUserNewChat);
      }

      const userNewChat = {
        id: newChatId,
        unreadMessages: 0,
        participants: [req.body.userId, req.body.otherUserId],
        name: currentOtherUser.name,
        image: currentOtherUser.image,
      };
      if (userChatIndex !== -1) {
        Object.assign(
          currentUser.chats[userChatIndex],
          userNewChat
        )
      } else {
        userChatIndex = currentUser.chats.push(userNewChat);
      }

    
      chatIndex = newDb.chats.length - 1;
    } else {
      currentUser.chats[userChatIndex].unreadMessages = 0;
      delete currentUser.chats[userChatIndex].messages;
      currentOtherUser.chats[otherUserChatIndex].unreadMessages += 1;
      delete currentOtherUser.chats[otherUserChatIndex].messages;
      newDb.chats[chatIndex].messages.push(req.body);
    }
    io.to(`chat${chatId}`).emit('new-message', {
      chatId,
      id: req.body.userId,
      newMessage: req.body
    });
    writeFile(newDb, () => {
      res.status(200).json();
    });
  })
})

chatsRouter.post('/:chatId/readMessages', (req, res) => {
  import("../db.json", { with: { type: "json" } }).then(module => {
    const dbFromImport = module.default;
    const newDb = { ...dbFromImport };

    const chatId = Number(req.params.chatId);
    const userIndex = newDb.users.findIndex(userDb => userDb.id === req.body.id);
    const currentUser = newDb.users[userIndex];
    const userChatIndex = currentUser.chats.findIndex(chatDb => chatDb.id === chatId);
    currentUser.chats[userChatIndex].unreadMessages = 0;
    io.emit('read-message', currentUser);
    res.status(200).json();
  })
})

export default chatsRouter;