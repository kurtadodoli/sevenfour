import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SideNav = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: fit-content;
`;

const NavItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-weight: ${props => props.active ? '500' : 'normal'};
  background-color: ${props => props.active ? '#f5f5f5' : 'transparent'};
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SettingsPanel = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PanelTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }
  
  span {
    cursor: pointer;
    width: 50px;
    height: 26px;
    background-color: ${props => props.active ? '#28a745' : '#ccc'};
    display: inline-block;
    border-radius: 13px;
    position: relative;
    margin-right: 10px;
    transition: background-color 0.3s;
    
    &:before {
      content: '';
      position: absolute;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: white;
      top: 2px;
      left: ${props => props.active ? 'calc(100% - 24px)' : '2px'};
      transition: left 0.3s;
    }
  }
`;

const SettingDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  background-color: ${props => props.$primary ? '#000' : '#f5f5f5'};
  color: ${props => props.$primary ? '#fff' : '#333'};
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.$primary ? '#333' : '#e0e0e0'};
  }
`;

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      storeName: 'Seven Four Clothing',
      storeEmail: 'contact@sevenfourclothing.com',
      storePhone: '+63 912 345 6789',
      storeAddress: '123 Main Street, Caloocan City, Metro Manila, Philippines',
      storeCurrency: 'PHP',
      maintenanceMode: false
    },
    shipping: {
      enableShipping: true,
      shippingFee: 150,
      freeShippingThreshold: 2000,
      shippingMethods: [
        { id: 'standard', name: 'Standard Delivery', days: '3-5', fee: 150 },
        { id: 'express', name: 'Express Delivery', days: '1-2', fee: 300 }
      ],
      enableLocalPickup: true
    },
    payment: {
      enableCashOnDelivery: true,
      enableBankTransfer: true,
      enableGCash: true,
      bankDetails: 'Bank: BDO\nAccount Name: Seven Four Clothing\nAccount Number: 1234567890',
      gcashNumber: '09123456789'
    },
    notifications: {
      orderConfirmation: true,
      orderStatusUpdate: true,
      orderShipped: true,
      orderDelivered: true,
      lowStockAlert: true,
      lowStockThreshold: 10
    }
  });
  const [loading, setLoading] = useState(true);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // In a real application, you would fetch settings from your API
        // const res = await axios.get('/api/settings');
        // setSettings(res.data.data);
        
        // Mock data is already set in the initial state
        setLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle form input changes
  const handleInputChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  // Handle form submission
  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    // In a real application, you would update settings via API
    // axios.put('/api/settings', { [activeSection]: settings[activeSection] });
    
    alert('Settings saved successfully!');
  };

  if (loading) {
    return <PageContainer>Loading settings...</PageContainer>;
  }

  return (
    <PageContainer>
      <Header>
        <Title>Store Settings</Title>
        <Subtitle>Configure your store settings and preferences</Subtitle>
      </Header>
      
      <SettingsGrid>
        <SideNav>
          <NavItem 
            active={activeSection === 'general'} 
            onClick={() => setActiveSection('general')}
          >
            General Settings
          </NavItem>
          <NavItem 
            active={activeSection === 'shipping'} 
            onClick={() => setActiveSection('shipping')}
          >
            Shipping Options
          </NavItem>
          <NavItem 
            active={activeSection === 'payment'} 
            onClick={() => setActiveSection('payment')}
          >
            Payment Methods
          </NavItem>
          <NavItem 
            active={activeSection === 'notifications'} 
            onClick={() => setActiveSection('notifications')}
          >
            Notifications
          </NavItem>
        </SideNav>
        
        <SettingsPanel>
          {/* General Settings */}
          {activeSection === 'general' && (
            <>
              <PanelTitle>General Settings</PanelTitle>
              <Form onSubmit={handleSaveSettings}>
                <FormGroup>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    type="text"
                    id="storeName"
                    value={settings.general.storeName}
                    onChange={(e) => handleInputChange('general', 'storeName', e.target.value)}
                  />
                </FormGroup>
                
                <FormRow>
                  <FormGroup>
                    <Label htmlFor="storeEmail">Store Email</Label>
                    <Input
                      type="email"
                      id="storeEmail"
                      value={settings.general.storeEmail}
                      onChange={(e) => handleInputChange('general', 'storeEmail', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="storePhone">Store Phone</Label>
                    <Input
                      type="text"
                      id="storePhone"
                      value={settings.general.storePhone}
                      onChange={(e) => handleInputChange('general', 'storePhone', e.target.value)}
                    />
                  </FormGroup>
                </FormRow>
                
                <FormGroup>
                  <Label htmlFor="storeAddress">Store Address</Label>
                  <TextArea
                    id="storeAddress"
                    value={settings.general.storeAddress}
                    onChange={(e) => handleInputChange('general', 'storeAddress', e.target.value)}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="storeCurrency">Currency</Label>
                  <Select
                    id="storeCurrency"
                    value={settings.general.storeCurrency}
                    onChange={(e) => handleInputChange('general', 'storeCurrency', e.target.value)}
                  >
                    <option value="PHP">Philippine Peso (₱)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label>Maintenance Mode</Label>
                  <ToggleSwitch active={settings.general.maintenanceMode}>
                    <input
                      type="checkbox"
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                    />
                    <span></span>
                    {settings.general.maintenanceMode ? 'Enabled' : 'Disabled'}
                  </ToggleSwitch>
                  <SettingDescription>
                    When enabled, the store will be in maintenance mode and customers won't be able to place orders.
                  </SettingDescription>
                </FormGroup>
                
                <ButtonGroup>
                  <Button type="button" onClick={() => setSettings({...settings})}>Cancel</Button>
                  <Button $primary type="submit">Save Changes</Button>
                </ButtonGroup>
              </Form>
            </>
          )}
          
          {/* Shipping Options */}
          {activeSection === 'shipping' && (
            <>
              <PanelTitle>Shipping Options</PanelTitle>
              <Form onSubmit={handleSaveSettings}>
                <FormGroup>
                  <Label>Enable Shipping</Label>
                  <ToggleSwitch active={settings.shipping.enableShipping}>
                    <input
                      type="checkbox"
                      checked={settings.shipping.enableShipping}
                      onChange={(e) => handleInputChange('shipping', 'enableShipping', e.target.checked)}
                    />
                    <span></span>
                    {settings.shipping.enableShipping ? 'Enabled' : 'Disabled'}
                  </ToggleSwitch>
                </FormGroup>
                
                <FormRow>
                  <FormGroup>
                    <Label htmlFor="shippingFee">Default Shipping Fee (₱)</Label>
                    <Input
                      type="number"
                      id="shippingFee"
                      value={settings.shipping.shippingFee}
                      onChange={(e) => handleInputChange('shipping', 'shippingFee', Number(e.target.value))}
                      disabled={!settings.shipping.enableShipping}
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₱)</Label>
                    <Input
                      type="number"
                      id="freeShippingThreshold"
                      value={settings.shipping.freeShippingThreshold}
                      onChange={(e) => handleInputChange('shipping', 'freeShippingThreshold', Number(e.target.value))}
                      disabled={!settings.shipping.enableShipping}
                    />
                    <SettingDescription>
                      Order amount to qualify for free shipping. Set to 0 to disable.
                    </SettingDescription>
                  </FormGroup>
                </FormRow>
                
                <FormGroup>
                  <Label>Enable Local Pickup</Label>
                  <ToggleSwitch active={settings.shipping.enableLocalPickup}>
                    <input
                      type="checkbox"
                      checked={settings.shipping.enableLocalPickup}
                      onChange={(e) => handleInputChange('shipping', 'enableLocalPickup', e.target.checked)}
                    />
                    <span></span>
                    {settings.shipping.enableLocalPickup ? 'Enabled' : 'Disabled'}
                  </ToggleSwitch>
                </FormGroup>
                
                <ButtonGroup>
                  <Button type="button" onClick={() => setSettings({...settings})}>Cancel</Button>
                  <Button $primary type="submit">Save Changes</Button>
                </ButtonGroup>
              </Form>
            </>
          )}
          
          {/* Payment Methods */}
          {activeSection === 'payment' && (
            <>
              <PanelTitle>Payment Methods</PanelTitle>
              <Form onSubmit={handleSaveSettings}>
                <FormGroup>
                  <Label>Cash on Delivery</Label>
                  <ToggleSwitch active={settings.payment.enableCashOnDelivery}>
                    <input
                      type="checkbox"
                      checked={settings.payment.enableCashOnDelivery}
                      onChange={(e) => handleInputChange('payment', 'enableCashOnDelivery', e.target.checked)}
                    />
                    <span></span>
                    {settings.payment.enableCashOnDelivery ? 'Enabled' : 'Disabled'}
                  </ToggleSwitch>
                </FormGroup>
                
                <FormGroup>
                  <Label>Bank Transfer</Label>
                  <ToggleSwitch active={settings.payment.enableBankTransfer}>
                    <input
                      type="checkbox"
                      checked={settings.payment.enableBankTransfer}
                      onChange={(e) => handleInputChange('payment', 'enableBankTransfer', e.target.checked)}
                    />
                    <span></span>
                    {settings.payment.enableBankTransfer ? 'Enabled' : 'Disabled'}
                  </ToggleSwitch>
                </FormGroup>
                
                {settings.payment.enableBankTransfer && (
                  <FormGroup>
                    <Label htmlFor="bankDetails">Bank Details</Label>
                    <TextArea
                      id="bankDetails"
                      value={settings.payment.bankDetails}
                      onChange={(e) => handleInputChange('payment', 'bankDetails', e.target.value)}
                    />
                    <SettingDescription>
                      These details will be shown to customers who choose bank transfer.
                    </SettingDescription>
                  </FormGroup>
                )}
                
                <FormGroup>
                  <Label>GCash</Label>
                  <ToggleSwitch active={settings.payment.enableGCash}>
                    <input
                      type="checkbox"
                      checked={settings.payment.enableGCash}
                      onChange={(e) => handleInputChange('payment', 'enableGCash', e.target.checked)}
                    />
                    <span></span>
                    {settings.payment.enableGCash ? 'Enabled' : 'Disabled'}
                  </ToggleSwitch>
                </FormGroup>
                
                {settings.payment.enableGCash && (
                  <FormGroup>
                    <Label htmlFor="gcashNumber">GCash Number</Label>
                    <Input
                      type="text"
                      id="gcashNumber"
                      value={settings.payment.gcashNumber}
                      onChange={(e) => handleInputChange('payment', 'gcashNumber', e.target.value)}
                    />
                  </FormGroup>
                )}
                
                <ButtonGroup>
                  <Button type="button" onClick={() => setSettings({...settings})}>Cancel</Button>
                  <Button $primary type="submit">Save Changes</Button>
                </ButtonGroup>
              </Form>
            </>
          )}
          
          {/* Notifications */}
          {activeSection === 'notifications' && (
            <>
              <PanelTitle>Notification Settings</PanelTitle>
              <Form onSubmit={handleSaveSettings}>
                <FormGroup>
                  <Label>Order Confirmation</Label>
                  <ToggleSwitch active={settings.notifications.orderConfirmation}>
                    <input
                      type="checkbox"
                      checked={settings.notifications.orderConfirmation}
                      onChange={(e) => handleInputChange('notifications', 'orderConfirmation', e.target.checked)}
                    />
                    <span></span>
                    {settings.notifications.orderConfirmation ? 'Enabled' : 'Disabled'}
                  </ToggleSwitch>
                  <SettingDescription>
                    Send email notifications when an order is placed.
                  </SettingDescription>
                </FormGroup>
                
                <FormGroup>
                  <Label>Order Status Updates</Label>
                  <ToggleSwitch active={settings.notifications.orderStatusUpdate}>
                    <input
                      type="checkbox"
                      checked={settings.notifications.orderStatusUpdate}
                      onChange={(e) => handleInputChange('notifications', 'orderStatusUpdate', e.target.checked)}
                    />
                    <span></span>
                    {settings.notifications.orderStatusUpdate ? 'Enabled' : 'Disabled'}
                  </ToggleSwitch>
                  <SettingDescription>
                    Send email notifications when an order status changes.
                  </SettingDescription>
                </FormGroup>
                
                <FormGroup>
                  <Label>Order Shipped</Label>
                  <ToggleSwitch active={settings.notifications.orderShipped}>
                    <input
                      type="checkbox"
                      checked={settings.notifications.orderShipped}
                      onChange={(e) => handleInputChange('notifications', 'orderShipped', e.target.checked)}
                    />
                    <span></span>
                    {settings.notifications.orderShipped ? 'Enabled' : 'Disabled'}
                  </ToggleSwitch>
                  <SettingDescription>
                    Send email notifications when an order is shipped.
                  </SettingDescription>
                </FormGroup>
                
                <FormGroup>
                  <Label>Order Delivered</Label>
                  <ToggleSwitch active={settings.notifications.orderDelivered}>
                    <input
                      type="checkbox"
                      checked={settings.notifications.orderDelivered}
                      onChange={(e) => handleInputChange('notifications', 'orderDelivered', e.target.checked)}
                    />
                    <span></span>
                    {settings.notifications.orderDelivered ? 'Enabled' : 'Disabled'}
                  </ToggleSwitch>
                  <SettingDescription>
                    Send email notifications when an order is delivered.
                  </SettingDescription>
                </FormGroup>
                
                <FormGroup>
                  <Label>Low Stock Alerts</Label>
                  <ToggleSwitch active={settings.notifications.lowStockAlert}>
                    <input
                      type="checkbox"
                      checked={settings.notifications.lowStockAlert}
                      onChange={(e) => handleInputChange('notifications', 'lowStockAlert', e.target.checked)}
                    />
                    <span></span>
                    {settings.notifications.lowStockAlert ? 'Enabled' : 'Disabled'}
                  </ToggleSwitch>
                  <SettingDescription>
                    Receive notifications when product stock falls below threshold.
                  </SettingDescription>
                </FormGroup>
                
                {settings.notifications.lowStockAlert && (
                  <FormGroup>
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      type="number"
                      id="lowStockThreshold"
                      value={settings.notifications.lowStockThreshold}
                      onChange={(e) => handleInputChange('notifications', 'lowStockThreshold', Number(e.target.value))}
                    />
                    <SettingDescription>
                      Receive alerts when stock falls below this number.
                    </SettingDescription>
                  </FormGroup>
                )}
                
                <ButtonGroup>
                  <Button type="button" onClick={() => setSettings({...settings})}>Cancel</Button>
                  <Button $primary type="submit">Save Changes</Button>
                </ButtonGroup>
              </Form>
            </>
          )}
        </SettingsPanel>
      </SettingsGrid>
    </PageContainer>
  );
};

export default SettingsPage;