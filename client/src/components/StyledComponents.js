import styled from 'styled-components';

export const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: #f8f9fa;
`;

export const Section = styled.section`
    background: white;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

export const Label = styled.label`
    font-weight: 600;
    color: #333;
`;

export const Input = styled.input`
    width: 100%;
    padding: 1rem;
    border: 2px solid ${props => props.$error ? '#dc3545' : '#e5e5e5'};
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: ${props => props.$error ? '#fff8f8' : '#fff'};

    &:focus {
        outline: none;
        border-color: #1a1a1a;
    }
    
    &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }
`;

export const Select = styled.select`
    width: 100%;
    padding: 1rem;
    border: 2px solid ${props => props.$error ? '#dc3545' : '#e5e5e5'};
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: ${props => props.$error ? '#fff8f8' : '#fff'};
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1rem;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #1a1a1a;
    }
`;

export const Button = styled.button`
    background: #1a1a1a;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    width: auto;
    min-width: 150px;

    &:hover {
        background: #333;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }
`;

export const FormRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
`;

export const TabContainer = styled.div`
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
`;

export const TabButton = styled.button`
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    background: ${props => props.active ? '#1a1a1a' : 'transparent'};
    color: ${props => props.active ? '#fff' : '#666'};
    font-weight: 500;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
        background: ${props => props.active ? '#1a1a1a' : '#f0f0f0'};
        transform: translateY(-1px);
    }

    &:after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: ${props => props.active ? '100%' : '0'};
        height: 3px;
        background: #1a1a1a;
        transition: all 0.3s ease;
    }
`;

export const ErrorText = styled.span`
    color: #dc3545;
    font-size: 0.875rem;
`;

export const SuccessMessage = styled.div`
    background: #f1f8f1;
    color: #28a745;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border: 1px solid #e3f3e3;
`;

export const ErrorMessage = styled.div`
    background: #fff8f8;
    color: #dc3545;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border: 1px solid #ffebee;
`;

export const HelpText = styled.span`
    color: #6c757d;
    font-size: 0.875rem;
`;

export const ProfileTitle = styled.h1`
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: #1a1a1a;
`;

export const ProfileSubtitle = styled.h2`
    font-size: 1.8rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
    color: #1a1a1a;
`;

export const ValidationError = styled.span`
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    display: block;
`;
