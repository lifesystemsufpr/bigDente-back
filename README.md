# BigDente API

API REST do projeto BigDente, construída com NestJS, Prisma e PostgreSQL.

## Requisitos

- Node.js 20 ou superior
- pnpm
- Docker e Docker Compose

## Executando o projeto

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm prisma:deploy
pnpm start:dev
```

No PowerShell, copie o arquivo de ambiente com:

```powershell
Copy-Item .env.example .env
```

A API usa o prefixo `/api`. A verificação de saúde está disponível em
`GET /api/health`.

## Estrutura do projeto

```text
bigDente-back/
├── prisma/
│   ├── migrations/              # Histórico versionado do banco
│   └── schema.prisma            # Models User, Student e enum Role
├── src/
│   ├── common/
│   │   └── transforms/          # Normalizações reutilizadas pelos DTOs
│   ├── infrastructure/
│   │   ├── auth/                # Serviço de hash de senha
│   │   └── database/            # Módulo global e client Prisma
│   ├── modules/
│   │   ├── users/
│   │   │   ├── dto/             # Contratos e validações de entrada
│   │   │   ├── entities/        # IUser e ROLE
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   └── students/
│   │       ├── dto/             # Contratos e validações de entrada
│   │       ├── entities/        # IStudent
│   │       ├── students.controller.ts
│   │       ├── students.module.ts
│   │       └── students.service.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   └── main.ts
├── test/                        # Testes E2E
├── compose.yaml                 # PostgreSQL local
└── prisma.config.ts             # Configuração do Prisma CLI
```

Cada módulo de negócio segue as responsabilidades abaixo:

- `controller`: define rotas, parâmetros e códigos HTTP.
- `service`: concentra regras de negócio e acesso ao Prisma.
- `dto`: valida e normaliza os dados recebidos pela API.
- `entities`: mantém as interfaces e enums do domínio.
- `module`: registra controllers e providers no NestJS.

O código gerado pelo Prisma fica em `src/generated/prisma`, é ignorado pelo Git
e recriado automaticamente antes de cada build.

## Modelo de dados

### User

- `id`: identificador autoincremental.
- `name`: nome do usuário.
- `email`: e-mail único, normalizado para minúsculas.
- `password`: armazenada como hash `scrypt` e nunca retornada pela API.
- `role`: `ADMIN`, `OPERADOR` ou `ALUNO`.

### Student

- `studentId`: identificador autoincremental do aluno.
- `code`: código único.
- `grr`: GRR único e normalizado para maiúsculas.
- `course`: curso mantido como texto até ser definida uma enumeração ou tabela.
- `userId`: vínculo único com `User`.

`Student` possui uma relação 1:1 com `User`. Sua criação e atualização são
transacionais e seu papel é sempre `ALUNO`.

## CRUD de usuários

| Método   | Rota             | Descrição                        |
| -------- | ---------------- | -------------------------------- |
| `POST`   | `/api/users`     | Cria um usuário                  |
| `GET`    | `/api/users`     | Lista usuários                   |
| `GET`    | `/api/users/:id` | Busca um usuário                 |
| `PATCH`  | `/api/users/:id` | Atualiza parcialmente um usuário |
| `DELETE` | `/api/users/:id` | Exclui um usuário                |

Exemplo de criação:

```json
{
  "name": "Administrador",
  "email": "admin@bigdente.com",
  "password": "senha-segura",
  "role": "ADMIN"
}
```

No `PATCH`, envie somente os campos que serão alterados. Um usuário vinculado a
um aluno não pode deixar de ter o papel `ALUNO`. Excluir um usuário também exclui
seu registro de aluno, quando houver, devido à relação com `ON DELETE CASCADE`.

## CRUD de alunos

| Método   | Rota                       | Descrição                               |
| -------- | -------------------------- | --------------------------------------- |
| `POST`   | `/api/students`            | Cria usuário e aluno na mesma transação |
| `GET`    | `/api/students`            | Lista alunos                            |
| `GET`    | `/api/students/:studentId` | Busca um aluno                          |
| `PATCH`  | `/api/students/:studentId` | Atualiza dados pessoais e acadêmicos    |
| `DELETE` | `/api/students/:studentId` | Exclui o aluno e seu usuário            |

Exemplo de criação:

```json
{
  "name": "Maria da Silva",
  "email": "maria@ufpr.br",
  "password": "senha-segura",
  "role": "ALUNO",
  "code": "ODONTO-001",
  "grr": "GRR20260001",
  "course": "Odontologia"
}
```

As respostas de aluno são achatadas para refletir `IStudent`:

```json
{
  "id": 1,
  "name": "Maria da Silva",
  "email": "maria@ufpr.br",
  "role": "ALUNO",
  "studentId": 1,
  "code": "ODONTO-001",
  "grr": "GRR20260001",
  "course": "Odontologia",
  "userId": 1
}
```

Campos desconhecidos são rejeitados. IDs inválidos retornam `400`, recursos
inexistentes retornam `404` e conflitos de e-mail, código ou GRR retornam `409`.

## Como criar uma nova entidade

O exemplo abaixo adiciona a entidade `Appointment`. Substitua esse nome e seus
campos pelos dados do novo domínio. Use nomes no singular e `PascalCase` no
Prisma/TypeScript (`Appointment`) e nomes no plural e minúsculos nas pastas e
rotas (`appointments`).

### 1. Defina o modelo e suas regras

Antes de criar arquivos, registre:

- quais campos são obrigatórios e quais são opcionais;
- quais valores precisam ser únicos;
- quais relações existem e qual deve ser o comportamento ao excluir um registro;
- se um conjunto fechado de valores deve ser um `enum`;
- quais dados podem aparecer nas respostas da API.

Dados sensíveis, como senhas e tokens, nunca devem fazer parte da seleção
retornada pelos services.

### 2. Adicione o model ao Prisma

Edite `prisma/schema.prisma`:

```prisma
model Appointment {
  id          Int      @id @default(autoincrement())
  description String
  scheduledAt DateTime @map("scheduled_at")
  studentId   Int      @map("student_id")
  student     Student  @relation(fields: [studentId], references: [studentId], onDelete: Cascade)

  @@index([studentId])
  @@map("appointments")
}
```

Toda relação precisa existir nos dois lados. Nesse exemplo, adicione também ao
model `Student`:

```prisma
appointments Appointment[]
```

Use `@map` para colunas em `snake_case` e `@@map` para nomes de tabelas no plural,
mantendo os nomes TypeScript em `camelCase`.

### 3. Crie e confira a migration

Com o PostgreSQL local em execução e o `.env` configurado:

```bash
pnpm prisma:migrate --name add_appointments
pnpm prisma:generate
```

Confira o SQL criado em `prisma/migrations` antes de continuar. Uma migration que
já foi aplicada em outro ambiente não deve ser reescrita; crie outra migration
para qualquer correção. Em produção, aplique migrations com `pnpm prisma:deploy`.

O diretório `src/generated/prisma` é gerado automaticamente. Não edite nem
versione seus arquivos manualmente.

### 4. Crie a entidade de domínio

Crie `src/modules/appointments/entities/appointment.entity.ts`:

```ts
export interface IAppointment {
  id?: number;
  description: string;
  scheduledAt: Date;
  studentId: number;
}
```

Essa interface representa o domínio da aplicação. O model Prisma representa a
persistência; mesmo que sejam semelhantes, mantenha cada um em sua camada.

### 5. Crie os DTOs de entrada

Crie `src/modules/appointments/dto/create-appointment.dto.ts`:

```ts
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;

  @Type(() => Date)
  @IsDate()
  scheduledAt!: Date;

  @Type(() => Number)
  @IsInt()
  studentId!: number;
}
```

Crie também `update-appointment.dto.ts`, deixando todos os campos opcionais com
`@IsOptional()`. Não reutilize diretamente tipos do Prisma como DTOs: as classes
de DTO são necessárias para validar dados em tempo de execução.

Se um texto precisar de normalização, reutilize as funções de
`src/common/transforms/normalize-string.transform.ts` com `@Transform(...)`.

### 6. Implemente o service

Crie `src/modules/appointments/appointments.service.ts`. O service deve:

- acessar o banco somente pelo `PrismaService`;
- implementar `create`, `findAll`, `findOne`, `update` e `remove`;
- lançar `NotFoundException` quando o recurso não existir;
- converter violações de unicidade em `ConflictException`;
- usar `$transaction` quando uma operação alterar mais de uma entidade;
- selecionar explicitamente apenas os campos que podem ser retornados.

Estrutura mínima:

```ts
@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({ data: dto });
  }

  findAll() {
    return this.prisma.appointment.findMany({ orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }

    return appointment;
  }

  async update(id: number, dto: UpdateAppointmentDto) {
    await this.findOne(id);
    return this.prisma.appointment.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.appointment.delete({ where: { id } });
  }
}
```

Inclua os imports correspondentes ao copiar o exemplo.

### 7. Exponha o controller

Crie `src/modules/appointments/appointments.controller.ts` com o padrão REST:

```ts
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

