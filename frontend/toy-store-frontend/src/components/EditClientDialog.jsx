import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";

function EditClientDialog({ open, client, onClose, onSave }) {
  const [editClient, setEditClient] = useState(
    client || { name: "", email: "", birthdate: "" }
  );

  const handleSave = () => {
    onSave(editClient);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar Cliente</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditClientDialog;
