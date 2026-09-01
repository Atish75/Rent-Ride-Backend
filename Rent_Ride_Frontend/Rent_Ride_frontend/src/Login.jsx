import { useState, useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom'; 
import { API_BASE_URL } from './config';

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
                const profileRes = await fetch(`${API_BASE_URL}/profile/`, {
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
        <div style={{
            backgroundColor: "#F8FAFC",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            color: "#0F172A",
            WebkitFontSmoothing: "antialiased",
            padding: "1.5rem"
        }}>
            <div style={{ 
                width: "100%",
                maxWidth: '380px', 
                backgroundColor: '#FFFFFF',
                padding: '2.25rem 2rem', 
                border: '1px solid #E2E8F0', 
                borderRadius: '14px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' 
            }}>
                <h2 style={{ 
                    textAlign: 'center', 
                    marginBottom: '1.75rem', 
                    fontSize: '1.4rem', 
                    fontWeight: '400', 
                    color: '#0F172A',
                    letterSpacing: '-0.5px'
                }}>
                    Login to Rent Ride 
                </h2>
                
                {errorMsg && (
                    <div style={{
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FCA5A5",
                        color: "#991B1B",
                        padding: "0.65rem",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        textAlign: "center",
                        marginBottom: "1.25rem",
                        fontWeight: "300"
                    }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <input 
                            type="text" 
                            placeholder="Username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{ 
                            marginTop: '0.5rem',
                            padding: '0.75rem', 
                            backgroundColor: '#2563EB', 
                            color: '#FFFFFF', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontWeight: '300', 
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Login
                    </button>
                </form>

                <p style={{ 
                    textAlign: 'center', 
                    marginTop: '1.75rem', 
                    color: '#64748B', 
                    fontSize: '0.875rem',
                    fontWeight: '300',
                    margin: '1.75rem 0 0 0'
                }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: '400' }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.85rem', 
    borderRadius: '8px', 
    border: '1px solid #CBD5E1',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '0.9rem',
    fontWeight: '300'
};