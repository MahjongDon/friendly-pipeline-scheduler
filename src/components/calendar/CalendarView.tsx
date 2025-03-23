
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { sampleEvents } from "./types";
import UpcomingEvents from "./UpcomingEvents";
import DayView from "./DayView";
import AlternateViewMessage from "./AlternateViewMessage";
import CustomDay from "./CustomDay";

// We need to import the specific types we need from react-day-picker
import type { DayContentProps } from "react-day-picker";

const CalendarView: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <div className="w-full sm:w-auto">
        <div className="bg-white border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Calendar</h3>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setDate(newDate);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setDate(newDate);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={date}
            showOutsideDays
            className="p-0"
            components={{
              Day: (props: DayContentProps) => (
                <CustomDay dayProps={props} events={sampleEvents} />
              ),
            }}
          />
        </div>
        
        <UpcomingEvents events={sampleEvents} />
      </div>

      <div className="flex-1 bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">
            {selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "Select a date"}
          </h2>
          <div className="flex items-center gap-2">
            <Select defaultValue="month" onValueChange={(val: "month" | "week" | "day") => setView(val)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Event
            </Button>
          </div>
        </div>

        {view === "day" && selectedDate ? (
          <DayView 
            selectedDate={selectedDate} 
            events={sampleEvents} 
            onSwitchView={setView} 
          />
        ) : (
          <AlternateViewMessage onSwitchView={setView} />
        )}
      </div>
    </div>
  );
};

export default CalendarView;
