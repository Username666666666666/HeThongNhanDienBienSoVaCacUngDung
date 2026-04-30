import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { LucideIcon } from 'lucide-react';

interface CardActionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  onPress: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  loading?: boolean;
}

export const CardAction = ({
  title,
  description,
  icon: Icon,
  onPress,
  variant = 'default',
  disabled = false,
  loading = false,
}: CardActionProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onPress}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant={variant}
          className="w-full"
          disabled={disabled || loading}
          onClick={(e) => {
            e.stopPropagation();
            onPress();
          }}
        >
          {loading ? 'Đang xử lý...' : 'Thực hiện'}
        </Button>
      </CardContent>
    </Card>
  );
};