import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const API_URL = 'http://localhost:5000';

const StatusPage = () => {
    const [serverStatus, setServerStatus] = useState('checking');
    const [apiStatus, setApiStatus] = useState('checking');
    const [registrationTest, setRegistrationTest] = useState('pending');
    const [logs, setLogs] = useState([]);
    
    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, type }]);
    };
    
    // Basic server ping test
    const checkServer = async () => {
        try {
            addLog('Testing basic server connectivity...');
            const response = await axios.get(`${API_URL}`, { timeout: 5000 });
            addLog(`Server responded with status: ${response.status}`, 'success');
            setServerStatus('online');
            return true;
        } catch (error) {
            addLog(`Server connection failed: ${error.message}`, 'error');
            setServerStatus('offline');
            return false;
        }
    };
    
    // Test API endpoints
    const checkApi = async () => {
        try {
            addLog('Testing API health...');
            // We'll just try a simple endpoint that doesn't require auth
            const response = await axios.get(`${API_URL}/api/auth/health-check`);
            
            if (response.data && response.data.success) {
                addLog(`API is healthy: ${JSON.stringify(response.data)}`, 'success');
                setApiStatus('healthy');
                return true;
            } else {
                addLog('API responded but health check failed', 'warning');
                setApiStatus('unhealthy');
                return false;
            }
        } catch (error) {
            // Try a backup endpoint if the health-check doesn't exist
            try {
                const response = await fetch(`${API_URL}/api`);
                if (response.ok) {
                    addLog('API responded to backup endpoint', 'success');
                    setApiStatus('reachable');
                    return true;
                }
            } catch (backupError) {
                addLog(`Backup API check also failed: ${backupError.message}`, 'error');
            }
            
            addLog(`API health check failed: ${error.message}`, 'error');
            setApiStatus('unreachable');
            return false;
        }
    };
    
    // Test registration flow
    const testRegistration = async () => {
        try {
            addLog('Testing registration API...');
            setRegistrationTest('testing');
            
            // Create a unique test user
            const testUser = {
                first_name: 'Test',
                last_name: 'User',
                email: `test${Date.now()}@example.com`,
                password: 'TestPassword1!',
                gender: 'other',
                birthday: '1990-01-01'
            };
            
            addLog(`Sending registration request for: ${testUser.email}`);
            
            // First try with Axios
            try {
                const response = await axios.post(`${API_URL}/api/auth/register`, testUser, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000
                });
                
                addLog(`Registration successful via Axios! Status: ${response.status}`, 'success');
                addLog(`Response: ${JSON.stringify(response.data)}`, 'success');
                setRegistrationTest('success-axios');
                return true;
            } catch (axiosError) {
                addLog(`Axios registration failed: ${axiosError.message}`, 'warning');
                addLog('Trying with native fetch API...', 'info');
                
                // Try with native fetch as fallback
                const fetchResponse = await fetch(`${API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(testUser)
                });
                
                const data = await fetchResponse.json();
                
                if (fetchResponse.ok) {
                    addLog(`Registration successful via fetch! Status: ${fetchResponse.status}`, 'success');
                    addLog(`Response: ${JSON.stringify(data)}`, 'success');
                    setRegistrationTest('success-fetch');
                    return true;
                } else {
                    addLog(`Fetch registration failed: ${fetchResponse.status} ${fetchResponse.statusText}`, 'error');
                    addLog(`Error details: ${JSON.stringify(data)}`, 'error');
                    setRegistrationTest('failed');
                    return false;
                }
            }
        } catch (error) {
            addLog(`Registration test failed: ${error.message}`, 'error');
            setRegistrationTest('failed');
            return false;
        }
    };
    
    // Run the tests on component mount
    useEffect(() => {
        const runTests = async () => {
            const serverOnline = await checkServer();
            if (serverOnline) {
                const apiHealthy = await checkApi();
                if (apiHealthy) {
                    await testRegistration();
                }
            }
        };
        
        runTests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const runAllTests = () => {
        setServerStatus('checking');
        setApiStatus('checking');
        setRegistrationTest('pending');
        setLogs([]);
        
        const runTests = async () => {
            const serverOnline = await checkServer();
            if (serverOnline) {
                const apiHealthy = await checkApi();
                if (apiHealthy) {
                    await testRegistration();
                }
            }
        };
        
        runTests();
    };
    
    return (
        <Container>
            <Title>API Status Check</Title>
            
            <StatusGrid>
                <StatusCard status={serverStatus}>
                    <StatusTitle>Server Status</StatusTitle>
                    <StatusValue>{serverStatus}</StatusValue>
                </StatusCard>
                
                <StatusCard status={apiStatus}>
                    <StatusTitle>API Status</StatusTitle>
                    <StatusValue>{apiStatus}</StatusValue>
                </StatusCard>
                
                <StatusCard status={registrationTest}>
                    <StatusTitle>Registration API</StatusTitle>
                    <StatusValue>{registrationTest}</StatusValue>
                </StatusCard>
            </StatusGrid>
            
            <ButtonContainer>
                <Button onClick={runAllTests}>Run All Tests</Button>
            </ButtonContainer>
            
            <LogSection>
                <LogTitle>Diagnostics Log</LogTitle>
                <LogContainer>
                    {logs.map((log, index) => (
                        <LogEntry key={index} type={log.type}>
                            <LogTime>{log.timestamp}</LogTime>
                            <LogMessage>{log.message}</LogMessage>
                        </LogEntry>
                    ))}
                </LogContainer>
            </LogSection>
        </Container>
    );
};

const Container = styled.div`
    max-width: 900px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f8f8f8;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
    text-align: center;
    margin-bottom: 20px;
    color: #333;
`;

const StatusGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
`;

const StatusCard = styled.div`
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    background-color: ${props => {
        if (props.status === 'online' || props.status === 'healthy' || 
            props.status === 'success-axios' || props.status === 'success-fetch') {
            return '#d4edda';
        } else if (props.status === 'offline' || props.status === 'unhealthy' || 
                 props.status === 'unreachable' || props.status === 'failed') {
            return '#f8d7da';
        } else {
            return '#fff3cd';
        }
    }};
    border: 1px solid ${props => {
        if (props.status === 'online' || props.status === 'healthy' || 
            props.status === 'success-axios' || props.status === 'success-fetch') {
            return '#c3e6cb';
        } else if (props.status === 'offline' || props.status === 'unhealthy' || 
                 props.status === 'unreachable' || props.status === 'failed') {
            return '#f5c6cb';
        } else {
            return '#ffeeba';
        }
    }};
`;

const StatusTitle = styled.h3`
    margin: 0 0 10px;
    font-size: 16px;
    color: #555;
`;

const StatusValue = styled.div`
    font-size: 24px;
    font-weight: bold;
    text-transform: capitalize;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin: 20px 0;
`;

const Button = styled.button`
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    
    &:hover {
        background-color: #0069d9;
    }
`;

const LogSection = styled.div`
    margin-top: 30px;
`;

const LogTitle = styled.h2`
    margin-bottom: 10px;
    font-size: 18px;
`;

const LogContainer = styled.div`
    background-color: #282c34;
    border-radius: 4px;
    padding: 15px;
    height: 300px;
    overflow-y: auto;
    font-family: monospace;
    color: #abb2bf;
`;

const LogEntry = styled.div`
    margin-bottom: 5px;
    padding: 3px 0;
    border-bottom: 1px solid #3e4451;
    color: ${props => {
        switch(props.type) {
            case 'error': return '#e06c75';
            case 'warning': return '#d19a66';
            case 'success': return '#98c379';
            default: return '#abb2bf';
        }
    }};
`;

const LogTime = styled.span`
    color: #61afef;
    margin-right: 8px;
`;

const LogMessage = styled.span``;

export default StatusPage;
