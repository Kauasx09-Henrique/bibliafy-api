const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
   user: "562018581953b2", 
    pass: "f547b342bafa5c"
  }
});

exports.register = async (req, res) => {
  const { name, email, password, nickname, logo_url } = req.body;

  if (!name || !email || !password || !nickname) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    const emailExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailExists.rows.length > 0) {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }

    const nicknameExists = await db.query('SELECT id FROM users WHERE nickname = $1', [nickname]);
    if (nicknameExists.rows.length > 0) {
      return res.status(409).json({ message: 'Este apelido já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, nickname, logo_url, role, is_active)
       VALUES ($1, $2, $3, $4, $5, 'user', true)
       RETURNING id, name, email, nickname, logo_url, role, is_active, created_at`,
      [name, email, passwordHash, nickname, logo_url || null]
    );

    return res.status(201).json({
      message: 'Usuário criado com sucesso!',
      user: rows[0]
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos.' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '5d' }
    );

    const needsNickname = !user.nickname;

    delete user.password_hash;

    return res.status(200).json({
      message: 'Login bem-sucedido!',
      user,
      token,
      needsNickname
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.userId;
  const { name, password, nickname, logo_url } = req.body;

  if (!name && !password && !nickname && !logo_url) {
    return res.status(400).json({ message: 'Envie um dado para atualizar.' });
  }

  try {
    if (nickname) {
      const nicknameExists = await db.query(
        'SELECT id FROM users WHERE nickname = $1 AND id <> $2',
        [nickname, userId]
      );

      if (nicknameExists.rows.length > 0) {
        return res.status(409).json({ message: 'Este apelido já está em uso.' });
      }
    }

    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    await db.query(
      `
      UPDATE users SET 
        name = COALESCE($1, name),
        nickname = COALESCE($2, nickname),
        logo_url = COALESCE($3, logo_url),
        password_hash = COALESCE($4, password_hash),
        updated_at = NOW()
      WHERE id = $5
      `,
      [name || null, nickname || null, logo_url || null, passwordHash, userId]
    );

    return res.status(200).json({ message: 'Perfil atualizado com sucesso!' });

  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.checkNickname = async (req, res) => {
  const userId = req.userId;

  try {
    const { rows } = await db.query(
      'SELECT id, name, email, nickname FROM users WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const user = rows[0];

    return res.status(200).json({
      hasNickname: !!user.nickname,
      nickname: user.nickname || null,
      suggestedNickname: user.nickname || user.name || user.email
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.query('SELECT id, name FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(200).json({ message: 'Se o email existir, as instruções foram enviadas.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    
    const now = new Date();
    now.setHours(now.getHours() + 1); 

    await db.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [token, now, user.rows[0].id]
    );

    await transport.sendMail({
      to: email,
      from: 'noreply@bibliafy.com',
      subject: 'Recuperação de Senha - Bibliafy',
      html: `
        <p>Olá, ${user.rows[0].name}</p>
        <p>Você solicitou a recuperação de senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <a href="http://localhost:5173/reset-password/${token}">Recuperar Senha</a>
        <p>O link expira em 1 hora.</p>
      `,
    });

    return res.status(200).json({ message: 'Email enviado com sucesso.' });

  } catch (error) {
    return res.status(500).json({ message: 'Erro ao processar solicitação.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Dados inválidos.' });
  }

  try {
    const user = await db.query(
      'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [passwordHash, user.rows[0].id]
    );

    return res.status(200).json({ message: 'Senha alterada com sucesso!' });

  } catch (error) {
    return res.status(500).json({ message: 'Erro ao resetar senha.' });
  }
};