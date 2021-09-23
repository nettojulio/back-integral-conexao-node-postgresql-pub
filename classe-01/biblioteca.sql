DROP DATABASE IF EXISTS biblioteca;
CREATE DATABASE biblioteca;

DROP TABLE IF EXISTS autores;

CREATE TABLE autores (
    id SERIAL PRIMARY KEY,
    nome text NOT NULL,
    idade SMALLINT
);

DROP TABLE IF EXISTS livros;

CREATE TABLE livros (
    id SERIAL PRIMARY KEY,
    autor_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    editora VARCHAR(100),
    genero VARCHAR(50) NOT NULL,
    data_publicacao DATE,
    FOREIGN KEY (autor_id) REFERENCES autores(id)
);

DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  idade SMALLINT,
  email VARCHAR(50) UNIQUE NOT NULL,
  telefone VARCHAR(11),
  cpf VARCHAR(11) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS emprestimos;
DROP TYPE IF EXISTS status_type;

CREATE TYPE status_type AS ENUM ('pendente', 'devolvido');

CREATE TABLE IF NOT EXISTS emprestimos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  livro_id INTEGER NOT NULL,
  status status_type DEFAULT 'pendente',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (livro_id) REFERENCES livros(id)
);