import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DocenteSubmeter.css";

const DocenteSubmeter = () => {
  const navigate = useNavigate();

  const [semestre, setSemestre] = useState("1");
  const [horasSelecionadas, setHorasSelecionadas] = useState({});
  const [anoLetivo, setAnoLetivo] = useState("2024/2025");
  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  const unidadesCurriculares1Semestre = [
    "Sistemas Distribuídos",
    "Cibersegurança",
    "Internet das Coisas",
    "Inteligência Artificial",
  ];

  const unidadesCurriculares2Semestre = [
    "Análise Matemática",
    "Sistemas Embebidos",
    "POO",
    "Sistemas Digitais",
  ];

  const unidadesCurriculares =
    semestre === "1" ? unidadesCurriculares1Semestre : unidadesCurriculares2Semestre;

  const unidadesOrdenadas = unidadesCurriculares.sort();

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
    const horarios = [];
    Object.keys(horasSelecionadas).forEach((dia) => {
      horasSelecionadas[dia].forEach((hora) => {
        horarios.push({
          dia: new Date().toISOString().split('T')[0],
          hora_inicio: hora,
          hora_fim: hora,
          semestre: semestre,
          ano_letivo: anoLetivo,  // Inclui o ano letivo
        });
      });
    });

    fetch("http://localhost:8000/api/submeter-horario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ horarios }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Horários submetidos com sucesso!");
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Erro ao submeter horários.");
      });
  };

  const handleVisualizarHorario = () => {
    navigate('/DocenteVisualizarHorario');
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/Registo");
  };

  useEffect(() => {
    const currentDate = new Date();
    const isAfterSeptember = currentDate.getMonth() >= 8; // Verifica se já passou setembro (mês 9)
    if (isAfterSeptember) {
      setAnoLetivo("2025/2026"); // Altera para o próximo ano letivo
    }
  }, []);

  return (
    <div className="horario-container fade-in">
      <aside className="horario-sidebar">
        <div className="user-info">
          <p className="user-name">Nome do Utilizador</p>
        </div>
        <nav className="menu">
          <ul>
            <li onClick={handleVisualizarHorario}>Visualizar Horário</li>
            <li className="active">Submeter Disponibilidade</li>
            <li>Consultar Submissões</li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout">SAIR</button>
      </aside>

      <main className="horario-content">
        <div className="horario-header">
          <h2 className="horario-titulo">Submeter Disponibilidade</h2>
        </div>

        <div className="disponibilidade-form">
          <div className="ano-letivo-selector">
            <label>Escolha o ano letivo:</label>
            <select
              value={anoLetivo}
              onChange={(e) => setAnoLetivo(e.target.value)}
              className="ano-letivo-select"
            >
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
            </select>
          </div>

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
            <div className="horas-selector">
              {dias.map((dia) => (
                <div key={dia} className="dias-label">
                  <p>{dia}</p>
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
          </div>

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
