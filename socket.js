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
};
