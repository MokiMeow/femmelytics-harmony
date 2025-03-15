
import { supabase } from '@/integrations/supabase/client';

export interface Article {
  id?: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  image_url?: string;
  reading_time: number;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleBookmark {
  id?: string;
  article_id: string;
  user_id?: string;
  created_at?: string;
}

// Fetch all articles
export const fetchArticles = async (): Promise<Article[]> => {
  const { data, error } = await supabase
    .from('health_articles')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

// Fetch articles by category
export const fetchArticlesByCategory = async (category: string): Promise<Article[]> => {
  const { data, error } = await supabase
    .from('health_articles')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

// Fetch a single article by ID
export const fetchArticle = async (id: string): Promise<Article | null> => {
  const { data, error } = await supabase
    .from('health_articles')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

// Bookmark an article
export const bookmarkArticle = async (articleId: string): Promise<void> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Check if already bookmarked
  const { data: existingBookmark } = await supabase
    .from('article_bookmarks')
    .select('*')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .single();
    
  if (existingBookmark) {
    return; // Already bookmarked
  }
  
  const { error } = await supabase
    .from('article_bookmarks')
    .insert([{ article_id: articleId, user_id: userId }]);
    
  if (error) throw error;
};

// Remove bookmark
export const removeBookmark = async (articleId: string): Promise<void> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { error } = await supabase
    .from('article_bookmarks')
    .delete()
    .eq('article_id', articleId)
    .eq('user_id', userId);
    
  if (error) throw error;
};

// Get user's bookmarked articles
export const fetchBookmarkedArticles = async (): Promise<Article[]> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('article_bookmarks')
    .select('article_id')
    .eq('user_id', userId);
    
  if (error) throw error;
  
  if (!data || data.length === 0) {
    return [];
  }
  
  const articleIds = data.map(bookmark => bookmark.article_id);
  
  const { data: articles, error: articlesError } = await supabase
    .from('health_articles')
    .select('*')
    .in('id', articleIds);
    
  if (articlesError) throw articlesError;
  return articles || [];
};

// Check if user has bookmarked an article
export const hasUserBookmarkedArticle = async (articleId: string): Promise<boolean> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  
  const userId = userData.user?.id;
  if (!userId) {
    return false;
  }
  
  const { data, error } = await supabase
    .from('article_bookmarks')
    .select('*')
    .eq('article_id', articleId)
    .eq('user_id', userId);
    
  if (error) throw error;
  return (data?.length || 0) > 0;
};
