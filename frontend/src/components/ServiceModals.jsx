import { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
// We might not have an endpoint yet, so we will handle the submission gracefully

export default function ServiceModal({ service, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    requirements: '',
    budget: '',
    timeline: '',
  });

  if (!service) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call for now or use real socket/api if available
    try {
      // In a real scenario, this would be an API call like:
      // await api('/services/request', { method: 'POST', body: JSON.stringify({ serviceId: service.id, ...formData }) });
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (error) {
      console.error("Failed to submit service request", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`service-modal-overlay theme-${service.themeId}`} onClick={onClose}>
      <div className="service-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="service-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="service-modal-left">
          <div className="service-modal-left-content">
            <div>
              <h2>{service.title}</h2>
              <p>{service.description}</p>
            </div>
            
            <ul className="service-features">
              {service.features.map((feature, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={16} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="service-modal-right">
          <h3>Request this service</h3>
          
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'var(--modal-soft-color)', color: 'var(--modal-color)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 20px' 
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Request Submitted!</h4>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', marginBottom: '30px' }}>
                Thank you for your interest in our {service.title} services. Our team will review your requirements and get back to you within 24 hours.
              </p>
              <button 
                className="service-submit" 
                style={{ width: '100%' }}
                onClick={onClose}
              >
                Close Window
              </button>
            </div>
          ) : (
            <form className="service-form" onSubmit={handleSubmit}>
              <label>
                Contact Name
                <input 
                  type="text" 
                  value={user?.name || ''} 
                  disabled 
                  style={{ cursor: 'not-allowed', opacity: 0.8 }}
                />
              </label>

              <label>
                Company Name
                <input 
                  type="text" 
                  name="companyName"
                  placeholder="e.g. Acme Corp" 
                  required 
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </label>

              <label>
                Project Requirements
                <textarea 
                  name="requirements"
                  placeholder="Tell us about what you need..." 
                  required
                  value={formData.requirements}
                  onChange={handleChange}
                ></textarea>
              </label>

              <div className="form-row">
                <label>
                  Estimated Budget
                  <select name="budget" required value={formData.budget} onChange={handleChange}>
                    <option value="" disabled>Select range</option>
                    <option value="under_5k">Under $5,000</option>
                    <option value="5k_15k">$5,000 - $15,000</option>
                    <option value="15k_50k">$15,000 - $50,000</option>
                    <option value="50k_plus">$50,000+</option>
                  </select>
                </label>

                <label>
                  Desired Timeline
                  <select name="timeline" required value={formData.timeline} onChange={handleChange}>
                    <option value="" disabled>Select timeline</option>
                    <option value="asap">As soon as possible</option>
                    <option value="1_month">Within 1 month</option>
                    <option value="1_3_months">1 - 3 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </label>
              </div>

              <button type="submit" className="service-submit" disabled={loading}>
                {loading ? 'Submitting...' : (
                  <>
                    Submit Request
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
