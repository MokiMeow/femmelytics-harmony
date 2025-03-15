
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Library as LibraryIcon, Search, BookOpen, Bookmark, Clock, BookMarked } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { Article, fetchArticles, fetchArticlesByCategory, fetchArticle, hasUserBookmarkedArticle, bookmarkArticle, removeBookmark, fetchBookmarkedArticles } from '@/services/libraryService';

const Library = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isArticleOpen, setIsArticleOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewingBookmarks, setViewingBookmarks] = useState(false);

  const categories = [
    "All Topics", 
    "Menstrual Health", 
    "Fertility", 
    "Hormones", 
    "Nutrition", 
    "Mental Health", 
    "Exercise"
  ];

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, viewingBookmarks]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      let data;
      
      if (viewingBookmarks) {
        data = await fetchBookmarkedArticles();
      } else if (!selectedCategory || selectedCategory === "All Topics") {
        data = await fetchArticles();
      } else {
        data = await fetchArticlesByCategory(selectedCategory);
      }
      
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load articles. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openArticle = async (article: Article) => {
    try {
      if (!article.id) return;
      
      const fullArticle = await fetchArticle(article.id);
      if (fullArticle) {
        setSelectedArticle(fullArticle);
        
        // Check if the article is bookmarked
        const bookmarked = await hasUserBookmarkedArticle(fullArticle.id!);
        setIsBookmarked(bookmarked);
        
        setIsArticleOpen(true);
      }
    } catch (error) {
      console.error('Error loading article details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load article details. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBookmarkToggle = async () => {
    if (!selectedArticle?.id) return;
    
    try {
      if (isBookmarked) {
        await removeBookmark(selectedArticle.id);
        setIsBookmarked(false);
        toast({
          title: 'Bookmark Removed',
          description: 'Article removed from your reading list',
        });
      } else {
        await bookmarkArticle(selectedArticle.id);
        setIsBookmarked(true);
        toast({
          title: 'Bookmarked',
          description: 'Article added to your reading list',
        });
      }
      
      // Refresh articles if viewing bookmarks
      if (viewingBookmarks) {
        loadArticles();
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bookmark. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleViewBookmarks = () => {
    setViewingBookmarks(!viewingBookmarks);
    setSelectedCategory(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const filteredArticles = searchQuery.trim() === '' 
    ? articles 
    : articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Health Article Library</h1>
          <Button variant="outline" className="gap-2" onClick={toggleViewBookmarks}>
            {viewingBookmarks ? <LibraryIcon size={18} /> : <BookMarked size={18} />}
            {viewingBookmarks ? 'All Articles' : 'Reading List'}
          </Button>
        </div>
        
        <div className="flex items-center border rounded-md px-4 py-2 mb-8 bg-background">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <Input 
            type="text"
            placeholder="Search articles..." 
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {!viewingBookmarks && (
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
        )}
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200"></div>
                <CardHeader>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => openArticle(article)}>
                <div className="w-full h-48 bg-gray-200">
                  {article.image_url ? (
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <LibraryIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{article.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock size={12} className="mr-1" />
                      {article.reading_time} min read
                    </span>
                  </div>
                  <CardTitle className="text-xl font-semibold">{article.title}</CardTitle>
                  <CardDescription>{article.summary}</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <Button variant="ghost" size="sm" className="w-full">Read Article</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-10 border border-dashed rounded-lg">
            <LibraryIcon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">
              {viewingBookmarks ? 'No bookmarked articles' : 'No articles found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {viewingBookmarks 
                ? 'Save articles to your reading list to access them later' 
                : 'Try adjusting your search or check back later for new content'}
            </p>
            {viewingBookmarks && (
              <Button onClick={() => setViewingBookmarks(false)}>Browse Articles</Button>
            )}
          </div>
        )}
        
        <Dialog open={isArticleOpen} onOpenChange={setIsArticleOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            {selectedArticle && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{selectedArticle.category}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleBookmarkToggle(); 
                      }}
                    >
                      {isBookmarked ? (
                        <BookMarked className="h-5 w-5 text-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <DialogTitle className="text-2xl my-2">{selectedArticle.title}</DialogTitle>
                  <DialogDescription>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} />
                      <span>{selectedArticle.reading_time} min read</span>
                      <span>•</span>
                      <span>{selectedArticle.created_at && formatDate(selectedArticle.created_at)}</span>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                
                {selectedArticle.image_url && (
                  <div className="w-full h-64 my-4">
                    <img 
                      src={selectedArticle.image_url} 
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover rounded-md" 
                    />
                  </div>
                )}
                
                <div className="article-content prose dark:prose-invert max-w-none">
                  {selectedArticle.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">{paragraph}</p>
                  ))}
                </div>
                
                <DialogFooter>
                  <Button 
                    variant={isBookmarked ? "outline" : "default"} 
                    className="gap-2"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleBookmarkToggle(); 
                    }}
                  >
                    {isBookmarked ? (
                      <>
                        <BookMarked size={16} />
                        Remove from Reading List
                      </>
                    ) : (
                      <>
                        <Bookmark size={16} />
                        Add to Reading List
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">Access expert-reviewed articles on women's health</p>
          <Button variant="outline" className="gap-2">
            <LibraryIcon size={16} />
            Browse Full Library
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Library;
