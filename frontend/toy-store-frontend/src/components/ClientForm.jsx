import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";

function ClientForm({ onAddClient }) {
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    birthdate: "",
  });

  const handleSubmit = () => {
    onAddClient(newClient);
    setNewClient({ name: "", email: "", birthdate: "" });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Adicionar Cliente
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Nome"
          variant="outlined"
          value={newClient.name}
          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
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
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Adicionar
        </Button>
      </Box>
    </Box>
  );
}

export default ClientForm;
