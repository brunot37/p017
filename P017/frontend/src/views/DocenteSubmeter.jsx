import React, { useState } from "react";
import "./DocenteSubmeter.css";

const DocenteSubmeter = () => {
  const [semestre, setSemestre] = useState("1"); 
  const [diasSelecionados, setDiasSelecionados] = useState([]); 
  const [horasSelecionadas, setHorasSelecionadas] = useState({}); 
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

  const handleDiaChange = (dia) => {
    setDiasSelecionados((prev) =>
      prev.includes(dia)
        ? prev.filter((item) => item !== dia)
        : [...prev, dia]
    );

  
    setHorasSelecionadas((prev) => {
      if (!prev[dia]) {
        return { ...prev, [dia]: [] }; 
        return { ...prev }; 
      }
    });
  };

  
  const handleHoraChange = (dia, hora) => {
    setHorasSelecionadas((prev) => {
      const updated = { ...prev };
      
      if (updated[dia]?.includes(hora)) {
        updated[dia] = updated[dia].filter((h) => h !== hora); 
      } else {
        updated[dia] = [...(updated[dia] || []), hora]; 
      }
      return updated;
    });
  };

  const submeterDisponibilidade = () => {
   
    console.log("Disponibilidade submetida", { semestre, diasSelecionados, horasSelecionadas });
  };

  return (
    <div className="horario-container fade-in">
      <aside className="horario-sidebar">
        <div className="user-info">
          <p className="user-name">Nome do Utilizador</p>
        </div>
        <nav className="menu">
          <ul>
            <li>Visualizar Horário</li>
            <li className="active">Submeter Disponibilidade</li>
            <li>Consultar Submissões</li>
          </ul>
        </nav>
        <button className="logout">SAIR</button>
      </aside>

      <main className="horario-content">
        <div className="horario-header">
          <h2 className="horario-titulo">Submeter Disponibilidade</h2>
        </div>

        <div className="disponibilidade-form">
          <div className="semestre-selector">
            <label>Escolha o semestre:</label>
            <select
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              className="semestre-select"
            >
              <option value="1">1º Semestre</option>
              <option value="2">2º Semestre</option>
            </select>
          </div>

          <div className="dias-selector">
            <p>Selecione os dias da semana:</p>
            {dias.map((dia) => (
              <label key={dia} className="dias-label">
                <input
                  type="checkbox"
                  checked={diasSelecionados.includes(dia)}
                  onChange={() => handleDiaChange(dia)}
                />
                {dia}
              </label>
            ))}
          </div>

          {diasSelecionados.length > 0 && (
            <div className="horas-selector">
              {diasSelecionados.map((dia) => (
                <div key={dia} className="horas-dia">
                  <p>{dia}:</p>
                  {horas.map((hora) => (
                    <label key={hora} className="hora-label">
                      <input
                        type="checkbox"
                        checked={horasSelecionadas[dia]?.includes(hora)}
                        onChange={() => handleHoraChange(dia, hora)}
                      />
                      {hora}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="submeter-container">
            <button onClick={submeterDisponibilidade} className="semana-atual-btn">
              Submeter
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocenteSubmeter;
