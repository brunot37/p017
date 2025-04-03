import React, { useState } from "react";
import "./DocenteVizualizarHorario.css";

const DocenteVizualizarHorario = () => {
  const calcularSemanaAtual = () => {
    const hoje = new Date();
    const base = new Date("2025-09-14");
    const diffDias = Math.floor((hoje - base) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDias / 7);
  };

  const [semanaIndex, setSemanaIndex] = useState(calcularSemanaAtual());

  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  const gerarHoras = () => {
    const horas = [];
    let hora = 8;
    let minuto = 0;
    while (hora < 20 || (hora === 20 && minuto === 0)) {
      const h = hora.toString().padStart(2, '0');
      const m = minuto.toString().padStart(2, '0');
      horas.push(`${h}:${m}`);
      minuto += 30;
      if (minuto === 60) {
        minuto = 0;
        hora += 1;
      }
    }
    return horas;
  };

  const horas = gerarHoras();
  const dataInicio = new Date("2025-09-14");
  const dataAtual = new Date(dataInicio);
  dataAtual.setDate(dataInicio.getDate() + semanaIndex * 7);
  const dataFim = new Date(dataAtual);
  dataFim.setDate(dataAtual.getDate() + 6);

  const formatarData = (data) => {
    return data.toLocaleDateString('pt-PT');
  };

  const mudarSemana = (direcao) => {
    setSemanaIndex((prev) => prev + direcao);
  };

  const voltarHoje = () => {
    setSemanaIndex(calcularSemanaAtual());
  };

  return (
    <div className="horario-container fade-in">
      <aside className="horario-sidebar">
        <div className="user-info">
          <div className="user-avatar"></div>
          <p>User1</p>
        </div>
        <nav className="menu">
          <ul>
            <li className="active">Visualizar Horário</li>
            <li>Submeter Disponibilidade</li>
            <li>Consultar Submissões</li>
          </ul>
        </nav>
        <button className="logout">SAIR</button>
      </aside>

      <main className="horario-content">
        <div className="horario-header">
          <h2 className="horario-titulo">
            Semana {formatarData(dataAtual)} - {formatarData(dataFim)}
          </h2>
          <div className="semana-navegacao">
            <button onClick={() => mudarSemana(-1)}>&larr; Anterior</button>
            <button onClick={voltarHoje}>Semana Atual</button>
            <button onClick={() => mudarSemana(1)}>Próxima &rarr;</button>
          </div>
        </div>

        <div className="horario-tabela-wrapper">
          <table className="horario-tabela">
            <thead>
              <tr>
                <th>Hora</th>
                {dias.map((dia) => <th key={dia}>{dia}</th>)}
              </tr>
            </thead>
            <tbody>
              {horas.map((hora) => (
                <tr key={hora}>
                  <td className="hora-coluna">{hora}</td>
                  {dias.map((dia) => {
                    const cellId = `${dia}-${hora.replace(":", "")}`;
                    return (
                      <td key={cellId} id={cellId} className="horario-celula">-</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default DocenteVizualizarHorario;
