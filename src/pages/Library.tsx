
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Library as LibraryIcon, Search, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const Library = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Health Article Library</h1>
          <Button variant="outline" className="gap-2">
            <BookOpen size={18} />
            Reading List
          </Button>
        </div>
        
        <div className="flex items-center border rounded-md px-4 py-2 mb-8 bg-background">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <Input 
            type="text"
            placeholder="Search articles..." 
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
          />
        </div>
        
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          {["All Topics", "Menstrual Health", "Fertility", "Hormones", "Nutrition", "Mental Health", "Exercise"].map((topic, i) => (
            <Badge 
              key={i} 
              variant={i === 0 ? "default" : "outline"} 
              className="px-4 py-2 cursor-pointer"
            >
              {topic}
            </Badge>
          ))}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Understanding Your Menstrual Cycle Phases",
              description: "A comprehensive guide to the four phases",
              image: "https://placehold.co/600x400",
              category: "Menstrual Health",
              readTime: "8 min"
            },
            {
              title: "Nutrition and Hormone Balance",
              description: "How diet affects your hormonal health",
              image: "https://placehold.co/600x400",
              category: "Nutrition",
              readTime: "12 min"
            },
            {
              title: "Signs of Hormonal Imbalance",
              description: "Common symptoms and when to see a doctor",
              image: "https://placehold.co/600x400",
              category: "Hormones",
              readTime: "10 min"
            },
            {
              title: "Exercise Through Your Cycle",
              description: "Optimizing workouts for each phase",
              image: "https://placehold.co/600x400",
              category: "Exercise",
              readTime: "7 min"
            },
            {
              title: "Tracking for Fertility Awareness",
              description: "Methods and best practices",
              image: "https://placehold.co/600x400",
              category: "Fertility",
              readTime: "15 min"
            },
            {
              title: "Managing PMS and PMDD",
              description: "Strategies for symptom relief",
              image: "https://placehold.co/600x400",
              category: "Mental Health",
              readTime: "9 min"
            }
          ].map((article, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="w-full h-48 bg-gray-200">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <LibraryIcon className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{article.category}</Badge>
                  <span className="text-xs text-muted-foreground">{article.readTime} read</span>
                </div>
                <CardTitle className="text-xl font-semibold">{article.title}</CardTitle>
                <CardDescription>{article.description}</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <Button variant="ghost" size="sm" className="w-full">Read Article</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
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
