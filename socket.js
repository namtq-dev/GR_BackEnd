let onlineUsers = [];

exports.socketServices = (socket, io) => {
  // users online
  socket.on('online', (userId) => {
    socket.join(userId);

    // add new user to online list
    if (!onlineUsers.some((user) => user.userId === userId)) {
      // console.log(`user ${userId} is online`);
      onlineUsers.push({ userId, socketId: socket.id });
    }

    // send online users list to FE
    io.emit('online users list', onlineUsers);

    // send socketId to start video call
    io.emit('setup socket', socket.id);
  });

  // socket disconnect
  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    // console.log('user has just disconnected');

    // send online users list to FE
    io.emit('online users list', onlineUsers);
  });

  // user join a conversation room
  socket.on('join conversation', (conversationId) => {
    socket.join(conversationId);
    // console.log('user open conversation: ', conversationId);
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

  // typing
  socket.on('typing', (conversationId) => {
    // console.log('typing in ', conversationId);
    socket.in(conversationId).emit('typing', conversationId);
  });

  socket.on('stop typing', (conversationId) => {
    // console.log('stop typing in ', conversationId);
    socket.in(conversationId).emit('stop typing');
  });

  // video call
  // make a call
  socket.on('call user', (data) => {
    let callReceiverId = data.userToCall;
    let callReceiver = onlineUsers.find(
      (user) => user.userId === callReceiverId
    );

    console.log('user make a call request to: ', callReceiver.socketId);

    io.to(callReceiver.socketId).emit('incoming call', {
      signal: data.signal,
      from: data.from,
      name: data.myName,
      picture: data.myPicture,
    });
  });

  // answer call
  socket.on('answer call', (data) => {
    console.log('call accepted with receiver socketId', data.to);

    io.to(data.to).emit('call accepted', data.signal);
  });

  // end call
  socket.on('end call', (socketId) => {
    console.log('user end call, send end signal to other users:', socketId);

    io.to(socketId).emit('call ended');
  });
};
