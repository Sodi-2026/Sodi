/**
 * server.ts — Stub do servidor Express.
 *
 * Este arquivo é um ponto de partida para quando você decidir migrar
 * do Supabase/Edge Functions para uma API própria rodando no Render ou VPS.
 *
 * PARA ATIVAR:
 * 1. Instale as dependências: npm install -w apps/backend
 * 2. Rode: npm run dev -w apps/backend
 * 3. Implemente as rotas em src/routes/
 * 4. Atualize o serviceProvider.ts no frontend para usar os serviços REST
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Rotas de Health Check ---
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: '@soday/backend',
    timestamp: new Date().toISOString(),
  });
});

// --- Placeholder de Rotas ---
// TODO: Implementar quando migrar do Supabase
// app.use('/api/insumos', insumosRouter);
// app.use('/api/tipologias', tipologiasRouter);

app.listen(PORT, () => {
  console.log(`[SODAY Backend] Rodando em http://localhost:${PORT}`);
  console.log(`[SODAY Backend] Health check: http://localhost:${PORT}/health`);
});
