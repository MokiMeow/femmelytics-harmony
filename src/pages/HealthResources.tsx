
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, MessageSquare, Library, Pill, ArrowRight } from 'lucide-react';

const HealthResources = () => {
  // Define the resource cards
  const resources = [
    {
      title: 'Health Journal',
      description: 'Track symptoms, mood, and health patterns over time',
      icon: <Book className="h-8 w-8 text-primary" />,
      path: '/journal',
      color: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-900',
    },
    {
      title: 'Community Forums',
      description: 'Connect with others and share experiences',
      icon: <MessageSquare className="h-8 w-8 text-pink-500" />,
      path: '/forums',
      color: 'bg-pink-50 dark:bg-pink-950/30',
      borderColor: 'border-pink-200 dark:border-pink-900',
    },
    {
      title: 'Health Library',
      description: 'Access expert-reviewed health articles and resources',
      icon: <Library className="h-8 w-8 text-blue-500" />,
      path: '/library',
      color: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-900',
    },
    {
      title: 'Medication Tracking',
      description: 'Manage medication schedules and refills',
      icon: <Pill className="h-8 w-8 text-teal-500" />,
      path: '/medications',
      color: 'bg-teal-50 dark:bg-teal-950/30',
      borderColor: 'border-teal-200 dark:border-teal-900',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Health Resources</h1>
          <p className="text-muted-foreground">
            Tools and resources to help you manage your health and wellbeing
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {resources.map((resource) => (
            <Link to={resource.path} key={resource.title}>
              <Card className={`h-full transition-all duration-300 hover:shadow-md ${resource.color} border ${resource.borderColor} overflow-hidden`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    {resource.icon}
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl mt-4">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {resource.title === 'Health Journal' && (
                    <p>Record your daily health observations and track patterns over time.</p>
                  )}
                  {resource.title === 'Community Forums' && (
                    <p>Share experiences and get support from others on similar health journeys.</p>
                  )}
                  {resource.title === 'Health Library' && (
                    <p>Browse articles and resources on women's health topics curated by experts.</p>
                  )}
                  {resource.title === 'Medication Tracking' && (
                    <p>Never miss a dose with medication reminders and refill tracking.</p>
                  )}
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Click to explore {resource.title.toLowerCase()}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthResources;
