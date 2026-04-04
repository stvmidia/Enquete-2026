import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.env ? new URL(import.meta.url) : import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    const questionsPath = path.join(process.cwd(), 'questions.json');

    // API para buscar as questões do arquivo
    app.get('/api/questions', async (req, res) => {
        try {
            const data = await fs.readFile(questionsPath, 'utf-8');
            res.json(JSON.parse(data));
        } catch (error) {
            console.error('Erro ao ler questões:', error);
            res.status(500).json({ error: 'Erro ao carregar questões' });
        }
    });

    // API para salvar as questões no arquivo
    app.post('/api/questions', async (req, res) => {
        try {
            const questions = req.body;
            await fs.writeFile(questionsPath, JSON.stringify(questions, null, 4), 'utf-8');
            res.json({ success: true });
        } catch (error) {
            console.error('Erro ao salvar questões:', error);
            res.status(500).json({ error: 'Erro ao salvar questões' });
        }
    });

    // Configuração do Vite como middleware
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

startServer();
