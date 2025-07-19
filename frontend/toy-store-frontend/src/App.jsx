import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ClientForm from "./components/ClientForm";
import ClientTable from "./components/ClientTable";
import EditClientDialog from "./components/EditClientDialog";
import LoginForm from "./components/LoginForm";
import SaleForm from "./components/SaleForm";
import SalesStatistics from "./components/SalesStatistics";
import {
  addClient,
  addSale,
  deleteClient,
  fetchClients,
  fetchStatistics,
  login,
  updateClient,
} from "./services/api";

function App() {
  const [token, setToken] = useState(null);
  const [clients, setClients] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [topClients, setTopClients] = useState({
    highestVolume: null,
    highestAverage: null,
    mostFrequent: null,
  });
  const [editClient, setEditClient] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      Promise.all([
        fetchClients(token)
          .then((clients) => {
            setClients(clients);
            return clients;
          })
          .catch((err) => {
            setError("Falha ao buscar clientes");
            console.error("Erro ao buscar clientes:", err);
            return [];
          }),
        fetchStatistics(token)
          .then(({ dailySales, topClients }) => {
            console.log("Dados de estatísticas recebidos:", {
              dailySales,
              topClients,
            }); // Log para depuração
            setDailySales(Array.isArray(dailySales) ? dailySales : []);
            setTopClients(
              topClients || {
                highestVolume: null,
                highestAverage: null,
                mostFrequent: null,
              }
            );
            return { dailySales, topClients };
          })
          .catch((err) => {
            setError("Falha ao buscar estatísticas");
            console.error("Erro ao buscar estatísticas:", err);
            return {
              dailySales: [],
              topClients: {
                highestVolume: null,
                highestAverage: null,
                mostFrequent: null,
              },
            };
          }),
      ]).finally(() => setIsLoading(false));
    }
  }, [token]);

  const handleLogin = async (credentials) => {
    try {
      const response = await login(credentials);
      setToken(response.token);
      setError(null);
    } catch (error) {
      setError("Falha no login. Verifique suas credenciais.");
      console.error("Erro no login:", error);
    }
  };

  const handleAddClient = async (client) => {
    try {
      await addClient(client, token);
      setClients(await fetchClients(token));
      setError(null);
    } catch (error) {
      setError("Falha ao adicionar cliente");
      console.error("Erro ao adicionar cliente:", error);
    }
  };

  const handleAddSale = async (sale) => {
    try {
      await addSale(sale, token);
      const { dailySales, topClients } = await fetchStatistics(token);
      console.log("Dados de estatísticas após venda:", {
        dailySales,
        topClients,
      }); // Log para depuração
      setDailySales(Array.isArray(dailySales) ? dailySales : []);
      setTopClients(
        topClients || {
          highestVolume: null,
          highestAverage: null,
          mostFrequent: null,
        }
      );
      setClients(await fetchClients(token));
      setError(null);
    } catch (error) {
      setError("Falha ao adicionar venda");
      console.error("Erro ao adicionar venda:", error);
    }
  };

  const handleEditClient = (client) => {
    setEditClient(client);
    setOpenEditDialog(true);
  };

  const handleUpdateClient = async (client) => {
    try {
      await updateClient(client, token);
      setClients(await fetchClients(token));
      setOpenEditDialog(false);
      setEditClient(null);
      setError(null);
    } catch (error) {
      setError("Falha ao atualizar cliente");
      console.error("Erro ao atualizar cliente:", error);
    }
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await deleteClient(id, token);
        setClients(await fetchClients(token));
        setError(null);
      } catch (error) {
        setError("Falha ao excluir cliente");
        console.error("Erro ao excluir cliente:", error);
      }
    }
  };

  if (!token) {
    return (
      <Box>
        <LoginForm onLogin={handleLogin} />
        {error && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Carregando...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Painel da Loja de Brinquedos
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <ClientForm onAddClient={handleAddClient} />
      <SaleForm clients={clients} onAddSale={handleAddSale} />
      <ClientTable
        clients={clients}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
      />
      <SalesStatistics dailySales={dailySales} topClients={topClients} />
      <EditClientDialog
        open={openEditDialog}
        client={editClient}
        onClose={() => setOpenEditDialog(false)}
        onSave={handleUpdateClient}
      />
    </Container>
  );
}

export default App;
