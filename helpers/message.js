const Message = require('../models/message');

exports.createMessage = async (data) => {
  let newMessage = await Message.create(data);

  if (!newMessage) return { message: 'Oops... Something went wrong!' };

  return newMessage;
};

exports.populateMessage = async (id) => {
  let msg = await Message.findById(id)
    .populate({
      path: 'sender',
      select: 'firstName lastName picture',
      model: 'User',
    })
    .populate({
      path: 'conversation',
      select: 'name isGroup users',
      model: 'Conversation',
      populate: {
        path: 'users',
        select: 'firstName lastName username email picture status',
        model: 'User',
      },
    });

  if (!msg) return { message: 'Oops... Something went wrong!' };

  return msg;
};

exports.getAllConverMessages = async (converId) => {
  const messages = await Message.find({ conversation: converId })
    .populate('sender', 'firstName lastName email picture status')
    .populate('conversation');

  if (!messages) return { message: 'Oops... Something went wrong!' };

  return messages;
};
