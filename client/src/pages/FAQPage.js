import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronDown, faChevronUp, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './FAQPage.css';

const faqData = [
  {
    id: 1,
    question: "How do I place an order?",
    answer: [
      "Go to the SHOP section & browse through selection of available products",
      "Add & manage desired items into your cart",
      "Please double check the items in your cart as we would not be accepting cancellation of orders once your order is submitted/confirmed.",
      "Proceed to checkout and fill out the form before your screen",
      "Modes of payment: Gcash",
      "Wait for an email confirmation from our online sales rep and your orders will be prepared and will be shipped soon"
    ],
    category: "ordering"
  },
  {
    id: 2,
    question: "What courier do you use when shipping items within the country?",
    answer: "We use our own delivery man for transactions outside Metro Manila (NCR).",
    category: "shipping"
  },
  {
    id: 3,
    question: "How much is the shipping fee?",
    answer: "The shipping fee will depend on your quantity of your order(s) and its weight. The starting price of the shipping fee will be 169PHP and will increase depending on the weight of your item(s) and location.",
    category: "shipping"
  },
  {
    id: 4,
    question: "How many days will it take to receive my order(s)?",
    answer: "You can expect to have your orders after 7-14 working days from the date of receiving your email confirmation. You may track your orders through the email confirmation that will be sent to you. **your orders may take longer than expected come peak season**",
    category: "shipping"
  },
  {
    id: 5,
    question: "I still haven't received my shipment. What do I do with this?",
    answer: "What we can do is help you guys track your parcels and monitor its current location once the orders are shipped out. - but with regards to the date on when you'll receive the items ordered is already out of our control. For this matter, you can verify and ask for a follow-up of the parcel with the chosen courier.",
    category: "shipping"
  },
  {
    id: 8,
    question: "What is your Return & Exchange Policy?",
    answer: "Generally, only defective items or wrong order/s sent by our staff may be exchanged. But reasonable cases like wrong sizing can be an exception to the rule. You can find the detailed Return/Exchange policy (https://forms.gle/8Pq2fhiJDkofNcv66). Once orders are confirmed, we cannot cancel it anymore. We do not accept refunds.",
    category: "policies"
  },
  {
    id: 9,
    question: "Are there other stores that carry SevenFourClothing products?",
    answer: {
      intro: "Here is the list of our stockists:",
      stores: [
        {
          name: "BRATPACK",
          locations: [
            { name: "Ayala Marquee Mall", contact: "(045) 304-07-18", address: "LEVEL 2 PAMPANGA 2133-2134" },
            { name: "SM Pampanga", contact: "(045) 961-69-74", address: "UPPER GROUND FLOOR, STALL 163,SAN JOSE, SAN FERNANDO CITY PAMPANGA" },
            { name: "Araneta Center Gateway", contact: "709-36-68", address: "LEVEL 2 SPACE 02029" },
    
          ]
        },
      ]
    },
    category: "stores"
  },
  {
    id: 10,
    question: "Where is your Flagship Store located? Store hours?",
    answer: "It's at #40 Shorthorn St. Project 8 Q.C. Store hours: Monday to Sunday - 12nn to 8pm",
    category: "stores"
  },
  {
    id: 11,
    question: "Where is your Satellite Store located? Store hours?",
    answer: "It's at Munoz Plaza. - Underground floor",
    category: "stores"
  },
  {
    id: 12,
    question: "How do I contact you guys?",
    answer: [
      { purpose: "business proposals and sales reports", email: "sfclothing.74.gmail.com" },
      { purpose: "flagship store hotline", contact: "09494072608" },
    ],
    category: "contact"
  },
  {
    id: 13,
    question: "Why is the shirt/size I want not shown/available in the website?",
    answer: "If a size or specific design/item is not included means it is already unavailable but there is a possibility of its reappearance in our website. Otherwise, there is also a big chance that we still have those in stock at the Flagship store. Come visit us!",
    category: "products"
  },
  {
    id: 14,
    question: "Can we have SFC as a sponsor for our event?",
    answer: "We don't usually sponsor events and/or other related activities but if you believe you have a worthy proposal, send them over at sfclothing.74@gmail.com",
    category: "partnerships"
  },
  
  {
    id: 16,
    question: "Can I get free stickers?",
    answer: "Yes guys. Whenever you make a purchase of SFC products either online or in the Flagship store, you will receive a free sticker.",
    category: "products"
  },
  {
    id: 17,
    question: "I want to work with the team. How do I join?",
    answer: "Wait for further notice. We'll make sure you guys know when we need extra hands. If you think you have effective plans of action and efficient suggestions, let us know by sending us an email over at sfclothing.74@gmail.com",
    category: "careers"
  }
];

