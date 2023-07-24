exports.socketServices = (socket) => {
  // users online
  socket.on('online', (userId) => {
    socket.join(userId);
    // console.log(userId);
  });

  // user join a conversation room
  socket.on('join conversation', (conversationId) => {
    socket.join(conversationId);
    // console.log(conversationId);
  });

  // send and receive message
  socket.on('send message', (message) => {
    // console.log(message);
    let conversation = message.conversation;

    if (!conversation.users) return;
    conversation.users.forEach((user) => {
      if (user._id === message.sender._id) return;
      socket.in(user._id).emit('receive message', message);
    });
  });
};
