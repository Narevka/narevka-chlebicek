
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatsSection from "./analytics/ChatsSection";
import TopicsSection from "./analytics/TopicsSection";
import SentimentSection from "./analytics/SentimentSection";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const AnalyticsTab = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">Last 7 days</Button>
            <Button variant="outline" size="sm">Last 30 days</Button>
            <Button variant="outline" size="sm">Last 3 months</Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <Tabs defaultValue="chats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="chats">
          <ChatsSection />
        </TabsContent>

        <TabsContent value="topics">
          <TopicsSection />
        </TabsContent>

        <TabsContent value="sentiment">
          <SentimentSection />
        </TabsContent>
      </Tabs>

      <Card className="mt-6 p-4 bg-gray-50">
        <p className="text-sm text-gray-500">
          Note: Analytics data is updated with a 1-day delay. Topics and sentiment data are only available after upgrading to a paid plan.
        </p>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
