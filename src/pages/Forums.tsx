
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { MessageSquare, Users, Heart, Search, Filter } from 'lucide-react';
import { ForumPost, fetchForumPosts, createForumPost, fetchForumPostsByCategory } from '@/services/forumService';

const Forums = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [postForm, setPostForm] = useState<{
    title: string;
    content: string;
    category: string;
  }>({
    title: '',
    content: '',
    category: 'PCOS',
  });

  const categories = [
    "All Topics",
    "PCOS",
    "Fertility",
    "Menstrual Health",
    "Hormones",
    "Nutrition",
    "Mental Health",
    "Exercise"
  ];

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let data;
      
      if (!selectedCategory || selectedCategory === "All Topics") {
        data = await fetchForumPosts();
      } else {
        data = await fetchForumPostsByCategory(selectedCategory);
      }
      
      setPosts(data);
    } catch (error) {
      console.error('Error loading forum posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load forum posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      if (!postForm.title.trim() || !postForm.content.trim() || !postForm.category.trim()) {
        toast({
          title: 'Error',
          description: 'Title, content, and category are required',
          variant: 'destructive',
        });
        return;
      }

      await createForumPost(postForm);
      toast({
        title: 'Success',
        description: 'Forum post created successfully',
      });
      setIsNewPostOpen(false);
      resetForm();
      loadPosts();
    } catch (error) {
      console.error('Error creating forum post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create forum post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setPostForm({
      title: '',
      content: '',
      category: 'PCOS',
    });
  };

  const formatPostDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 2) {
        return '1 hour ago';
      } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch {
      return dateStr;
    }
  };

  const filteredPosts = searchQuery.trim() === '' 
    ? posts 
    : posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Community Forums</h1>
          <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <MessageSquare size={18} />
                New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Discussion</DialogTitle>
                <DialogDescription>
                  Share your experiences or ask questions to the community.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="post-title">Title</label>
                  <Input
                    id="post-title"
                    placeholder="Discussion title"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="post-category">Category</label>
                  <select 
                    id="post-category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                  >
                    {categories.slice(1).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="post-content">Content</label>
                  <Textarea
                    id="post-content"
                    placeholder="Write your discussion here..."
                    className="min-h-[200px] resize-none"
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>Cancel</Button>
                <Button onClick={handleCreatePost}>Post Discussion</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center border rounded-md px-4 py-2 mb-8 bg-background">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <Input 
            type="text"
            placeholder="Search discussions..." 
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          {categories.map((category, i) => (
            <Badge 
              key={category} 
              variant={(!selectedCategory && i === 0) || selectedCategory === category ? "default" : "outline"} 
              className="px-4 py-2 cursor-pointer"
              onClick={() => setSelectedCategory(category === "All Topics" ? null : category)}
            >
              {category}
            </Badge>
          ))}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 gap-6 mb-8">
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
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 mb-8">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold">{post.title}</CardTitle>
                      <CardDescription>{post.content.substring(0, 100)}...</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, j) => (
                        <Avatar key={j} className="border-2 border-background w-8 h-8">
                          <AvatarFallback>{String.fromCharCode(65 + j)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">156 members</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare size={14} />
                      <span>24 posts</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Last activity: {formatPostDate(post.created_at || '')}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 flex justify-end">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Heart size={14} />
                    Join Discussion
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-10 border border-dashed rounded-lg">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No discussions found</h3>
            <p className="text-muted-foreground mb-4">Start a new discussion or check back later for updates.</p>
            <Button onClick={() => setIsNewPostOpen(true)}>Start a New Discussion</Button>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">Connect with others and share your experiences</p>
          <Button variant="outline" className="gap-2">
            <Users size={16} />
            Explore All Forums
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Forums;
