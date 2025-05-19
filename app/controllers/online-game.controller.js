// app/controller/online-game.controller.js

import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity, ImageBackground, Platform, ScrollView } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import Board from "../components/board/board.component";
import AnimatedBackground from "../components/common/AnimatedBackground";


export default function OnlineGameController({ navigation }) {
    const socket = useContext(SocketContext);

    // Ajoute ce log pour vérifier la connexion socket
    useEffect(() => {
        if (!socket) {
            console.warn("Aucune connexion socket détectée. Vérifie que ton serveur WebSocket tourne bien sur localhost.");
        } else if (!socket.connected && socket.io && typeof socket.io.uri === "string") {
            console.warn("Socket non connecté à :", socket.io.uri);
            // Affiche une alerte utilisateur claire
            alert(
                "Connexion impossible au serveur : " + socket.io.uri +
                "\n\nVérifie que ton serveur Node.js tourne bien sur cette adresse et ce port.\n" +
                "Si tu es sur mobile, utilise l'adresse IP locale de ton PC (ex : 192.168.x.x) dans la config du socket côté client."
            );
        }
    }, [socket]);

    const [inQueue, setInQueue] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [idOpponent, setIdOpponent] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [finalScores, setFinalScores] = useState({ player1Score: 0, player2Score: 0 });
    const [scores, setScores] = useState({ player1Score: 0, player2Score: 0 });

    useEffect(() => {
        console.log('[emit][queue.join]:', socket.id);
        socket.emit("queue.join");
        setInQueue(false);
        setInGame(false);

        socket.on('queue.added', (data) => {
            console.log('[listen][queue.added]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
        });

        socket.on('game.start', (data) => {
            console.log('[listen][game.start]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
            setIdOpponent(data['idOpponent']);
            console.log('Game started. Opponent ID:', data['idOpponent']);
        });

        socket.on('game.grid.view-state', (data) => {
            console.log('[listen][game.grid.view-state]:', data);
            setScores({
                player1Score: data.player1Score || 0,
                player2Score: data.player2Score || 0
            });
            console.log('[listen][game.grid.view-state] Scores actuels:', {
                player1: data.player1Score,
                player2: data.player2Score
            });
            // Ajoute ce log pour voir si la sélection de case est possible
            if (!data.canSelectCells) {
                console.warn("canSelectCells est false : ce joueur ne peut pas jouer. Vérifie la logique serveur !");
                // Ajoute ce log pour identifier le joueur concerné
                if (socket && socket.id) {
                    console.warn("Socket.id concerné :", socket.id);
                }
            }
        });

        socket.on('game.over', (data) => {
            console.log('[listen][game.over]:', data);
            setGameOver(true);
            setWinner(data.winner);
            // Correction : certains serveurs envoient les scores dans data.scores
            let player1Score = data.player1Score;
            let player2Score = data.player2Score;
            if (data.scores) {
                player1Score = data.scores.player1 !== undefined ? data.scores.player1 : player1Score;
                player2Score = data.scores.player2 !== undefined ? data.scores.player2 : player2Score;
            }
            setFinalScores({ player1Score, player2Score });
            console.log('[listen][game.over] Scores finaux:', {
                player1: player1Score,
                player2: player2Score,
                winner: data.winner
            });
        });

        socket.on('queue.left', (data) => {
            console.log('[listen][queue.left]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
            navigation.navigate('HomeScreen');
        });
    }, []);

    // Ajoute ce useEffect pour forcer un re-render à chaque événement socket (pour Board et Choices)
    const [, forceUpdate] = useState(0);
    useEffect(() => {
        if (!socket) return;
        const rerender = () => forceUpdate(n => n + 1);

        socket.on("game.choices.view-state", (data) => {
            // Force un re-render et log pour debug
            forceUpdate(n => n + 1);
            console.log('[listen][game.choices.view-state]:', data);
            // Ajoute ce log pour voir si tu reçois bien les choix
            if (!data || !data.availableChoices || data.availableChoices.length === 0) {
                console.warn("Aucun choix reçu pour ce joueur. Vérifie le backend !");
            }
        });
        socket.on("game.grid.view-state", rerender);
        socket.on("game.start", rerender);
        socket.on("game.over", rerender);

        return () => {
            socket.off("game.choices.view-state", rerender);
            socket.off("game.grid.view-state", rerender);
            socket.off("game.start", rerender);
            socket.off("game.over", rerender);
        };
    }, [socket]);

    const handleReplay = () => {
        setGameOver(false);
        setWinner(null);
        setFinalScores({ player1Score: 0, player2Score: 0 });
        socket.emit('queue.join');
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
                        {gameOver ? (
                            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <AnimatedBackground player1Score={finalScores.player1Score} player2Score={finalScores.player2Score} />
                                <View style={[styles.gameOverContainer, { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                                    {/* Ligne des boutons retour/menu/replay */}

                                    <Text style={styles.gameOverTitle}>Partie terminée !</Text>
                                    <View style={styles.finalScoresContainer}>
                                        <Text style={styles.finalScoreTitle}>Scores finaux</Text>
                                        <Text style={styles.playerScore}>
                                            Joueur 1 : {finalScores.player1Score !== undefined ? finalScores.player1Score : 0}
                                        </Text>
                                        <Text style={styles.playerScore}>
                                            Joueur 2 : {finalScores.player2Score !== undefined ? finalScores.player2Score : 0}
                                        </Text>
                                        {winner === "player:1" && (
                                            <Text style={styles.winnerScore}>🏆 Joueur 1 remporte la partie !</Text>
                                        )}
                                        {winner === "player:2" && (
                                            <Text style={styles.winnerScore}>🏆 Joueur 2 remporte la partie !</Text>
                                        )}
                                        {winner === "draw" && (
                                            <Text style={styles.resultText}>Match nul !</Text>
                                        )}
                                    </View>
                                    <View style={styles.topButtonsRow}>
                                        <TouchableOpacity style={styles.customButton} onPress={() => navigation.navigate('HomeScreen')}>
                                            <Text style={styles.customButtonText}>Retour au menu</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.customButton} onPress={handleReplay}>
                                            <Text style={styles.customButtonText}>Nouvelle partie</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <>
                                {!inQueue && !inGame && (
                                    <Text style={styles.paragraph}>Waiting for server datas...</Text>
                                )}

                                {inQueue && (
                                    <>
                                        <Text style={styles.paragraph}>Waiting for another player...</Text>
                                        <Button
                                            title="Quittez la file d'attente"
                                            onPress={() => socket.emit("queue.leave")}
                                        />
                                    </>
                                )}

                                {/* Correction ici : Board doit être rendu même si inGame est true, pour que les dés/choix apparaissent */}
                                {inGame && <Board gameViewState={scores} />}
                            </>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.container}>
                    {gameOver ? (
                        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <AnimatedBackground player1Score={finalScores.player1Score} player2Score={finalScores.player2Score} />
                            <View style={[styles.gameOverContainer, { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }]}>
                                {/* Ligne des boutons retour/menu/replay */}

                                <Text style={styles.gameOverTitle}>Partie terminée !</Text>
                                <View style={styles.finalScoresContainer}>
                                    <Text style={styles.finalScoreTitle}>Scores finaux</Text>
                                    <Text style={styles.playerScore}>
                                        Joueur 1 : {finalScores.player1Score !== undefined ? finalScores.player1Score : 0}
                                    </Text>
                                    <Text style={styles.playerScore}>
                                        Joueur 2 : {finalScores.player2Score !== undefined ? finalScores.player2Score : 0}
                                    </Text>
                                    {winner === "player:1" && (
                                        <Text style={styles.winnerScore}>🏆 Joueur 1 remporte la partie !</Text>
                                    )}
                                    {winner === "player:2" && (
                                        <Text style={styles.winnerScore}>🏆 Joueur 2 remporte la partie !</Text>
                                    )}
                                    {winner === "draw" && (
                                        <Text style={styles.resultText}>Match nul !</Text>
                                    )}
                                </View>
                                <View style={styles.topButtonsRow}>
                                    <TouchableOpacity style={styles.customButton} onPress={() => navigation.navigate('HomeScreen')}>
                                        <Text style={styles.customButtonText}>Retour au menu</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.customButton} onPress={handleReplay}>
                                        <Text style={styles.customButtonText}>Nouvelle partie</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <>
                            {!inQueue && !inGame && (
                                <Text style={styles.paragraph}>Waiting for server datas...</Text>
                            )}

                            {inQueue && (
                                <>
                                    <Text style={styles.paragraph}>Waiting for another player...</Text>
                                    <Button
                                        title="Quittez la file d'attente"
                                        onPress={() => socket.emit("queue.leave")}
                                    />
                                </>
                            )}

                            {inGame && <Board gameViewState={scores} />}
                        </>
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
        color: "#555555",
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
    topButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        marginBottom: 20,
    },
    customButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
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
