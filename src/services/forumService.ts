
import { supabase } from '@/integrations/supabase/client';

export interface ForumPost {
  id?: string;
  title: string;
  content: string;
  category: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ForumComment {
  id?: string;
  content: string;
  post_id: string;
  user_id?: string;
  created_at?: string;
}

export interface ForumLike {
  id?: string;
  post_id: string;
  user_id?: string;
  created_at?: string;
}

// Fetch all forum posts
export const fetchForumPosts = async (): Promise<ForumPost[]> => {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

// Fetch forum posts by category
export const fetchForumPostsByCategory = async (category: string): Promise<ForumPost[]> => {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

// Fetch a single forum post by ID
export const fetchForumPost = async (id: string): Promise<ForumPost | null> => {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

// Create a new forum post
export const createForumPost = async (post: Omit<ForumPost, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ForumPost> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('forum_posts')
    .insert([{ ...post, user_id: userId }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Update an existing forum post
export const updateForumPost = async (id: string, updates: Partial<ForumPost>): Promise<ForumPost> => {
  const { data, error } = await supabase
    .from('forum_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Delete a forum post
export const deleteForumPost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};

// Add a comment to a post
export const addComment = async (comment: Omit<ForumComment, 'id' | 'user_id' | 'created_at'>): Promise<ForumComment> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('forum_comments')
    .insert([{ ...comment, user_id: userId }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Fetch comments for a post
export const fetchCommentsForPost = async (postId: string): Promise<ForumComment[]> => {
  const { data, error } = await supabase
    .from('forum_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
    
  if (error) throw error;
  return data || [];
};

// Like a post
export const likePost = async (postId: string): Promise<void> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Check if already liked
  const { data: existingLike } = await supabase
    .from('forum_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();
    
  if (existingLike) {
    return; // Already liked
  }
  
  const { error } = await supabase
    .from('forum_likes')
    .insert([{ post_id: postId, user_id: userId }]);
    
  if (error) throw error;
};

// Unlike a post
export const unlikePost = async (postId: string): Promise<void> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { error } = await supabase
    .from('forum_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
    
  if (error) throw error;
};

// Get like count for a post
export const getLikeCount = async (postId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('forum_likes')
    .select('*', { count: 'exact' })
    .eq('post_id', postId);
    
  if (error) throw error;
  return count || 0;
};

// Check if user has liked a post
export const hasUserLikedPost = async (postId: string): Promise<boolean> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    return false;
  }
  
  const { data, error } = await supabase
    .from('forum_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId);
    
  if (error) throw error;
  return (data?.length || 0) > 0;
};
