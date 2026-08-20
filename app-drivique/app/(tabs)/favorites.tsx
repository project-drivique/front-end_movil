import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTemaColores } from "@/modules/i18n/hooks/useLanguage";
import { useAuthStore } from "@/store/authStore";
import { useFavoritos } from "@/modules/catalog/hooks/useFavorites";
import { VEHICULOS_MOCK } from "@/modules/catalog/constants/catalog.constants";
import { useMonedaStore } from "@/store/currencyStore";
import { formatCurrency } from "@/utils/currencyUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const c = useTemaColores();
  const { t } = useTranslation();
  const usuario = useAuthStore((s) => s.usuario);
  const usuarioId = usuario ? String(usuario.id ?? usuario.correo ?? "user") : null;
  
  const { favoritos, toggleFavorito } = useFavoritos(usuarioId);
  const monedaActual = useMonedaStore((s) => s.monedaActual);
  const tasaUSD = useMonedaStore((s) => s.tasaUSD);

  // Get only the favorited vehicles
  const favoritedVehicles = VEHICULOS_MOCK.filter((v) => favoritos.includes(v.id));

  const handleCardPress = (id: number) => {
    router.push({
      pathname: "/vehicle/[id]",
      params: { id: id.toString() }
    } as any);
  };

  const renderFavoriteItem = ({ item }: { item: typeof VEHICULOS_MOCK[0] }) => {
    const mainImage = item.imagenes && item.imagenes.length > 0 ? item.imagenes[0] : item.imagen;

    return (
      <TouchableOpacity
        style={[styles.itemCard, { backgroundColor: c.bgCard, borderBottomColor: c.border }]}
        onPress={() => handleCardPress(item.id)}
        activeOpacity={0.9}
      >
        {/* Left Side - Image */}
        <View style={[styles.imageWrapper, { backgroundColor: c.bgInput }]}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.itemImage} resizeMode="cover" />
          ) : (
            <Ionicons name="car-outline" size={40} color={c.textMuted} />
          )}
        </View>

        {/* Right Side - Info & Actions */}
        <View style={styles.infoWrapper}>
          <Text style={[styles.itemTitle, { color: c.textPrimary }]} numberOfLines={2}>
            {item.marca} {item.modelo}
          </Text>
          <Text style={[styles.itemPrice, { color: c.textPrimary }]}>
            {formatCurrency(item.precio, monedaActual, tasaUSD)}
          </Text>
          <Text style={[styles.itemDescription, { color: c.textSecondary }]} numberOfLines={1}>
            {item.categoria} · {item.transmision} · {item.pasajeros} {t("catalogo.plazas")}
          </Text>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => toggleFavorito(item.id)}>
              <Text style={[styles.actionBtnText, { color: "#1D4ED8" }]}>{t("tabs.eliminar")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Brand Header with Gradient */}
      <LinearGradient
        colors={["#1e3a8a", "#2563eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientHeader, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("tabs.misFavoritos")}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Main Content */}
      <FlatList
        data={favoritedVehicles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike-outline" size={60} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              {t("tabs.sinFavoritos")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 24,
  },
  itemCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
  },
  imageWrapper: {
    width: 110,
    height: 110,
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  itemDescription: {
    fontSize: 11.5,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  actionBtn: {
    paddingVertical: 2,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
});
