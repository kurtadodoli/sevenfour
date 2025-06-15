import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';
import { Navigate } from 'react-router-dom';

const MaintenanceContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #0a0a0a;
  min-height: 100vh;
  color: #ffffff;
  padding-top: 80px; /* Account for fixed TopBar */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: #1a1a1a;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateTime = styled.div`
  text-align: right;
  color: #888888;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Section = styled.div`
  background: linear-gradient(145deg, #1a1a1a 0%, #161616 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.15),
      0 4px 10px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

const SectionHeader = styled.div`
  background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 1.5rem;
    right: 1.5rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const SectionIcon = styled.div`
  font-size: 1.5rem;
`;

const SectionContent = styled.div`
  padding: 1.5rem;
`;

const ActionGrid = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 1rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  text-align: left;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.25);
    background: linear-gradient(135deg, #3a3a3a 0%, #2d2d2d 100%);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    
    &::before {
      display: none;
    }
  }

  /* Subtle accent based on type */
  ${props => {
    if (props.variant === 'primary') return `
      border-left: 3px solid #4a9eff;
      &:hover { border-left-color: #5aa3ff; }
    `;
    if (props.variant === 'success') return `
      border-left: 3px solid #28a745;
      &:hover { border-left-color: #34ce57; }
    `;
    if (props.variant === 'warning') return `
      border-left: 3px solid #ffc107;
      &:hover { border-left-color: #ffcd39; }
    `;
    if (props.variant === 'danger') return `
      border-left: 3px solid #dc3545;
      &:hover { border-left-color: #e4606d; }
    `;
    if (props.variant === 'info') return `
      border-left: 3px solid #17a2b8;
      &:hover { border-left-color: #20c0d7; }
    `;
    if (props.variant === 'secondary') return `
      border-left: 3px solid #6c757d;
      &:hover { border-left-color: #868e96; }
    `;
    return `
      border-left: 3px solid #495057;
      &:hover { border-left-color: #6c757d; }
    `;
  }}
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.3);
  border-radius: 6px;
  color: #28a745;
  font-size: 0.9rem;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.status === 'healthy') return '#4caf50';
    if (props.status === 'warning') return '#ff9800';
    if (props.status === 'danger') return '#f44336';
    return props.color || '#4caf50';
  }};
  box-shadow: 0 0 6px ${props => {
    if (props.status === 'healthy') return 'rgba(76, 175, 80, 0.3)';
    if (props.status === 'warning') return 'rgba(255, 152, 0, 0.3)';
    if (props.status === 'danger') return 'rgba(244, 67, 54, 0.3)';
    return props.color ? `${props.color}33` : 'rgba(76, 175, 80, 0.3)';
  }};
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: #cccccc;
  font-size: 0.9rem;
`;

const InfoValue = styled.span`
  color: #ffffff;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: linear-gradient(145deg, #1a1a1a 0%, #161616 100%);
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 600px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  color: #ffffff;
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const WarningCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const WarningIcon = styled.div`
  color: #ffc107;
  font-size: 1.2rem;
  margin-top: 0.1rem;
`;

const WarningText = styled.div`
  color: #ffffff;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const ConfirmationDialog = styled.div`
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ConfirmationTitle = styled.h4`
  color: #dc3545;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ConfirmationText = styled.p`
  color: #ffffff;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ActionDescription = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-left: 3px solid #4a9eff;
`;

const DescriptionTitle = styled.h5`
  color: #4a9eff;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const DescriptionText = styled.p`
  color: #cccccc;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const ConfirmButton = styled(ActionButton)`
  min-width: 120px;
  justify-content: center;
`;

const CancelButton = styled(ActionButton)`
  min-width: 120px;
  justify-content: center;
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  border-color: rgba(255, 255, 255, 0.15);
  
  &:hover {
    background: linear-gradient(135deg, #78858f 0%, #6c757d 100%);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #cccccc;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RiskBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    if (props.level === 'high') return `
      background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%);
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
    `;
    if (props.level === 'medium') return `
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      color: #000000;
      box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
    `;
    return `
      background: linear-gradient(135deg, #28a745 0%, #20a83a 100%);
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
    `;
  }}
`;

const ActionDetails = styled.div`
  background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.25rem;
  margin: 1rem 0;
`;

const ActionTitle = styled.h4`
  color: #ffffff;
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionDesc = styled.p`
  color: #cccccc;
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const TechnicalDetails = styled.div`
  background: rgba(40, 40, 40, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 1rem;
  margin: 0.75rem 0;
`;

const DetailText = styled.p`
  color: #aaaaaa;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  font-family: 'Consolas', 'Monaco', monospace;
`;

const MaintenancePage = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState({
    database: 'healthy',
    server: 'healthy',
    storage: 'healthy',
    memory: 'healthy'
  });
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [pendingAction, setPendingAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Check if user has admin access
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const formatDateTime = (date) => {
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };
  const { date, time } = formatDateTime(currentTime);
  // System Management Actions with detailed descriptions and warnings
  const systemActions = {
    backup: {
      title: 'Database Backup',
      description: 'Creates a complete backup of the entire database including all products, orders, customers, and system data.',
      details: 'This operation will create a compressed backup file that can be used to restore your system in case of data loss. The backup includes all tables, indexes, and stored procedures.',
      warning: 'Database backup may temporarily slow down system performance during the backup process.',
      requiresConfirmation: false,
      risk: 'low'
    },
    cache: {
      title: 'Clear System Cache',
      description: 'Removes all cached data including application cache, image cache, and session data to improve system performance.',
      details: 'Clearing cache will force the system to rebuild all cached data, which may temporarily slow down the first few operations but will improve overall performance.',
      warning: 'Users may experience slower response times immediately after cache clearing as the system rebuilds cached data.',
      requiresConfirmation: true,
      risk: 'medium'
    },
    logs: {
      title: 'View System Logs',
      description: 'Displays detailed system logs including user activities, errors, warnings, and system events for troubleshooting.',
      details: 'System logs contain sensitive information about user activities and system operations. This data is used for monitoring, debugging, and security analysis.',
      warning: 'System logs may contain sensitive information. Only authorized personnel should access this data.',
      requiresConfirmation: false,
      risk: 'low'
    },
    optimize: {
      title: 'Optimize Database',
      description: 'Performs database optimization including table defragmentation, index rebuilding, and query performance improvements.',
      details: 'This operation will analyze all database tables, rebuild indexes, and optimize query performance. It may take several minutes to complete depending on database size.',
      warning: 'Database optimization will temporarily lock tables and may cause brief service interruptions. Perform during low-traffic periods.',
      requiresConfirmation: true,
      risk: 'high'
    }
  };

  // Data Management Actions
  const dataActions = {
    export: {
      title: 'Export Products',
      description: 'Exports all product data to CSV format for backup, analysis, or migration purposes.',
      details: 'Creates a comprehensive CSV file containing all product information including SKUs, descriptions, prices, inventory levels, categories, and metadata.',
      warning: 'Export may take several minutes for large product catalogs.',
      requiresConfirmation: false,
      risk: 'low'
    },
    import: {
      title: 'Import Products',
      description: 'Imports product data from CSV, Excel, or JSON files to add or update products in bulk.',
      details: 'Supports multiple file formats and validates data integrity before import. Existing products will be updated based on SKU matching.',
      warning: 'Import operations can modify existing product data. Always backup before importing.',
      requiresConfirmation: true,
      risk: 'medium'
    },
    cleanup: {
      title: 'Data Cleanup',
      description: 'Removes old user sessions, expired coupons, temporary files, and other obsolete data to optimize system performance.',
      details: 'Clears expired sessions older than 30 days, removes unused temporary files, deletes expired promotional codes, and optimizes data storage.',
      warning: 'This action permanently removes old data and cannot be undone.',
      requiresConfirmation: true,
      risk: 'medium'
    },
    archive: {
      title: 'Archive Orders',
      description: 'Archives completed orders older than specified period to reduce database size while maintaining data integrity.',
      details: 'Moves orders older than 1 year to archive storage, keeping them accessible but removing them from active database queries.',
      warning: 'Archived orders will not appear in regular reports but remain accessible through archive interface.',
      requiresConfirmation: true,
      risk: 'medium'
    }
  };

  // User Management Actions
  const userActions = {
    users: {
      title: 'Manage Users',
      description: 'Access comprehensive user management interface to view, edit, activate, or deactivate user accounts.',
      details: 'Provides full control over user accounts including profile management, status changes, and access control.',
      warning: 'User management affects customer access to the system.',
      requiresConfirmation: false,
      risk: 'low'
    },
    permissions: {
      title: 'Update Permissions',
      description: 'Modify user role permissions and access levels across the system.',
      details: 'Changes user access rights including admin privileges, product management, order processing, and system settings.',
      warning: 'Incorrect permission changes can lock users out of essential functions.',
      requiresConfirmation: true,
      risk: 'high'
    },
    sessions: {
      title: 'Active Sessions',
      description: 'View and manage currently active user sessions across the platform.',
      details: 'Monitor active user sessions, view session details, and terminate sessions if necessary for security purposes.',
      warning: 'Terminating sessions will immediately log out users.',
      requiresConfirmation: true,
      risk: 'medium'
    },
    activity: {
      title: 'User Activity',
      description: 'Review detailed logs of user activities including logins, purchases, and system interactions.',
      details: 'Comprehensive activity tracking for security monitoring, user behavior analysis, and troubleshooting purposes.',
      warning: 'Activity logs contain sensitive user behavior data.',
      requiresConfirmation: false,
      risk: 'low'
    }
  };

  // Store Configuration Actions
  const storeActions = {
    store: {
      title: 'Store Settings',
      description: 'Configure basic store information including name, address, contact details, and operating parameters.',
      details: 'Updates store identity, contact information, business details, and customer-facing information displayed throughout the platform.',
      warning: 'Changes affect customer-facing information immediately.',
      requiresConfirmation: false,
      risk: 'low'
    },
    tax: {
      title: 'Tax Configuration',
      description: 'Configure tax rates, exemptions, and tax calculation rules for different product categories and locations.',
      details: 'Sets up tax calculations for products, shipping, and services. Supports multiple tax zones and product-specific tax rates.',
      warning: 'Incorrect tax settings can affect order calculations and legal compliance.',
      requiresConfirmation: true,
      risk: 'high'
    },
    receipt: {
      title: 'Receipt Settings',
      description: 'Customize receipt appearance, content, and branding elements for customer receipts and invoices.',
      details: 'Configure receipt templates, logos, messaging, social media links, and legal disclaimers for printed and digital receipts.',
      warning: 'Changes affect all future receipts and customer communications.',
      requiresConfirmation: false,
      risk: 'low'
    },
    hours: {
      title: 'Business Hours',
      description: 'Set store operating hours, holiday schedules, and special event hours for customer reference.',
      details: 'Configures displayed business hours, automated messages during closed hours, and special scheduling for holidays or events.',
      warning: 'Changes affect customer expectations and automated system behaviors.',
      requiresConfirmation: false,
      risk: 'low'
    }
  };

  // Inventory Management Actions
  const inventoryActions = {
    stock: {
      title: 'Bulk Stock Adjustment',
      description: 'Perform bulk inventory adjustments across multiple products simultaneously.',
      details: 'Update inventory quantities for multiple products at once, apply percentage adjustments, or set minimum stock levels in bulk.',
      warning: 'Bulk stock changes affect product availability and can impact ongoing orders.',
      requiresConfirmation: true,
      risk: 'high'
    },
    audit: {
      title: 'Inventory Audit',
      description: 'Perform comprehensive inventory count and discrepancy analysis to ensure accurate stock levels.',
      details: 'Compares system inventory levels with actual stock, identifies discrepancies, and generates detailed audit reports for reconciliation.',
      warning: 'Audit process may temporarily lock inventory for counting accuracy.',
      requiresConfirmation: true,
      risk: 'medium'
    },
    alerts: {
      title: 'Stock Alerts',
      description: 'Configure low stock alerts, reorder points, and inventory notification settings.',
      details: 'Sets up automated alerts for low stock conditions, critical inventory levels, and reorder notifications to prevent stockouts.',
      warning: 'Alert changes affect inventory management workflows.',
      requiresConfirmation: false,
      risk: 'low'
    },
    categories: {
      title: 'Manage Categories',
      description: 'Create, edit, and organize product categories and subcategories for better product organization.',
      details: 'Manage product taxonomy, category hierarchies, and product assignments to improve navigation and inventory organization.',
      warning: 'Category changes affect product organization and customer navigation.',
      requiresConfirmation: false,
      risk: 'low'
    }
  };

  // Advanced Tools Actions
  const advancedActions = {
    restart: {
      title: 'Restart Services',
      description: 'Restart core system services including web server, database connections, and cache services.',
      details: 'Performs a controlled restart of all system services to resolve performance issues or apply configuration changes.',
      warning: 'Service restart causes temporary system unavailability (30-60 seconds).',
      requiresConfirmation: true,
      risk: 'high'
    },
    update: {
      title: 'System Update',
      description: 'Check for and install available system updates, security patches, and feature improvements.',
      details: 'Scans for available updates, displays change logs, and provides controlled update installation with rollback capability.',
      warning: 'Updates may require system restart and temporary downtime.',
      requiresConfirmation: true,
      risk: 'medium'
    },
    security: {
      title: 'Security Scan',
      description: 'Perform comprehensive security analysis including vulnerability scanning and security audit.',
      details: 'Analyzes system security, checks for vulnerabilities, reviews access logs, and generates security compliance reports.',
      warning: 'Security scans may temporarily impact system performance.',
      requiresConfirmation: false,
      risk: 'low'
    },
    performance: {
      title: 'Performance Report',
      description: 'Generate detailed performance analytics including response times, resource usage, and optimization recommendations.',
      details: 'Analyzes system performance metrics, database query efficiency, memory usage patterns, and provides actionable optimization recommendations.',
      warning: 'Performance analysis may temporarily increase system load.',
      requiresConfirmation: false,
      risk: 'low'
    }
  };
  const handleSystemAction = (actionType) => {
    const action = systemActions[actionType];
    
    if (action.requiresConfirmation) {
      setPendingAction({ actionType, actionName: action.title, actionCategory: 'system' });
      setShowConfirmation(true);
    } else {
      executeAction(actionType, action.title);
    }
  };

  const handleDataAction = (actionType) => {
    const action = dataActions[actionType];
    
    if (action.requiresConfirmation) {
      setPendingAction({ actionType, actionName: action.title, actionCategory: 'data' });
      setShowConfirmation(true);
    } else {
      executeAction(actionType, action.title);
    }
  };

  const handleUserAction = (actionType) => {
    const action = userActions[actionType];
    
    if (action.requiresConfirmation) {
      setPendingAction({ actionType, actionName: action.title, actionCategory: 'user' });
      setShowConfirmation(true);
    } else {
      executeAction(actionType, action.title);
    }
  };

  const handleStoreAction = (actionType) => {
    const action = storeActions[actionType];
    
    if (action.requiresConfirmation) {
      setPendingAction({ actionType, actionName: action.title, actionCategory: 'store' });
      setShowConfirmation(true);
    } else {
      executeAction(actionType, action.title);
    }
  };

  const handleInventoryAction = (actionType) => {
    const action = inventoryActions[actionType];
    
    if (action.requiresConfirmation) {
      setPendingAction({ actionType, actionName: action.title, actionCategory: 'inventory' });
      setShowConfirmation(true);
    } else {
      executeAction(actionType, action.title);
    }
  };

  const handleAdvancedAction = (actionType) => {
    const action = advancedActions[actionType];
    
    if (action.requiresConfirmation) {
      setPendingAction({ actionType, actionName: action.title, actionCategory: 'advanced' });
      setShowConfirmation(true);
    } else {
      executeAction(actionType, action.title);
    }
  };

  // Get current action details for confirmation dialog
  const getCurrentAction = () => {
    if (!pendingAction) return null;
    
    switch (pendingAction.actionCategory) {
      case 'system': return systemActions[pendingAction.actionType];
      case 'data': return dataActions[pendingAction.actionType];
      case 'user': return userActions[pendingAction.actionType];
      case 'store': return storeActions[pendingAction.actionType];
      case 'inventory': return inventoryActions[pendingAction.actionType];
      case 'advanced': return advancedActions[pendingAction.actionType];
      default: return null;
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      executeAction(pendingAction.actionType, pendingAction.actionName);
      setPendingAction(null);
      setShowConfirmation(false);
    }
  };

  const cancelAction = () => {
    setPendingAction(null);
    setShowConfirmation(false);
  };

  const executeAction = async (actionType, actionName) => {
    setIsProcessing(true);
    
    // Simulate processing time based on action complexity
    const processingTime = {
      backup: 3000,
      cache: 1500,
      logs: 1000,
      optimize: 4000
    };
    
    await new Promise(resolve => setTimeout(resolve, processingTime[actionType] || 2000));
    
    let content = '';
    
    switch (actionType) {
      case 'backup':
        content = `Database backup completed successfully!\n\nBackup Details:\n- Date: ${date}\n- Time: ${time}\n- Size: 45.2 MB\n- Location: /backups/db_backup_${Date.now()}.sql`;
        break;
      case 'cache':
        content = `Cache cleared successfully!\n\nCleared:\n- Application cache: 12.5 MB\n- Image cache: 8.3 MB\n- Session cache: 2.1 MB\n- Total freed: 22.9 MB`;
        break;
      case 'logs':
        content = `System logs from the last 24 hours:\n\n[INFO] 14:32:15 - User login: admin@store.com\n[INFO] 14:35:22 - Product added: Classic T-Shirt\n[WARN] 14:40:12 - Low stock alert: Blue Jeans\n[INFO] 14:45:33 - Order completed: ORD-001\n[ERROR] 14:50:44 - Failed payment: timeout\n[INFO] 14:55:15 - System backup completed`;
        break;
      case 'export':
        content = `Product export completed!\n\nExport Details:\n- Total products: 156\n- File format: CSV\n- File size: 2.3 MB\n- Download will start automatically...`;
        break;
      case 'import':
        content = `Ready to import products!\n\nSupported formats:\n- CSV (.csv)\n- Excel (.xlsx, .xls)\n- JSON (.json)\n\nPlease select a file to import...`;
        break;
      case 'optimize':
        content = `Database optimization completed!\n\nOptimization Results:\n- Tables optimized: 12\n- Indices rebuilt: 8\n- Disk space freed: 125 MB\n- Query performance improved by 23%`;
        break;
      default:
        content = `${actionName} operation completed successfully!`;
    }
      setModalContent({ title: actionName, content });
    setShowModal(true);
    setIsProcessing(false);
  };
  return (
    <MaintenanceContainer>
      <Header>
        <Title>
          🔧 System Maintenance
        </Title>
        <DateTime>
          <div>{date}</div>
          <div>{time}</div>
        </DateTime>
      </Header>

      {/* System Status Overview */}
      <Section style={{ marginBottom: '2rem' }}>
        <SectionHeader>
          <SectionIcon>📊</SectionIcon>
          <SectionTitle>System Health Status</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <InfoCard>
              <InfoRow>
                <InfoLabel>Database</InfoLabel>                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusDot status="healthy" />
                  <InfoValue>Healthy</InfoValue>
                </div>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Uptime</InfoLabel>
                <InfoValue>99.8%</InfoValue>
              </InfoRow>
            </InfoCard>
            <InfoCard>
              <InfoRow>
                <InfoLabel>Storage</InfoLabel>                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusDot status="healthy" />
                  <InfoValue>78% Used</InfoValue>
                </div>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Free Space</InfoLabel>
                <InfoValue>2.4 GB</InfoValue>
              </InfoRow>
            </InfoCard>
            <InfoCard>
              <InfoRow>
                <InfoLabel>Memory</InfoLabel>                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusDot status="warning" />
                  <InfoValue>85% Used</InfoValue>
                </div>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Available</InfoLabel>
                <InfoValue>1.2 GB</InfoValue>
              </InfoRow>
            </InfoCard>
            <InfoCard>
              <InfoRow>
                <InfoLabel>API Health</InfoLabel>                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusDot status="healthy" />
                  <InfoValue>Online</InfoValue>
                </div>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Response</InfoLabel>
                <InfoValue>45ms</InfoValue>
              </InfoRow>
            </InfoCard>
          </div>
        </SectionContent>
      </Section>

      <SectionGrid>
        {/* System Maintenance */}        <Section>
          <SectionHeader>
            <SectionIcon>⚙️</SectionIcon>
            <SectionTitle>System Maintenance</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <div style={{ marginBottom: '1rem', color: '#cccccc', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Critical system operations that affect database integrity and performance. Some actions require confirmation and may temporarily impact system availability.
            </div>
            <ActionGrid>              <ActionButton 
                variant="success" 
                onClick={() => handleSystemAction('backup')}
                disabled={isProcessing}
                title="Creates a complete backup of the database - safe operation with no downtime"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    💾 <strong>Create Database Backup</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Safe operation • Creates full system backup • No service interruption
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="warning" 
                onClick={() => handleSystemAction('cache')}
                disabled={isProcessing}
                title="Clears all cached data - requires confirmation, may slow initial responses"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    🧹 <strong>Clear System Cache</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Requires confirmation • Temporary slowdown • Improves performance
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="secondary" 
                onClick={() => handleSystemAction('logs')}
                disabled={isProcessing}
                title="View system logs and activities - read-only operation"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    📋 <strong>View System Logs</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Read-only • System monitoring • Troubleshooting data
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="danger" 
                onClick={() => handleSystemAction('optimize')}
                disabled={isProcessing}
                title="Optimize database performance - HIGH RISK: requires confirmation, causes service interruption"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    ⚡ <strong>Optimize Database</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#dc3545', 
                      color: '#fff', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>HIGH RISK</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    ⚠️ Requires confirmation • Service interruption • Use during low traffic
                  </div>
                </div>
              </ActionButton>
            </ActionGrid>
          </SectionContent>
        </Section>        {/* Data Management */}
        <Section>
          <SectionHeader>
            <SectionIcon>📦</SectionIcon>
            <SectionTitle>Data Management</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <div style={{ marginBottom: '1rem', color: '#cccccc', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Import, export, and maintain data integrity. Bulk operations for products and orders with safety checks and backup options.
            </div>
            <ActionGrid>
              <ActionButton 
                variant="success" 
                onClick={() => handleDataAction('export')}
                disabled={isProcessing}
                title="Export all product data to CSV format - safe read-only operation"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    📤 <strong>Export Products (CSV)</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Safe operation • Read-only export • No data changes
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="warning" 
                onClick={() => handleDataAction('import')}
                disabled={isProcessing}
                title="Import product data from files - requires confirmation, can modify existing data"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    📥 <strong>Import Products</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#ffc107', 
                      color: '#000', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>MEDIUM RISK</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    ⚠️ Requires confirmation • Can modify data • Backup recommended
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="warning" 
                onClick={() => handleDataAction('cleanup')}
                disabled={isProcessing}
                title="Clean old data and temporary files - requires confirmation, permanent deletion"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    🗑️ <strong>Clean Old Records</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#ffc107', 
                      color: '#000', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>MEDIUM RISK</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    ⚠️ Requires confirmation • Permanent deletion • Cannot be undone
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="warning" 
                onClick={() => handleDataAction('archive')}
                disabled={isProcessing}
                title="Archive old orders to reduce database size - requires confirmation"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    📁 <strong>Archive Old Orders</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#ffc107', 
                      color: '#000', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>MEDIUM RISK</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    ⚠️ Requires confirmation • Changes data access • Affects reports
                  </div>
                </div>
              </ActionButton>
            </ActionGrid>
          </SectionContent>
        </Section>        {/* User Management */}
        <Section>
          <SectionHeader>
            <SectionIcon>👥</SectionIcon>
            <SectionTitle>User Management</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <div style={{ marginBottom: '1rem', color: '#cccccc', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Manage user accounts, permissions, and access control. Monitor user activity and session management for security.
            </div>
            <ActionGrid>
              <ActionButton 
                variant="info" 
                onClick={() => handleUserAction('users')}
                disabled={isProcessing}
                title="Access user management interface - safe read/write operations"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    👤 <strong>Manage User Accounts</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Safe operation • User interface • Standard management
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="danger" 
                onClick={() => handleUserAction('permissions')}
                disabled={isProcessing}
                title="Modify user permissions and access levels - HIGH RISK: affects system access"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    🔐 <strong>Update Permissions</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#dc3545', 
                      color: '#fff', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>HIGH RISK</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    🚨 Requires confirmation • Affects access • Can lock out users
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="warning" 
                onClick={() => handleUserAction('sessions')}
                disabled={isProcessing}
                title="View and manage active user sessions - can terminate sessions"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    🔄 <strong>View Active Sessions</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#ffc107', 
                      color: '#000', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>MEDIUM RISK</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    ⚠️ Requires confirmation • Can terminate sessions • Logs out users
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="secondary" 
                onClick={() => handleUserAction('activity')}
                disabled={isProcessing}
                title="View user activity logs - read-only security monitoring"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    📊 <strong>User Activity Logs</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Read-only • Security monitoring • Sensitive data access
                  </div>
                </div>
              </ActionButton>
            </ActionGrid>
          </SectionContent>
        </Section>        {/* Store Settings */}
        <Section>
          <SectionHeader>
            <SectionIcon>🏪</SectionIcon>
            <SectionTitle>Store Configuration</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <div style={{ marginBottom: '1rem', color: '#cccccc', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Configure store identity, tax settings, receipts, and operational parameters. Changes affect customer experience and compliance.
            </div>
            <ActionGrid>
              <ActionButton 
                variant="success" 
                onClick={() => handleStoreAction('store')}
                disabled={isProcessing}
                title="Configure basic store information and settings"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    🏢 <strong>Store Information</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Safe operation • Basic settings • Customer-facing info
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="danger" 
                onClick={() => handleStoreAction('tax')}
                disabled={isProcessing}
                title="Configure tax rates and calculations - HIGH RISK: affects order totals and compliance"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    💰 <strong>Tax Settings</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#dc3545', 
                      color: '#fff', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>HIGH RISK</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    � Requires confirmation • Affects calculations • Legal compliance
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="info" 
                onClick={() => handleStoreAction('receipt')}
                disabled={isProcessing}
                title="Customize receipt appearance and content"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    🧾 <strong>Receipt Customization</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Safe operation • Branding settings • Customer receipts
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="secondary" 
                onClick={() => handleStoreAction('hours')}
                disabled={isProcessing}
                title="Set business hours and holiday schedules"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    🕒 <strong>Business Hours</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Safe operation • Schedule settings • Customer information
                  </div>
                </div>
              </ActionButton>
            </ActionGrid>
          </SectionContent>
        </Section>        {/* Inventory Tools */}
        <Section>
          <SectionHeader>
            <SectionIcon>📊</SectionIcon>
            <SectionTitle>Inventory Tools</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <div style={{ marginBottom: '1rem', color: '#cccccc', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Comprehensive inventory management including stock adjustments, audits, alerts, and category organization.
            </div>
            <ActionGrid>
              <ActionButton 
                variant="danger" 
                onClick={() => handleInventoryAction('stock')}
                disabled={isProcessing}
                title="Perform bulk inventory adjustments - HIGH RISK: affects product availability"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    📈 <strong>Bulk Stock Adjustment</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#dc3545', 
                      color: '#fff', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>HIGH RISK</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    🚨 Requires confirmation • Affects availability • Impacts orders
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="warning" 
                onClick={() => handleInventoryAction('audit')}
                disabled={isProcessing}
                title="Perform comprehensive inventory audit - may temporarily lock inventory"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    🔍 <strong>Inventory Audit</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#ffc107', 
                      color: '#000', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>MEDIUM RISK</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    ⚠️ Requires confirmation • Temporary lock • Discrepancy analysis
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="info" 
                onClick={() => handleInventoryAction('alerts')}
                disabled={isProcessing}
                title="Configure stock alerts and reorder points"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    ⚠️ <strong>Low Stock Alerts</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Safe operation • Alert configuration • Notification settings
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="secondary" 
                onClick={() => handleInventoryAction('categories')}
                disabled={isProcessing}
                title="Manage product categories and organization"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    📁 <strong>Product Categories</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Safe operation • Category management • Product organization
                  </div>
                </div>
              </ActionButton>
            </ActionGrid>
          </SectionContent>
        </Section>        {/* System Tools */}
        <Section>
          <SectionHeader>
            <SectionIcon>🛠️</SectionIcon>
            <SectionTitle>Advanced Tools</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <div style={{ marginBottom: '1rem', color: '#cccccc', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Advanced system tools for service management, updates, security scanning, and performance monitoring.
            </div>
            <ActionGrid>
              <ActionButton 
                variant="danger" 
                onClick={() => handleAdvancedAction('restart')}
                disabled={isProcessing}
                title="Restart system services - HIGH RISK: causes temporary downtime"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    🔄 <strong>Restart Services</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#dc3545', 
                      color: '#fff', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>HIGH RISK</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    � Requires confirmation • System downtime • Service interruption
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="warning" 
                onClick={() => handleAdvancedAction('update')}
                disabled={isProcessing}
                title="Check for system updates - may require restart"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    🆙 <strong>Check for Updates</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: '#ffc107', 
                      color: '#000', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>MEDIUM RISK</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    ⚠️ Requires confirmation • May need restart • System updates
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="info" 
                onClick={() => handleAdvancedAction('security')}
                disabled={isProcessing}
                title="Perform security scan and vulnerability analysis"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    🔒 <strong>Security Scan</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Safe operation • Security analysis • Vulnerability check
                  </div>
                </div>
              </ActionButton>
              <ActionButton 
                variant="secondary" 
                onClick={() => handleAdvancedAction('performance')}
                disabled={isProcessing}
                title="Generate performance report and optimization recommendations"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    📈 <strong>Performance Report</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: '1.3' }}>
                    Safe operation • Performance analysis • Optimization tips
                  </div>
                </div>
              </ActionButton>
            </ActionGrid>
          </SectionContent>
        </Section>
      </SectionGrid>

      {/* Confirmation Modal */}
      <Modal show={showConfirmation}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>⚠️ Confirm Action</ModalTitle>
            <CloseButton onClick={cancelAction}>×</CloseButton>
          </ModalHeader>          <ModalBody>
            {pendingAction && getCurrentAction() && (
              <>
                <ActionDetails>
                  <ActionTitle>
                    {getCurrentAction().title}
                    <RiskBadge level={getCurrentAction().risk}>
                      {getCurrentAction().risk === 'high' && '⚠️'}
                      {getCurrentAction().risk === 'medium' && '⚡'}
                      {getCurrentAction().risk === 'low' && '✅'}
                      {getCurrentAction().risk} Risk
                    </RiskBadge>
                  </ActionTitle>
                  <ActionDesc>
                    {getCurrentAction().description}
                  </ActionDesc>
                  <TechnicalDetails>
                    <DetailText>
                      {getCurrentAction().details}
                    </DetailText>
                  </TechnicalDetails>
                </ActionDetails>

                {getCurrentAction().warning && (
                  <WarningCard>
                    <WarningIcon>⚠️</WarningIcon>
                    <WarningText>
                      <strong>Warning:</strong> {getCurrentAction().warning}
                    </WarningText>
                  </WarningCard>
                )}

                <ConfirmationDialog>
                  <ConfirmationTitle>
                    {getCurrentAction().risk === 'high' 
                      ? '🚨 HIGH RISK OPERATION' 
                      : 'Confirm Action'
                    }
                  </ConfirmationTitle>
                  <p style={{ color: '#cccccc', margin: '0', fontSize: '0.9rem' }}>
                    {getCurrentAction().risk === 'high' 
                      ? 'This is a high-risk operation that may cause service interruption. Please ensure you understand the consequences before proceeding.'
                      : 'This action cannot be undone. Please confirm that you want to continue.'
                    }
                  </p>
                </ConfirmationDialog>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <ActionButton 
                    variant="secondary"
                    onClick={cancelAction}
                    style={{ minWidth: '100px' }}
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton 
                    variant={getCurrentAction().risk === 'high' ? 'danger' : 'warning'}
                    onClick={confirmAction}
                    disabled={isProcessing}
                    style={{ minWidth: '120px' }}
                  >
                    {isProcessing ? 'Processing...' : 
                     getCurrentAction().risk === 'high' ? 'I Understand, Proceed' : 'Confirm'}
                  </ActionButton>
                </div>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Action Result Modal */}
      <Modal show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{modalContent.title}</ModalTitle>
            <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
          </ModalHeader>
          <div style={{ 
            whiteSpace: 'pre-line', 
            color: '#cccccc', 
            fontSize: '0.95rem', 
            lineHeight: '1.6',
            marginBottom: '1.5rem'
          }}>
            {modalContent.content}
          </div>          <ActionButton 
            variant="primary" 
            onClick={() => setShowModal(false)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Close
          </ActionButton>
        </ModalContent>
      </Modal>
    </MaintenanceContainer>
  );
};

export default MaintenancePage;
