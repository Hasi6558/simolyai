
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  label?: string;
  buttonText?: string;
  accept?: string;
}

const ImageUploader = ({ 
  onImageUpload, 
  label = "Carica immagine", 
  buttonText = "Carica immagine dal computer",
  accept = "image/*" 
}: ImageUploaderProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('page-images')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      onImageUpload(publicUrl);
      
      toast({
        title: "Immagine caricata",
        description: "L'immagine è stata caricata con successo",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il caricamento dell'immagine",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        variant="outline" 
        className="w-full"
        disabled={uploading}
        onClick={() => document.getElementById(`image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`)?.click()}
      >
        {uploading ? (
          "Caricamento..."
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {buttonText}
          </>
        )}
      </Button>
      <input
        id={`image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;
