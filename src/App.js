import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Login from './components/Login/Login.js';
import Register from './components/Login/Register.js';

import { SettingsProvider } from './context/SettingsContext';
import LoginCodeRequest from './components/Login/LoginCodeRequest.js';
import LoginCodeVerify from './components/Login/LoginCodeVerify.js';
import RegisterCodeVerify from './components/Login/RegisterCodeVerify.js';

import ResponsiveLayout from './components/Layout/ResponsiveLayout';
import Dashboard from './components/Pages/Dashboard.js';
import Inicio from './components/Pages/Inicio.js';
import Clientes from './components/Pages/Clientes.js'
import RelatorioMensalidade from './components/Pages/RelatorioMensalidade.js';
import Planos from './components/Pages/Planos.js';
import Chatbot from './components/Pages/Chatbot.js';
// import Finalizados from './components/Pages/Finalizados.js'; // removido
// import Agenda from './components/Pages/Agenda.js';
import AgendamentoExterno from './components/Pages/AgendamentoExterno.js';


function App() {
  return (
    <SettingsProvider>
      <Router>
        <Routes>
          {/* Rota para Login */}
          <Route path="/" element={<Login />} />

          {/* Rota para Registrar Usuário */}
          <Route path="/register" element={<Register />} />

          
           {/* Rota para Perfil */}
          <Route path="/logincodeverify" element={<LoginCodeVerify />} />

            {/* Rota para Perfil */}
          <Route path="/logincoderequest" element={<LoginCodeRequest />} />

          {/* Rota para Codigo de criação */}
          <Route path="/register-code" element={<RegisterCodeVerify />} />

          {/* Rota Pública para Clientes Externos */}
          <Route path="/agendamento-externo" element={<AgendamentoExterno />} />

          {/* Rota Dashboard (Sem Sidebar) */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Rotas Protegidas com Layout Global */}
          <Route element={
            <ResponsiveLayout>
              <Outlet />
            </ResponsiveLayout>
          }>
            {/* Rota para a Comandas */}
            <Route path="/inicio" element={<Inicio />} />
            
            {/* Rota para Clientes */}
            <Route path="/clientes" element={<Clientes />} />

            {/* Rota para Relatório */}
            <Route path="/relatorio" element={<RelatorioMensalidade />} />

            {/* Rota para Planos */}
            <Route path="/planos" element={<Planos />} />

            {/* Rota para Chatbot */}
            <Route path="/chatbot" element={<Chatbot />} />
          </Route>
      
        
        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;

