import { Text } from "@/components/common/Texto";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const emReais = (valor: number | string | null | undefined) => {
  const numero = Number(valor);
  return Number.isFinite(numero)
    ? `R$ ${numero.toFixed(2).replace(".", ",")}`
    : "";
};

function useSegundosAte(instante: string | null) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const relogio = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(relogio);
  }, []);

  if (!instante) return null;
  return Math.max(0, Math.round((new Date(instante).getTime() - agora) / 1000));
}

// Negocia: proposta mandada, esperando o passageiro escolher
export function PropostaEnviadaAviso({
  valorMotorista,
  expiraEm,
  distanciaDoRodape,
}: {
  valorMotorista: number | null;
  expiraEm: string | null;
  distanciaDoRodape: number;
}) {
  const segundos = useSegundosAte(expiraEm);

  return (
    <View
      style={[styles.aviso, { bottom: distanciaDoRodape + 12 }]}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator color="#111" />
      <View style={styles.textos}>
        <Text style={styles.titulo}>
          Proposta enviada: {emReais(valorMotorista)}
        </Text>
        <Text style={styles.apoio}>
          Aguardando o passageiro escolher
          {segundos !== null ? ` · ${segundos}s` : ""}
        </Text>
      </View>
    </View>
  );
}

// Negocia no Pix/cartão: o passageiro escolheu este motorista e está pagando
export function AguardandoPagamentoNegocia({
  valorMotorista,
  metodoPagamento,
}: {
  valorMotorista: number | string | null | undefined;
  metodoPagamento: string | null | undefined;
}) {
  const insets = useSafeAreaInsets();
  const meio = metodoPagamento === "cartao" ? "no cartão" : "no Pix";

  return (
    <View
      style={[styles.folha, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.icone}>
        <Ionicons name="checkmark" size={26} color="#fff" />
      </View>
      <Text style={styles.folhaTitulo}>O passageiro escolheu sua proposta</Text>
      <Text style={styles.folhaTexto}>
        Aguardando o pagamento {meio}. Assim que for confirmado, vá até o
        embarque.
      </Text>
      <View style={styles.valorLinha}>
        <Text style={styles.valorRotulo}>Você recebe</Text>
        <Text style={styles.valor}>{emReais(valorMotorista)}</Text>
      </View>
      <View style={styles.esperando}>
        <ActivityIndicator color="#8A5A00" />
        <Text style={styles.esperandoTexto}>Esperando o pagamento</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    backgroundColor: "#FFF6DB",
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  textos: { flex: 1 },
  titulo: { fontSize: 15, fontWeight: "800", color: "#3D2A00" },
  apoio: { fontSize: 13, color: "#7A5A12", marginTop: 2 },
  folha: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 22,
    gap: 10,
    elevation: 16,
  },
  icone: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#21C987",
    alignItems: "center",
    justifyContent: "center",
  },
  folhaTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
  },
  folhaTexto: {
    fontSize: 15,
    lineHeight: 21,
    color: "#4B5563",
    textAlign: "center",
  },
  valorLinha: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  valorRotulo: { fontSize: 15, color: "#4B5563" },
  valor: { fontSize: 22, fontWeight: "800", color: "#111" },
  esperando: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  esperandoTexto: { fontSize: 14, fontWeight: "700", color: "#8A5A00" },
});
