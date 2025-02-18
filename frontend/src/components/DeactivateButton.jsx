import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DeactivateButton = () => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleDeactivate = async () => {
        try {
            if (!phoneNumber) {
                setError('Please enter your phone number');
                return;
            }

            if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
                setError('Please enter a valid phone number in international format (e.g., +1234567890)');
                return;
            }

            const userData = localStorage.getItem('user');
            if (!userData) {
                setError('User data not found. Please log in again.');
                navigate('/login');
                return;
            }

            const user = JSON.parse(userData);
            if (!user._id) {
                setError('Invalid user data. Please log in again.');
                navigate('/login');
                return;
            }

            await axios.post('http://localhost:5000/api/users/deactivate', { 
                userId: user._id,
                phoneNumber
            });
            
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to deactivate account');
            setShowConfirm(false);
        }
    };

    return (
        <div style={styles.container}>
            {!showConfirm ? (
                <button 
                    onClick={() => setShowConfirm(true)} 
                    style={styles.deactivateButton}
                >
                    Deactivate Account
                </button>
            ) : (
                <div style={styles.confirmDialog}>
                    <p style={styles.confirmText}>
                        To deactivate your account, please enter your phone number. 
                        This will be required to reactivate your account later.
                    </p>
                    <input
                        type="tel"
                        placeholder="Phone Number (e.g., +1234567890)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        style={styles.input}
                    />
                    <div style={styles.buttonGroup}>
                        <button 
                            onClick={handleDeactivate} 
                            style={styles.confirmButton}
                        >
                            Yes, Deactivate
                        </button>
                        <button 
                            onClick={() => {
                                setShowConfirm(false);
                                setPhoneNumber('');
                                setError('');
                            }} 
                            style={styles.cancelButton}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    deactivateButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        width: 'fit-content',
    },
    confirmDialog: {
        border: '1px solid #dc3545',
        borderRadius: '4px',
        padding: '20px',
        backgroundColor: '#fff',
    },
    confirmText: {
        marginBottom: '15px',
        color: '#721c24',
    },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '4px',
        border: '1px solid #ced4da',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
    },
    confirmButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    error: {
        color: '#dc3545',
        marginTop: '10px',
    }
};

export default DeactivateButton;
