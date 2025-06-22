import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTshirt, 
  faUpload, 
  faTrash, 
  faEye, 
  faTimes,
  faShoppingCart,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';

// Custom SVG Icons for clothing types
const ShortsIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8h24v6l-2 4v18h-8V20h-4v16h-8V18l-2-4V8z" fill={color} stroke={color} strokeWidth="1"/>
    <path d="M16 8v6M32 8v6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const JacketIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12h6v-2c0-2 2-4 4-4h8c2 0 4 2 4 4v2h6l2 4v26H8V16l2-4z" fill={color}/>
    <path d="M18 12h12M14 18v20M34 18v20M18 20h12M18 24h12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="16" cy="22" r="1" fill="white"/>
    <circle cx="16" cy="26" r="1" fill="white"/>
    <circle cx="32" cy="22" r="1" fill="white"/>
    <circle cx="32" cy="26" r="1" fill="white"/>
  </svg>
);

const SweaterIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 14h4v-2c0-2 2-4 4-4h8c2 0 4 2 4 4v2h4l2 2v26H10V16l2-2z" fill={color}/>
    <path d="M18 14h12M16 18v22M32 18v22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 20h12M18 24h12M18 28h12M18 32h12" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
  </svg>
);

const HoodieIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 14h4v-2c0-2 2-4 4-4h8c2 0 4 2 4 4v2h4l2 2v26H10V16l2-2z" fill={color}/>
    <path d="M16 8c0-2 2-4 8-4s8 2 8 4c0 1-1 2-2 3h-12c-1-1-2-2-2-3z" fill={color}/>
    <path d="M18 14h12M16 18v22M32 18v22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 18v4h8v-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <circle cx="22" cy="20" r="0.5" fill="white"/>
    <circle cx="26" cy="20" r="0.5" fill="white"/>
  </svg>
);

