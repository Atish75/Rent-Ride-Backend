import { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { registerUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const result = await registerUser(username, email, password);
        if (result.success) {
            alert("Account created successfully! Ab login kijiye.");
            navigate('/login'); // Direct Login page par redirect
        } else {
            setErrorMsg(result.error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account 🚗</h2>
            
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
                    type="email" 
                    placeholder="Email (Optional)" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    style={{ padding: '0.8rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Sign Up
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Already have an account? <Link to="/login" style={{ color: '#007bff' }}>Login here</Link>
            </p>
        </div>
    );
}