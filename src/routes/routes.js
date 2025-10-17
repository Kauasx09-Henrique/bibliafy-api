// Em: src/routes/routes.js

const express = require('express');
// ... suas outras importações de rotas (usersRoutes, etc.)
const progressRoutes = require('./progress.routes'); // <-- 1. IMPORTE AS NOVAS ROTAS

const routes = express.Router();

// ... seu código onde você usa as outras rotas (routes.use('/users', ...), etc.)

// <-- 2. ADICIONE ESTA LINHA PARA USAR AS ROTAS DE PROGRESSO
// Isso diz: "Qualquer requisição que chegar em /progress, mande para o arquivo progressRoutes"
routes.use('/progress', progressRoutes);

module.exports = routes;