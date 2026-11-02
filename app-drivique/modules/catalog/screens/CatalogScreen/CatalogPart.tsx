import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from '../catalog.styles'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'

export default function CatalogPart({ c, getInitials, nombreMarca, setAjustesVisible, t, usuario }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; getInitials: () => string; nombreMarca: string; setAjustesVisible: React.Dispatch<React.SetStateAction<boolean>>; t: any; usuario: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/store/authStore").Usuario | null }) {
  return (
    <View style={[styles.header, { backgroundColor: c.bgHeader, borderBottomColor: c.border }]}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{nombreMarca}</Text>
          </View>
          {usuario ? (
            <TouchableOpacity
              style={styles.avatarHeaderBtn}
              onPress={() => router.push("/(tabs)/profile")}
              activeOpacity={0.7}
            >
              <View style={[styles.avatarContainer, { backgroundColor: c.primaryBg }]}>
                <Text style={[styles.avatarText, { color: "#1D4ED8" }]}>
                  {getInitials()}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerBtns}>
              <TouchableOpacity
                style={styles.ajustesBtn}
                onPress={() => setAjustesVisible(true)}
                hitSlop={6}
              >
                <Ionicons name="settings-outline" size={19} color="#1E40AF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push("/(auth)/login")}
              >
                <Text style={styles.loginBtnText}>{t("catalogo.ingresar")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => router.push("/(auth)/register")}
              >
                <Text style={styles.registerBtnText}>{t("catalogo.registro")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
  )
}
