
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, BookText, Plus, Edit, Trash2, Save } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

const HealthJournal = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState({ title: "", content: "" });
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchJournalEntries();
    }
  }, [user, date]);

  const fetchJournalEntries = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', formattedDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast({
        title: "Failed to load journal entries",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createJournalEntry = async () => {
    if (!user) return;
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your journal entry.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: newEntry.title,
          content: newEntry.content,
          date: formattedDate,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Journal entry saved",
        description: "Your journal entry has been saved successfully.",
      });

      setNewEntry({ title: "", content: "" });
      fetchJournalEntries();
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast({
        title: "Failed to save journal entry",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateJournalEntry = async () => {
    if (!user || !editingEntry) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: editingEntry.title,
          content: editingEntry.content,
        })
        .eq('id', editingEntry.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Journal entry updated",
        description: "Your journal entry has been updated successfully.",
      });

      setEditingEntry(null);
      fetchJournalEntries();
    } catch (error) {
      console.error('Error updating journal entry:', error);
      toast({
        title: "Failed to update journal entry",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteJournalEntry = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this journal entry?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Journal entry deleted",
        description: "Your journal entry has been deleted successfully.",
      });

      fetchJournalEntries();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast({
        title: "Failed to delete journal entry",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Health Journal</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-auto justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Entry for {format(date, "PPP")}</CardTitle>
          <CardDescription>Record your health thoughts, symptoms, or feelings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Entry title"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write your thoughts here..."
              className="min-h-32"
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={createJournalEntry} 
            disabled={isLoading || !newEntry.title.trim() || !newEntry.content.trim()}
            className="ml-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </CardFooter>
      </Card>

      {isLoading && entries.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.length === 0 ? (
            <Card className="p-8 text-center">
              <BookText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No journal entries for this date</p>
              <p className="text-muted-foreground mt-1">Create your first entry above</p>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className={cn(
                editingEntry?.id === entry.id ? "border-primary" : ""
              )}>
                {editingEntry?.id === entry.id ? (
                  <>
                    <CardHeader className="pb-2">
                      <Input
                        value={editingEntry.title}
                        onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                        className="font-semibold text-lg"
                      />
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={editingEntry.content}
                        onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                        className="min-h-32"
                      />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingEntry(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={updateJournalEntry}
                        disabled={isLoading || !editingEntry.title.trim() || !editingEntry.content.trim()}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </CardFooter>
                  </>
                ) : (
                  <>
                    <CardHeader className="pb-2">
                      <CardTitle>{entry.title}</CardTitle>
                      <CardDescription>
                        {format(new Date(entry.created_at), "h:mm a")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{entry.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setEditingEntry(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-destructive hover:text-destructive" 
                        onClick={() => deleteJournalEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HealthJournal;
