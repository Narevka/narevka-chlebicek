
import React, { useState } from "react";
import { Calendar, X, Users, Download, User, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data for demonstration
const mockLeads = [
  { id: 1, name: "John Doe", email: "john@example.com", timestamp: "2025-03-08T14:22:00Z" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", timestamp: "2025-03-09T09:15:00Z" },
  { id: 3, name: "Robert Johnson", email: "robert@example.com", timestamp: "2025-03-10T11:30:00Z" }
];

const LeadsSection = () => {
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLeads, setShowLeads] = useState(true); // Set to true to show mock data, false for empty state

  const clearDateFilter = () => {
    setDateFilter(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-600 mb-4">
          This section shows the answers done by the users to the lead form. The leads form settings can be configured in the settings of the chatbot.
        </p>
      </div>
      
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

      {showLeads ? (
        <Card className="w-full">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Name
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Submission Time
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.id}</TableCell>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{formatDate(lead.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center p-10">
            <Users className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No leads yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Lead information captured from conversations will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeadsSection;
