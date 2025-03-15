
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Heart, MessageCircle, Send, Flag, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistance } from "date-fns";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  category: string;
  user_name?: string;
  likes_count: number;
  comments_count: number;
  user_has_liked?: boolean;
}

interface ForumComment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  user_name?: string;
}

const CATEGORIES = [
  "General", "Cycle Tracking", "PCOS", "Endometriosis", "Menopause", 
  "Fertility", "Pregnancy", "Postpartum", "Mental Health", "Q&A"
];

const CommunityForums = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<Record<string, ForumComment[]>>({});
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, activeCategory]);

  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost);
    }
  }, [selectedPost]);

  const fetchPosts = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('forum_posts')
        .select('*');

      if (activeCategory !== "all") {
        query = query.eq('category', activeCategory);
      }

      const { data: postsData, error: postsError } = await query.order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Process posts to include user names
      const enhancedPosts = await Promise.all(postsData.map(async (post) => {
        // Get profile info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', post.user_id)
          .single();

        // Get likes count
        const { data: likesData, error: likesError } = await supabase
          .from('forum_likes')
          .select('user_id')
          .eq('post_id', post.id);

        if (likesError) console.error('Error fetching likes:', likesError);

        // Get comments count
        const { count: commentsCount, error: commentsError } = await supabase
          .from('forum_comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id);

        if (commentsError) console.error('Error fetching comments count:', commentsError);

        const firstName = profileData?.first_name || 'Anonymous';
        const lastName = profileData?.last_name ? profileData.last_name.charAt(0) + '.' : '';
        const userName = `${firstName} ${lastName}`.trim();
        const likesCount = likesData?.length || 0;
        const userHasLiked = likesData ? likesData.some((like) => like.user_id === user.id) : false;

        return {
          ...post,
          user_name: userName,
          likes_count: likesCount,
          comments_count: commentsCount || 0,
          user_has_liked: userHasLiked,
        };
      }));

      setPosts(enhancedPosts);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      toast({
        title: "Failed to load forum posts",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    if (!user) return;

    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      const enhancedComments = await Promise.all(commentsData.map(async (comment) => {
        // Get profile info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', comment.user_id)
          .single();

        const firstName = profileData?.first_name || 'Anonymous';
        const lastName = profileData?.last_name ? profileData.last_name.charAt(0) + '.' : '';
        const userName = `${firstName} ${lastName}`.trim();

        return {
          ...comment,
          user_name: userName,
        };
      }));

      setComments(prev => ({
        ...prev,
        [postId]: enhancedComments,
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const createPost = async () => {
    if (!user) return;
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your post.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          user_id: user.id,
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Post created",
        description: "Your post has been published to the forum.",
      });

      setNewPost({ title: "", content: "", category: "General" });
      fetchPosts();
    } catch (error) {
      console.error('Error creating forum post:', error);
      toast({
        title: "Failed to create post",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (postId: string) => {
    if (!user) return;
    const comment = newComments[postId];
    if (!comment || !comment.trim()) return;

    try {
      const { error } = await supabase
        .from('forum_comments')
        .insert({
          user_id: user.id,
          post_id: postId,
          content: comment,
        });

      if (error) throw error;

      setNewComments(prev => ({
        ...prev,
        [postId]: "",
      }));

      fetchComments(postId);
      fetchPosts(); // Refresh posts to update comment count
      
      toast({
        title: "Comment added",
        description: "Your comment has been added to the post.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Failed to add comment",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const toggleLike = async (postId: string, userHasLiked: boolean) => {
    if (!user) return;

    try {
      if (userHasLiked) {
        // Unlike
        const { error } = await supabase
          .from('forum_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('forum_likes')
          .insert({
            user_id: user.id,
            post_id: postId,
          });

        if (error) throw error;
      }

      // Update local state optimistically
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: userHasLiked ? post.likes_count - 1 : post.likes_count + 1,
              user_has_liked: !userHasLiked,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Failed to update like",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="browse">Browse Forums</TabsTrigger>
          <TabsTrigger value="create">Create Post</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              className="rounded-full" 
              size="sm"
              onClick={() => setActiveCategory("all")}
            >
              All Topics
            </Button>
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                className="rounded-full" 
                size="sm"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {isLoading && posts.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No posts found</p>
              <p className="text-muted-foreground mt-1 mb-4">Be the first to start a conversation!</p>
              <Button onClick={() => {
                const createTab = document.querySelector('[data-value="create"]');
                if (createTab) {
                  // Use TypeScript assertion to handle the click
                  (createTab as HTMLElement).click();
                }
              }}>
                Create A Post
              </Button>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="rounded-full">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(new Date(post.created_at), new Date(), { addSuffix: true })}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{post.user_name?.[0] || "A"}</AvatarFallback>
                    </Avatar>
                    <CardDescription>{post.user_name}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">
                    {selectedPost === post.id 
                      ? post.content 
                      : post.content.length > 200 
                        ? `${post.content.substring(0, 200)}...` 
                        : post.content}
                  </p>
                  {post.content.length > 200 && selectedPost !== post.id && (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto" 
                      onClick={() => setSelectedPost(post.id)}
                    >
                      Read more
                    </Button>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={post.user_has_liked ? "text-primary" : ""}
                      onClick={() => toggleLike(post.id, post.user_has_liked || false)}
                    >
                      <Heart className="h-4 w-4 mr-1" fill={post.user_has_liked ? "currentColor" : "none"} />
                      {post.likes_count}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        if (selectedPost === post.id) {
                          setSelectedPost(null);
                        } else {
                          setSelectedPost(post.id);
                        }
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments_count}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Flag className="h-4 w-4" />
                  </Button>
                </CardFooter>
                
                {selectedPost === post.id && (
                  <div className="border-t p-4">
                    <h4 className="font-medium mb-4">Comments</h4>
                    <div className="space-y-4 mb-4">
                      {comments[post.id]?.length ? (
                        comments[post.id].map((comment) => (
                          <div key={comment.id} className="flex gap-2 pb-4 border-b last:border-0 last:pb-0">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{comment.user_name?.[0] || "A"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{comment.user_name}</p>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistance(new Date(comment.created_at), new Date(), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No comments yet. Be the first to comment!</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={newComments[post.id] || ""}
                        onChange={(e) => setNewComments(prev => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            addComment(post.id);
                          }
                        }}
                      />
                      <Button 
                        size="icon" 
                        onClick={() => addComment(post.id)}
                        disabled={!newComments[post.id]?.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Post</CardTitle>
              <CardDescription>Share your thoughts, questions, or experiences with the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Post title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Write your post content here..."
                  className="min-h-32"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={newPost.category === category ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setNewPost({ ...newPost, category })}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={createPost} 
                disabled={isLoading || !newPost.title.trim() || !newPost.content.trim()}
                className="ml-auto"
              >
                Post to Community
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityForums;
