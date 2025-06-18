import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const OTPInput = ({ value, onChange, onVerify, isVerifying, isVerified, disabled }) => {
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [resendAvailable, setResendAvailable] = useState(false);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setResendAvailable(true);
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleInputChange = (e) => {
        const inputValue = e.target.value.replace(/\D/g, ''); // Only digits
        if (inputValue.length <= 6) {
            onChange(inputValue);
        }
    };

    return (
        <Container>
            <InputGroup>
                <Label>
                    Verification Code
                    {isVerifying && <StatusText color="#999">Verifying...</StatusText>}
                    {isVerified && <StatusText color="#28a745">✓ Verified</StatusText>}
                </Label>
                
                <OTPInputField
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    placeholder="000000"
                    maxLength="6"
                    disabled={disabled}
                    isVerified={isVerified}
                    hasError={value.length === 6 && !isVerified}
                />
                
                <InputInfo>
                    <InfoText>
                        Enter the 6-digit code sent to your email
                    </InfoText>
                    
                    {timeLeft > 0 ? (
                        <TimerText>
                            Code expires in {formatTime(timeLeft)}
                        </TimerText>
                    ) : (
                        <ExpiredText>
                            Code expired
                        </ExpiredText>
                    )}
                </InputInfo>
                
                {resendAvailable && (
                    <ResendButton 
                        type="button" 
                        onClick={() => {
                            if (onVerify) onVerify();
                            setTimeLeft(600);
                            setResendAvailable(false);
                        }}
                    >
                        Resend Code
                    </ResendButton>
                )}
            </InputGroup>
        </Container>
    );
};

const Container = styled.div`
    margin-bottom: 1rem;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #000;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const StatusText = styled.span`
    margin-left: 8px;
    font-size: 11px;
    color: ${props => props.color};
    font-weight: 400;
`;

const OTPInputField = styled.input`
    padding: 16px;
    border: 2px solid ${props => 
        props.isVerified ? '#28a745' : 
        props.hasError ? '#dc3545' : '#ddd'};
    border-radius: 8px;
    font-size: 18px;
    text-align: center;
    letter-spacing: 4px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    transition: all 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: ${props => 
            props.isVerified ? '#28a745' : '#000'};
        box-shadow: 0 0 0 3px ${props => 
            props.isVerified ? 'rgba(40, 167, 69, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    }
    
    &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
        opacity: 0.6;
    }
    
    &::placeholder {
        color: #ccc;
    }
`;

const InputInfo = styled.div`
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
`;

const InfoText = styled.p`
    font-size: 12px;
    color: #666;
    margin: 0;
`;

const TimerText = styled.p`
    font-size: 12px;
    color: #007bff;
    margin: 0;
    font-weight: 500;
`;

const ExpiredText = styled.p`
    font-size: 12px;
    color: #dc3545;
    margin: 0;
    font-weight: 500;
`;

const ResendButton = styled.button`
    background: none;
    border: 1px solid #007bff;
    color: #007bff;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    margin-top: 8px;
    transition: all 0.3s ease;
    
    &:hover {
        background-color: #007bff;
        color: white;
    }
`;

export default OTPInput;
