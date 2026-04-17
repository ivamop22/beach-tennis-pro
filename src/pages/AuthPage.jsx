import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

function translateAuthError(message) {
  if (!message) return 'Erro desconhecido.';
  if (message.includes('Invalid login')) return 'E-mail ou senha incorretos.';
  if (message.includes('already registered')) return 'E-mail já cadastrado.';
  if (message.includes('Password should')) return 'Senha muito fraca.';
  return message;
}

export default function AuthPage() {
  const { login, register, toastMessage } = useAppContext();
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });

  async function handleLogin() {
    if (!loginData.email || !loginData.password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    const authError = await login(loginData.email, loginData.password);
    if (authError) setError(translateAuthError(authError.message));
  }

  async function handleRegister() {
    if (!registerData.name || !registerData.email || !registerData.password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (registerData.password.length < 6) {
      setError('Senha mínima de 6 caracteres.');
      return;
    }

    const authError = await register(registerData);
    if (authError) setError(translateAuthError(authError.message));
    else {
      setError('');
      toastMessage('✅ Conta criada! Verifique seu e-mail se necessário.');
      setTab('login');
    }
  }

  return (
    <div id="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="icon">🎾</span>
          <h1>ARENA GWM</h1>
          <div className="arena-label">Beach Tennis</div>
          <div className="brand-sub">Sistema de Chaveamento Inteligente</div>
        </div>

        {error ? <div className="auth-error is-visible">{error}</div> : null}

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => {
            setTab('login');
            setError('');
          }}>
            <i className="fa fa-sign-in-alt"></i>
            {' '}Entrar
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => {
            setTab('register');
            setError('');
          }}>
            <i className="fa fa-user-plus"></i>
            {' '}Cadastrar
          </button>
        </div>

        {tab === 'login' ? (
          <div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} placeholder="seu@email.com" />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} placeholder="••••••••" />
            </div>
            <button className="btn-primary" onClick={handleLogin}>ENTRAR</button>
          </div>
        ) : (
          <div>
            <div className="form-group">
              <label>Nome</label>
              <input value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} placeholder="Seu nome" />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} placeholder="seu@email.com" />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} placeholder="mínimo 6 caracteres" />
            </div>
            <button className="btn-primary" onClick={handleRegister}>CRIAR CONTA</button>
          </div>
        )}
      </div>
    </div>
  );
}
