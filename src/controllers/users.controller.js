const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  try {
    const { rows: existingUsers } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const { rows: newUserRows } = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, passwordHash]
    );

    const newUser = newUserRows[0];

    return res.status(201).json({
      message: 'Usuário criado com sucesso!',
      user: newUser,
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  try {
    const { rows: userRows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = userRows[0];

    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const payload = { id: user.id, name: user.name };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    delete user.password_hash;

    return res.status(200).json({
      message: 'Login bem-sucedido!',
      user,
      token,
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
// Adicione esta função ao final de src/controllers/users.controller.js

exports.updateProfile = async (req, res) => {
  const userId = req.userId; // Vem do middleware de autenticação
  const { name, password } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'O nome é obrigatório.' });
  }

  try {
    // Se uma nova senha foi enviada, criptografa ela
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      await db.query(
        'UPDATE users SET name = $1, password_hash = $2, updated_at = NOW() WHERE id = $3',
        [name, passwordHash, userId]
      );
    } else {
      // Se não, atualiza apenas o nome
      await db.query(
        'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2',
        [name, userId]
      );
    }

    return res.status(200).json({ message: 'Perfil atualizado com sucesso!' });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};