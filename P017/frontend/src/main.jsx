import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Registo from './views/Registo.jsx';
import Login from './views/Login.jsx';
import RecuperarPassword from './views/RecuperarPassword.jsx';
import DocenteVisualizarHorario from './views/DocenteVisualizarHorario.jsx';
import DocenteSubmeter from './views/DocenteSubmeter.jsx';
import DocenteConsultarSubmissoes from './views/DocenteConsultarSubmissoes.jsx';
import CoordenadorConsultar from './views/CoordenadorConsultar.jsx';
import GerirDocentes from './views/GerirDocentes.jsx';
import Adm from './views/Adm.jsx';
import Pendente from './views/Pendente.jsx';
import GerirCoordenadores from './views/GerirCoordenadores.jsx';
import GerirDepartamento from './views/GerirDepartamento.jsx';
import GerirPerfilDocente from './views/GerirPerfilDocente.jsx';
import GerirPerfilCoordenador from './views/GerirPerfilCoordenador.jsx';
import HorarioDosDocentes from './views/HorarioDosDocentes.jsx';
import AlterarPassword from './views/AlterarPassword.jsx';
import GerirEscolas from './views/GerirEscolas.jsx'
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/Registo",
    element: <Registo />,
  },
  {
    path: "/Login",
    element: <Login />,
  },
  {
    path: "/RecuperarPassword",
    element: <RecuperarPassword />,
  },
  {
    path: "/DocenteVisualizarHorario",
    element: <DocenteVisualizarHorario />,
  },
  {
    path: "/DocenteSubmeter",
    element: <DocenteSubmeter />,
  },
  {
    path: "/DocenteConsultarSubmissoes",
    element: <DocenteConsultarSubmissoes />,
  },
  {
    path: "/CoordenadorConsultar",
    element: <CoordenadorConsultar />,
  },
  {
    path: "/Adm",
    element: <Adm />,
  },
  {
    path: "/Pendente",
    element: <Pendente />,
  },
   {
    path: "/GerirCoordenadores",
    element: <GerirCoordenadores />,
  },
  {
    path: "/GerirDepartamento",
    element: <GerirDepartamento />,
  },
  {
    path: "/GerirPerfilDocente",
    element: <GerirPerfilDocente />,
  },
   {
    path: "/GerirPerfilCoordenador",
    element: <GerirPerfilCoordenador />,
  },
    {
    path: "/HorarioDosDocentes",
    element: <HorarioDosDocentes />,
  },
    {
    path: "/AlterarPassword",
    element: <AlterarPassword />,
  },
    {
    path: "/GerirEscolas",
    element: <GerirEscolas />,
  },
  {
    path: "/GerirDocentes",
    element: <GerirDocentes />,
  },
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
