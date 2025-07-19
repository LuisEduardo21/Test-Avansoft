import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

function SaleForm({ clients, onAddSale }) {
  const [newSale, setNewSale] = useState({
    client_id: "",
    sale_date: "",
    amount: "",
  });

  const handleSubmit = () => {
    onAddSale(newSale);
    setNewSale({ client_id: "", sale_date: "", amount: "" });
  };

  return (
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
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Adicionar Venda
        </Button>
      </Box>
    </Box>
  );
}

export default SaleForm;
