import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Comment } from '@/types';

interface CommentsProps {
  projectId: string;
  comments: Comment[];
  currentUserId: string;
  onSubmitComment?: (content: string, timestamp: number | null) => Promise<boolean>;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

// Format timestamp for video position
const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return '';
  
  const minutes = Math.floor(timestamp / 60);
  const seconds = Math.floor(timestamp % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function Comments({ projectId, comments, currentUserId, onSubmitComment }: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      if (onSubmitComment) {
        const success = await onSubmitComment(newComment, timestamp);
        if (success) {
          setNewComment('');
          setTimestamp(null);
        }
      } else {
        // Fallback for sample implementation
        console.log('Adding comment:', {
          projectId,
          userId: currentUserId,
          content: newComment,
          timestamp,
        });
        
        setNewComment('');
        setTimestamp(null);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Comments & Feedback</h3>
      
      {/* Comment list */}
      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="bg-gray-50 p-3 rounded-md"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium">{comment.user_id === currentUserId ? 'You' : 'User'}</span>
                <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-sm text-gray-800">{comment.content}</p>
              
              {comment.timestamp && (
                <div className="mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">
                    at {formatTimestamp(comment.timestamp)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            className="flex w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Add your comment or feedback..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label htmlFor="timestamp" className="text-sm text-gray-600">
              Timestamp:
            </label>
            <Input
              id="timestamp"
              type="text"
              placeholder="0:00"
              className="w-24"
              value={timestamp ? formatTimestamp(timestamp) : ''}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setTimestamp(null);
                  return;
                }
                
                const [minutes, seconds] = value.split(':').map(Number);
                if (!isNaN(minutes) && !isNaN(seconds)) {
                  setTimestamp(minutes * 60 + seconds);
                }
              }}
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
