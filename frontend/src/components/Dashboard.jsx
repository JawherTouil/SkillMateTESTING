import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeactivateButton from './DeactivateButton';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userData));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Welcome to your Dashboard</h1>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Logout
                </button>
            </div>

            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Account Information</h2>
                <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                        <label>Name:</label>
                        <span>{user.firstName || ''} {user.lastName || ''}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <label>Email:</label>
                        <span>{user.email || 'N/A'}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <label>Phone:</label>
                        <span>{user.phoneNumber || 'N/A'}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <label>Account Status:</label>
                        <span style={{
                            color: (user.status || 'active') === 'active' ? '#28a745' : '#dc3545',
                            fontWeight: 'bold'
                        }}>
                            {((user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1))}
                        </span>
                    </div>
                </div>

                <div style={styles.deactivateSection}>
                    <h3>Account Management</h3>
                    <p style={styles.warningText}>
                        Warning: Deactivating your account will prevent you from accessing your account until you reactivate it through SMS verification.
                    </p>
                    <DeactivateButton />
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
    },
    logoutButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    sectionTitle: {
        marginBottom: '20px',
        color: '#2c3e50',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        marginBottom: '30px',
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    deactivateSection: {
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #dee2e6',
    },
    warningText: {
        color: '#721c24',
        backgroundColor: '#f8d7da',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px',
    }
};

export default Dashboard;
