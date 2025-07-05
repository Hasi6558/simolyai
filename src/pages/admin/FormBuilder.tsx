import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, MoreVertical, Trash2, Copy, Edit, FileText, Layout, Eye } from 'lucide-react';

const FormBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shortcodeFormId, setShortcodeFormId] = useState<string | null>(null);
  const [shortcodeDialogOpen, setShortcodeDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/forms');
        if (!res.ok) throw new Error('Errore nel recupero dei forms');
        const result = await res.json();
        
        if (result.success) {
          setForms(result.data || []);
        } else {
          throw new Error(result.message || 'Errore nel recupero dei forms');
        }
      } catch (err: any) {
        setError(err.message || 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
    // Refetch forms when page regains focus
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchForms();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const filteredForms = (Array.isArray(forms) ? forms : [])
    .filter(form => form.status === 'published')
    .filter(form => {
      const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (form.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesActiveState = showInactiveOnly ? !form.active : true;
      return matchesSearch && matchesActiveState;
    });

  const handleCreateNew = () => {
    navigate('/admin/form-builder/create');
  };

  const handleEdit = (formId: string) => {
    navigate(`/admin/form-builder/edit/${formId}`);
  };

  const handleDuplicate = (formId: string) => {
    const formsArray = Array.isArray(forms) ? forms : [];
    const formToDuplicate = formsArray.find(f => f.id === formId);
    if (formToDuplicate) {
      const newForm = {
        ...formToDuplicate,
        id: (formsArray.length + 1).toString(),
        title: `${formToDuplicate.title} (Copia)`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setForms([...formsArray, newForm]);
      toast({
        title: 'Form duplicato',
        description: `"${formToDuplicate.title}" è stato duplicato con successo.`
      });
    }
  };

  const handleDelete = (formId: string) => {
    setDeleteFormId(formId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteFormId) {
      const formsArray = Array.isArray(forms) ? forms : [];
      setForms(formsArray.filter(f => f.id !== deleteFormId));
      setDeleteDialogOpen(false);
      toast({
        title: 'Form eliminato',
        description: 'Il form è stato eliminato con successo.'
      });
    }
  };

  const handleToggleActive = (formId: string) => {
    const formsArray = Array.isArray(forms) ? forms : [];
    setForms(formsArray.map(form => {
      if (form.id === formId) {
        return { ...form, active: !form.active };
      }
      return form;
    }));
    
    const form = formsArray.find(f => f.id === formId);
    if (form) {
      toast({
        title: 'Stato aggiornato',
        description: `Il form "${form.title}" è ora ${!form.active ? 'attivo' : 'inattivo'}.`
      });
    }
  };

  const handleShowShortcode = (formId: string) => {
    setShortcodeFormId(formId);
    setShortcodeDialogOpen(true);
  };

  const handleEditPageLayout = (formId: string) => {
    navigate(`/admin/form-builder/page-layout/${formId}`);
    toast({
      title: 'Editor layout pagina',
      description: 'Modifica la descrizione e il layout della pagina che visualizza il form'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Form Builder</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci i tuoi form e questionari
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Crea Nuovo Form
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Input
            type="search"
            placeholder="Cerca form..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="show-inactive" className="text-sm font-medium">
            Mostra solo inattivi
          </Label>
          <Switch
            id="show-inactive"
            checked={showInactiveOnly}
            onCheckedChange={setShowInactiveOnly}
          />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center p-10">Caricamento...</div>
        ) : error ? (
          <div className="col-span-full text-center text-red-500 p-10">{error}</div>
        ) : (
          filteredForms.map(form => (
            <Card key={form.id} className={`${!form.active ? 'border-dashed' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="flex items-center min-w-0">
                      <span className="max-w-full break-words whitespace-normal">{form.title}</span>
                      {!form.active && (
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600 whitespace-nowrap">
                          Inattivo
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[220px] md:max-w-[260px] lg:max-w-[320px]">{form.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 min-w-0"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuItem onClick={() => handleEdit(form.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span className="truncate">Modifica Form</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/questionnaire-surveyjs/${form.id}`, '_blank')}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span className="truncate">Test Form</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditPageLayout(form.id)}>
                        <Layout className="mr-2 h-4 w-4" />
                        <span className="truncate">Editor Pagina Form</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(form.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        <span className="truncate">Duplica</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShowShortcode(form.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="truncate">Shortcode</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(form.id)}>
                        <Switch checked={form.active} className="mr-2" />
                        <span className="truncate">{form.active ? 'Disattiva' : 'Attiva'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(form.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span className="truncate">Elimina</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate">
                    Domande: {Array.isArray(form.questions)
                      ? form.questions.reduce((acc, page) => acc + (page.fields?.length || 0), 0)
                      : 0}
                  </span>
                  <span className="text-muted-foreground truncate">Creato: {form.createdAt}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex flex-col gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-2 py-2"
                  onClick={() => handleEdit(form.id)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="font-medium">Modifica Form</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-2 py-2"
                  onClick={() => handleEditPageLayout(form.id)}
                >
                  <Layout className="h-4 w-4" />
                  <span className="font-medium">Editor Pagina</span>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {filteredForms.length === 0 && !loading && (
        <div className="text-center p-10 border rounded-md">
          <p className="text-muted-foreground">Nessun form trovato</p>
          {searchTerm && (
            <p className="text-sm mt-2">Prova a modificare i criteri di ricerca</p>
          )}
        </div>
      )}
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questo form? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={shortcodeDialogOpen} onOpenChange={setShortcodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shortcode del Form</DialogTitle>
            <DialogDescription>
              Copia questo shortcode per inserire il form in una pagina
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto my-4">
            [simoly_form id="{shortcodeFormId}"]
          </div>
          <p className="text-sm text-muted-foreground">
            Aggiungi questo shortcode in qualsiasi pagina per mostrare il form ai visitatori. 
            Solo gli utenti autenticati potranno compilarlo.
          </p>
          <DialogFooter>
            <Button onClick={() => {
              navigator.clipboard.writeText(`[simoly_form id="${shortcodeFormId}"]`);
              toast({
                title: 'Shortcode copiato',
                description: 'Lo shortcode è stato copiato negli appunti.'
              });
              setShortcodeDialogOpen(false);
            }}>
              Copia Shortcode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormBuilder;
