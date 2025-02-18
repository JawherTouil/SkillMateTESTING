import React, { useState } from 'react';
import axios from 'axios';

const AccountStatus = ({ userId, phoneNumber }) => {
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [isReactivating, setIsReactivating] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [message, setMessage] = useState('');

    const handleDeactivate = async () => {
        try {
            const response = await axios.post(`/api/users/deactivate/${userId}`);
            setMessage(response.data.message);
            setIsDeactivating(false);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error deactivating account');
        }
    };

    const handleSendCode = async () => {
        try {
            const response = await axios.post('/api/users/reactivate/send-code', { phoneNumber });
            setMessage(response.data.message);
            setIsReactivating(true);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error sending verification code');
        }
    };

    const handleVerifyCode = async () => {
        try {
            const response = await axios.post('/api/users/reactivate/verify', {
                phoneNumber,
                verificationCode
            });
            setMessage(response.data.message);
            setIsReactivating(false);
            // Refresh the page or update user state as needed
            window.location.reload();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error verifying code');
        }
    };

    return (
        <div className="account-status-container">
            <h2>Account Status Management</h2>
            
            {message && (
                <div className="message-box">
                    {message}
                </div>
            )}

            {!isDeactivating && !isReactivating && (
                <button 
                    onClick={() => setIsDeactivating(true)}
                    className="deactivate-btn"
                >
                    Deactivate Account
                </button>
            )}

            {isDeactivating && (
                <div className="confirmation-box">
                    <p>Are you sure you want to deactivate your account? You can reactivate it anytime by verifying your phone number.</p>
                    <button onClick={handleDeactivate}>Yes, Deactivate</button>
                    <button onClick={() => setIsDeactivating(false)}>Cancel</button>
                </div>
            )}

            {!isDeactivating && !isReactivating && (
                <button 
                    onClick={handleSendCode}
                    className="reactivate-btn"
                >
                    Reactivate Account
                </button>
            )}

            {isReactivating && (
                <div className="verification-box">
                    <p>Enter the verification code sent to your phone:</p>
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength="6"
                    />
                    <button onClick={handleVerifyCode}>Verify Code</button>
                    <button onClick={() => setIsReactivating(false)}>Cancel</button>
                </div>
            )}

            <style jsx>{`
                .account-status-container {
                    max-width: 500px;
                    margin: 2rem auto;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .message-box {
                    padding: 1rem;
                    margin: 1rem 0;
                    border-radius: 4px;
                    background-color: #f8f9fa;
                    border: 1px solid #dee2e6;
                }

                button {
                    padding: 0.5rem 1rem;
                    margin: 0.5rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .deactivate-btn {
                    background-color: #dc3545;
                    color: white;
                }

                .reactivate-btn {
                    background-color: #28a745;
                    color: white;
                }

                input {
                    padding: 0.5rem;
                    margin: 0.5rem 0;
                    width: 100%;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                }

                .confirmation-box, .verification-box {
                    padding: 1rem;
                    margin: 1rem 0;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default AccountStatus;
