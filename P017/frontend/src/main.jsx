import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Registo from './views/Registo.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },

  {

    path: "/Registo",
    element: <Registo />,
  }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
