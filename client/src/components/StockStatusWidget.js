import React from 'react';
import { useStock } from '../context/StockContext';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxes, 
  faExclamationTriangle, 
  faWarning, 
  faCheckCircle,
  faRefresh 
} from '@fortawesome/free-solid-svg-icons';

const StockStatusContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatusTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RefreshButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const StatusCard = styled.div`
  background: ${props => 
    props.type === 'critical' ? '#fff5f5' :
    props.type === 'low' ? '#fffbeb' :
    props.type === 'good' ? '#f0f9ff' :
    '#f8f9fa'
  };
  border: 1px solid ${props => 
    props.type === 'critical' ? '#fed7d7' :
    props.type === 'low' ? '#fde68a' :
    props.type === 'good' ? '#bfdbfe' :
    '#e9ecef'
  };
  border-radius: 6px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => 
    props.type === 'critical' ? '#fed7d7' :
    props.type === 'low' ? '#fde68a' :
    props.type === 'good' ? '#bfdbfe' :
    '#e9ecef'
  };
  color: ${props => 
    props.type === 'critical' ? '#c53030' :
    props.type === 'low' ? '#d69e2e' :
    props.type === 'good' ? '#3182ce' :
    '#718096'
  };
`;

const StatusInfo = styled.div`
  flex: 1;
`;

const StatusValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${props => 
    props.type === 'critical' ? '#c53030' :
    props.type === 'low' ? '#d69e2e' :
    props.type === 'good' ? '#3182ce' :
    '#2d3748'
  };
`;

const StatusLabel = styled.div`
  font-size: 12px;
  color: #718096;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LastUpdateInfo = styled.div`
  font-size: 12px;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StockStatusWidget = ({ compact = false }) => {
  const { getStockStats, loading, lastUpdate, fetchStockData } = useStock();
  
  const stats = getStockStats();

  const handleRefresh = async () => {
    await fetchStockData();
  };

  if (compact) {
    return (
      <StatusCard type={stats.criticalStock > 0 ? 'critical' : stats.lowStock > 0 ? 'low' : 'good'}>
        <StatusIcon type={stats.criticalStock > 0 ? 'critical' : stats.lowStock > 0 ? 'low' : 'good'}>
          <FontAwesomeIcon 
            icon={stats.criticalStock > 0 ? faExclamationTriangle : stats.lowStock > 0 ? faWarning : faCheckCircle} 
          />
        </StatusIcon>
        <StatusInfo>
          <StatusValue type={stats.criticalStock > 0 ? 'critical' : stats.lowStock > 0 ? 'low' : 'good'}>
            {stats.totalAvailableStock.toLocaleString()}
          </StatusValue>
          <StatusLabel>Available Stock</StatusLabel>
        </StatusInfo>
      </StatusCard>
    );
  }

  return (
    <StockStatusContainer>
      <StatusHeader>
        <StatusTitle>
          <FontAwesomeIcon icon={faBoxes} />
          Stock Overview
        </StatusTitle>
        <RefreshButton onClick={handleRefresh} disabled={loading}>
          <FontAwesomeIcon icon={faRefresh} spin={loading} />
          {loading ? 'Updating...' : 'Refresh'}
        </RefreshButton>
      </StatusHeader>

      <StatusGrid>
        <StatusCard type="good">
          <StatusIcon type="good">
            <FontAwesomeIcon icon={faBoxes} />
          </StatusIcon>
          <StatusInfo>
            <StatusValue type="good">{stats.totalProducts}</StatusValue>
            <StatusLabel>Total Products</StatusLabel>
          </StatusInfo>
        </StatusCard>

        <StatusCard type="good">
          <StatusIcon type="good">
            <FontAwesomeIcon icon={faCheckCircle} />
          </StatusIcon>
          <StatusInfo>
            <StatusValue type="good">{stats.totalAvailableStock.toLocaleString()}</StatusValue>
            <StatusLabel>Available Stock</StatusLabel>
          </StatusInfo>
        </StatusCard>

        <StatusCard type="low">
          <StatusIcon type="low">
            <FontAwesomeIcon icon={faWarning} />
          </StatusIcon>
          <StatusInfo>
            <StatusValue type="low">{stats.lowStock}</StatusValue>
            <StatusLabel>Low Stock Items</StatusLabel>
          </StatusInfo>
        </StatusCard>

        <StatusCard type="critical">
          <StatusIcon type="critical">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </StatusIcon>
          <StatusInfo>
            <StatusValue type="critical">{stats.criticalStock}</StatusValue>
            <StatusLabel>Critical/Out of Stock</StatusLabel>
          </StatusInfo>
        </StatusCard>
      </StatusGrid>

      {lastUpdate && (
        <LastUpdateInfo>
          <FontAwesomeIcon icon={faRefresh} />
          Last updated: {lastUpdate.toLocaleTimeString()}
        </LastUpdateInfo>
      )}
    </StockStatusContainer>
  );
};

export default StockStatusWidget;
