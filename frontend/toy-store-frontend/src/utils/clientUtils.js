export const normalizeClientData = (apiData) => {
  return apiData.data.clientes.map((client) => ({
    id: client.id || Math.random().toString(36).substr(2, 9), // Fallback ID se não fornecido
    name: client.info.nomeCompleto,
    email: client.info.detalhes.email,
    birthdate: client.info.detalhes.nascimento,
    sales: client.estatisticas.vendas || [],
  }));
};

export const getMissingLetter = (name) => {
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
