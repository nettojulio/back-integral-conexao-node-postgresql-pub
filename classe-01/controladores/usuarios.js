const conexao = require('../conexao');

const listarUsuarios = async (req, res) => {

    try {
        const { rows: usuarios } = await conexao.query('SELECT * FROM usuarios');

        for (const usuario of usuarios) {
            const { rows: emprestimos } = await conexao.query(
                `SELECT DISTINCT emprestimos.id, usuario_id, livro_id, status, nome as livro 
                FROM emprestimos, livros 
                WHERE usuario_id = $1`, [usuario.id]
            );
            usuario.emprestimos = emprestimos;
        }

        return res.status(200).json(usuarios);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await conexao.query('SELECT * FROM usuarios WHERE id = $1', [id]);

        if (usuario.rowCount === 0) return res.status(404).json('Usuário não encontrado!');

        const { rows: emprestimos } = await conexao.query(
            `SELECT DISTINCT emprestimos.id, usuario_id, livro_id, status, nome as livro 
            FROM emprestimos, livros 
            WHERE usuario_id = $1`, [usuario.rows[0].id]
        );
        usuario.rows[0].emprestimos = emprestimos;

        return res.status(200).json(usuario.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarUsuario = async (req, res) => {
    const { nome, idade, email, telefone, cpf } = req.body;

    !nome.trim() && res.status(404).json('Nome é obrigatório');
    if (Number(idade) <= 0 || isNaN(idade)) return res.status(404).json('Idade Inválida');
    if (!email.trim() || !email.trim().includes('@') || !email.trim().includes('.') || email.trim().length < 6) return res.status(404).json('E-Mail inválido');
    if (isNaN(telefone) || telefone.trim().length < 10) return res.status(404).json('Telefone inválido');
    if (isNaN(cpf) || cpf.trim().length !== 11) return res.status(404).json('CPF inválido');

    try {
        const usuario = await conexao.query(
            `INSERT INTO usuarios 
            (nome, idade, email, telefone, cpf) 
            VALUES ($1, $2,$3, $4, $5)`, [nome, idade, email, telefone, cpf]
        );

        usuario.rowCount === 0 ?
            res.status(400).json('Não foi possível cadastrar o usuário') :
            res.status(201).json("Usuário Cadastrado com sucesso!");
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarUsuario = async (req, res) => {
    const { id } = req.params;
    let { nome, idade, email, telefone, cpf } = req.body;

    try {
        const prevUsuario = await conexao.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (prevUsuario.rowCount === 0) return res.status(404).json('Usuário não encontrado!');

        const { nome: prevNome, idade: prevIdade, email: prevEmail, telefone: prevTelefone, cpf: prevCpf } = prevUsuario.rows[0];

        nome = !nome ? prevNome : nome;
        idade = !idade ? prevIdade : idade;
        email = !email ? prevEmail : email;
        telefone = !telefone ? prevTelefone : telefone;
        cpf = !cpf ? prevCpf : cpf;

        if (!nome.trim() || !nome) return res.status(404).json('Nome é obrigatório');
        if (Number(idade) <= 0 || isNaN(idade)) return res.status(404).json('Idade Inválida');
        if (!email.trim() || !email.trim().includes('@') || !email.trim().includes('.') || email.trim().length < 6) return res.status(404).json('E-Mail inválido');
        if (isNaN(telefone) || telefone.trim().length < 10) return res.status(404).json('Telefone inválido');
        if (isNaN(cpf) || cpf.trim().length !== 11) return res.status(404).json('CPF inválido');

        const usuarioAtualizado = await conexao.query(
            `UPDATE usuarios 
            SET nome = $1, idade = $2, email = $3, telefone = $4, cpf = $5 
            WHERE id = $6`, [nome, idade, email, telefone, cpf, id]
        );
        if (usuarioAtualizado.rowCount === 0) return res.status(404).json('Não foi possivel atualizar o usuário');

        return res.status(200).json('Usuário atualizado com sucesso!');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await conexao.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (usuario.rowCount === 0) return res.status(404).json('Usuário não encontrado!');

        const emprestimosUsuario = await conexao.query('select * from emprestimos where usuario_id = $1', [id]);
        if (emprestimosUsuario.rowCount !== 0) return res.status(401).json("Usuário possui emprestimos cadastrados");

        const usuarioExcluido = await conexao.query('DELETE FROM usuarios WHERE id = $1', [id]);
        if (usuarioExcluido.rowCount === 0) return res.status(404).json('Não foi possivel excluir o usuário');

        return res.status(200).json('Usuário excluído com sucesso!');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = { listarUsuarios, obterUsuario, cadastrarUsuario, atualizarUsuario, excluirUsuario }