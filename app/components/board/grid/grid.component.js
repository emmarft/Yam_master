import React, {useEffect, useContext, useState} from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const Grid = ({ playerRole, showPlayerRoleBanner }) => {

    const socket = useContext(SocketContext) || (typeof window !== "undefined" && window.__BOT_SOCKET__);

    const [displayGrid, setDisplayGrid] = useState(false);
    const [canSelectCells, setCanSelectCells] = useState(false);
    const [grid, setGrid] = useState([]);
    const [player1Score, setPlayer1Score] = useState(0);
    const [player2Score, setPlayer2Score] = useState(0);
    const [tokensLeft, setTokensLeft] = useState({ player1: 12, player2: 12 });
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [scores, setScores] = useState({ player1: 0, player2: 0 });
    const [finalScores, setFinalScores] = useState({ player1: 0, player2: 0 });

    const checkVictory = (updatedGrid, player) => {
    };

    const handleSelectCell = (cellId, rowIndex, cellIndex) => {
        if (canSelectCells) {
            socket.emit("game.grid.selected", { cellId, rowIndex, cellIndex });
        }
    };

    useEffect(() => {
        // Nettoyage des anciens listeners pour éviter les doublons
        return () => {
            socket.off("game.start");
            socket.off("game.grid.view-state");
            socket.off("game.over");
        };
    }, [socket]);

    useEffect(() => {
        const onGridViewState = (data) => {
            setDisplayGrid(data['displayGrid']);
            setCanSelectCells(!!data['canSelectCells']);
            setGrid(data['grid']);
            setPlayer1Score(data['player1Score']);
            setPlayer2Score(data['player2Score']);
            setTokensLeft(data['tokensLeft']);

            if ((Platform.OS === "ios" || Platform.OS === "android") && data['grid']) {
                setGrid([...data['grid']]); 
            }

            if (socket && socket.id) {
                if (data && data.socketIdForTurn) {
                    console.log("Socket.id courant (client):", socket.id);
                    console.log("Socket.id du joueur qui doit jouer (serveur):", data.socketIdForTurn);
                    if (socket.id === data.socketIdForTurn && !data.canSelectCells) {
                        console.error("❌ Le serveur n'autorise pas ce joueur à jouer alors que c'est son tour !");
                    }
                    if (socket.id !== data.socketIdForTurn && data.canSelectCells) {
                        console.warn("⚠️ Ce client reçoit canSelectCells:true alors que ce n'est pas son tour !");
                    }
                }
            }
            if (!data['canSelectCells']) {
                if (socket && socket.id) {
                    console.warn("canSelectCells est false : ce joueur ne peut pas jouer. Socket.id :", socket.id);
                }
            }

            if (data && data.choicesForTurn) {
                console.log("choicesForTurn (backend):", data.choicesForTurn);
            }
        };

        socket.on("game.start", () => {

            setTokensLeft({ player1: 12, player2: 12 });
            setPlayer1Score(0);
            setPlayer2Score(0);
            setScores({ player1: 0, player2: 0 });
            setFinalScores({ player1: 0, player2: 0 });
            setGameOver(false);
            setWinner(null);
            setCanSelectCells(false);
        });

        socket.on("game.grid.view-state", onGridViewState);

        socket.on("game.over", (data) => {
            setGameOver(true);
            setWinner(data.winner);
            setFinalScores(data.scores);
        });

        return () => {
            socket.off("game.start");
            socket.off("game.grid.view-state", onGridViewState);
            socket.off("game.over");
        };
    }, [socket]);

    const GameOverScreen = () => (
        <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverTitle}>Partie terminée !</Text>
            <View style={styles.finalScoresContainer}>
                <Text style={styles.finalScoreTitle}>Scores finaux</Text>
                <Text style={[styles.playerScore, winner === "player:1" && styles.winnerScore]}>
                    Joueur 1 : {finalScores.player1} points {winner === "player:1" && "🏆"}
                </Text>
                <Text style={[styles.playerScore, winner === "player:2" && styles.winnerScore]}>
                    Joueur 2 : {finalScores.player2} points {winner === "player:2" && "🏆"}
                </Text>
            </View>
            <Text style={styles.resultText}>
                {winner === "draw" 
                    ? "Match nul !" 
                    : `Le ${winner === "player:1" ? "Joueur 1" : "Joueur 2"} remporte la partie !`}
            </Text>
        </View>
    );

    const [isMobile, setIsMobile] = useState(
        Platform.OS === "ios" ||
        Platform.OS === "android" ||
        Dimensions.get('window').width < 600
    );

    useEffect(() => {
        const handleResize = () => {
            const mobile =
                Platform.OS === "ios" ||
                Platform.OS === "android" ||
                Dimensions.get('window').width < 600;
            setIsMobile(mobile);
            setGrid((prev) => prev ? [...prev] : []);
        };
        const subscription = Dimensions.addEventListener('change', handleResize);
        return () => {
            if (subscription && typeof subscription.remove === 'function') {
                subscription.remove();
            }
        };
    }, []);

    return (
        <View style={isMobile ? styles.gridContainerMobile : styles.gridContainer}>
            {/* Affiche le message du rôle du joueur au-dessus de la grille */}
            {showPlayerRoleBanner && playerRole && (
                <View style={[styles.playerRoleBanner, {zIndex: 9999}]}>
                    <Text style={styles.playerRoleText}>
                        Vous êtes <Text style={{ fontWeight: 'bold' }}>{playerRole}</Text>
                    </Text>
                </View>
            )}
            {gameOver ? <GameOverScreen /> : (
                <>
                    <View style={styles.playersContainer}>
                        
                    </View>
                    {displayGrid &&
                        grid.map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.row}>
                                {row.map((cell, cellIndex) => (
                                    <TouchableOpacity
                                        key={cell.id + '-' + rowIndex + '-' + cellIndex}
                                        style={[
                                            styles.cell,
                                            cell.owner === "player:1" && styles.playerOwnedCell,
                                            cell.owner === "player:2" && styles.opponentOwnedCell,
                                            (cell.canBeChecked && !(cell.owner === "player:1") && !(cell.owner === "player:2")) && styles.canBeCheckedCell,
                                            rowIndex !== 0 && styles.topBorder,
                                            cellIndex !== 0 && styles.leftBorder,
                                        ]}
                                        onPress={() => handleSelectCell(cell.id, rowIndex, cellIndex)}
                                        disabled={!cell.canBeChecked}
                                    >
                                        <Text style={styles.cellText}>{cell.viewContent}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        flex: 7,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        margin: 8,
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    gridContainerMobile: {
        flex: 7,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 0,
        marginBottom: 0,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15,
        paddingBottom: 15,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        width: '100%',
        maxWidth: '100%',
    },
    playersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    playerColumn: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '45%',
    },
    playerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    tokenContainer: {
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 6,
        width: '100%',
    },
    tokenTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    tokenCount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    tokenText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    row: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    cell: {
        flexDirection: "row",
        flex: 2,
        width: "94%",
        height: "94%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#e8e8e8",
        borderRadius: 12,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        margin: 3,
        transform: [{ scale: 0.98 }],
    },
    cellText: {
        fontSize: 14,
        fontWeight: "700",
        color: '#2c3e50',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    playerOwnedCell: {
        backgroundColor: "#ffc7c2",
        borderColor: "#ef7c86",
        transform: [{ scale: 1 }],
        shadowColor: "#ef7c86",
        shadowOpacity: 0.2,
    },
    opponentOwnedCell: {
        backgroundColor: "#ffe18f",
        borderColor: "#fda333",
        transform: [{ scale: 1 }],
        shadowColor: "#fda333",
        shadowOpacity: 0.2,
    },
    canBeCheckedCell: {
        backgroundColor: "rgba(255, 243, 176, 0.9)",
        borderColor: "#ffd700",
        transform: [{ scale: 1.02 }],
        shadowColor: "#ffd700",
        shadowOpacity: 0.3,
    },
    topBorder: {
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    leftBorder: {
        borderLeftWidth: 1,
        borderLeftColor: "#ddd",
    },
    playerInfo: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    scoreResult: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2ecc71',
        marginVertical: 10,
    },
    scoreDetail: {
        fontSize: 16,
        color: '#666',
        marginVertical: 5,
    },
    gameOverContainer: {
        alignItems: 'center',
        padding: 25,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 8,
        margin: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
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
    resultText: {
        fontSize: 20,
        marginBottom: 15,
        color: '#2c3e50',
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
        marginBottom: 10
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
    playerRoleBanner: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.85)',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignSelf: 'center',
        alignItems: 'center',
    },
    playerRoleText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});

export default Grid;
