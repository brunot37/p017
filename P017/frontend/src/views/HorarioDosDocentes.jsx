import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HorarioDosDocentes.css";

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (e) {
    console.error("Erro a ler token JWT:", e);
    return null;
  }
}

const HorarioDosDocentes = () => {
  const navigate = useNavigate();
  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [docentes, setDocentes] = useState([]);
  const [docenteSelecionado, setDocenteSelecionado] = useState("");
  const [mostrarDropdownExport, setMostrarDropdownExport] = useState(false);
  const [popupMensagem, setPopupMensagem] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [gradeHorarios, setGradeHorarios] = useState({});

  const baseDate = new Date("2025-09-14");
  
  const calcularSemanaAtual = () => {
    const hoje = new Date();
    const diffDias = Math.floor((hoje - baseDate) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDias / 7);
  };

  const calcularSemanaPorData = (data) => {
    const diffDias = Math.floor((data - baseDate) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDias / 7);
  };

  const [semanaIndex, setSemanaIndex] = useState(calcularSemanaAtual());
  const [selectedDate, setSelectedDate] = useState(null);
  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  const gerarHoras = () => {
    const horas = [];
    let hora = 8;
    let minuto = 0;
    while (hora < 20 || (hora === 20 && minuto === 0)) {
      const h = hora.toString().padStart(2, "0");
      const m = minuto.toString().padStart(2, "0");
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
  const dataInicio = new Date(baseDate);
  dataInicio.setDate(baseDate.getDate() + semanaIndex * 7);
  const dataFim = new Date(dataInicio);
  dataFim.setDate(dataInicio.getDate() + 6);

  const formatarData = (data) => data.toLocaleDateString("pt-PT");

  useEffect(() => {
    const user = getUserFromToken();
    if (user && user.nome) {
      setNomeUtilizador(user.nome);
    } else {
      setNomeUtilizador("Coordenador");
    }

    const fetchDocentes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/docentes", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const docentesFormatados = data.map(docente => ({
            id: docente.id,
            nome: docente.nome,
            email: docente.email,
            departamento: docente.departamento?.nome || "Sem departamento"
          }));
          setDocentes(docentesFormatados);
        } else {
          console.error("Erro ao buscar docentes:", response.status);
        }
      } catch (error) {
        console.error("Erro ao buscar docentes:", error);
      }
    };

    fetchDocentes();
  }, [navigate]);

  useEffect(() => {
    if (docenteSelecionado) {
      buscarHorariosDocente();
    } else {
      setGradeHorarios({});
    }
  }, [docenteSelecionado, semanaIndex]);

  const buscarHorariosDocente = async () => {
    if (!docenteSelecionado) return;
    
    setCarregando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado");
        navigate("/");
        return;
      }

      const dataInicioStr = dataInicio.toISOString().split('T')[0];
      const dataFimStr = dataFim.toISOString().split('T')[0];

      console.log(`Buscando horários do docente ${docenteSelecionado} de ${dataInicioStr} até ${dataFimStr}`);

      const response = await fetch(
        `http://localhost:8000/api/visualizar-horario-docente?docente_id=${docenteSelecionado}&data_inicio=${dataInicioStr}&data_fim=${dataFimStr}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Horários do docente recebidos:", data);
        
        const novaGrade = {};
        
        data.forEach(horario => {
          try {
            const dataObj = new Date(horario.dia + 'T00:00:00');
            const diaSemana = dataObj.getDay();
            
            if (diaSemana >= 1 && diaSemana <= 5) {
              const diaNome = dias[diaSemana - 1];
              
              const horaInicio = horario.hora_inicio;
              const horaFim = horario.hora_fim;
              
              const horaInicioObj = parseHora(horaInicio);
              const horaFimObj = parseHora(horaFim);
              
              horas.forEach(slot => {
                const slotObj = parseHora(slot);

                if (
                  (slotObj.hora > horaInicioObj.hora || 
                   (slotObj.hora === horaInicioObj.hora && slotObj.minuto >= horaInicioObj.minuto)) &&
                  (slotObj.hora < horaFimObj.hora || 
                   (slotObj.hora === horaFimObj.hora && slotObj.minuto < horaFimObj.minuto))
                ) {
                  const key = `${diaNome}-${slot}`;

                  novaGrade[key] = {
                    disciplina: horario.disciplina || 'Horário Aprovado',
                    sala: horario.sala || 'Sala a definir',
                    status: horario.status || 'aprovado',
                    semestre: horario.semestre,
                    ano_letivo: horario.ano_letivo
                  };
                }
              });
            }
          } catch (error) {
            console.error("Erro ao processar horário:", horario, error);
          }
        });
        
        setGradeHorarios(novaGrade);
        console.log("Grade de horários do docente processada:", novaGrade);
        
      } else {
        const errorText = await response.text();
        console.error("Erro ao carregar horários do docente:", errorText);
        setGradeHorarios({});
      }
    } catch (error) {
      console.error("Erro ao buscar horários do docente:", error);
      setGradeHorarios({});
    } finally {
      setCarregando(false);
    }
  };

  const parseHora = (horaString) => {
    const [hora, minuto] = horaString.split(':').map(Number);
    return { hora, minuto };
  };

  const handleDateChange = (e) => {
    if (!e.target.value) return;
    const novaData = new Date(e.target.value);
    setSelectedDate(e.target.value);
    setSemanaIndex(calcularSemanaPorData(novaData));
  };

  const mudarSemana = (direcao) => {
    setSemanaIndex((prev) => prev + direcao);
    setSelectedDate(null);
  };

  const voltarHoje = () => {
    setSemanaIndex(calcularSemanaAtual());
    setSelectedDate(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleIrParaDisponibilidade = () => {
    navigate("/CoordenadorConsultar");
  };

  const handleIrGerirDocentes = () => {
    navigate("/GerirDocentes");
  };

  const exportarHorario = async (formato) => {
    if (!docenteSelecionado) {
      setPopupMensagem({ 
        tipo: "erro", 
        texto: "Selecione um docente antes de exportar." 
      });
      setTimeout(() => setPopupMensagem(null), 3000);
      return;
    }

    setMostrarDropdownExport(false);
    setCarregando(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      const dataInicioStr = dataInicio.toISOString().split('T')[0];
      const dataFimStr = dataFim.toISOString().split('T')[0];

      console.log(`Exportando horário do docente ${docenteSelecionado} em ${formato} de ${dataInicioStr} até ${dataFimStr}`);

      const response = await fetch(
        `http://localhost:8000/api/exportar-horario-docente?formato=${formato.toLowerCase()}&docente_id=${docenteSelecionado}&data_inicio=${dataInicioStr}&data_fim=${dataFimStr}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
        }
      );

      if (!response.ok) {
        let errorMessage = "Erro ao exportar horário";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') {
        throw new Error("Arquivo vazio recebido do servidor");
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error("Arquivo vazio recebido do servidor");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const nomeDocente = docentes.find(d => d.id.toString() === docenteSelecionado)?.nome || 'docente';
      const extensao = formato.toLowerCase() === "excel" ? "xlsx" : "pdf";
      const nomeArquivo = `horario_${nomeDocente}_${dataInicioStr}_${dataFimStr}.${extensao}`;
      a.download = nomeArquivo;
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 100);
      
      setPopupMensagem({ 
        tipo: "sucesso", 
        texto: `Horário do docente exportado com sucesso em ${formato}! Download iniciado.` 
      });

    } catch (error) {
      console.error("Erro durante exportação:", error);
      setPopupMensagem({ 
        tipo: "erro", 
        texto: `Erro ao exportar horário: ${error.message}` 
      });
    } finally {
      setCarregando(false);
      setTimeout(() => setPopupMensagem(null), 5000);
    }
  };

  return (
    <div className="hd-container fade-in">
      <aside className="hd-sidebar">
        <div className="hd-user-greeting">
          <span>Olá, <strong>{nomeUtilizador}</strong></span>
          <button className="hd-gerir-perfil-btn" onClick={() => navigate("/GerirPerfilCoordenador")}>Gerir Perfil</button>
          <hr className="hd-divider" />
        </div>

        <nav className="hd-menu">
          <ul>
            <li onClick={handleIrGerirDocentes} style={{ cursor: "pointer" }}>Gerir Docentes</li>
            <li onClick={handleIrParaDisponibilidade}>Disponibilidade dos Docentes</li>
            <li className="active">Horário dos Docentes</li>
          </ul>
        </nav>

        <button onClick={handleLogout} className="hd-logout">SAIR</button>
      </aside>

      <main className="hd-content">
        <h2 className="hd-welcome">Olá, {nomeUtilizador}</h2>

        <div
          className="hd-header"
          style={{
            position: "relative",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            display: "flex",
          }}
        >
          <input
            type="date"
            value={selectedDate || ""}
            onChange={handleDateChange}
            className="hd-date-picker"
            title="Selecionar data"
            max="2100-12-31"
            min="2000-01-01"
          />

          <select
            value={docenteSelecionado}
            onChange={(e) => setDocenteSelecionado(e.target.value)}
            className="hd-select-docente"
            title="Selecionar docente"
          >
            <option value="">Selecionar docente</option>
            {docentes.map((docente) => (
              <option key={docente.id} value={docente.id}>
                {docente.nome}
              </option>
            ))}
          </select>

          {docenteSelecionado && (
            <div style={{ position: "relative", marginLeft: "auto" }}>
              <button
                onClick={() => setMostrarDropdownExport((prev) => !prev)}
                className="hd-export-btn"
                title="Exportar Horário"
                disabled={carregando}
              >
                {carregando ? "Processando..." : "Exportar Horário ▼"}
              </button>

              {mostrarDropdownExport && !carregando && (
                <div className="hd-export-dropdown">
                  <button onClick={() => exportarHorario("Excel")}>Excel</button>
                  <button onClick={() => exportarHorario("PDF")}>PDF</button>
                </div>
              )}
            </div>
          )}
        </div>

        {docenteSelecionado ? (
          <>
            <h2 className="hd-titulo">
              Horário de: {
                docentes.find(d => d.id.toString() === docenteSelecionado)?.nome
              }<br />
              {formatarData(dataInicio)} - {formatarData(dataFim)}
            </h2>

            <div className="hd-tabela-wrapper">
              {carregando ? (
                <div className="carregando-indicador">Carregando horários...</div>
              ) : (
                <table className="hd-tabela">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      {dias.map((dia) => (
                        <th key={dia}>{dia}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {horas.map((hora) => (
                      <tr key={hora}>
                        <td className="hd-hora-coluna">{hora}</td>
                        {dias.map((dia) => {
                          const key = `${dia}-${hora}`;
                          const aulaInfo = gradeHorarios[key];
                          
                          return (
                            <td 
                              key={key} 
                              className={`hd-horario-celula ${aulaInfo ? 'aula' : ''}`}
                            >
                              {aulaInfo ? (
                                <div className="hd-aula-info">
                                  <strong>{aulaInfo.disciplina}</strong>
                                  <span>{aulaInfo.sala}</span>
                                </div>
                              ) : (
                                '-'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="hd-navegacao">
              <button onClick={() => mudarSemana(-1)} className="hd-btn-seta" title="Semana Anterior">
                &#x276E;
              </button>
              <button onClick={voltarHoje} className="hd-btn-semana-atual">
                Semana Atual
              </button>
              <button onClick={() => mudarSemana(1)} className="hd-btn-seta" title="Próxima Semana">
                &#x276F;
              </button>
            </div>
          </>
        ) : (
          <p className="hd-aviso">Selecione um docente para visualizar o horário.</p>
        )}
      </main>

      {popupMensagem && (
        <div className={`popup-msg ${popupMensagem.tipo}`}>
          {popupMensagem.texto}
        </div>
      )}
    </div>
  );
};

export default HorarioDosDocentes;
