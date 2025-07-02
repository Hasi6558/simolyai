
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string | null;
  features: string[];
  is_popular: boolean | null;
  is_free: boolean | null;
  active: boolean | null;
}

const PlansManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      if (data) {
        const transformedPlans = data.map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string || '[]'),
          is_free: Boolean(plan.is_free)
        }));
        
        setPlans(transformedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i piani",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planToDelete.id);

      if (error) throw error;

      toast({
        title: "Piano eliminato",
        description: "Il piano è stato eliminato con successo",
      });

      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il piano",
        variant: "destructive"
      });
    } finally {
      setPlanToDelete(null);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean | null) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: isActive ? "Piano disattivato" : "Piano attivato",
        description: `Il piano è stato ${isActive ? "disattivato" : "attivato"} con successo`,
      });

      fetchPlans();
    } catch (error) {
      console.error('Error toggling plan active state:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato del piano",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number) => {
    return `€${(price / 100).toFixed(2)}`;
  };

  const renderPlanType = (plan: Plan) => {
    if (plan.is_free === true) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Gratuito</Badge>;
    }
    
    if (plan.is_popular === true) {
      return <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-300">Premium</Badge>;
    }
    
    return <Badge variant="outline">Standard</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestione Piani</h1>
        <Button onClick={() => navigate('/admin/plans/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Piano
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Piani</CardTitle>
          <CardDescription>
            Gestisci i piani di abbonamento disponibili per i tuoi utenti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">Caricamento in corso...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prezzo</TableHead>
                  <TableHead>Attivo</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      Nessun piano trovato. Crea un nuovo piano per iniziare.
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{renderPlanType(plan)}</TableCell>
                      <TableCell>
                        {plan.is_free ? 'Gratuito' : formatPrice(plan.price)}
                      </TableCell>
                      <TableCell>
                        <Switch 
                          checked={plan.active === true} 
                          onCheckedChange={() => handleToggleActive(plan.id, plan.active)}
                          aria-label={`${plan.active ? 'Disattiva' : 'Attiva'} piano ${plan.name}`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/admin/plans/edit/${plan.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifica
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setPlanToDelete(plan)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Elimina
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questo piano?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Ciò eliminerà permanentemente il piano
              "{planToDelete?.name}" e rimuoverà i dati associati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} className="bg-red-600 hover:bg-red-700">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlansManagement;
