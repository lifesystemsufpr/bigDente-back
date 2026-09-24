import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // A URL real continua obrigatória ao iniciar a API ou acessar o banco.
  // O fallback permite gerar o client durante builds sem expor credenciais.
  datasource: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/bigdente?schema=public',
  },
});
