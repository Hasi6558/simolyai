
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import PageEditorToolbar from '@/components/admin/PageEditorToolbar';
import { Edit, Trash2, Plus, Save, Eye } from 'lucide-react';

const allPages = [
  { 
    id: 'home', 
    title: 'Home',
    menuTitle: 'Home', 
    content: '<h1>Benvenuti in SimplyAI</h1><p>La piattaforma intelligente per l\'analisi dei dati aziendali</p>',
    inMainMenu: true,
    order: 1
  },
  { 
    id: 'about', 
    title: 'Chi Siamo',
    menuTitle: 'Chi Siamo', 
    content: '<h1>Chi Siamo</h1><p>SimplyAI è una piattaforma innovativa che utilizza l\'intelligenza artificiale per analizzare i dati della tua azienda e fornire report dettagliati e insights preziosi.</p>',
    inMainMenu: true,
    order: 2
  },
  { 
    id: 'services', 
    title: 'Servizi',
    menuTitle: 'Servizi', 
    content: '<h1>I Nostri Servizi</h1><ul><li>Analisi dei dati aziendali</li><li>Report automatizzati</li><li>Dashboard interattive</li><li>Consulenza personalizzata</li></ul>',
    inMainMenu: true,
    order: 3
  },
  {
    id: 'guide',
    title: 'Guida',
    menuTitle: 'Guida',
    content: '<h1>Guida all\'uso</h1><p>Benvenuti alla guida per l\'utilizzo della piattaforma SimplyAI.</p>',
    inMainMenu: true,
    order: 4
  },
  {
    id: 'contact',
    title: 'Contatti',
    menuTitle: 'Contatti',
    content: '<h1>Contattaci</h1><p>Siamo qui per aiutarti. Compila il modulo sottostante per metterti in contatto con noi.</p>',
    inMainMenu: true,
    order: 5
  },
  {
    id: 'pricing',
    title: 'Prezzi',
    menuTitle: 'Prezzi',
    content: '<h1>I nostri piani</h1><p>Scegli il piano più adatto alle tue esigenze.</p>',
    inMainMenu: true,
    order: 6
  }
];

const PageEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState(allPages);
  const [currentPage, setCurrentPage] = useState(allPages[0]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageDialog, setNewPageDialog] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [filterMainMenu, setFilterMainMenu] = useState(false);

  const handleSave = () => {
    const editorContent = document.getElementById('wysiwyg-editor')?.innerHTML || '';
    
    setPages(pages.map(page => 
      page.id === currentPage.id ? { ...page, content: editorContent } : page
    ));

    toast({
      title: 'Pagina salvata',
      description: `La pagina "${currentPage.title}" è stata salvata con successo.`,
    });
  };

  const handleAddPage = () => {
    if (!newPageTitle.trim()) {
      toast({
        title: 'Errore',
        description: 'Il titolo della pagina non può essere vuoto',
        variant: 'destructive'
      });
      return;
    }

    const newId = newPageTitle.toLowerCase().replace(/\s+/g, '-');
    if (pages.some(page => page.id === newId)) {
      toast({
        title: 'Errore',
        description: 'Esiste già una pagina con questo titolo',
        variant: 'destructive'
      });
      return;
    }

    const newPage = {
      id: newId,
      title: newPageTitle,
      menuTitle: newPageTitle,
      content: `<h1>${newPageTitle}</h1><p>Contenuto della pagina ${newPageTitle}</p>`,
      inMainMenu: true,
      order: pages.length + 1
    };

    setPages([...pages, newPage]);
    setCurrentPage(newPage);
    setNewPageTitle('');
    setNewPageDialog(false);

    toast({
      title: 'Pagina creata',
      description: `La pagina "${newPageTitle}" è stata creata con successo.`
    });
  };

  const handleInsertImage = (imageUrl: string) => {
    const imgHtml = `<figure class="image-container">
      <img src="${imageUrl}" alt="Immagine caricata" class="max-w-full h-auto" />
    </figure>`;

    const editor = document.getElementById('wysiwyg-editor');
    if (editor) {
      editor.innerHTML += imgHtml;
    }
  };

  const handleInsertHeading = (level: number) => {
    const editor = document.getElementById('wysiwyg-editor');
    if (editor) {
      editor.innerHTML += `<h${level}>Nuovo titolo ${level}</h${level}>`;
    }
  };

  const handleInsertParagraph = () => {
    const editor = document.getElementById('wysiwyg-editor');
    if (editor) {
      editor.innerHTML += '<p>Nuovo paragrafo di testo. Fare clic per modificare.</p>';
    }
  };

  const handleInsertLayout = (columns: number) => {
    const editor = document.getElementById('wysiwyg-editor');
    if (editor) {
      let layout = '<div class="grid grid-cols-' + columns + ' gap-4">';
      for (let i = 0; i < columns; i++) {
        layout += '<div class="col"><p>Colonna ' + (i+1) + '</p></div>';
      }
      layout += '</div>';
      editor.innerHTML += layout;
    }
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      toast({
        title: 'Errore',
        description: 'Non puoi eliminare l\'unica pagina rimasta',
        variant: 'destructive'
      });
      return;
    }

    setPages(pages.filter(page => page.id !== pageId));
    if (currentPage.id === pageId) {
      setCurrentPage(pages[0]);
    }

    toast({
      title: 'Pagina eliminata',
      description: 'La pagina è stata eliminata con successo'
    });
  };

  const handleToggleMainMenu = (pageId: string) => {
    setPages(pages.map(page => 
      page.id === pageId ? { ...page, inMainMenu: !page.inMainMenu } : page
    ));

    toast({
      title: 'Menu aggiornato',
      description: `La pagina è stata ${pages.find(p => p.id === pageId)?.inMainMenu ? 'rimossa dal' : 'aggiunta al'} menu principale.`
    });
  };

  const handlePageOrderChange = (pageId: string, direction: 'up' | 'down') => {
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex < 0) return;

    const newPages = [...pages];
    const page = newPages[pageIndex];

    if (direction === 'up' && pageIndex > 0) {
      const prevPage = newPages[pageIndex - 1];
      const tempOrder = page.order;
      page.order = prevPage.order;
      prevPage.order = tempOrder;
    } else if (direction === 'down' && pageIndex < newPages.length - 1) {
      const nextPage = newPages[pageIndex + 1];
      const tempOrder = page.order;
      page.order = nextPage.order;
      nextPage.order = tempOrder;
    }

    newPages.sort((a, b) => a.order - b.order);
    setPages(newPages);
  };

  const filteredPages = filterMainMenu ? pages.filter(page => page.inMainMenu) : pages;

  if (loading) {
    return <div className="flex justify-center p-10">Caricamento editor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editor Pagine</h1>
          <p className="text-muted-foreground mt-2">
            Modifica i contenuti delle pagine del sito
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="filter-main-menu">Solo menu principale</Label>
            <Switch
              id="filter-main-menu"
              checked={filterMainMenu}
              onCheckedChange={setFilterMainMenu}
            />
          </div>
          <Dialog open={newPageDialog} onOpenChange={setNewPageDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Nuova Pagina</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea nuova pagina</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="page-title">Titolo della pagina</Label>
                  <Input 
                    id="page-title" 
                    value={newPageTitle} 
                    onChange={(e) => setNewPageTitle(e.target.value)} 
                    placeholder="Inserisci il titolo della pagina" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewPageDialog(false)}>Annulla</Button>
                <Button onClick={handleAddPage}>Crea Pagina</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {previewMode ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anteprima della Pagina</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                [simoly_page id="{currentPage.id}"]
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue={pages[0].id} className="space-y-4">
          <TabsList className="flex overflow-x-auto pb-px">
            {filteredPages.map(page => (
              <TabsTrigger 
                key={page.id} 
                value={page.id}
                onClick={() => setCurrentPage(page)}
                className="flex items-center space-x-2"
              >
                <span>{page.title}</span>
                {page.inMainMenu && (
                  <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                    Menu
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {filteredPages.map(page => (
            <TabsContent key={page.id} value={page.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    {editingTitle && currentPage.id === page.id ? (
                      <Input 
                        value={currentPage.title}
                        onChange={(e) => setCurrentPage({...currentPage, title: e.target.value})}
                        className="text-xl font-semibold"
                        autoFocus
                        onBlur={() => setEditingTitle(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                      />
                    ) : (
                      <CardTitle className="flex items-center space-x-2">
                        <span>{page.title}</span>
                        <button onClick={() => setEditingTitle(true)} className="text-gray-500 hover:text-gray-700">
                          <Edit className="h-4 w-4" />
                        </button>
                      </CardTitle>
                    )}
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleToggleMainMenu(page.id)}
                      >
                        {page.inMainMenu ? 'Rimuovi dal Menu' : 'Aggiungi al Menu'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeletePage(page.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    ID: {page.id} - Modifica il contenuto della pagina
                    {page.inMainMenu && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span>Posizione nel menu:</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePageOrderChange(page.id, 'up')}
                          disabled={page.order <= 1}
                          className="h-6 w-6 p-0"
                        >
                          ↑
                        </Button>
                        <span className="text-sm font-medium">{page.order}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePageOrderChange(page.id, 'down')}
                          disabled={page.order >= pages.filter(p => p.inMainMenu).length}
                          className="h-6 w-6 p-0"
                        >
                          ↓
                        </Button>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <PageEditorToolbar 
                      onInsertHeading={handleInsertHeading}
                      onInsertParagraph={handleInsertParagraph}
                      onInsertLayout={handleInsertLayout}
                      onInsertImage={handleInsertImage}
                      onSave={handleSave}
                    />
                    
                    <div 
                      id="wysiwyg-editor" 
                      className="min-h-[500px] p-4 border rounded-md bg-white overflow-auto" 
                      contentEditable={true}
                      dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => window.open(`/page-preview/${page.id}`, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Anteprima
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Salva Pagina
                    </Button>
                  </div>
                  <div className="space-x-2 flex items-center">
                    <Label>Titolo nel menu:</Label>
                    <Input 
                      value={page.menuTitle}
                      onChange={(e) => {
                        setPages(pages.map(p => 
                          p.id === page.id ? { ...p, menuTitle: e.target.value } : p
                        ));
                      }}
                      className="inline-block w-48"
                    />
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Shortcode della Pagina</CardTitle>
          <CardDescription>
            Usa questo shortcode per includere questa pagina in un'altra pagina
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
            [simoly_page id="{currentPage.id}"]
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageEditor;