// Helper functions
const getAllFAQs = () => faqData;
const getFAQById = (id) => faqData.find(faq => faq.id === id);
const getFAQsByCategory = (category) => faqData.filter(faq => faq.category === category);
const getCategories = () => [...new Set(faqData.map(faq => faq.category))];

const searchFAQs = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return faqData.filter(faq =>
    faq.question.toLowerCase().includes(term) ||
    (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(term)) ||
    (Array.isArray(faq.answer) && faq.answer.some(item =>
      typeof item === 'string' ? item.toLowerCase().includes(term) :
      JSON.stringify(item).toLowerCase().includes(term)
    ))
  );
};

const formatAnswer = (answer) => {
  if (typeof answer === 'string') {
    return <p>{answer}</p>;
  }
 
  if (Array.isArray(answer)) {
    // Check if it's contact info array
    if (answer.every(item => typeof item === 'object' && (item.email || item.contact))) {
      return (
        <div className="contact-list">
          {answer.map((contact, index) => (
            <div key={index} className="contact-item">
              <strong>{contact.purpose}:</strong>
              {contact.email && <span> {contact.email}</span>}
              {contact.contact && <span> {contact.contact}</span>}
            </div>
          ))}
        </div>
      );
    }
    // Simple array of strings
    return (
      <ol className="answer-list">
        {answer.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
  }
 
  if (typeof answer === 'object' && answer.stores) {
    return (
      <div className="stores-info">
        <p>{answer.intro}</p>
        {answer.stores.map((store, index) => (
          <div key={index} className="store-section">
            <h4>{store.name}</h4>
            {store.locations ? (
              <div className="locations-list">
                {store.locations.map((location, locIndex) => (
                  <div key={locIndex} className="location-item">
                    <strong>{location.name}</strong>
                    <p>Contact: {location.contact}</p>
                    <p>Address: {location.address}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>{store.address}</p>
            )}
          </div>
        ))}
      </div>
    );
  }
 
  return <p>{JSON.stringify(answer)}</p>;
};

const FAQPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQs, setExpandedFAQs] = useState(new Set());

  const categories = getCategories();

  const filteredFAQs = useMemo(() => {
    let faqs = getAllFAQs();
    
    // Filter by search term
    if (searchTerm.trim()) {
      faqs = searchFAQs(searchTerm);
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      faqs = faqs.filter(faq => faq.category === selectedCategory);
    }
    
    return faqs;
  }, [searchTerm, selectedCategory]);

  const toggleFAQ = (id) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFAQs(newExpanded);
  };

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="faq-page-wrapper">
      <div className="faq-container">
        {/* Header */}
        <div className="faq-header">
          <button className="back-button" onClick={() => navigate('/help')}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Help
          </button>
          <h1>Frequently Asked Questions</h1>
          <div className="header-line"></div>
        </div>

        {/* Search and Filter */}
        <div className="faq-controls">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {capitalizeFirst(category)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FAQ List */}
        <div className="faq-list">
          {filteredFAQs.length === 0 ? (
            <div className="no-results">
              <p>No FAQs found matching your search criteria.</p>
            </div>
          ) : (
            filteredFAQs.map(faq => (
              <div key={faq.id} className="faq-item">
                <div 
                  className="faq-question"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <h3>{faq.question}</h3>
                  <span className="category-tag">{capitalizeFirst(faq.category)}</span>
                  <FontAwesomeIcon
                    icon={expandedFAQs.has(faq.id) ? faChevronUp : faChevronDown}
                    className="expand-icon"
                  />
                </div>
                
                {expandedFAQs.has(faq.id) && (
                  <div className="faq-answer">
                    {formatAnswer(faq.answer)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="faq-stats">
          <p>Showing {filteredFAQs.length} of {getAllFAQs().length} FAQs</p>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