O prefixo `/api` já é aplicado globalmente em `main.ts`; portanto, esse controller
responderá em `/api/appointments`.

### 8. Registre o módulo

Crie `src/modules/appointments/appointments.module.ts`:

```ts
@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
```

Depois importe `AppointmentsModule` no array `imports` de `src/app.module.ts`.
Exporte o service apenas se outro módulo realmente precisar usá-lo.

Ao final, a nova pasta deve ter esta forma:

```text
src/modules/appointments/
├── dto/
│   ├── create-appointment.dto.ts
│   └── update-appointment.dto.ts
├── entities/
│   └── appointment.entity.ts
├── appointments.controller.ts
├── appointments.module.ts
└── appointments.service.ts
```

### 9. Adicione testes e documentação

Teste pelo menos:

- criação com dados válidos e rejeição de dados inválidos;
- listagem e busca por ID;
- resposta `404` para ID inexistente;
- atualização parcial;
- exclusão com status `204`;
- regras de unicidade, relações e transações específicas da entidade.

Documente no README as novas rotas, um payload de criação, o formato da resposta
e qualquer regra de exclusão ou relacionamento que não seja óbvia.

### 10. Execute a verificação final

```bash
pnpm format
pnpm lint
pnpm build
pnpm test
pnpm test:e2e
```

Antes de entregar, confirme também que somente a migration esperada foi criada e
que nenhum segredo do `.env` ou arquivo de `src/generated/prisma` entrou no Git.

## Comandos disponíveis

```bash
pnpm start:dev       # desenvolvimento com watch
pnpm build           # gera o Prisma Client e compila
pnpm lint            # valida e corrige o código
pnpm format          # formata TypeScript e schema Prisma
pnpm test            # testes unitários
pnpm test:e2e        # testes HTTP
pnpm prisma:migrate  # cria uma migration em desenvolvimento
pnpm prisma:deploy   # aplica migrations existentes
pnpm prisma:studio   # interface de inspeção do banco
```
