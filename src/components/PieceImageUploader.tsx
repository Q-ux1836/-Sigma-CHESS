
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { PieceType, PieceColor } from '@/lib/chessEngine';

interface PieceImageUploaderProps {
  onImageUploaded: (color: PieceColor, type: PieceType, imageUrl: string) => void;
}

const PieceImageUploader: React.FC<PieceImageUploaderProps> = ({ onImageUploaded }) => {
  const { toast } = useToast();

  const handleFileChange = (color: PieceColor, type: PieceType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image less than 2MB",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onImageUploaded(color, type, imageUrl);
      toast({
        title: "Image uploaded",
        description: `${color} ${type} piece updated successfully`,
      });
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg">
      {Object.values(PieceColor).map((color) => (
        <div key={color} className="space-y-4">
          <h3 className="text-lg font-semibold">{color} Pieces</h3>
          {Object.values(PieceType).map((type) => (
            <div key={`${color}-${type}`} className="space-y-2">
              <Label htmlFor={`${color}-${type}`}>{type}</Label>
              <Input
                id={`${color}-${type}`}
                type="file"
                accept="image/*"
                onChange={handleFileChange(color, type)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PieceImageUploader;
