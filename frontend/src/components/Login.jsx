import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isDeactivated, setIsDeactivated] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');
    
    const navigate = useNavigate();
//testa
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', { email, password });
            
            if (response.data.deactivated) {
                setError('Account is deactivated. Please reactivate it.');
                setIsDeactivated(true);
                setUserId(response.data.userId);
                return;
            }

            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            }
        } catch (error) {
            if (error.response?.status === 403 && error.response.data.deactivated) {
                setError('Account is deactivated. Please reactivate it.');
                setIsDeactivated(true);
                setUserId(error.response.data.userId);
            } else {
                setError(error.response?.data?.message || 'Login failed');
            }
        }
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('http://localhost:5000/api/users/reactivate/send-code', { 
                phoneNumber,
                userId 
            });
            setShowCodeInput(true);
            setMessage('Verification code sent! Please check your phone.');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to send verification code');
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/users/reactivate/verify', { 
                userId,
                verificationCode 
            });
            
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setMessage('Account reactivated successfully!');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid verification code');
        }
    };

    return (
        <div style={styles.container}>
            {!isDeactivated ? (
                <div>
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                        />
                        <button type="submit" style={styles.button}>Login</button>
                    </form>
                </div>
            ) : (
                <div>
                    <h2>Reactivate Account</h2>
                    {!showCodeInput ? (
                        <form onSubmit={handleSendCode}>
                            <p style={styles.info}>
                                Your account is deactivated. Please enter your phone number to receive a verification code.
                            </p>
                            <input
                                type="tel"
                                placeholder="Phone Number (e.g., +1234567890)"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                style={styles.input}
                            />
                            <button type="submit" style={styles.button}>Send Code</button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyCode}>
                            <p style={styles.info}>
                                Please enter the 6-digit verification code sent to your phone.
                            </p>
                            <input
                                type="text"
                                placeholder="Verification Code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                style={styles.input}
                                maxLength={6}
                            />
                            <button type="submit" style={styles.button}>Verify Code</button>
                        </form>
                    )}
                    <button 
                        onClick={() => {
                            setIsDeactivated(false);
                            setShowCodeInput(false);
                            setError('');
                            setMessage('');
                        }} 
                        style={styles.linkButton}
                    >
                        Back to Login
                    </button>
                </div>
            )}
            {error && <p style={styles.error}>{error}</p>}
            {message && <p style={styles.success}>{message}</p>}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '400px',
        margin: '40px auto',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '4px',
        border: '1px solid #ddd',
    },
    button: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        padding: '10px',
        textDecoration: 'underline',
    },
    error: {
        color: '#dc3545',
        textAlign: 'center',
        marginTop: '10px',
    },
    success: {
        color: '#28a745',
        textAlign: 'center',
        marginTop: '10px',
    },
    info: {
        color: '#0c5460',
        backgroundColor: '#d1ecf1',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '15px',
    }
};

export default Login;
