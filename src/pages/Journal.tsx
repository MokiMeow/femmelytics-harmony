
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Edit, Trash, Book, Calendar } from 'lucide-react';
import { JournalEntry, fetchJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/services/journalService';

const Journal = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [entryForm, setEntryForm] = useState<{
    title: string;
    content: string;
    date: string;
  }>({
    title: '',
    content: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await fetchJournalEntries();
      setEntries(data);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load journal entries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    try {
      if (!entryForm.title.trim() || !entryForm.content.trim()) {
        toast({
          title: 'Error',
          description: 'Title and content are required',
          variant: 'destructive',
        });
        return;
      }

      await createJournalEntry(entryForm);
      toast({
        title: 'Success',
        description: 'Journal entry created successfully',
      });
      setIsNewEntryOpen(false);
      resetForm();
      loadEntries();
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create journal entry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEntry = async () => {
    try {
      if (!selectedEntry?.id) return;
      
      await updateJournalEntry(selectedEntry.id, entryForm);
      toast({
        title: 'Success',
        description: 'Journal entry updated successfully',
      });
      setIsEditOpen(false);
      resetForm();
      loadEntries();
    } catch (error) {
      console.error('Error updating journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update journal entry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteJournalEntry(id);
      toast({
        title: 'Success',
        description: 'Journal entry deleted successfully',
      });
      loadEntries();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete journal entry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setEntryForm({
      title: entry.title,
      content: entry.content,
      date: entry.date,
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setEntryForm({
      title: '',
      content: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setSelectedEntry(null);
  };

  const formatEntryDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Health Journal</h1>
          <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle size={18} />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Journal Entry</DialogTitle>
                <DialogDescription>
                  Record your health observations, symptoms, and feelings.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="entry-date">Date</label>
                  <Input
                    id="entry-date"
                    type="date"
                    value={entryForm.date}
                    onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="entry-title">Title</label>
                  <Input
                    id="entry-title"
                    placeholder="Entry title"
                    value={entryForm.title}
                    onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="entry-content">Content</label>
                  <Textarea
                    id="entry-content"
                    placeholder="Write your journal entry here..."
                    className="min-h-[200px] resize-none"
                    value={entryForm.content}
                    onChange={(e) => setEntryForm({ ...entryForm, content: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateEntry}>Save Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <Card key={entry.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-semibold truncate">{entry.title}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      <span>{formatEntryDate(entry.date)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-muted-foreground">{entry.content}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(entry)}>
                    <Edit size={16} className="mr-1" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash size={16} className="mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your journal entry.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => entry.id && handleDeleteEntry(entry.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-10 border border-dashed rounded-lg">
            <Book className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
            <p className="text-muted-foreground mb-4">Start tracking your health journey by creating your first entry.</p>
            <Button onClick={() => setIsNewEntryOpen(true)}>Create Your First Entry</Button>
          </div>
        )}
        
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Journal Entry</DialogTitle>
              <DialogDescription>
                Update your journal entry details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-entry-date">Date</label>
                <Input
                  id="edit-entry-date"
                  type="date"
                  value={entryForm.date}
                  onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-entry-title">Title</label>
                <Input
                  id="edit-entry-title"
                  placeholder="Entry title"
                  value={entryForm.title}
                  onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-entry-content">Content</label>
                <Textarea
                  id="edit-entry-content"
                  placeholder="Write your journal entry here..."
                  className="min-h-[200px] resize-none"
                  value={entryForm.content}
                  onChange={(e) => setEntryForm({ ...entryForm, content: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateEntry}>Update Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">Track your health patterns to gain insights into your well-being</p>
          <Button variant="outline" className="gap-2">
            <Book size={16} />
            View Journal History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Journal;
