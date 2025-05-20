// c:\Users\emmar\Desktop\Cours\Archi-applicatives\TP-final\Yam_master\app\controllers\vs-bot-game.controller.js

import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, Button, ImageBackground, Platform, ScrollView, TouchableOpacity } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import Board from "../components/board/board.component";
import AnimatedBackground from "../components/common/AnimatedBackground";

export default function VsBotGameController({ navigation }) {
    const socket = useContext(SocketContext);
    const [inGame, setInGame] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [finalScores, setFinalScores] = useState(null);
    const [scores, setScores] = useState({ player1Score: 0, player2Score: 0 });

    useEffect(() => {
        if (!socket?.connected) {
            return;
        }

        socket.emit("game.vs-bot.start");

        socket.on('game.start', (data) => {
            setInGame(true);
        });

        socket.on('game.grid.view-state', (data) => {
            setScores({
                player1Score: data.player1Score || 0,
                player2Score: data.player2Score || 0
            });
        });

        socket.on('game.end', (data) => {
            setGameOver(true);
            setWinner(data.winner);
            setFinalScores(data.scores);
            setInGame(false);
        });

        return () => {
            socket.off('game.start');
            socket.off('game.grid.view-state');
            socket.off('game.end');
        };
    }, [socket?.connected]);

    const handleReturn = () => {
        navigation.navigate('HomeScreen');
    };

    return (
        <ImageBackground
            source={require("../../assets/hawai.png")}
            style={styles.background}
            resizeMode="cover"
        >
            {Platform.OS === "ios" || Platform.OS === "android" ? (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    style={{ flex: 1, width: "100%" }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        {!inGame && !gameOver && (
                            <View style={styles.container}>
                                <Text style={styles.paragraph}>
                                    Initialisation de la partie contre le bot...
                                </Text>
                                <TouchableOpacity style={styles.customButton} onPress={handleReturn}>
                                    <Text style={styles.customButtonText}>Retour à l'accueil</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {inGame && (
                            <Board gameViewState={scores} />
                        )}

                        {gameOver && (
                            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <AnimatedBackground player1Score={finalScores?.player1} player2Score={finalScores?.player2} />
                                <View style={[styles.gameOverContainer, { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={styles.gameOverTitle}>Partie terminée !</Text>
                                    <View style={styles.finalScoresContainer}>
                                        <Text style={styles.finalScoreTitle}>Scores finaux</Text>
                                        <Text style={styles.playerScore}>
                                            Joueur 1 : {finalScores?.player1 ?? 0}
                                        </Text>
                                        <Text style={styles.playerScore}>
                                            Bot : {finalScores?.player2 ?? 0}
                                        </Text>
                                        {winner === "player:1" && (
                                            <Text style={styles.winnerScore}>🏆 Joueur 1 remporte la partie !</Text>
                                        )}
                                        {winner === "player:2" && (
                                            <Text style={styles.winnerScore}>🏆 Le bot remporte la partie !</Text>
                                        )}
                                        {winner === "draw" && (
                                            <Text style={styles.resultText}>Match nul !</Text>
                                        )}
                                    </View>
                                    <TouchableOpacity style={styles.customButton} onPress={handleReturn}>
                                        <Text style={styles.customButtonText}>Retour à l'accueil</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.container}>
                    {!inGame && !gameOver && (
                        <View style={styles.container}>
                            <Text style={styles.paragraph}>
                                Initialisation de la partie contre le bot...
                            </Text>
                            <TouchableOpacity style={styles.customButton} onPress={handleReturn}>
                                <Text style={styles.customButtonText}>Retour à l'accueil</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {inGame && (
                        <Board gameViewState={scores} />
                    )}

                    {gameOver && (
                        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <AnimatedBackground player1Score={finalScores?.player1} player2Score={finalScores?.player2} />
                            <View style={[styles.gameOverContainer, { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={styles.gameOverTitle}>Partie terminée !</Text>
                                <View style={styles.finalScoresContainer}>
                                    <Text style={styles.finalScoreTitle}>Scores finaux</Text>
                                    <Text style={styles.playerScore}>
                                        Joueur 1 : {finalScores?.player1 ?? 0}
                                    </Text>
                                    <Text style={styles.playerScore}>
                                        Bot : {finalScores?.player2 ?? 0}
                                    </Text>
                                    {winner === "player:1" && (
                                        <Text style={styles.winnerScore}>🏆 Joueur 1 remporte la partie !</Text>
                                    )}
                                    {winner === "player:2" && (
                                        <Text style={styles.winnerScore}>🏆 Le bot remporte la partie !</Text>
                                    )}
                                    {winner === "draw" && (
                                        <Text style={styles.resultText}>Match nul !</Text>
                                    )}
                                </View>
                                <TouchableOpacity style={styles.customButton} onPress={handleReturn}>
                                    <Text style={styles.customButtonText}>Retour à l'accueil</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        width: "100%",
    },
    container: {
        flex: 1,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        width: '100%',
        height: '100%',
    },
    paragraph: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginVertical: 10,
    },
    gameOverContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20
    },
    gameOverTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2c3e50',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    finalScoresContainer: {
        backgroundColor: '#f8f9fa',
        padding: 20,
        borderRadius: 15,
        marginVertical: 15,
        width: '85%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    finalScoreTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
    },
    playerScore: {
        fontSize: 18,
        marginVertical: 6,
        color: '#34495e',
        textShadowColor: 'rgba(0, 0, 0, 0.05)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    winnerScore: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#27ae60',
        textShadowColor: 'rgba(39, 174, 96, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    resultText: {
        fontSize: 20,
        marginBottom: 15,
        color: '#2c3e50',
        textAlign: 'center',
    },
    customButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
        border: 'none',
        paddingVertical: 10,
        paddingHorizontal: 18,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    customButtonText: {
        color: '#007AFF',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});
