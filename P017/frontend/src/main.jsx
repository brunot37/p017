import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Registo from './views/Registo.jsx';
import Login from './views/Login.jsx'; // Importação do componente Login

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
    element: <Login />, // Corrigido e garantido que o componente existe
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
