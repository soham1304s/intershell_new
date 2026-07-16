import { useState } from 'react';
import { Briefcase, Code2, LineChart, Cpu, Megaphone, ArrowRight } from 'lucide-react';
import ServiceModal from '../components/ServiceModals.jsx';

const SERVICES_DATA = [
  {
    id: 'hr',
    themeId: 'hr',
    title: 'HR & Recruitment',
    description: 'Find top-tier talent quickly and efficiently with our advanced recruitment engine. We handle the sourcing, vetting, and initial interviews.',
    icon: Briefcase,
    features: [
      'Access to a curated talent pool',
      'AI-driven candidate matching',
      'End-to-end interview scheduling',
      'Background checks and verification'
    ]
  },
  {
    id: 'dev',
    themeId: 'dev',
    title: 'Web & App Development',
    description: 'Build robust, scalable, and modern applications tailored to your business needs. From landing pages to complex full-stack platforms.',
    icon: Code2,
    features: [
      'Custom full-stack web applications',
      'Cross-platform mobile apps',
      'UI/UX design and prototyping',
      'Cloud deployment and maintenance'
    ]
  },
  {
    id: 'finance',
    themeId: 'finance',
    title: 'Financial Services',
    description: 'Streamline your accounting, payroll, and financial forecasting. Let our experts handle the numbers so you can focus on growth.',
    icon: LineChart,
    features: [
      'Automated payroll systems',
      'Tax compliance and reporting',
      'Financial forecasting models',
      'Expense tracking dashboards'
    ]
  },
  {
    id: 'auto',
    themeId: 'auto',
    title: 'Business Automation',
    description: 'Eliminate repetitive tasks and optimize workflows. We build custom automation scripts and integrate your favorite tools.',
    icon: Cpu,
    features: [
      'Custom workflow automation',
      'CRM and API integrations',
      'Data entry and scraping bots',
      'Process optimization consulting'
    ]
  },
  {
    id: 'marketing',
    themeId: 'marketing',
    title: 'Digital Marketing',
    description: 'Drive growth with data-driven marketing campaigns. From SEO to paid ads, we help you reach your target audience effectively.',
    icon: Megaphone,
    features: [
      'SEO and content strategy',
      'Social media management',
      'PPC and ad campaign optimization',
      'Conversion rate optimization (CRO)'
    ]
  }
];

export default function ClientServices() {
  const [activeService, setActiveService] = useState(null);

  return (
    <div className="client-services-page reveal">
      <div className="services-hero">
        <div className="eyebrow" style={{ justifyContent: 'center', marginBottom: '16px' }}>
          Internshell Premium Agency
        </div>
        <h1>Client Command Center</h1>
        <p>
          Request and manage our premium agency services directly from your dashboard. 
          Select a service below to get a custom proposal tailored to your business needs.
        </p>
      </div>

      <div className="services-grid">
        {SERVICES_DATA.map((service) => {
          const Icon = service.icon;
          return (
            <div 
              key={service.id} 
              className={`service-card theme-${service.themeId}`}
              onClick={() => setActiveService(service)}
            >
              <div className="service-icon-wrapper">
                <Icon size={28} />
              </div>
              <h2>{service.title}</h2>
              <p>{service.description}</p>
              
              <button className="request-btn">
                Request Service <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {activeService && (
        <ServiceModal 
          service={activeService} 
          onClose={() => setActiveService(null)} 
        />
      )}
    </div>
  );
}
