import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verificarDepartamentoDocente } from "../utils/verificarDepartamento";
import { navegarParaPerfilCorreto } from "../utils/navegacao";
import "./DocenteVisualizarHorario.css";

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

const DocenteVisualizarHorario = () => {
  const navigate = useNavigate();
  
  const calcularSemanaAtual = () => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    // Ajustar para segunda-feira (dia 1)
    const diaSemana = hoje.getDay();
    const diasParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
    inicioSemana.setDate(hoje.getDate() + diasParaSegunda);
    return inicioSemana;
  };

  const calcularSemanaPorData = (data) => {
    const inicioSemana = new Date(data);
    const diaSemana = data.getDay();
    const diasParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
    inicioSemana.setDate(data.getDate() + diasParaSegunda);
    return inicioSemana;
  };
  
  const [nomeUtilizador, setNomeUtilizador] = useState("");
  const [mostrarDropdownExport, setMostrarDropdownExport] = useState(false);
  const [horarios, setHorarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [popupMensagem, setPopupMensagem] = useState(null);
  const [dataInicioSemana, setDataInicioSemana] = useState(calcularSemanaAtual());
  const [selectedDate, setSelectedDate] = useState(null);
  const [gradeHorarios, setGradeHorarios] = useState({});
  const [verificandoDepartamento, setVerificandoDepartamento] = useState(true);
  
  const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  
  useEffect(() => {
    const verificarAcesso = async () => {
      const resultado = await verificarDepartamentoDocente(navigate);
      if (resultado.redirecionado) {
        return; // Já foi redirecionado
      }
      setVerificandoDepartamento(false);
    };
    
    verificarAcesso();
  }, [navigate]);

  useEffect(() => {
    // Só executar se já verificou o departamento
    if (verificandoDepartamento) return;

    const user = getUserFromToken();
    if (user && user.nome) {
      setNomeUtilizador(user.nome);
    } else {
      setNomeUtilizador("Docente");
    }
    
    const dataFim = new Date(dataInicioSemana);
    dataFim.setDate(dataInicioSemana.getDate() + 4); // Sexta-feira (4 dias após segunda)
    
    buscarHorarios(dataInicioSemana, dataFim);
  }, [dataInicioSemana, navigate, verificandoDepartamento]);

  // Se ainda está verificando o departamento, mostrar loading
  if (verificandoDepartamento) {
    return (
      <div className="docente-horario-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="carregando-indicador">Verificando permissões...</div>
        </div>
      </div>
    );
  }
  
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

  const dataInicio = new Date(dataInicioSemana);
  const dataFim = new Date(dataInicio);
  dataFim.setDate(dataInicio.getDate() + 4); // Sexta-feira (4 dias após segunda)

  const formatarData = (data) => data.toLocaleDateString("pt-PT");

  const handleDateChange = (e) => {
    if (!e.target.value) return;
    const novaData = new Date(e.target.value);
    setSelectedDate(e.target.value);
    setDataInicioSemana(calcularSemanaPorData(novaData));
  };

  const mudarSemana = (direcao) => {
    const novaData = new Date(dataInicioSemana);
    novaData.setDate(dataInicioSemana.getDate() + (direcao * 7));
    setDataInicioSemana(novaData);
    setSelectedDate(null);
  };

  const voltarHoje = () => {
    setDataInicioSemana(calcularSemanaAtual());
    setSelectedDate(null);
  };

  const handleSubmeterDisponibilidade = () => {
    navigate("/DocenteSubmeter");
  };

  const handleConsultarSubmissoes = () => {
    navigate("/DocenteConsultarSubmissoes");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleGerirPerfil = () => {
    navegarParaPerfilCorreto(navigate);
  };

  const exportarHorario = async (formato) => {
    setMostrarDropdownExport(false);
    setCarregando(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
      }

      const dataInicio = new Date(dataInicioSemana);
      const dataFim = new Date(dataInicio);
      dataFim.setDate(dataInicio.getDate() + 4);

      const dataInicioStr = dataInicio.toISOString().split('T')[0];
      const dataFimStr = dataFim.toISOString().split('T')[0];

      const response = await fetch(
        `http://localhost:8000/api/exportar-horario?formato=${formato}&data_inicio=${dataInicioStr}&data_fim=${dataFimStr}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao exportar horário");
      }

      if (formato.toLowerCase() === "pdf" || formato.toLowerCase() === "excel") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `horario_${dataInicioStr}_${dataFimStr}.${formato.toLowerCase() === "excel" ? "xlsx" : "pdf"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        setPopupMensagem({ 
          tipo: "sucesso", 
          texto: `Horário exportado com sucesso em ${formato}!` 
        });
      } else {
        throw new Error(`Formato não suportado: ${formato}`);
      }
    } catch (error) {
      console.error("Erro durante exportação:", error);
      setPopupMensagem({ 
        tipo: "erro", 
        texto: `Erro ao exportar horário: ${error.message}` 
      });
    } finally {
      setCarregando(false);
      setTimeout(() => setPopupMensagem(null), 3000);
    }
  };

  const buscarHorarios = async (inicio, fim) => {
    setCarregando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado");
        navigate("/");
        return;
      }

      const dataInicio = inicio.toISOString().split('T')[0];
      const dataFim = fim.toISOString().split('T')[0];

      const response = await fetch(
        `http://localhost:8000/api/visualizar-horario?data_inicio=${dataInicio}&data_fim=${dataFim}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHorarios(data);
        
        const novaGrade = {};
        
        data.forEach(horario => {
          try {
            const dataObj = new Date(horario.dia + 'T00:00:00');
            const diaSemana = dataObj.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb
            
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
        
      } else {
        const errorText = await response.text();
        console.error("Erro ao carregar horários:", errorText);
        setHorarios([]);
        setGradeHorarios({});
      }
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      setHorarios([]);
      setGradeHorarios({});
    } finally {
      setCarregando(false);
    }
  };

  const parseHora = (horaString) => {
    const [hora, minuto] = horaString.split(':').map(Number);
    return { hora, minuto };
  };

  return (
    <div className="docente-horario-container fade-in">
      <aside className="horario-sidebar">
        <div className="user-greeting">
          <p>
            Olá, <strong>{nomeUtilizador || "Utilizador"}</strong>
          </p>
          <button className="btn-gerir-perfil" onClick={handleGerirPerfil}>
            Gerir Perfil
          </button>
        </div>

        <nav className="menu">
          <ul>
            <li onClick={handleSubmeterDisponibilidade}>Submeter Disponibilidade</li>
            <li onClick={handleConsultarSubmissoes}>Consultar Submissões</li>
            <li className="active">Visualizar Horário</li>
          </ul>
        </nav>

        <button onClick={handleLogout} className="logout">
          SAIR
        </button>
      </aside>

      <main className="docente-horario-content">
        <div
          className="docente-horario-header"
          style={{ justifyContent: "space-between", alignItems: "center", position: "relative" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <input
              type="date"
              value={selectedDate || ""}
              onChange={handleDateChange}
              className="docente-date-picker"
              title="Selecionar data"
              max="2100-12-31"
              min="2000-01-01"
            />
            <h2 className="docente-horario-titulo">
              Semana {formatarData(dataInicio)} - {formatarData(dataFim)}
            </h2>
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMostrarDropdownExport((prev) => !prev)}
              className="docente-export-btn"
              title="Exportar Horário"
            >
              Exportar Horário ▼
            </button>

            {mostrarDropdownExport && (
              <div className="docente-export-dropdown">
                <button onClick={() => exportarHorario("Excel")}>Excel</button>
                <button onClick={() => exportarHorario("PDF")}>PDF</button>
              </div>
            )}
          </div>
        </div>

        <div className="docente-horario-tabela-wrapper">
          {carregando ? (
            <div className="carregando-indicador">Carregando horários...</div>
          ) : (
            <table className="docente-horario-tabela">
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
                    <td className="docente-hora-coluna">{hora}</td>
                    {dias.map((dia) => {
                      const key = `${dia}-${hora}`;
                      const aulaInfo = gradeHorarios[key];
                      
                      return (
                        <td 
                          key={key} 
                          className={`docente-horario-celula ${aulaInfo ? 'aula' : ''}`}
                        >
                          {aulaInfo ? (
                            <div className="docente-aula-info">
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

        <div className="docente-semana-navegacao-rodape">
          <button
            onClick={() => mudarSemana(-1)}
            className="docente-btn-seta"
            title="Semana Anterior"
          >
            &#x276E;
          </button>

          <button onClick={voltarHoje} className="docente-btn-semana-atual">
            Semana Atual
          </button>

          <button
            onClick={() => mudarSemana(1)}
            className="docente-btn-seta"
            title="Próxima Semana"
          >
            &#x276F;
          </button>
        </div>
      </main>

      {popupMensagem && (
        <div className={`popup-msg ${popupMensagem.tipo}`}>
          {popupMensagem.texto}
        </div>
      )}
    </div>
  );
};

export default DocenteVisualizarHorario;
