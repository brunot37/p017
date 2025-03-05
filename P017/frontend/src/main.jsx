import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Registo from './views/Registo.jsx';
import Login from './views/Login.jsx';
import RecuperarPassword from './views/RecuperarPassword.jsx';


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
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
