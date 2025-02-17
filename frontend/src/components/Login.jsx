import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    // Login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Forgot Password state
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState('email'); // 'email' -> 'code' -> 'password'
    const [resetEmail, setResetEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', {
                email,
                password,
            });
            console.log(response.data); // Handle the successful login response
            alert('Login successful!');
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Invalid email or password.');
        }
    };

    // Toggle forgot password form
    const handleForgotPassword = () => setShowForgotPassword(true);

    // Send reset code
    const handleSendResetCode = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/send-reset-code', { email: resetEmail });
            alert(res.data.message);
            setResetStep('code');
        } catch (error) {
            console.error('Failed to send reset code:', error);
            alert('Failed to send reset code. Please try again.');
        }
    };

    // Verify reset code
    const handleVerifyCode = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/verify-code', { email: resetEmail, code: resetCode });
            if (res.data.success) {
                setResetStep('password');
            } else {
                alert('Invalid code. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying code:', error);
        }
    };

    // Reset password
    const handleResetPassword = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/reset-password', { email: resetEmail, newPassword });
            alert(res.data.message);
            setShowForgotPassword(false);
            setResetStep('email');
        } catch (error) {
            console.error('Error resetting password:', error);
        }
    };

    return (
        <div style={styles.container}>
            {/* ✅ Regular Login Form */}
            {!showForgotPassword && (
                <div>
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                        <button type="submit" style={styles.button}>Login</button>
                    </form>
                    <p style={styles.forgotLink} onClick={handleForgotPassword}>Forgot Password?</p>
                </div>
            )}

            {/* 🔑 Forgot Password Flow */}
            {showForgotPassword && (
                <div>
                    <h2>Forgot Password</h2>
                    {resetStep === 'email' && (
                        <>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                                style={styles.input}
                            />
                            <button onClick={handleSendResetCode} style={styles.button}>Send Reset Code</button>
                        </>
                    )}

                    {resetStep === 'code' && (
                        <>
                            <input
                                type="text"
                                placeholder="Enter the reset code"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                required
                                style={styles.input}
                            />
                            <button onClick={handleVerifyCode} style={styles.button}>Verify Code</button>
                        </>
                    )}

                    {resetStep === 'password' && (
                        <>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                style={styles.input}
                            />
                            <button onClick={handleResetPassword} style={styles.button}>Reset Password</button>
                        </>
                    )}

                    <p style={styles.forgotLink} onClick={() => setShowForgotPassword(false)}>Back to Login</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { textAlign: 'center', marginTop: '50px' },
    input: { padding: '10px', margin: '10px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' },
    button: { padding: '10px 20px', margin: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    forgotLink: { color: 'blue', cursor: 'pointer', textDecoration: 'underline', marginTop: '10px' },
};

export default Login;
