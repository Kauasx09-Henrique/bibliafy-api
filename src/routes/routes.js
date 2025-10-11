router.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ banco_online: true, hora: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ banco_online: false, erro: err.message });
  }
});
