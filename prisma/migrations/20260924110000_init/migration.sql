CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERADOR', 'ALUNO');

CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "students" (
    "student_id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "grr" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "students_pkey" PRIMARY KEY ("student_id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "students_code_key" ON "students"("code");
CREATE UNIQUE INDEX "students_grr_key" ON "students"("grr");
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

ALTER TABLE "students"
ADD CONSTRAINT "students_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
