
import React from 'react';
import { Button } from '@/components/ui/button';
import { Type, Image, Layout, Save } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PageEditorToolbarProps {
  onInsertHeading: (level: number) => void;
  onInsertParagraph: () => void;
  onInsertLayout: (columns: number) => void;
  onInsertImage: (imageUrl: string) => void;
  onSave: () => void;
}

const PageEditorToolbar = ({
  onInsertHeading,
  onInsertParagraph,
  onInsertLayout,
  onInsertImage,
  onSave
}: PageEditorToolbarProps) => {
  return (
    <div className="border rounded-md p-2 bg-gray-50">
      <div className="flex flex-wrap gap-2 p-2 border-b">
        <Button variant="outline" size="sm" onClick={() => onInsertHeading(1)}>H1</Button>
        <Button variant="outline" size="sm" onClick={() => onInsertHeading(2)}>H2</Button>
        <Button variant="outline" size="sm" onClick={() => onInsertHeading(3)}>H3</Button>
        <Button variant="outline" size="sm" onClick={onInsertParagraph}>
          <Type className="mr-2 h-4 w-4" />
          Paragrafo
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Image className="mr-2 h-4 w-4" />
              Immagine
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inserisci immagine</DialogTitle>
            </DialogHeader>
            <ImageUploader onImageUpload={onInsertImage} />
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" size="sm" onClick={() => onInsertLayout(2)}>
          <Layout className="mr-2 h-4 w-4" />
          2 Colonne
        </Button>
        <Button variant="outline" size="sm" onClick={() => onInsertLayout(3)}>
          <Layout className="mr-2 h-4 w-4" />
          3 Colonne
        </Button>

        <Button onClick={onSave} className="ml-auto">
          <Save className="mr-2 h-4 w-4" />
          Salva Modifiche
        </Button>
      </div>
    </div>
  );
};

export default PageEditorToolbar;
