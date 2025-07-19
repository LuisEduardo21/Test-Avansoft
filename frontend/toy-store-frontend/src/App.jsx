import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from "chart.js";
import { useEffect, useRef, useState } from "react";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

const normalizeClientData = (apiData) => {
  return apiData.data.clientes.map((client) => ({
    id: client.id || Math.random().toString(36).substr(2, 9), // Fallback ID se não fornecido
    name: client.info.nomeCompleto,
    email: client.info.detalhes.email,
    birthdate: client.info.detalhes.nascimento,
    sales: client.estatisticas.vendas || [],
  }));
};

const getMissingLetter = (name) => {
  const letters = new Set(
    name
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .split("")
  );
  for (let i = 97; i <= 122; i++) {
    const letter = String.fromCharCode(i);
    if (!letters.has(letter)) return letter;
  }
  return "-";
};

function App() {
  const [token, setToken] = useState(null);
  const [clients, setClients] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [topClients, setTopClients] = useState({});
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    birthdate: "",
  });
  const [newSale, setNewSale] = useState({
    client_id: "",
    sale_date: "",
    amount: "",
  });
  const [editClient, setEditClient] = useState(null);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const chartRef = useRef(null); // Referência para armazenar a instância do gráfico

  useEffect(() => {
    if (token) {
      fetchClients();
      fetchStatistics();
    }
  }, [token]);

  const login = async () => {
    try {
      const response = await axios.post("/api/login", credentials);
      setToken(response.data.token);
    } catch (error) {
      alert("Falha no login", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get("/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(normalizeClientData(response.data));
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      alert("Falha ao buscar clientes");
    }
  };

  const fetchStatistics = async () => {
    try {
      const [dailyRes, topRes] = await Promise.all([
        axios.get("/api/stats/daily-sales", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/stats/top-clients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDailySales(dailyRes.data);
      setTopClients(topRes.data);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      alert("Falha ao buscar estatísticas");
    }
  };

  const addClient = async () => {
    try {
      await axios.post("/api/clients", newClient, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClients();
      setNewClient({ name: "", email: "", birthdate: "" });
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      alert("Falha ao adicionar cliente");
    }
  };

  const addSale = async () => {
    try {
      await axios.post("/api/sales", newSale, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStatistics(); // Atualiza estatísticas para refletir nova venda
      setNewSale({ client_id: "", sale_date: "", amount: "" });
    } catch (error) {
      console.error("Erro ao adicionar venda:", error);
      alert("Falha ao adicionar venda");
    }
  };

  const updateClient = async () => {
    try {
      await axios.put(`/api/clients/${editClient.id}`, editClient, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClients();
      setOpenEditDialog(false);
      setEditClient(null);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      alert("Falha ao atualizar cliente");
    }
  };

  const deleteClient = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await axios.delete(`/api/clients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchClients();
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        alert("Falha ao excluir cliente");
      }
    }
  };

  const handleEditClick = (client) => {
    setEditClient(client);
    setOpenEditDialog(true);
  };

  useEffect(() => {
    if (dailySales.length > 0) {
      const ctx = document.getElementById("salesChart").getContext("2d");
      // Destruir o gráfico anterior, se existir
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      // Criar novo gráfico
      chartRef.current = new ChartJS(ctx, {
        type: "line",
        data: {
          labels: dailySales.map((sale) => sale.sale_date),
          datasets: [
            {
              label: "Vendas Diárias",
              data: dailySales.map((sale) => sale.total),
              borderColor: "#1976d2",
              backgroundColor: "rgba(25, 118, 210, 0.1)",
              fill: true,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
    // Cleanup: destruir o gráfico quando o componente desmontar
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [dailySales]);

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Login
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Usuário"
              variant="outlined"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
            />
            <TextField
              label="Senha"
              type="password"
              variant="outlined"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
            />
            <Button variant="contained" color="primary" onClick={login}>
              Entrar
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Painel da Loja de Brinquedos
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Adicionar Cliente
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Nome"
            variant="outlined"
            value={newClient.name}
            onChange={(e) =>
              setNewClient({ ...newClient, name: e.target.value })
            }
            sx={{ flex: 1 }}
          />
          <TextField
            label="E-mail"
            type="email"
            variant="outlined"
            value={newClient.email}
            onChange={(e) =>
              setNewClient({ ...newClient, email: e.target.value })
            }
            sx={{ flex: 1 }}
          />
          <TextField
            type="date"
            variant="outlined"
            value={newClient.birthdate}
            onChange={(e) =>
              setNewClient({ ...newClient, birthdate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            label="Data de Nascimento"
            sx={{ flex: 1 }}
          />
          <Button variant="contained" color="primary" onClick={addClient}>
            Adicionar
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Adicionar Venda
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Cliente</InputLabel>
            <Select
              value={newSale.client_id}
              onChange={(e) =>
                setNewSale({ ...newSale, client_id: e.target.value })
              }
              label="Cliente"
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            type="date"
            variant="outlined"
            value={newSale.sale_date}
            onChange={(e) =>
              setNewSale({ ...newSale, sale_date: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            label="Data da Venda"
            sx={{ flex: 1 }}
          />
          <TextField
            type="number"
            variant="outlined"
            value={newSale.amount}
            onChange={(e) => setNewSale({ ...newSale, amount: e.target.value })}
            label="Valor"
            sx={{ flex: 1 }}
          />
          <Button variant="contained" color="primary" onClick={addSale}>
            Adicionar Venda
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Clientes
        </Typography>
        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Data de Nascimento</TableCell>
                <TableCell>Letra Ausente</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.email}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.birthdate}</TableCell>
                  <TableCell>{getMissingLetter(client.name)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(client)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => deleteClient(client.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Estatísticas de Vendas
        </Typography>
        <canvas
          id="salesChart"
          style={{ maxHeight: "300px", marginBottom: "16px" }}
        ></canvas>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="primary">
                  Maior Volume
                </Typography>
                <Typography>
                  {topClients.highestVolume?.name || "N/A"}: R$
                  {topClients.highestVolume?.total || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="primary">
                  Maior Média
                </Typography>
                <Typography>
                  {topClients.highestAverage?.name || "N/A"}: R$
                  {topClients.highestAverage?.avg?.toFixed(2) || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="primary">
                  Mais Frequente
                </Typography>
                <Typography>
                  {topClients.mostFrequent?.name || "N/A"}:{" "}
                  {topClients.mostFrequent?.days || "N/A"} dias
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent>
          {editClient && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <TextField
                label="Nome"
                variant="outlined"
                value={editClient.name}
                onChange={(e) =>
                  setEditClient({ ...editClient, name: e.target.value })
                }
              />
              <TextField
                label="E-mail"
                type="email"
                variant="outlined"
                value={editClient.email}
                onChange={(e) =>
                  setEditClient({ ...editClient, email: e.target.value })
                }
              />
              <TextField
                type="date"
                variant="outlined"
                value={editClient.birthdate}
                onChange={(e) =>
                  setEditClient({ ...editClient, birthdate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                label="Data de Nascimento"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={updateClient} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
