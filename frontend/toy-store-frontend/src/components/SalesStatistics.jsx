import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from "chart.js";
import { useEffect, useRef } from "react";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

function SalesStatistics({
  dailySales = [],
  topClients = {
    highestVolume: null,
    highestAverage: null,
    mostFrequent: null,
  },
}) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(dailySales) && dailySales.length > 0) {
      const ctx = document.getElementById("salesChart")?.getContext("2d");
      if (!ctx) {
        console.error("Canvas salesChart não encontrado");
        return;
      }
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      chartRef.current = new ChartJS(ctx, {
        type: "line",
        data: {
          labels: dailySales.map((sale) => sale.sale_date || ""),
          datasets: [
            {
              label: "Vendas Diárias",
              data: dailySales.map((sale) => sale.total || 0),
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
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [dailySales]);

  return (
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
                {topClients.highestVolume?.total?.toFixed(2) || "N/A"}
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
  );
}

export default SalesStatistics;
