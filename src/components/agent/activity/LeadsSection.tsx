
import React, { useState } from "react";
import { Calendar, X, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-10">
          <Users className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No leads yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Lead information captured from conversations will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsSection;
