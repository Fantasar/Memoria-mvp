const crispMessageRepository = require('../repositories/crispMessageRepository');

const receiveWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;
    if (event !== 'message:send') return res.status(200).json({ ok: true });
    if (data?.origin !== 'chat') return res.status(200).json({ ok: true });

    await crispMessageRepository.create(
      data?.session_id     || 'unknown',
      data?.user?.email    || null,
      data?.user?.nickname || 'Visiteur',
      data?.content        || ''
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Erreur webhook Crisp:', error.message);
    return res.status(500).json({ ok: false });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await crispMessageRepository.findAll();
    const unread   = await crispMessageRepository.countUnread();
    return res.status(200).json({ success: true, data: { messages, unread } });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const markAsRead = async (req, res) => {
  try {
    await crispMessageRepository.markAsRead(req.params.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = { receiveWebhook, getMessages, markAsRead };