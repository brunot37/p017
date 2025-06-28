import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './utils/fetchInterceptor.js';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import TokenCleaner from './components/TokenCleaner.jsx';
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
import DocenteAguardarDepartamento from './views/DocenteAguardarDepartamento.jsx';
import Notificacoes from './views/Notificacoes.jsx';
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
    path: "/AlterarPassword",
    element: (
      <ProtectedRoute>
        <AlterarPassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Pendente",
    element: (
      <ProtectedRoute allowedRoles={['pendente']}>
        <Pendente />
      </ProtectedRoute>
    ),
  },
  // Rotas de Docente
  {
    path: "/DocenteVisualizarHorario",
    element: (
      <ProtectedRoute allowedRoles={['docente']}>
        <DocenteVisualizarHorario />
      </ProtectedRoute>
    ),
  },
  {
    path: "/DocenteSubmeter",
    element: (
      <ProtectedRoute allowedRoles={['docente']}>
        <DocenteSubmeter />
      </ProtectedRoute>
    ),
  },
  {
    path: "/DocenteConsultarSubmissoes",
    element: (
      <ProtectedRoute allowedRoles={['docente']}>
        <DocenteConsultarSubmissoes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/DocenteAguardarDepartamento",
    element: (
      <ProtectedRoute allowedRoles={['docente']}>
        <DocenteAguardarDepartamento />
      </ProtectedRoute>
    ),
  },
  {
    path: "/GerirPerfilDocente",
    element: (
      <ProtectedRoute allowedRoles={['docente']}>
        <GerirPerfilDocente />
      </ProtectedRoute>
    ),
  },
  // Rotas de Coordenador
  {
    path: "/CoordenadorConsultar",
    element: (
      <ProtectedRoute allowedRoles={['coordenador']}>
        <CoordenadorConsultar />
      </ProtectedRoute>
    ),
  },
  {
    path: "/GerirDocentes",
    element: (
      <ProtectedRoute allowedRoles={['coordenador']}>
        <GerirDocentes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/HorarioDosDocentes",
    element: (
      <ProtectedRoute allowedRoles={['coordenador']}>
        <HorarioDosDocentes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/GerirPerfilCoordenador",
    element: (
      <ProtectedRoute allowedRoles={['coordenador']}>
        <GerirPerfilCoordenador />
      </ProtectedRoute>
    ),
  },
  // Rotas de Admin
  {
    path: "/Adm",
    element: (
      <ProtectedRoute allowedRoles={['adm']}>
        <Adm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/GerirCoordenadores",
    element: (
      <ProtectedRoute allowedRoles={['adm']}>
        <GerirCoordenadores />
      </ProtectedRoute>
    ),
  },
  {
    path: "/GerirDepartamento",
    element: (
      <ProtectedRoute allowedRoles={['adm']}>
        <GerirDepartamento />
      </ProtectedRoute>
    ),
  },
  {
    path: "/GerirEscolas",
    element: (
      <ProtectedRoute allowedRoles={['adm']}>
        <GerirEscolas />
      </ProtectedRoute>
    ),
  },
  // Rotas acessíveis a usuários autenticados (qualquer role)
  {
    path: "/notificacoes",
    element: (
      <ProtectedRoute>
        <Notificacoes />
      </ProtectedRoute>
    ),
  }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TokenCleaner />
    <RouterProvider router={router} />
  </StrictMode>
);
