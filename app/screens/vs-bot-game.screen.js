// app/screens/vs-bot-game.screen.js

import React from "react";
import { StyleSheet, ImageBackground, Platform } from "react-native";
import AnimatedBackground from "../components/common/AnimatedBackground";
import VsBotGameController from "../controllers/vs-bot-game.controller";

export default function VsBotGameScreen({ navigation }) {
    // Utilise simplement le contrôleur qui gère la logique backend vs bot
    return (
        <VsBotGameController navigation={navigation} />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    },
    paragraph: {
        margin: 24,
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    footnote: {
        margin: 24,
        fontSize: 14,
        textAlign: "center",
    },
});