const JerseyIcon = ({ color = 'currentColor', size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12h4v-2c0-1 1-2 2-2h12c1 0 2 1 2 2v2h4v6l-2 2v20H14V20l-2-2v-6z" fill={color}/>
    <path d="M18 12h12M16 16v24M32 16v24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <text x="24" y="28" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">7</text>
  </svg>
);

// Styled Components
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  gap: 2rem;
  flex-wrap: wrap;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  border-radius: 50px;
  border: 2px solid ${props => props.active ? '#000000' : '#e0e0e0'};
  background: ${props => props.active ? '#000000' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#666666'};
  font-weight: 600;
  transition: all 0.3s ease;
  
  ${props => props.completed && `
    background: #28a745;
    border-color: #28a745;
    color: #ffffff;
  `}
`;

const StepNumber = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.active || props.completed ? '#ffffff' : '#e0e0e0'};
  color: ${props => props.active ? '#000000' : props.completed ? '#28a745' : '#666666'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  margin-right: 0.75rem;
`;

const ContentSection = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ProductCard = styled.div`
  border: 2px solid ${props => props.selected ? '#000000' : '#e0e0e0'};
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#f8f9fa' : '#ffffff'};
  
  &:hover {
    border-color: #000000;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ProductIcon = styled.div`
  font-size: 3rem;
  color: ${props => props.selected ? '#000000' : '#666666'};
  margin-bottom: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 0.5rem;
`;

const ProductDescription = styled.p`
  font-size: 0.9rem;
  color: #666666;
  line-height: 1.5;
`;

const CustomizationSection = styled.div`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UploadArea = styled.div`
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  margin-bottom: 2rem;
  
  &:hover {
    border-color: #000000;
    background: #f5f5f5;
  }
  
  ${props => props.dragOver && `
    border-color: #000000;
    background: #f0f0f0;
  `}
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #666666;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  font-size: 1.1rem;
  color: #666666;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.p`
  font-size: 0.9rem;
  color: #999999;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  background: #f8f9fa;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageActions = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
`;

const ImageAction = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
`;

const FormSection = styled.div`
  margin-top: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #000000;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: #ffffff;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.875rem 2rem;
  border: 2px solid #000000;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  
  ${props => props.primary ? `
    background: #000000;
    color: #ffffff;
    
    &:hover {
      background: #333333;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
  ` : `
    background: #ffffff;
    color: #000000;
    
    &:hover {
      background: #f8f9fa;
      transform: translateY(-2px);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
    }
  }
`;

// Modal Components
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  overflow: hidden;
`;

const ModalImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
`;

const Alert = styled.div`
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  ${props => props.type === 'error' && `
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
  
  ${props => props.type === 'success' && `
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `}
  
  ${props => props.type === 'warning' && `
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  `}
`;

const CustomPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);  const [customizationData, setCustomizationData] = useState({
    size: '',
    color: '',
    quantity: 1,
    specialInstructions: '',
    urgency: 'standard',
    customerName: '',
    email: '',
    phone: '',
    province: '',
    municipality: '',
    streetNumber: '',
    houseNumber: '',
    barangay: '',
    postalCode: ''
  });const [alert, setAlert] = useState(null);
  const fileInputRef = useRef(null);

  // Philippines provinces and municipalities data
  const philippinesData = {
    'Metro Manila': [
      'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 
      'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 
      'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela'
    ],
    'Abra': [
      'Bangued', 'Boliney', 'Bucay', 'Bucloc', 'Daguioman', 'Danglas', 
      'Dolores', 'La Paz', 'Lacub', 'Lagangilang', 'Lagayan', 'Langiden', 
      'Licuan-Baay', 'Luba', 'Malibcong', 'Manabo', 'Peñarrubia', 'Pidigan', 
      'Pilar', 'Sallapadan', 'San Isidro', 'San Juan', 'San Quintin', 'Tayum', 
      'Tineg', 'Tubo', 'Villaviciosa'
    ],
    'Agusan del Norte': [
      'Buenavista', 'Carmen', 'Jabonga', 'Kitcharao', 'Las Nieves', 'Magallanes', 
      'Nasipit', 'Remedios T. Romualdez', 'Santiago', 'Tubay', 'Butuan'
    ],
    'Agusan del Sur': [
      'Bayugan', 'Bunawan', 'Esperanza', 'La Paz', 'Loreto', 'Prosperidad', 
      'Rosario', 'San Francisco', 'San Luis', 'Santa Josefa', 'Sibagat', 
      'Talacogon', 'Trento', 'Veruela'
    ],
    'Aklan': [
      'Altavas', 'Balete', 'Banga', 'Batan', 'Buruanga', 'Ibajay', 
      'Kalibo', 'Lezo', 'Libacao', 'Madalag', 'Makato', 'Malay', 
      'Malinao', 'Nabas', 'New Washington', 'Numancia', 'Tangalan'
    ],
    'Albay': [
      'Bacacay', 'Camalig', 'Daraga', 'Guinobatan', 'Jovellar', 'Libon', 
      'Ligao', 'Malilipot', 'Malinao', 'Manito', 'Oas', 'Pio Duran', 
      'Polangui', 'Rapu-Rapu', 'Santo Domingo', 'Tabaco', 'Tiwi', 'Legazpi'
    ],
    'Antique': [
      'Anini-y', 'Barbaza', 'Belison', 'Bugasong', 'Caluya', 'Culasi', 
      'Hamtic', 'Laua-an', 'Libertad', 'Pandan', 'Patnongon', 'San Jose', 
      'San Remigio', 'Sebaste', 'Sibalom', 'Tibiao', 'Tobias Fornier', 'Valderrama'
    ],
    'Apayao': [
      'Calanasan', 'Conner', 'Flora', 'Kabugao', 'Luna', 'Pudtol', 'Santa Marcela'
    ],
    'Aurora': [
      'Baler', 'Casiguran', 'Dilasag', 'Dinalungan', 'Dingalan', 'Dipaculao', 
      'Maria Aurora', 'San Luis'
    ],
    'Basilan': [
      'Akbar', 'Al-Barka', 'Hadji Mohammad Ajul', 'Hadji Muhtamad', 'Lantawan', 
      'Maluso', 'Sumisip', 'Tabuan-Lasa', 'Tipo-Tipo', 'Tuburan', 
      'Ungkaya Pukan', 'Lamitan', 'Isabela'
    ],
    'Bataan': [
      'Abucay', 'Bagac', 'Dinalupihan', 'Hermosa', 'Limay', 'Mariveles', 
      'Morong', 'Orani', 'Orion', 'Pilar', 'Samal', 'Balanga'
    ],
    'Batanes': [
      'Basco', 'Itbayat', 'Ivana', 'Mahatao', 'Sabtang', 'Uyugan'
    ],
    'Batangas': [
      'Agoncillo', 'Alitagtag', 'Balayan', 'Balete', 'Bauan', 'Calaca', 
      'Calatagan', 'Cuenca', 'Ibaan', 'Laurel', 'Lemery', 'Lian', 
      'Lobo', 'Mabini', 'Malvar', 'Mataasnakahoy', 'Nasugbu', 'Padre Garcia', 
      'Rosario', 'San Jose', 'San Juan', 'San Luis', 'San Nicolas', 'San Pascual', 
      'Santa Teresita', 'Santo Tomas', 'Taal', 'Talisay', 'Taysan', 'Tingloy', 
      'Tuy', 'Batangas City', 'Lipa', 'Tanauan'
    ],
    'Benguet': [
      'Atok', 'Bakun', 'Bokod', 'Buguias', 'Itogon', 'Kabayan', 'Kapangan', 
      'Kibungan', 'La Trinidad', 'Mankayan', 'Sablan', 'Tuba', 'Tublay', 'Baguio'
    ],
    'Bicol': [
      'Bagamanoc', 'Baras', 'Bato', 'Caramoran', 'Gigmoto', 'Pandan', 
      'Panganiban', 'San Andres', 'San Miguel', 'Viga', 'Virac'
    ],
    'Bohol': [
      'Alburquerque', 'Alicia', 'Anda', 'Antequera', 'Baclayon', 'Balilihan', 
      'Batuan', 'Bien Unido', 'Bilar', 'Buenavista', 'Calape', 'Candijay', 
      'Carmen', 'Catigbian', 'Clarin', 'Corella', 'Cortes', 'Dagohoy', 
      'Danao', 'Dauis', 'Dimiao', 'Duero', 'Garcia Hernandez', 'Getafe', 
      'Guindulman', 'Inabanga', 'Jagna', 'Lila', 'Loay', 'Loboc', 
      'Loon', 'Mabini', 'Maribojoc', 'Panglao', 'Pilar', 'President Carlos P. Garcia', 
      'Sagbayan', 'San Isidro', 'San Miguel', 'Sevilla', 'Sierra Bullones', 
      'Sikatuna', 'Talibon', 'Trinidad', 'Tubigon', 'Ubay', 'Valencia', 'Tagbilaran'
    ],
    'Bukidnon': [
      'Baungon', 'Cabanglasan', 'Damulog', 'Dangcagan', 'Don Carlos', 'Impasugong', 
      'Kadingilan', 'Kalilangan', 'Kibawe', 'Kitaotao', 'Lantapan', 'Libona', 
      'Malaybalay', 'Malitbog', 'Manolo Fortich', 'Maramag', 'Pangantucan', 
      'Quezon', 'San Fernando', 'Sumilao', 'Talakag', 'Valencia'
    ],
    'Bulacan': [
      'Angat', 'Balagtas', 'Baliuag', 'Bocaue', 'Bulakan', 'Bustos', 
      'Calumpit', 'Doña Remedios Trinidad', 'Guiguinto', 'Hagonoy', 'Marilao', 
      'Norzagaray', 'Obando', 'Pandi', 'Paombong', 'Plaridel', 'Pulilan', 
      'San Ildefonso', 'San Miguel', 'San Rafael', 'Santa Maria', 'Malolos', 
      'Meycauayan', 'San Jose del Monte'
    ],
    'Cagayan': [
      'Abulug', 'Alcala', 'Allacapan', 'Amulung', 'Aparri', 'Baggao', 
      'Ballesteros', 'Buguey', 'Calayan', 'Camalaniugan', 'Claveria', 'Enrile', 
      'Gattaran', 'Gonzaga', 'Iguig', 'Lal-lo', 'Lasam', 'Pamplona', 
      'Peñablanca', 'Piat', 'Rizal', 'Sanchez-Mira', 'Santa Ana', 'Santa Praxedes', 
      'Santa Teresita', 'Santo Niño', 'Solana', 'Tuao', 'Tuguegarao'
    ],
    'Camarines Norte': [
      'Basud', 'Capalonga', 'Daet', 'Jose Panganiban', 'Labo', 'Mercedes', 
      'Paracale', 'San Lorenzo Ruiz', 'San Vicente', 'Santa Elena', 'Talisay', 'Vinzons'
    ],
    'Camarines Sur': [
      'Baao', 'Balatan', 'Bato', 'Bombon', 'Buhi', 'Bula', 'Cabusao', 
      'Calabanga', 'Camaligan', 'Canaman', 'Caramoan', 'Del Gallego', 'Gainza', 
      'Garchitorena', 'Goa', 'Lagonoy', 'Libmanan', 'Lupi', 'Magarao', 
      'Milaor', 'Minalabac', 'Nabua', 'Ocampo', 'Pamplona', 'Pasacao', 
      'Pili', 'Presentacion', 'Ragay', 'Sagñay', 'San Fernando', 'San Jose', 
      'Sipocot', 'Siruma', 'Tigaon', 'Tinambac', 'Iriga', 'Naga'
    ],
    'Camiguin': [
      'Catarman', 'Guinsiliban', 'Mahinog', 'Mambajao', 'Sagay'
    ],
    'Capiz': [
      'Cuartero', 'Dao', 'Dumalag', 'Dumarao', 'Ivisan', 'Jamindan', 
      'Ma-ayon', 'Mambusao', 'Panay', 'Panitan', 'Pilar', 'Pontevedra', 
      'President Roxas', 'Sapi-an', 'Sigma', 'Tapaz', 'Roxas'
    ],
    'Catanduanes': [
      'Bagamanoc', 'Baras', 'Bato', 'Caramoran', 'Gigmoto', 'Pandan', 
      'Panganiban', 'San Andres', 'San Miguel', 'Viga', 'Virac'
    ],
    'Cavite': [
      'Alfonso', 'Amadeo', 'General Emilio Aguinaldo', 'General Trias', 'Indang', 
      'Kawit', 'Magallanes', 'Maragondon', 'Mendez', 'Naic', 'Noveleta', 
      'Rosario', 'Silang', 'Tanza', 'Ternate', 'Bacoor', 'Carmona', 
      'Cavite City', 'Dasmariñas', 'Imus', 'Tagaytay', 'Trece Martires'
    ],
    'Cebu': [
      'Alcantara', 'Alcoy', 'Alegria', 'Aloguinsan', 'Argao', 'Asturias', 
      'Badian', 'Balamban', 'Bantayan', 'Barili', 'Bogo', 'Boljoon', 
      'Borbon', 'Carmen', 'Catmon', 'Compostela', 'Consolacion', 'Cordova', 
      'Daanbantayan', 'Dalaguete', 'Danao', 'Dumanjug', 'Ginatilan', 'Liloan', 
      'Madridejos', 'Malabuyoc', 'Medellin', 'Minglanilla', 'Moalboal', 
      'Oslob', 'Pilar', 'Pinamungajan', 'Poro', 'Ronda', 'Samboan', 
      'San Fernando', 'San Francisco', 'San Remigio', 'Santa Fe', 'Santander', 
      'Sibonga', 'Sogod', 'Tabogon', 'Tabuelan', 'Tuburan', 'Tudela', 'Cebu City', 
      'Lapu-Lapu', 'Mandaue', 'Talisay', 'Toledo'
    ]
  };  const productTypes = [
    {
      id: 't-shirts',
      name: 'T-Shirts',
      icon: 'tshirt',
      description: 'Classic comfortable tees perfect for everyday wear and custom designs'
    },
    {
      id: 'shorts',
      name: 'Shorts',
      icon: 'shorts',
      description: 'Comfortable shorts ideal for sports, casual wear, and summer styles'
    },
    {
      id: 'hoodies',
      name: 'Hoodies',
      icon: 'hoodie',
      description: 'Cozy hoodies perfect for cooler weather and streetwear fashion'
    },
    {
      id: 'jackets',
      name: 'Jackets',
      icon: 'jacket',
      description: 'Stylish jackets for protection and fashion-forward looks'
    },
    {
      id: 'sweaters',
      name: 'Sweaters',
      icon: 'sweater',
      description: 'Warm sweaters for comfort and style during cold seasons'
    },
    {
      id: 'jerseys',
      name: 'Jerseys',
      icon: 'jersey',
      description: 'Sports jerseys for teams, events, and athletic activities'
    }  ];

  // Function to render the appropriate icon
  const renderProductIcon = (iconType, selected = false) => {
    const color = selected ? '#000000' : '#666666';
    
    switch (iconType) {
      case 'tshirt':
        return <FontAwesomeIcon icon={faTshirt} style={{ color }} />;
      case 'shorts':
        return <ShortsIcon color={color} />;
      case 'hoodie':
        return <HoodieIcon color={color} />;
      case 'jacket':
        return <JacketIcon color={color} />;
      case 'sweater':
        return <SweaterIcon color={color} />;
      case 'jersey':
        return <JerseyIcon color={color} />;
      default:
        return <FontAwesomeIcon icon={faTshirt} style={{ color }} />;
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    setCurrentStep(2);
    showAlert('Product selected! Now upload your design images.', 'success');
  };

  const handleFileUpload = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      return isValidType && isValidSize;
    });

    if (validFiles.length !== fileArray.length) {
      showAlert('Some files were rejected. Only image files under 10MB are allowed.', 'warning');
    }

    if (uploadedImages.length + validFiles.length > 10) {
      showAlert('Maximum 10 images allowed. Some files were not uploaded.', 'warning');
      const remainingSlots = 10 - uploadedImages.length;
      validFiles.splice(remainingSlots);
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file,
          url: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      showAlert(`${validFiles.length} image(s) uploaded successfully!`, 'success');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    showAlert('Image removed successfully.', 'success');
  };

  const viewImage = (index) => {
    setSelectedImageIndex(index);
  };

  const handleInputChange = (field, value) => {
    setCustomizationData(prev => ({
      ...prev,
      [field]: value
    }));
  };  const validateForm = () => {
    if (!selectedProduct) {
      showAlert('Please select a product type.', 'error');
      return false;
    }
    
    if (uploadedImages.length === 0) {
      showAlert('Please upload at least one design image.', 'error');
      return false;
    }
    
    if (!customizationData.customerName || !customizationData.email) {
      showAlert('Please fill in your name and email.', 'error');
      return false;
    }

    if (!customizationData.size || !customizationData.color) {
      showAlert('Please select size and color.', 'error');
      return false;
    }

    if (!customizationData.province || !customizationData.municipality || !customizationData.streetNumber) {
      showAlert('Please complete your shipping address.', 'error');
      return false;
    }

    return true;
  };const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      console.log('🚀 Starting custom order submission...');
      
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      
      // Add all form fields
      formData.append('productType', selectedProduct);
      formData.append('size', customizationData.size);
      formData.append('color', customizationData.color);
      formData.append('quantity', customizationData.quantity);
      formData.append('urgency', customizationData.urgency);
      formData.append('specialInstructions', customizationData.specialInstructions);
      formData.append('customerName', customizationData.customerName);
      formData.append('customerEmail', customizationData.email);
      formData.append('customerPhone', customizationData.phone);
      formData.append('province', customizationData.province);
      formData.append('municipality', customizationData.municipality);
      formData.append('streetNumber', customizationData.streetNumber);
      formData.append('houseNumber', customizationData.houseNumber);
      formData.append('barangay', customizationData.barangay);
      formData.append('postalCode', customizationData.postalCode);
      
      // Add images
      uploadedImages.forEach((image, index) => {
        if (image.file) {
          formData.append('images', image.file);
          console.log(`📎 Adding image ${index + 1}: ${image.file.name}`);
        }
      });
      
      console.log('📋 Form data prepared, submitting to API...');
      
      // Submit to API
      const response = await api.post('/custom-orders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });
      
      console.log('✅ API Response:', response.data);
      
      if (response.data.success) {
        showAlert(
          `Custom order submitted successfully! Order ID: ${response.data.data.customOrderId}. Estimated price: ₱${response.data.data.estimatedPrice.toFixed(2)}`, 
          'success'
        );
        
        // Reset form
        setCurrentStep(1);
        setSelectedProduct('');
        setUploadedImages([]);
        setCustomizationData({
          size: '',
          color: '',
          quantity: 1,
          specialInstructions: '',
          urgency: 'standard',
          customerName: '',
          email: '',
          phone: '',
          province: '',
          municipality: '',
          streetNumber: '',
          houseNumber: '',
          barangay: '',
          postalCode: ''
        });
        
        // Show success message for longer
        setTimeout(() => {
          showAlert('Thank you for your custom order! We will contact you soon with more details.', 'success');
        }, 2000);
      } else {
        showAlert('Failed to submit custom order. Please try again.', 'error');
      }
    } catch (error) {
      console.error('❌ Error submitting custom order:', error);
      
      let errorMessage = 'Failed to submit custom order. Please try again.';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please ensure the server is running.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please try again later.';
      }
      
      showAlert(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const proceedToCustomization = () => {
    if (uploadedImages.length === 0) {
      showAlert('Please upload at least one design image before proceeding.', 'error');
      return;
    }
    setCurrentStep(3);
  };

  return (
    <PageContainer>
      <Header>
        <Title>Custom Product Designer</Title>
        <Subtitle>
          Create your unique design by selecting a product type and uploading your concept art. 
          Our team will bring your vision to life with professional quality craftsmanship.
        </Subtitle>
      </Header>

      <StepsContainer>
        <Step active={currentStep === 1} completed={currentStep > 1}>
          <StepNumber active={currentStep === 1} completed={currentStep > 1}>
            {currentStep > 1 ? <FontAwesomeIcon icon={faCheck} /> : '1'}
          </StepNumber>
          Choose Product
        </Step>
        <Step active={currentStep === 2} completed={currentStep > 2}>
          <StepNumber active={currentStep === 2} completed={currentStep > 2}>
            {currentStep > 2 ? <FontAwesomeIcon icon={faCheck} /> : '2'}
          </StepNumber>
          Upload Design
        </Step>
        <Step active={currentStep === 3}>
          <StepNumber active={currentStep === 3}>3</StepNumber>
          Customize Details
        </Step>
      </StepsContainer>

      {alert && (
        <Alert type={alert.type}>
          <FontAwesomeIcon icon={
            alert.type === 'error' ? faExclamationTriangle :
            alert.type === 'success' ? faCheck :
            faExclamationTriangle
          } />
          {alert.message}
        </Alert>
      )}

      <ContentSection>
        {currentStep === 1 && (
          <>
            <SectionTitle>
              <FontAwesomeIcon icon={faTshirt} style={{ color: '#000000' }} />
              Choose Your Product Type
            </SectionTitle>
            <ProductGrid>
              {productTypes.map(product => (
                <ProductCard
                  key={product.id}
                  selected={selectedProduct === product.id}
                  onClick={() => handleProductSelect(product.id)}
                >                  <ProductIcon selected={selectedProduct === product.id}>
                    {renderProductIcon(product.icon, selectedProduct === product.id)}
                  </ProductIcon>
                  <ProductName>{product.name}</ProductName>
                  <ProductDescription>{product.description}</ProductDescription>
                </ProductCard>
              ))}
            </ProductGrid>
          </>
        )}

        {currentStep === 2 && (
          <CustomizationSection>
            <SectionTitle>
              <FontAwesomeIcon icon={faUpload} style={{ color: '#000000' }} />
              Upload Your Design Images ({uploadedImages.length}/10)
            </SectionTitle>
            
            <UploadArea
              dragOver={dragOver}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon>
                <FontAwesomeIcon icon={faUpload} style={{ color: '#666666' }} />
              </UploadIcon>
              <UploadText>Click to upload or drag and drop your design files</UploadText>
              <UploadSubtext>
                Maximum 10 images • PNG, JPG, GIF up to 10MB each
              </UploadSubtext>
            </UploadArea>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {uploadedImages.length > 0 && (
              <ImageGrid>
                {uploadedImages.map((image, index) => (
                  <ImagePreview key={image.id}>
                    <PreviewImage src={image.url} alt={image.name} />
                    <ImageActions>
                      <ImageAction onClick={() => viewImage(index)}>
                        <FontAwesomeIcon icon={faEye} />
                      </ImageAction>
                      <ImageAction onClick={() => removeImage(image.id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </ImageAction>
                    </ImageActions>
                  </ImagePreview>
                ))}
              </ImageGrid>
            )}

            <ButtonContainer>
              <Button onClick={() => setCurrentStep(1)}>
                Back to Products
              </Button>
              <Button primary onClick={proceedToCustomization}>
                Continue to Details
              </Button>
            </ButtonContainer>
          </CustomizationSection>
        )}

        {currentStep === 3 && (
          <CustomizationSection>
            <SectionTitle>
              <FontAwesomeIcon icon={faShoppingCart} style={{ color: '#000000' }} />
              Customization Details
            </SectionTitle>            <FormSection>
              <SectionTitle>
                Contact Information
              </SectionTitle>
              <FormGrid>
                <FormGroup>
                  <Label>Customer Name *</Label>
                  <Input
                    type="text"
                    value={customizationData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={customizationData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={customizationData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </FormGroup>
              </FormGrid>

              <SectionTitle style={{ marginTop: '2rem' }}>
                Shipping Address
              </SectionTitle>
              <FormGrid>
                <FormGroup>
                  <Label>Province *</Label>
                  <Select
                    value={customizationData.province}
                    onChange={(e) => {
                      handleInputChange('province', e.target.value);
                      handleInputChange('municipality', ''); // Reset municipality when province changes
                    }}
                    required
                  >
                    <option value="">Select Province</option>
                    {Object.keys(philippinesData).map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Municipality/City *</Label>
                  <Select
                    value={customizationData.municipality}
                    onChange={(e) => handleInputChange('municipality', e.target.value)}
                    required
                    disabled={!customizationData.province}
                  >
                    <option value="">Select Municipality/City</option>
                    {customizationData.province && philippinesData[customizationData.province]?.map(municipality => (
                      <option key={municipality} value={municipality}>{municipality}</option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Street Number/Name *</Label>
                  <Input
                    type="text"
                    value={customizationData.streetNumber}
                    onChange={(e) => handleInputChange('streetNumber', e.target.value)}
                    placeholder="e.g., 123 Main St, Rizal Ave"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>House Number/Building</Label>
                  <Input
                    type="text"
                    value={customizationData.houseNumber}
                    onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                    placeholder="House #, Unit, Building name"
                  />
                </FormGroup>                <FormGroup>
                  <Label>Barangay</Label>
                  <Input
                    type="text"
                    value={customizationData.barangay}
                    onChange={(e) => handleInputChange('barangay', e.target.value)}
                    placeholder="Enter barangay"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Postal Code</Label>
                  <Input
                    type="text"
                    value={customizationData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="Enter postal code"
                  />
                </FormGroup>
              </FormGrid>              <SectionTitle style={{ marginTop: '2rem' }}>
                Product Details
              </SectionTitle>
              <FormGrid>
                <FormGroup>
                  <Label>Size *</Label>
                  <Select
                    value={customizationData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    required
                  >
                    <option value="">Select Size</option>
                    <option value="XS">Extra Small (XS)</option>
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">Double Extra Large (XXL)</option>
                    <option value="XXXL">Triple Extra Large (XXXL)</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Base Color *</Label>
                  <Select
                    value={customizationData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    required
                  >
                    <option value="">Select Color</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="gray">Gray</option>
                    <option value="navy">Navy Blue</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="purple">Purple</option>
                    <option value="pink">Pink</option>
                    <option value="orange">Orange</option>
                    <option value="brown">Brown</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={customizationData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Urgency</Label>
                  <Select
                    value={customizationData.urgency}
                    onChange={(e) => handleInputChange('urgency', e.target.value)}
                  >
                    <option value="standard">Standard (7-10 days)</option>
                    <option value="express">Express (3-5 days)</option>
                    <option value="rush">Rush (1-2 days)</option>
                  </Select>
                </FormGroup>
              </FormGrid>

              <FormGroup>
                <Label>Special Instructions</Label>
                <Textarea
                  value={customizationData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  placeholder="Any special requirements, placement instructions, or additional details..."
                />
              </FormGroup>
            </FormSection>

            <ButtonContainer>
              <Button onClick={() => setCurrentStep(2)}>
                Back to Upload
              </Button>              <Button primary onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </ButtonContainer>
          </CustomizationSection>
        )}
      </ContentSection>

      {/* Image Preview Modal */}
      {selectedImageIndex !== null && (
        <Modal onClick={() => setSelectedImageIndex(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedImageIndex(null)}>
              <FontAwesomeIcon icon={faTimes} />
            </CloseButton>
            <ModalImage 
              src={uploadedImages[selectedImageIndex]?.url} 
              alt={uploadedImages[selectedImageIndex]?.name} 
            />
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default CustomPage;
