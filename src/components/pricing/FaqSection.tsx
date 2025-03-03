
interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem = ({ question, answer }: FaqItemProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-3">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
};

const FaqSection = () => {
  const faqs = [
    {
      question: "Can I upgrade or downgrade my plan later?",
      answer: "Yes, you can change your plan at any time. Changes will be prorated based on the remaining time in your billing cycle."
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes, you can try our Professional plan free for 14 days, no credit card required."
    },
    {
      question: "How does billing work?",
      answer: "You'll be billed at the start of each billing cycle (monthly or annually). We accept all major credit cards."
    },
    {
      question: "Is there a setup fee?",
      answer: "No, there are no setup fees for any of our plans. You only pay the displayed subscription price."
    }
  ];

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {faqs.map((faq, index) => (
          <FaqItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
};

export default FaqSection;
