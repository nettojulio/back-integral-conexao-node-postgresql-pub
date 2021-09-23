const conexao = require('../conexao');

const listarEmprestimos = async (req, res) => {

    try {
        const { rows: emprestimos } = await conexao.query(
            `SELECT 
            e.id, u.nome as usuario, u.telefone, u.email, l.nome as livro, e.status 
            FROM emprestimos e
            LEFT JOIN usuarios u on e.usuario_id = u.id
            LEFT JOIN livros l on e.livro_id = l.id`
        );

        return res.status(200).json(emprestimos);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterEmprestimo = async (req, res) => {
    const { id } = req.params;

    try {
        const emprestimo = await conexao.query(
            `SELECT 
            e.id, u.nome as usuario, u.telefone, u.email, l.nome as livro, e.status 
            FROM emprestimos e
            LEFT JOIN usuarios u on e.usuario_id = u.id
            LEFT JOIN livros l on e.livro_id = l.id
            WHERE e.id = $1`, [id]
        );
        if (emprestimo.rowCount === 0) return res.status(404).json('Empréstimo não encontrado!');

        return res.status(200).json(emprestimo.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarEmprestimo = async (req, res) => {
    const { usuario_id, livro_id, status } = req.body;

    if (!usuario_id || Number(usuario_id) <= 0 || isNaN(usuario_id)) return res.status(400).json("Empréstimo não informado");
    if (!livro_id || Number(livro_id) <= 0 || isNaN(livro_id)) return res.status(400).json("Obra para empréstimo não informada");
    if (status.trim() !== 'devolvido' && status.trim() !== 'pendente') return res.status(400).json("Status não informado");

    try {
        const validarIdUsuario = await conexao.query('SELECT id from usuarios WHERE ID = $1', [usuario_id]);
        if (!validarIdUsuario.rowCount) return res.status(404).json("Usuário não cadastrado em sistema.");

        const validarIdLivro = await conexao.query('SELECT id from livros WHERE ID = $1', [livro_id]);
        if (!validarIdLivro.rowCount) return res.status(404).json("Livro não cadastrado em sistema.");

        const emprestimo = await conexao.query(
            `INSERT INTO emprestimos 
            (usuario_id, livro_id, status) 
            VALUES ($1, $2, $3)`, [usuario_id, livro_id, status]
        );

        emprestimo.rowCount === 0 ?
            res.status(400).json('Não foi possível cadastrar o empréstimo') :
            res.status(201).json("Empréstimo cadastrado com sucesso!")
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarEmprestimo = async (req, res) => {
    const { id } = req.params;
    const { usuario_id, livro_id, status } = req.body;

    try {
        if (usuario_id || livro_id || usuario_id === 0 || livro_id === 0) return res.status(401).json("Permissão negada! Permitida APENAS alteração de status");

        const prevEmprestimo = await conexao.query('SELECT * FROM emprestimos WHERE id = $1', [id]);
        if (prevEmprestimo.rowCount === 0) return res.status(404).json('Empréstimo não encontrado!');

        const { status: prevStatus } = prevEmprestimo.rows[0];
        if (prevStatus === status) return res.status(400).json("Não houveram alterações de Status");
        if (status.trim() !== 'devolvido' && status.trim() !== 'pendente') return res.status(400).json("Status não informado");

        const statusAtualizado = await conexao.query('UPDATE emprestimos SET status = $1 WHERE id = $2', [status, id]);
        if (statusAtualizado.rowCount === 0) return res.status(404).json('Não foi possivel atualizar o emprestimo');

        return res.status(200).json('Empréstimo atualizado com sucesso!');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirEmprestimo = async (req, res) => {
    const { id } = req.params;

    try {
        const emprestimo = await conexao.query('SELECT * FROM emprestimos WHERE id = $1', [id]);
        if (emprestimo.rowCount === 0) return res.status(404).json('Empréstimo não encontrado!');

        const emprestimoExcluido = await conexao.query('DELETE FROM emprestimos WHERE id = $1', [id]);
        if (emprestimoExcluido.rowCount === 0) return res.status(404).json('Não foi possivel excluir o empréstimo');

        return res.status(200).json('Empréstimo excluído com sucesso!');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = { listarEmprestimos, obterEmprestimo, cadastrarEmprestimo, atualizarEmprestimo, excluirEmprestimo }