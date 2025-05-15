import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GerirDocentes.css";

const GerirDocentes = () => {
  const navigate = useNavigate();
  const [paginaAtiva, setPaginaAtiva] = useState("gerirDocentes");

  // Dados simulados dos docentes
  const [docentes, setDocentes] = useState([]);
  // Dados simulados dos coordenadores para o seletor
  const [coordenadores, setCoordenadores] = useState([]);

  useEffect(() => {
    setDocentes([
      { id: 1, nome: "Docente 01", coordenadorId: 1 },
      { id: 2, nome: "Docente 02", coordenadorId: 2 },
      { id: 3, nome: "Docente 03", coordenadorId: null },
    ]);

    setCoordenadores([
      { id: 1, nome: "User00" },
      { id: 2, nome: "User01" },
      { id: 3, nome: "User02" },
    ]);
  }, []);

  const handleCoordenadorChange = (idDocente, novoCoordId) => {
    setDocentes((prev) =>
      prev.map((doc) =>
        doc.id === idDocente ? { ...doc, coordenadorId: Number(novoCoordId) } : doc
      )
    );
    // Aqui podes fazer PUT para API para guardar alteração
  };

  // Sidebar handlers
  const handleGerirUtilizadores = () => {
    setPaginaAtiva("gerirUtilizadores");
    navigate("/Adm");
  };

  const handleGerirDepartamento = () => {
    setPaginaAtiva("gerirDepartamento");
    navigate("/GerirDepartamento");
  };

  const handleGerirCoordenadores = () => {
    setPaginaAtiva("gerirCoordenadores");
    navigate("/GerirCoordenadores");
  };

  const handleGerirDocentes = () => {
    setPaginaAtiva("gerirDocentes");
    navigate("/GerirDocentes");
  };

  const handleLogout = () => {
    navigate("/App");
  };

  return (
    <div className="horario-container">
      <aside className="horario-sidebar">
        <nav className="menu">
          <ul>
            <li
              onClick={handleGerirUtilizadores}
              className={paginaAtiva === "gerirUtilizadores" ? "active gerir-utilizadores" : ""}
            >
              Gerir Utilizadores
            </li>
            <li
              onClick={handleGerirDepartamento}
              className={paginaAtiva === "gerirDepartamento" ? "active" : ""}
            >
              Gerir Departamento
            </li>
            <li
              onClick={handleGerirCoordenadores}
              className={paginaAtiva === "gerirCoordenadores" ? "active" : ""}
            >
              Gerir Coordenadores
            </li>
            <li
              onClick={handleGerirDocentes}
              className={paginaAtiva === "gerirDocentes" ? "active" : ""}
            >
              Gerir Docentes
            </li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout">
          SAIR
        </button>
      </aside>

      <main className="horario-content">
        <table className="tabela-coordenadores">
          <thead>
            <tr>
              <th>Docente</th>
              <th>Alterar Coordenador</th>
            </tr>
          </thead>
          <tbody>
            {docentes.length === 0 && (
              <tr>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  Nenhum docente encontrado
                </td>
              </tr>
            )}

            {docentes.map(({ id, nome, coordenadorId }) => (
              <tr key={id}>
                <td>{nome}</td>
                <td>
                  <select
                    value={coordenadorId || ""}
                    onChange={(e) => handleCoordenadorChange(id, e.target.value)}
                  >
                    <option value="">Selecionar Coordenador</option>
                    {coordenadores.map((coord) => (
                      <option key={coord.id} value={coord.id}>
                        {coord.nome}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default GerirDocentes;
