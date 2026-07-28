import { useState, useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom'; // 1. Link import karein

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const result = await loginUser(username, password);
        if (result.success) {
            navigate('/'); // Login hone par home page par redirect
        } else {
            setErrorMsg(result.error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login to Rent Ride 🚗</h2>
            
            {errorMsg && <p style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ padding: '0.8rem', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '0.8rem', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button 
                    type="submit" 
                    style={{ padding: '0.8rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Login
                </button>
            </form>

            {/* 2. 👈 DON'T HAVE AN ACCOUNT OPTION */}
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#555', fontSize: '0.95rem' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                    Sign up
                </Link>
            </p>
        </div>
    );
}