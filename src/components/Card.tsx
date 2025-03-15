
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div className={cn("bg-card rounded-lg border shadow-sm", className)} {...props}>
      {children}
    </div>
  );
};

export default Card;
