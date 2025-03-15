
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Search, BookOpen, Bookmark, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  image_url: string;
  category: string;
  created_at: string;
  reading_time: number;
  is_bookmarked?: boolean;
}

const CATEGORIES = [
  "Cycle Health", "Reproductive Health", "Mental Health", "Nutrition", 
  "Fitness", "Sleep", "Relationships", "Hormones", "General Wellness"
];

const HealthArticleLibrary = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchArticles();
      fetchBookmarks();
    }
  }, [user]);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, selectedCategory]);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('health_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Failed to load articles",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('article_bookmarks')
        .select('article_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const bookmarkIds = data.map(bookmark => bookmark.article_id);
      setBookmarks(bookmarkIds);
      
      // Update articles with bookmark status
      setArticles(prevArticles => 
        prevArticles.map(article => ({
          ...article,
          is_bookmarked: bookmarkIds.includes(article.id)
        }))
      );
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        article => 
          article.title.toLowerCase().includes(query) || 
          article.summary.toLowerCase().includes(query) ||
          article.category.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    setFilteredArticles(filtered);
  };

  const toggleBookmark = async (articleId: string) => {
    if (!user) return;
    
    const isCurrentlyBookmarked = bookmarks.includes(articleId);
    
    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('article_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);

        if (error) throw error;
        
        setBookmarks(prevBookmarks => prevBookmarks.filter(id => id !== articleId));
        
        toast({
          title: "Bookmark removed",
          description: "Article has been removed from your bookmarks.",
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('article_bookmarks')
          .insert({
            user_id: user.id,
            article_id: articleId,
          });

        if (error) throw error;
        
        setBookmarks(prevBookmarks => [...prevBookmarks, articleId]);
        
        toast({
          title: "Bookmark added",
          description: "Article has been added to your bookmarks.",
        });
      }
      
      // Update article in state
      setArticles(prevArticles => 
        prevArticles.map(article => {
          if (article.id === articleId) {
            return {
              ...article,
              is_bookmarked: !isCurrentlyBookmarked
            };
          }
          return article;
        })
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Failed to update bookmark",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="all">All Articles</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              className="rounded-full h-10" 
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {CATEGORIES.slice(0, 3).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="rounded-full h-10" 
                size="sm"
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
              >
                {category}
              </Button>
            ))}
            <Dialog>
              <Dialog
                content={
                  <div className="flex flex-wrap gap-2 p-4">
                    {CATEGORIES.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className="rounded-full" 
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category === selectedCategory ? null : category);
                          document.querySelector('[role="dialog"]')?.setAttribute("data-state", "closed");
                        }}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                }
              >
                <Button variant="outline" className="rounded-full h-10" size="sm">
                  More...
                </Button>
              </Dialog>
            </Dialog>
          </div>
        </div>
        
        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card className="p-8 text-center">
              <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No articles found</p>
              <p className="text-muted-foreground mt-1">
                {searchQuery || selectedCategory 
                  ? "Try adjusting your search or filters" 
                  : "Articles will appear here once they're available"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden flex flex-col h-full">
                  {article.image_url && (
                    <div 
                      className="h-40 w-full bg-center bg-cover" 
                      style={{ backgroundImage: `url(${article.image_url})` }}
                    ></div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge variant="outline" className="mb-2">
                        {article.category}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={article.is_bookmarked ? "text-primary" : ""}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(article.id);
                        }}
                      >
                        <Bookmark 
                          className="h-4 w-4" 
                          fill={article.is_bookmarked ? "currentColor" : "none"} 
                        />
                      </Button>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <CalendarDays className="h-3 w-3" />
                      <span>{format(parseISO(article.created_at), 'MMM d, yyyy')}</span>
                      <span>·</span>
                      <span>{article.reading_time} min read</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {article.summary}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto" 
                      onClick={() => setSelectedArticle(article)}
                    >
                      Read article <BookOpen className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="bookmarked" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredArticles.filter(a => a.is_bookmarked).length === 0 ? (
            <Card className="p-8 text-center">
              <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No bookmarked articles</p>
              <p className="text-muted-foreground mt-1 mb-4">
                Bookmark articles to save them for later reading
              </p>
              <Button onClick={() => document.querySelector('[data-value="all"]')?.click()}>
                Browse Articles
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles
                .filter(article => article.is_bookmarked)
                .map((article) => (
                  <Card key={article.id} className="overflow-hidden flex flex-col h-full">
                    {article.image_url && (
                      <div 
                        className="h-40 w-full bg-center bg-cover" 
                        style={{ backgroundImage: `url(${article.image_url})` }}
                      ></div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Badge variant="outline" className="mb-2">
                          {article.category}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(article.id);
                          }}
                        >
                          <Bookmark className="h-4 w-4" fill="currentColor" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <CalendarDays className="h-3 w-3" />
                        <span>{format(parseISO(article.created_at), 'MMM d, yyyy')}</span>
                        <span>·</span>
                        <span>{article.reading_time} min read</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {article.summary}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto" 
                        onClick={() => setSelectedArticle(article)}
                      >
                        Read article <BookOpen className="ml-1 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Article Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedArticle?.title}</DialogTitle>
            <DialogDescription className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {selectedArticle?.created_at ? format(parseISO(selectedArticle.created_at), 'MMM d, yyyy') : ''}
                </span>
                <span>·</span>
                <span>{selectedArticle?.reading_time} min read</span>
                <span>·</span>
                <Badge variant="outline">{selectedArticle?.category}</Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className={selectedArticle?.is_bookmarked ? "text-primary" : ""}
                onClick={() => selectedArticle && toggleBookmark(selectedArticle.id)}
              >
                <Bookmark 
                  className="h-4 w-4 mr-1" 
                  fill={selectedArticle?.is_bookmarked ? "currentColor" : "none"} 
                />
                {selectedArticle?.is_bookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow -mx-6 px-6">
            {selectedArticle?.image_url && (
              <div 
                className="h-60 w-full bg-center bg-cover mb-4 rounded-md" 
                style={{ backgroundImage: `url(${selectedArticle.image_url})` }}
              ></div>
            )}
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedArticle?.content || '' }}
            ></div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthArticleLibrary;
