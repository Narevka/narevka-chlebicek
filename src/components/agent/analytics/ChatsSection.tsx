
import React from 'react';
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, MessagesSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

const ChatsSection = () => {
  // Example data - in a real app this would come from the database
  const statsData = {
    totalChats: 150,
    totalMessages: 450,
    thumbsUp: 85,
    thumbsDown: 12
  };

  const countryData = [
    { name: 'USA', value: 45 },
    { name: 'UK', value: 25 },
    { name: 'Germany', value: 20 },
    { name: 'France', value: 15 },
    { name: 'Others', value: 45 }
  ];

  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Chats</p>
              <h3 className="text-2xl font-bold">{statsData.totalChats}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <MessagesSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Messages</p>
              <h3 className="text-2xl font-bold">{statsData.totalMessages}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Thumbs Up</p>
              <h3 className="text-2xl font-bold">{statsData.thumbsUp}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <ThumbsDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Thumbs Down</p>
              <h3 className="text-2xl font-bold">{statsData.thumbsDown}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Chats by Country</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Chat Volume</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { date: 'Mon', chats: 20 },
                  { date: 'Tue', chats: 35 },
                  { date: 'Wed', chats: 25 },
                  { date: 'Thu', chats: 40 },
                  { date: 'Fri', chats: 30 },
                  { date: 'Sat', chats: 15 },
                  { date: 'Sun', chats: 10 },
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="chats" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatsSection;
