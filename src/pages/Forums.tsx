
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Forums = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Community Forums</h1>
          <Button className="gap-2">
            <MessageSquare size={18} />
            New Discussion
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-8">
          {[
            {
              title: "Dealing with PCOS symptoms",
              description: "Support group for PCOS management",
              posts: 24,
              members: 156,
              latest: "2 hours ago",
              tags: ["PCOS", "Support"]
            },
            {
              title: "Period tracking methods discussion",
              description: "Comparing different tracking methods and apps",
              posts: 42,
              members: 213,
              latest: "Yesterday",
              tags: ["Tracking", "Apps"]
            },
            {
              title: "Natural remedies for menstrual cramps",
              description: "Sharing effective natural pain relief methods",
              posts: 37,
              members: 189,
              latest: "3 days ago",
              tags: ["Pain Relief", "Natural"]
            }
          ].map((forum, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-semibold">{forum.title}</CardTitle>
                    <CardDescription>{forum.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {forum.tags.map((tag, j) => (
                      <Badge key={j} variant="outline">{tag}</Badge>
                    ))}
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
                  <span className="text-sm text-muted-foreground">{forum.members} members</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare size={14} />
                    <span>{forum.posts} posts</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Last activity: {forum.latest}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 flex justify-end">
                <Button variant="ghost" size="sm" className="gap-1">
                  <Heart size={14} />
                  Join Forum
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
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
