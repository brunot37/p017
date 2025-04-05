import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./ColaboradorConsultar.css";

const ColaboradorConsultar = () => {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    docente: "",
    startDate: "",
    endDate: "",
  });

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  
  const handleSubmit = (e) => {
    e.preventDefault();


    console.log(formData); 

    
    navigate("/visualizar-disponibilidades");  
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="user-info">
          <div className="user-avatar"></div>
          <p>User1</p>
        </div>
        <nav>
          <ul>
            <li className="active">Consultar Disponibilidades Docentes</li>
            <li>Consultar Submissões</li>
          </ul>
        </nav>
        <button className="logout">SAIR</button>
      </div>

      <div className="content">
        <form className="availability-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Docente</label>
            <select 
              className="docente-select" 
              name="docente" 
              value={formData.docente} 
              onChange={handleChange} 
              required
            >
              <option value="">Selecione o Docente</option>
              <option value="docente1">Docente 1</option>
              <option value="docente2">Docente 2</option>
              <option value="docente3">Docente 3</option>
            </select>
          </div>

          <div className="date-time-group">
            <div>
              <label>Data de Início</label>
              <div className="date-field-group">
                <select
                  name="startDate"
                  className="date-field"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                >
                  {[...Array(31).keys()].map((day) => (
                    <option key={day + 1} value={String(day + 1).padStart(2, "0")}>
                      {String(day + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select
                  name="startMonth"
                  className="date-field"
                  value={formData.startMonth}
                  onChange={handleChange}
                  required
                >
                  {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(
                    (month, index) => (
                      <option key={index} value={String(index + 1).padStart(2, "0")}>
                        {month}
                      </option>
                    )
                  )}
                </select>
                <select
                  name="startYear"
                  className="date-field"
                  value={formData.startYear}
                  onChange={handleChange}
                  required
                >
                  {[...Array(10).keys()].map((year) => (
                    <option key={2025 + year} value={2025 + year}>
                      {2025 + year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label>Data de Fim</label>
              <div className="date-field-group">
                <select
                  name="endDate"
                  className="date-field"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                >
                  {[...Array(31).keys()].map((day) => (
                    <option key={day + 1} value={String(day + 1).padStart(2, "0")}>
                      {String(day + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select
                  name="endMonth"
                  className="date-field"
                  value={formData.endMonth}
                  onChange={handleChange}
                  required
                >
                  {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map(
                    (month, index) => (
                      <option key={index} value={String(index + 1).padStart(2, "0")}>
                        {month}
                      </option>
                    )
                  )}
                </select>
                <select
                  name="endYear"
                  className="date-field"
                  value={formData.endYear}
                  onChange={handleChange}
                  required
                >
                  {[...Array(10).keys()].map((year) => (
                    <option key={2025 + year} value={2025 + year}>
                      {2025 + year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-button">Visualizar</button>
        </form>
      </div>
    </div>
  );
};

export default ColaboradorConsultar;
