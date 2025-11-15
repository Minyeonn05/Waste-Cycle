import asyncHandler from '../middleware/asyncHandler.js';
import { db } from '../config/firebaseConfig.js';

// @desc    Get all chat rooms for the logged-in user
// @route   GET /api/chat
// @access  Private
const getChatRooms = asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  const chatsAsBuyerSnapshot = await db.collection('chats').where('buyerId', '==', userId).get();
  const chatsAsSellerSnapshot = await db.collection('chats').where('sellerId', '==', userId).get();

  const chatsAsBuyer = chatsAsBuyerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const chatsAsSeller = chatsAsSellerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const chatRooms = [...chatsAsBuyer, ...chatsAsSeller];
  // TODO: Sort or merge as needed

  res.status(200).json({ success: true, data: chatRooms });
});

// @desc    Create a new chat room
// @route   POST /api/chat
// @access  Private
const createChatRoom = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const buyerId = req.user.uid;

  const productDoc = await db.collection('products').doc(productId).get();
  if (!productDoc.exists) {
    res.status(404);
    throw new Error('Product not found');
  }

  const product = productDoc.data();
  const sellerId = product.userId;

  if (sellerId === buyerId) {
    res.status(400);
    throw new Error("You cannot start a chat for your own product");
  }

  // Check if a chat room already exists
  const existingChatQuery = await db.collection('chats')
    .where('buyerId', '==', buyerId)
    .where('sellerId', '==', sellerId)
    .where('productId', '==', productId)
    .limit(1)
    .get();

  if (!existingChatQuery.empty) {
    const existingChat = existingChatQuery.docs[0];
    res.status(200).json({ success: true, data: { id: existingChat.id, ...existingChat.data() }, message: "Chat room already exists" });
    return;
  }

  const newChat = {
    productId,
    buyerId,
    sellerId,
    buyerName: req.user.name,
    sellerName: product.farmName || 'Seller', // Adjust as needed
    farmName: product.farmName,
    createdAt: new Date().toISOString(),
    lastMessage: '',
    timestamp: new Date().toISOString(),
  };

  const chatRef = await db.collection('chats').add(newChat);

  res.status(201).json({
    success: true,
    data: { id: chatRef.id, ...newChat },
  });
});

// @desc    Get a single chat room by ID
// @route   GET /api/chat/:id
// @access  Private
const getChatRoomById = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const chatDoc = await db.collection('chats').doc(chatId).get();

  if (!chatDoc.exists) {
    res.status(404);
    throw new Error('Chat room not found');
  }

  const chatData = chatDoc.data();
  if (chatData.buyerId !== req.user.uid && chatData.sellerId !== req.user.uid) {
    res.status(401);
    throw new Error('Not authorized to access this chat');
  }

  res.status(200).json({ success: true, data: { id: chatDoc.id, ...chatData } });
});

// @desc    Post a new message
// @route   POST /api/chat/:id/messages
// @access  Private
const postMessage = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const { text } = req.body;
  const senderId = req.user.uid;

  const chatRef = db.collection('chats').doc(chatId);
  const chatDoc = await chatRef.get();

  if (!chatDoc.exists) {
    res.status(404);
    throw new Error('Chat room not found');
  }

  const chatData = chatDoc.data();
  if (chatData.buyerId !== senderId && chatData.sellerId !== senderId) {
    res.status(401);
    throw new Error('Not authorized to post in this chat');
  }

  const newMessage = {
    chatId,
    senderId,
    text,
    timestamp: new Date().toISOString(),
  };

  const messageRef = await db.collection('chats').doc(chatId).collection('messages').add(newMessage);
  
  // Update last message in chat room
  await chatRef.update({
    lastMessage: text,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send notification to the other user

  res.status(201).json({ success: true, data: { id: messageRef.id, ...newMessage } });
});

// @desc    Get messages for a chat room
// @route   GET /api/chat/:id/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user.uid;

  const chatDoc = await db.collection('chats').doc(chatId).get();
  if (!chatDoc.exists) {
    res.status(404);
    throw new Error('Chat room not found');
  }

  const chatData = chatDoc.data();
  if (chatData.buyerId !== userId && chatData.sellerId !== userId) {
    res.status(401);
    throw new Error('Not authorized to access this chat');
  }

  const messagesSnapshot = await db.collection('chats').doc(chatId).collection('messages').orderBy('timestamp', 'asc').get();
  const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  res.status(200).json({ success: true, data: messages });
});

// @desc    Delete a chat room (Admin only)
// @route   DELETE /api/chat/:id
// @access  Private/Admin
const deleteChatRoom = asyncHandler(async (req, res) => {
  const chatId = req.params.id;

  // TODO: Add logic to delete subcollection (messages) if needed, or use a Firebase Function
  
  await db.collection('chats').doc(chatId).delete();

  res.status(200).json({ success: true, message: 'Chat room deleted' });
});

export {
  getChatRooms,
  createChatRoom,
  getChatRoomById,
  postMessage,
  getMessages,
  deleteChatRoom
};