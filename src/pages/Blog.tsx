
import { Link } from "react-router-dom";

const BlogPost = ({ title, date, summary, imageUrl, slug }) => (
  <div className="bg-white overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="h-48 overflow-hidden">
      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="p-6">
      <div className="text-sm text-gray-500 mb-2">{date}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{summary}</p>
      <Link to={`/blog/${slug}`} className="text-blue-600 hover:text-blue-800 font-medium">
        Read more →
      </Link>
    </div>
  </div>
);

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "How AI Agents Are Transforming Customer Support",
      date: "May 15, 2023",
      summary: "Learn how AI-powered chatbots are revolutionizing customer service with 24/7 availability and instant responses.",
      imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      slug: "ai-transforming-customer-support"
    },
    {
      id: 2,
      title: "10 Tips for Building an Effective AI Agent",
      date: "April 22, 2023",
      summary: "Discover the best practices for creating AI agents that provide meaningful and helpful interactions with your customers.",
      imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      slug: "tips-for-effective-ai-agents"
    },
    {
      id: 3,
      title: "The Future of AI in Business Operations",
      date: "March 10, 2023",
      summary: "Explore how AI is set to transform various aspects of business operations beyond just customer service.",
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80",
      slug: "future-of-ai-business-operations"
    },
    {
      id: 4,
      title: "Measuring ROI from Your AI Investments",
      date: "February 28, 2023",
      summary: "Learn how to track and measure the return on investment from implementing AI solutions in your business.",
      imageUrl: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      slug: "measuring-ai-roi"
    },
    {
      id: 5,
      title: "How to Train Your AI Agent with Quality Data",
      date: "January 15, 2023",
      summary: "Discover the importance of high-quality training data and how it impacts the performance of your AI agents.",
      imageUrl: "https://images.unsplash.com/photo-1456428746267-a1756408f782?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      slug: "training-ai-with-quality-data"
    },
    {
      id: 6,
      title: "Integrating AI Agents with Your Existing Systems",
      date: "December 5, 2022",
      summary: "A step-by-step guide to seamlessly integrating AI agents with your current business systems and workflows.",
      imageUrl: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      slug: "integrating-ai-with-existing-systems"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Our Blog
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-500">
            The latest news, insights, and updates from the Chatbase team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <BlogPost key={post.id} {...post} />
          ))}
        </div>

        <div className="text-center mt-16">
          <Button className="px-8 py-3 text-base">Load More</Button>
        </div>
      </div>
    </div>
  );
};

// Simple Button component for this page
const Button = ({ children, className = "", ...props }) => (
  <button 
    className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Blog;
