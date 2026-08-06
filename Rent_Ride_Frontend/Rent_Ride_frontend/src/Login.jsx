import { useState, useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom'; 

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
        const access_token = localStorage.getItem('access_token');

        try {
            const profileRes = await fetch("http://127.0.0.1:8000/profile/", {
                headers: { "Authorization": `Bearer ${access_token}` }
            });

            if (profileRes.ok) {
                const profile = await profileRes.json();

                if (profile.is_driver === true || profile.is_owner === true) {
                    navigate("/role-select");
                } else {
                    navigate("/");
                }
            }
        } catch (err) {
            console.error("Profile Fetch Error:", err);
            navigate('/');
        }

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

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#555', fontSize: '0.95rem' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                    Sign up
                </Link>
            </p>
        </div>
    );
}