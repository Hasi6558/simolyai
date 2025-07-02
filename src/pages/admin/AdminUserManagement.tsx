
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { UserPlus, User, UsersRound } from 'lucide-react';

type UserStatus = 'active' | 'inactive' | 'pending' | 'locked';

interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: string;
  joinDate: string;
  lastActive: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Mario Rossi',
    email: 'mario.rossi@example.com',
    status: 'active',
    role: 'Utente',
    joinDate: '2023-01-15',
    lastActive: '2023-04-20'
  },
  {
    id: '2',
    name: 'Giulia Bianchi',
    email: 'giulia.bianchi@example.com',
    status: 'inactive',
    role: 'Utente Premium',
    joinDate: '2023-02-03',
    lastActive: '2023-03-28'
  },
  {
    id: '3',
    name: 'Luca Verdi',
    email: 'luca.verdi@example.com',
    status: 'pending',
    role: 'Utente',
    joinDate: '2023-04-10',
    lastActive: '2023-04-10'
  },
  {
    id: '4',
    name: 'Sofia Neri',
    email: 'sofia.neri@example.com',
    status: 'active',
    role: 'Utente Premium',
    joinDate: '2022-11-22',
    lastActive: '2023-04-22'
  },
  {
    id: '5',
    name: 'Marco Blu',
    email: 'marco.blu@example.com',
    status: 'locked',
    role: 'Utente',
    joinDate: '2022-09-14',
    lastActive: '2023-01-30'
  },
  {
    id: '6',
    name: 'Alessandro Verdi',
    email: 'alessandro.verdi@example.com',
    status: 'active',
    role: 'Amministratore',
    joinDate: '2022-08-10',
    lastActive: '2023-04-23'
  }
];

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [selectedUserForStatus, setSelectedUserForStatus] = useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Utente'
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = (newStatus: UserStatus) => {
    if (selectedUserForStatus) {
      const updatedUsers = users.map(user => 
        user.id === selectedUserForStatus.id ? { ...user, status: newStatus } : user
      );
      setUsers(updatedUsers);
      
      toast({
        title: "Stato aggiornato",
        description: `Lo stato di ${selectedUserForStatus.name} è stato cambiato in ${newStatus}.`
      });
      
      setStatusDialogOpen(false);
    }
  };

  const handleDeleteUser = () => {
    if (selectedUserForDelete) {
      const updatedUsers = users.filter(user => user.id !== selectedUserForDelete.id);
      setUsers(updatedUsers);
      
      toast({
        title: "Utente eliminato",
        description: `${selectedUserForDelete.name} è stato eliminato con successo.`
      });
      
      setDeleteDialogOpen(false);
    }
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const newId = `${users.length + 1}`;
      const currentDate = new Date().toISOString().split('T')[0];
      
      const createdUser: User = {
        id: newId,
        name: newUser.name,
        email: newUser.email,
        status: 'active',
        role: newUser.role,
        joinDate: currentDate,
        lastActive: currentDate
      };
      
      setUsers([...users, createdUser]);
      
      toast({
        title: "Utente aggiunto",
        description: `${newUser.name} è stato aggiunto con successo.`
      });
      
      setNewUser({
        name: '',
        email: '',
        role: 'Utente'
      });
      
      setAddUserDialogOpen(false);
    } else {
      toast({
        title: "Errore",
        description: "Nome e email sono campi obbligatori.",
        variant: "destructive"
      });
    }
  };

  const goToUserDetails = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Amministratore':
        return 'bg-red-100 text-red-800';
      case 'Utente Premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestione Utenti</h1>
          <p className="text-muted-foreground">Gestisci gli utenti della piattaforma</p>
        </div>
        
        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Aggiungi Utente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Utente</DialogTitle>
              <DialogDescription>
                Inserisci le informazioni per creare un nuovo utente
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nome Completo</label>
                <Input 
                  id="name" 
                  value={newUser.name} 
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                  placeholder="Mario Rossi"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  type="email"
                  value={newUser.email} 
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                  placeholder="mario.rossi@example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">Ruolo</label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Utente">Utente</option>
                  <option value="Utente Premium">Utente Premium</option>
                  <option value="Amministratore">Amministratore</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>Annulla</Button>
              <Button onClick={handleAddUser}>Aggiungi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input 
          placeholder="Cerca utenti..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Table>
        <TableCaption>Lista degli utenti registrati</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Ruolo</TableHead>
            <TableHead>Data Registrazione</TableHead>
            <TableHead>Ultima Attività</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Attivo' :
                     user.status === 'inactive' ? 'Inattivo' :
                     user.status === 'pending' ? 'In attesa' :
                     'Bloccato'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role === 'Amministratore' ? (
                      <><UsersRound className="h-3 w-3 mr-1" /> {user.role}</>
                    ) : user.role === 'Utente Premium' ? (
                      <><User className="h-3 w-3 mr-1" /> {user.role}</>
                    ) : (
                      <>{user.role}</>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>{user.joinDate}</TableCell>
                <TableCell>{user.lastActive}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => goToUserDetails(user.id)}
                    >
                      Dettagli
                    </Button>
                    <Dialog open={statusDialogOpen && selectedUserForStatus?.id === user.id} onOpenChange={setStatusDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedUserForStatus(user)}
                        >
                          Stato
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifica Stato Utente</DialogTitle>
                          <DialogDescription>
                            Seleziona il nuovo stato per {selectedUserForStatus?.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant={selectedUserForStatus?.status === 'active' ? 'default' : 'outline'}
                              onClick={() => handleStatusChange('active')}
                            >
                              Attivo
                            </Button>
                            <Button
                              variant={selectedUserForStatus?.status === 'inactive' ? 'default' : 'outline'}
                              onClick={() => handleStatusChange('inactive')}
                            >
                              Inattivo
                            </Button>
                            <Button
                              variant={selectedUserForStatus?.status === 'pending' ? 'default' : 'outline'}
                              onClick={() => handleStatusChange('pending')}
                            >
                              In attesa
                            </Button>
                            <Button
                              variant={selectedUserForStatus?.status === 'locked' ? 'default' : 'outline'}
                              onClick={() => handleStatusChange('locked')}
                            >
                              Bloccato
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={deleteDialogOpen && selectedUserForDelete?.id === user.id} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setSelectedUserForDelete(user)}
                        >
                          Elimina
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Conferma Eliminazione</DialogTitle>
                          <DialogDescription>
                            Sei sicuro di voler eliminare l'utente {selectedUserForDelete?.name}?
                            Questa azione non può essere annullata.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                          >
                            Annulla
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                          >
                            Elimina
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Nessun utente trovato
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminUserManagement;
