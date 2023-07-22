exports.sendMessage = async (req, res) => {
  try {
    res.send('send');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    res.send('get');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
