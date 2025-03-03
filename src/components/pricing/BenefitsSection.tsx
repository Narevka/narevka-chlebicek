
interface BenefitProps {
  title: string;
  description: string;
}

const Benefit = ({ title, description }: BenefitProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const BenefitsSection = () => {
  const benefits = [
    {
      title: "AI-Powered Documentation",
      description: "Automatically generate and organize documentation using our advanced AI technology."
    },
    {
      title: "Seamless Integration",
      description: "Connect with your existing tools and workflows with our flexible API and integrations."
    },
    {
      title: "Team Collaboration",
      description: "Work together effectively with real-time updates and shared workspaces."
    },
    {
      title: "Advanced Analytics",
      description: "Gain insights into usage patterns and performance metrics to optimize your workflow."
    },
    {
      title: "Custom Branding",
      description: "Personalize your documentation with your company's logo, colors, and styling."
    },
    {
      title: "Priority Support",
      description: "Get faster responses and dedicated assistance with our priority support channels."
    }
  ];

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-bold text-center mb-10">Only the most important benefits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <Benefit key={index} title={benefit.title} description={benefit.description} />
        ))}
      </div>
    </div>
  );
};

export default BenefitsSection;
