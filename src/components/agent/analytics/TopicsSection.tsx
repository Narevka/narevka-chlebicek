
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Trash2, Lock } from 'lucide-react';

const TopicsSection = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Example data - in a real app this would come from the database
  const topics = [
    { id: 1, name: 'Product Features', count: 45 },
    { id: 2, name: 'Pricing', count: 32 },
    { id: 3, name: 'Technical Support', count: 28 },
    { id: 4, name: 'Account Issues', count: 20 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Lock className="h-4 w-4 mr-2" />
            Freeze Topics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </div>
      </div>

      <Card>
        <div className="divide-y">
          {topics.map((topic) => (
            <div key={topic.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h4 className="font-medium">{topic.name}</h4>
                <p className="text-sm text-gray-500">Mentioned {topic.count} times</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TopicsSection;
