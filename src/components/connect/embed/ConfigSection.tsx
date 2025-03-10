
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ServerDomainConfig from "./ServerDomainConfig";
import CodeTabs from "./CodeTabs";

interface ConfigSectionProps {
  agentId: string | undefined;
  agentName: string | undefined;
  agentDescription: string | undefined;
  customDomain: string;
  setCustomDomain: (domain: string) => void;
  embedType: "bubble" | "iframe";
  website: string;
  setWebsite: (website: string) => void;
}

const ConfigSection: React.FC<ConfigSectionProps> = ({
  agentId,
  agentName,
  agentDescription,
  customDomain,
  setCustomDomain,
  embedType,
  website,
  setWebsite,
}) => {
  // Generate the code snippets based on the props
  const bubbleCode = `<script>
  window.chatbaseConfig = {
    chatbotId: "${agentId}",
    domain: "${customDomain}",
    title: "${agentName || 'Chat with our AI'}",
    description: "${agentDescription || 'Ask me anything!'}",
    primaryColor: "#6366f1",
    source: "Website" // This tracks the source of conversations
  }
  
  console.log('Initializing chat widget...');
  
  (function() {
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      console.log('Creating chatbase object...');
      window.chatbase = (...arguments) => {
        if (!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(arguments);
        console.log('Chatbase command queued:', arguments);
      };
      
      let s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = "${customDomain}/embed.min.js";
      s.onload = () => console.log('Embed script loaded successfully');
      s.onerror = (e) => console.error('Error loading embed script:', e);
      
      let p = document.getElementsByTagName("script")[0];
      p.parentNode.insertBefore(s, p);
      console.log('Embed script tag added to page');
    }
  })();
</script>`;

  const iframeCode = `<iframe
  src="${customDomain}/chatbot-iframe/${agentId}?source=WordPress"
  width="100%"
  style="height: 100%; min-height: 700px"
  frameborder="0"
  title="${agentName || 'AI Chat'}"
  allow="microphone"
></iframe>`;

  const wordpressInstructions = `
1. Go to your WordPress admin dashboard
2. Add a new HTML block or use a Custom HTML widget
3. Paste the code below into the HTML block/widget
4. Save and publish your changes
5. If the chat bubble doesn't appear, try adding the code to your theme's footer.php file
6. You may need to clear your cache or use incognito mode to see changes
`;

  const debugCode = `
// Add this to your page to help debug issues
<script>
  window.addEventListener('load', function() {
    console.log('Checking chatbot configuration...');
    console.log('Chatbase config:', window.chatbaseConfig);
    console.log('Chatbase initialized:', window.chatbase ? true : false);
    
    // Try to fetch the embed script to test connectivity
    fetch('${customDomain}/embed.min.js')
      .then(response => {
        console.log('Embed script fetch status:', response.status);
        if (!response.ok) {
          console.error('Failed to load embed script');
        }
      })
      .catch(error => {
        console.error('Error fetching embed script:', error);
      });
  });
</script>
`;

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <ServerDomainConfig
              customDomain={customDomain}
              setCustomDomain={setCustomDomain}
              website={website}
              setWebsite={setWebsite}
              agentId={agentId}
            />
            
            <CodeTabs
              bubbleCode={bubbleCode}
              iframeCode={iframeCode}
              embedType={embedType}
              wordpressInstructions={wordpressInstructions}
              debugCode={debugCode}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigSection;
