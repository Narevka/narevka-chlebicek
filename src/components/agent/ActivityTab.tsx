
import React, { useState } from "react";
import { 
  MessageSquare, 
  Users, 
  RefreshCw, 
  Filter, 
  Download, 
  Trash2, 
  Calendar, 
  X,
  BarChart
} from "lucide-react";
import { format } from "date-fns";
import "../ui/scrollbar.css";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock data for conversations
const mockConversations = [
  {
    id: 1,
    title: "Sprzedajemy kursy online z zakresu...",
    lastMessage: "co sprzedajecie?",
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    source: "Playground",
    messages: [
      { text: "Hi! What can I help you with?", isBot: true },
      { text: "co sprzedajecie?", isBot: false },
      { 
        text: "Sprzedajemy kursy online z zakresu sztucznej inteligencji. Oferujemy materiały edukacyjne, które można przeglądać na różnych urządzeniach, takich jak komputer, tablet czy smartfon. Jeśli masz jakieś konkretne pytania dotyczące kursów, chętnie na nie odpowiem!", 
        isBot: true,
        confidence: 0.727
      }
    ]
  },
  {
    id: 2,
    title: "Jaki jest najlepszy kurs dla początkujących?",
    lastMessage: "Szukam kursu dla początkujących",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    source: "Website",
    messages: [
      { text: "Hi! What can I help you with?", isBot: true },
      { text: "Szukam kursu dla początkujących", isBot: false },
      { 
        text: "Dla początkujących polecam nasz kurs 'Wprowadzenie do AI'. Zawiera podstawy teoretyczne oraz proste ćwiczenia praktyczne. Kurs jest dostępny w promocyjnej cenie 299 zł i obejmuje 30 dni dostępu do naszej platformy wsparcia.", 
        isBot: true,
        confidence: 0.85
      }
    ]
  },
  {
    id: 3,
    title: "Czy oferujecie certyfikaty?",
    lastMessage: "Czy po ukończeniu kursu otrzymam certyfikat?",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    source: "Mobile App",
    messages: [
      { text: "Hi! What can I help you with?", isBot: true },
      { text: "Czy po ukończeniu kursu otrzymam certyfikat?", isBot: false },
      { 
        text: "Tak, po ukończeniu każdego z naszych kursów otrzymasz certyfikat ukończenia. Certyfikat jest generowany automatycznie po zaliczeniu wszystkich modułów i można go pobrać w formacie PDF lub udostępnić bezpośrednio na LinkedIn.", 
        isBot: true,
        confidence: 0.92
      }
    ]
  }
];

// Mock data for leads
const mockLeads = [
  {
    id: 1,
    name: "Jan Kowalski",
    email: "jan.kowalski@example.com",
    phone: "+48 123 456 789",
    source: "Playground",
    date: new Date(2024, 1, 15),
    status: "New"
  },
  {
    id: 2,
    name: "Anna Nowak",
    email: "anna.nowak@example.com",
    phone: "+48 987 654 321",
    source: "Website",
    date: new Date(2024, 2, 3),
    status: "Contacted"
  },
  {
    id: 3,
    name: "Piotr Wiśniewski",
    email: "piotr.wisniewski@example.com",
    phone: "+48 555 444 333",
    source: "Mobile App",
    date: new Date(2024, 2, 20),
    status: "Qualified"
  }
];

// SubTabs component for switching between Chat Logs and Leads
const SubTabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  return (
    <div className="flex mb-6 space-x-2">
      <button
        className={`flex items-center px-4 py-2 rounded-md ${
          activeTab === "chatLogs"
            ? "bg-purple-100 text-purple-800"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("chatLogs")}
      >
        <MessageSquare className={`h-4 w-4 mr-2 ${activeTab === "chatLogs" ? "text-purple-800" : "text-gray-500"}`} />
        <span>Chat Logs</span>
      </button>
      <button
        className={`flex items-center px-4 py-2 rounded-md ${
          activeTab === "leads"
            ? "bg-purple-100 text-purple-800"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => setActiveTab("leads")}
      >
        <Users className={`h-4 w-4 mr-2 ${activeTab === "leads" ? "text-purple-800" : "text-gray-500"}`} />
        <span>Leads</span>
      </button>
    </div>
  );
};

// Chat Logs section component
const ChatLogsSection = () => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const filteredConversations = mockConversations.filter(convo => {
    const matchesSearch = convo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         convo.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter ? convo.source === filter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chat logs</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="bg-black text-white hover:bg-gray-800 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-md border overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((convo) => (
              <div 
                key={convo.id} 
                className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedConversation(convo)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{convo.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{convo.lastMessage}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">
                      {format(convo.date, "d MMM yyyy")} ({format(convo.date, "h:mm a")})
                    </span>
                    <div className="bg-gray-100 text-xs px-2 py-1 rounded">
                      {convo.source}
                    </div>
                    <button className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Detail Dialog */}
      {selectedConversation && (
        <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Conversation Details</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="flex justify-between mb-4">
                <div className="bg-gray-100 text-sm px-3 py-1 rounded">
                  Source: {selectedConversation.source}
                </div>
                <div className="text-sm text-gray-500">
                  {format(selectedConversation.date, "PPP")}
                </div>
              </div>

              <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto scrollbar-thin">
                {selectedConversation.messages.map((msg: any, i: number) => (
                  <div 
                    key={i} 
                    className={`mb-4 flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.isBot 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.confidence && (
                        <div className="mt-2 flex items-center">
                          <div className="bg-purple-500 text-xs text-white px-2 py-1 rounded flex items-center">
                            <BarChart className="h-3 w-3 mr-1" />
                            {msg.confidence.toFixed(3)}
                          </div>
                          <button className="ml-2 text-xs text-gray-500 underline">
                            Revise answer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Leads section component
const LeadsSection = () => {
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const clearDateFilter = () => {
    setDateFilter(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Leads</h2>
        <Button variant="outline" size="sm" className="bg-black text-white hover:bg-gray-800 flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Filters</h3>
        {dateFilter ? (
          <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-md">
            <Calendar className="h-3 w-3 mr-2" />
            <span className="text-sm">{dateFilter}</span>
            <button className="ml-2" onClick={clearDateFilter}>
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-md cursor-pointer">
            <Calendar className="h-3 w-3 mr-2" />
            <span className="text-sm">Select date range</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-md border overflow-hidden">
        {mockLeads.length > 0 ? (
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.email}</div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(lead.date, "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lead.status === 'New' ? 'bg-green-100 text-green-800' :
                        lead.status === 'Contacted' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <p className="text-gray-500 mb-2">No leads found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ type }: { type: string }) => {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-10">
        {type === "chatLogs" ? (
          <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
        ) : (
          <Users className="h-12 w-12 text-gray-300 mb-4" />
        )}
        <h3 className="text-lg font-medium mb-2">
          No {type === "chatLogs" ? "conversation history" : "leads"} yet
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          {type === "chatLogs"
            ? "When users interact with your agent, conversations will appear here."
            : "Lead information captured from conversations will appear here."}
        </p>
      </CardContent>
    </Card>
  );
};

// Main ActivityTab component
const ActivityTab = () => {
  const [activeTab, setActiveTab] = useState<string>("chatLogs");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Activity</h1>
      
      <SubTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === "chatLogs" ? (
        <ChatLogsSection />
      ) : (
        <LeadsSection />
      )}
    </div>
  );
};

export default ActivityTab;
