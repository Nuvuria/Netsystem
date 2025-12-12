import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login.js';
import Register from './components/Login/Register.js';

import { SettingsProvider } from './context/SettingsContext';
import LoginCodeRequest from './components/Login/LoginCodeRequest.js';
import LoginCodeVerify from './components/Login/LoginCodeVerify.js';
import RegisterCodeVerify from './components/Login/RegisterCodeVerify.js';

import Inicio from './components/Pages/Inicio.js';
import Clientes from './components/Pages/Clientes.js'
// import Finalizados from './components/Pages/Finalizados.js'; // removido
import Agenda from './components/Pages/Agenda.js';
import AgendamentoExterno from './components/Pages/AgendamentoExterno.js';


function App() {
  const [metas, setMetas] = useState({
    study: 5,
    leisure: 5,
    dev: 5,
  });

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

          {/* Rota para a Comandas */}
          <Route path="/inicio" element={<Inicio />} />
          {/* Redirect default path to Inicio instead of old logic if needed, or keep logic */}
          
          {/* Rota para Clientes */}
          <Route path="/clientes" element={<Clientes />} />

          {/* Rota para Finalizados */}
          {/* <Route path="/finalizados" element={<Finalizados />} /> */}
          
          {/* Rota para Agenda (antigo Quartos) */}
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/quartos" element={<Agenda />} /> {/* Redirecionamento legado se necessário */}

          {/* Rota Pública para Clientes Externos */}
          <Route path="/agendamento-externo" element={<AgendamentoExterno />} />








      
        
        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;

