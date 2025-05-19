// app/screens/vs-bot-game.screen.js

import React, { useEffect } from "react";
import { StyleSheet, View, ImageBackground, Platform } from "react-native";
import Board from "../components/board/board.component";
import AnimatedBackground from "../components/common/AnimatedBackground";

export default function VsBotGameScreen({ navigation }) {
    // On n'injecte le faux socket QUE dans ce mode (vs bot)
    useEffect(() => {
        if (Platform.OS !== "web" && Platform.OS !== "ios" && Platform.OS !== "android") return;
        if (!window.__BOT_SOCKET__) {
            const createEmptyGrid = () => Array(5).fill(0).map(() =>
                Array(5).fill(0).map((_, i) => ({
                    id: Math.random().toString(36).substr(2, 9) + i,
                    owner: null,
                    viewContent: "",
                    canBeChecked: true,
                }))
            );
            const state = {
                grid: createEmptyGrid(),
                player1Score: 0,
                player2Score: 0,
                tokensLeft: { player1: 12, player2: 12 },
                displayChoices: true,
                canMakeChoice: true,
                idSelectedChoice: null,
                availableChoices: [
                    { id: 'c1', value: 'Dés 1' },
                    { id: 'c2', value: 'Dés 2' },
                    { id: 'c3', value: 'Dés 3' },
                ],
            };
            window.__BOT_SOCKET__ = {
                _listeners: {},
                on(event, cb) {
                    this._listeners[event] = cb;
                    if (event === "game.grid.view-state") {
                        cb({
                            displayGrid: true,
                            canSelectCells: true,
                            grid: state.grid,
                            player1Score: state.player1Score,
                            player2Score: state.player2Score,
                            tokensLeft: state.tokensLeft,
                        });
                    }
                    if (event === "game.choices.view-state") {
                        cb({
                            displayChoices: state.displayChoices,
                            canMakeChoice: state.canMakeChoice,
                            idSelectedChoice: state.idSelectedChoice,
                            availableChoices: state.availableChoices,
                        });
                    }
                },
                emit(event, data) {
                    if (event === "game.grid.selected") {
                        const { rowIndex, cellIndex } = data;
                        if (state.grid[rowIndex][cellIndex].owner) return;
                        state.grid[rowIndex][cellIndex].owner = "player:1";
                        state.grid[rowIndex][cellIndex].viewContent = "O";
                        state.tokensLeft.player1 -= 1;
                        state.player1Score += 1;
                        this._listeners["game.grid.view-state"] &&
                            this._listeners["game.grid.view-state"]({
                                displayGrid: true,
                                canSelectCells: true,
                                grid: state.grid,
                                player1Score: state.player1Score,
                                player2Score: state.player2Score,
                                tokensLeft: state.tokensLeft,
                            });
                        setTimeout(() => {
                            let emptyCells = [];
                            state.grid.forEach((row, r) => {
                                row.forEach((cell, c) => {
                                    if (!cell.owner) emptyCells.push({ rowIndex: r, cellIndex: c });
                                });
                            });
                            if (emptyCells.length === 0) return;
                            const move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                            state.grid[move.rowIndex][move.cellIndex].owner = "player:2";
                            state.grid[move.rowIndex][move.cellIndex].viewContent = "X";
                            state.tokensLeft.player2 -= 1;
                            state.player2Score += 1;
                            this._listeners["game.grid.view-state"] &&
                                this._listeners["game.grid.view-state"]({
                                    displayGrid: true,
                                    canSelectCells: true,
                                    grid: state.grid,
                                    player1Score: state.player1Score,
                                    player2Score: state.player2Score,
                                    tokensLeft: state.tokensLeft,
                                });
                        }, 700);
                    }
                    if (event === "game.choices.selected") {
                        state.idSelectedChoice = data.choiceId;
                        state.canMakeChoice = false;
                        this._listeners["game.choices.view-state"] &&
                            this._listeners["game.choices.view-state"]({
                                displayChoices: true,
                                canMakeChoice: false,
                                idSelectedChoice: data.choiceId,
                                availableChoices: state.availableChoices,
                            });
                        setTimeout(() => {
                            state.idSelectedChoice = null;
                            state.canMakeChoice = true;
                            this._listeners["game.choices.view-state"] &&
                                this._listeners["game.choices.view-state"]({
                                    displayChoices: true,
                                    canMakeChoice: true,
                                    idSelectedChoice: null,
                                    availableChoices: state.availableChoices,
                                });
                        }, 1000);
                    }
                }
            };
        }
        return () => { delete window.__BOT_SOCKET__; };
    }, []);

    // Ici, tu joues contre un bot local (pas contre un vrai joueur)
    return (
        <ImageBackground
            source={require("../../assets/hawai.png")}
            style={{ flex: 1, width: "100%", height: "100%" }}
            resizeMode="cover"
        >
            <AnimatedBackground />
            <Board navigation={navigation} />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    }
});
