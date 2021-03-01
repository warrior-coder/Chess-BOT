const NONE = 'transparent';
const RED = 'rgba(255, 68, 0, 0.8)';
const GREEN = 'rgba(153, 205, 50, 0.8)';
const YELLOW = 'rgba(255, 255, 0, 0.9)';
const _FIGURES = [
    {type: -5, x: 0, y: 0},{type: -3, x: 1, y: 0},{type: -4, x: 2, y: 0},{type: -9, x: 3, y: 0},{type: -900, x: 4, y: 0},{type: -4, x: 5, y: 0},{type: -3, x: 6, y: 0},{type: -5, x: 7, y: 0},
    {type: -1, x: 0, y: 1},{type: -1, x: 1, y: 1},{type: -1, x: 2, y: 1},{type: -1, x: 3, y: 1},{type: -1, x: 4, y: 1},{type: -1, x: 5, y: 1},{type: -1, x: 6, y: 1},{type: -1, x: 7, y: 1},
    {type: 1, x: 0, y: 6},{type: 1, x: 1, y: 6},{type: 1, x: 2, y: 6},{type: 1, x: 3, y: 6},{type: 1, x: 4, y: 6},{type: 1, x: 5, y: 6},{type: 1, x: 6, y: 6},{type: 1, x: 7, y: 6},
    {type: 5, x: 0, y: 7},{type: 3, x: 1, y: 7},{type: 4, x: 2, y: 7},{type: 9, x: 3, y: 7},{type: 900, x: 4, y: 7},{type: 4, x: 5, y: 7},{type: 3, x: 6, y: 7},{type: 5, x: 7, y: 7},
];
const _BOARD = [
    [-5, -3, -4, -9, -900, -4, -3, -5],
    [-1, -1, -1, -1, -1, -1, -1, -1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [5, 3, 4, 9, 900, 4, 3, 5],
];

/* VUE JS */
vue1 = new Vue({
    el: '#vue1',
    data: {
        board: [],
        i2: -1,
        j2: -1,
        figures: [],
        beatedWhite: [],
        blackPoints: 0,
        beatedBlack: [],
        whitePoints: 0,
        freeMoves: [],
        cellActive: {},
        cellFrom: {},
        cellTo: {},
        gameOver: {},
        turn: 0,
        iterationCount: 0,
    },

    beforeMount() {
        this.SetUp();
    },

    methods: {
        SetUp()
        {
            for (let i = 0; i < 8; i++)
            {
                this.$set(this.board, i, []);
                for (let j = 0; j < 8; j++)
                {
                    this.$set(this.board[i], j, _BOARD[i][j]);
                }
                
            }
            for (let i = 0; i < 32; i++)
            {
                this.$set(this.figures, i, {type: _FIGURES[i].type, x: _FIGURES[i].x, y: _FIGURES[i].y} );
            }
            this.i2 = -1;
            this.j2 = -1;
            this.beatedWhite.splice(0);
            this.blackPoints = 0;
            this.beatedBlack.splice(0);
            this.whitePoints = 0;
            this.freeMoves.splice(0);
            this.cellActive = {x: -1, y: -1, col: YELLOW, bool: false};
            this.cellFrom = {x: -1, y: -1, col: YELLOW, bool: false};
            this.cellTo = {x: -1, y: -1, col: YELLOW, bool: false};
            this.gameOver = {side: 0, title: ''};
            this.turn = 1;
            this.iterationCount = 0;
        },
        FigureAction(i, j, figureType)
        {
            if (this.turn > 0 && figureType > 0)
            {
                this.freeMoves = this.FindMoves(this.board, i, j);
                this.freeMoves = this.CutMoves(this.freeMoves, this.board, i, j, 1);

                
                this.cellActive.x = j;
                this.cellActive.y = i;
                this.cellActive.bool = true;
                this.i2 = i;
                this.j2 = j;
            }
            else if (this.cellActive.bool)
            {
                this.freeMoves.splice(0);
                this.cellActive.bool = false;
            }
        },
        CellAction(ci, cj)
        {
            if (this.cellActive.bool)
            {
                this.FigureMove(ci, cj, this.i2, this.j2); // MAKE MOVE

                this.freeMoves.splice(0);
                this.cellActive.bool = false;
                this.turn *= -1;

                /* BOT TIME*/
                setTimeout(() => {
                    this.BotAction();
                }, 800);
                
            }
        },
        CutMoves(moves, board, i, j, side)
        {
            let len = moves.length;
            for (let k = 0; k < len; k++)
            {
                /* MAKE FAKE MOVE */
                let tempFig = board[moves[k].mi][moves[k].mj];
                board[moves[k].mi][moves[k].mj] = board[i][j];
                board[i][j] = 0;
                
                /* COUNT BOT POINTS */
                let points = this.CountSidePoints(board, -side);

                /* RETURN FAKE MOVE */
                board[i][j] = board[moves[k].mi][moves[k].mj];
                board[moves[k].mi][moves[k].mj] = tempFig;

                if(points*side > 500)
                {
                    moves.splice(k,1);
                    k--;
                    len--;
                }
                
            }
            return moves;
        },
        MiniMaxRoot(depth, board, side)
        {
            let bestMove = {i_from: -1, j_from: -1, i_to: -1, j_to: -1, points: 9999};

            let figures = this.CollectSideFigures(board, side);
            for (let figure of figures)
            {
                let moves = this.FindMoves(board, figure.i, figure.j);
                moves = this.CutMoves(moves, board, figure.i, figure.j, side);
                for (let move of moves)
                {
                    /* MAKE FAKE MOVE */
                    let tempFigure = board[move.mi][move.mj];
                    board[move.mi][move.mj] = board[figure.i][figure.j];
                    board[figure.i][figure.j] = 0;
                        
                    let points = this.MiniMax(depth-1, board, -side);

                    /* UNDO FAKE MOVE */
                    board[figure.i][figure.j] = board[move.mi][move.mj];
                    board[move.mi][move.mj] = tempFigure;

                    if (points <= bestMove.points)
                    {
                        bestMove.i_from = figure.i;
                        bestMove.j_from = figure.j;
                        bestMove.i_to = move.mi;
                        bestMove.j_to = move.mj;
                        bestMove.points = points;
                    }
                }
            }
            return bestMove;
        },
        MiniMax(depth, board, side)
        {
            this.iterationCount++;
            if (depth == 0)
            {
                return this.EvaluateBoard(board);
            }

            if (side == -1)
            {
                let bestPoints = 9999;

                let figures = this.CollectSideFigures(board, -1);
                for (let figure of figures)
                {
                    let moves = this.FindMoves(board, figure.i, figure.j);
                    moves = this.CutMoves(moves, board, figure.i, figure.j, side);
                    for (let move of moves)
                    {
                        /* MAKE FAKE MOVE */
                        let tempFigure = board[move.mi][move.mj];
                        board[move.mi][move.mj] = board[figure.i][figure.j];
                        board[figure.i][figure.j] = 0;
                        
                        bestPoints = Math.min(bestPoints, this.MiniMax(depth-1, board, -side) );
    
                        /* UNDO FAKE MOVE */
                        board[figure.i][figure.j] = board[move.mi][move.mj];
                        board[move.mi][move.mj] = tempFigure;
    
                    }
                }
                return bestPoints;
            }
            else
            {
                let bestPoints = -9999;

                let figures = this.CollectSideFigures(board, 1);
                for (let figure of figures)
                {
                    let moves = this.FindMoves(board, figure.i, figure.j);
                    moves = this.CutMoves(moves, board, figure.i, figure.j, side);
                    for (let move of moves)
                    {
                        /* MAKE FAKE MOVE */
                        let tempFigure = board[move.mi][move.mj];
                        board[move.mi][move.mj] = board[figure.i][figure.j];
                        board[figure.i][figure.j] = 0;
                        
                        bestPoints = Math.max(bestPoints, this.MiniMax(depth-1, board, -side) );
    
                        /* UNDO FAKE MOVE */
                        board[figure.i][figure.j] = board[move.mi][move.mj];
                        board[move.mi][move.mj] = tempFigure;
                    }
                }
                return bestPoints;
            }

            
        },
        BotAction()
        {
            this.iterationCount = 0;
            let bestMoveFound = this.MiniMaxRoot(3, this.board, -1); // FIND TREE TIME!

            if (bestMoveFound.points > 900)
            {
                this.EndTheGame(1);
                return 0;
            }

            console.log('ITERATIONS:', this.iterationCount, '| POINTS:', bestMoveFound.points);
            this.FigureMove(bestMoveFound.i_to, bestMoveFound.j_to, bestMoveFound.i_from, bestMoveFound.j_from); // MAKE BEST MOVE

            this.turn *= -1;
        },
        EvaluateBoard(board)
        {
            let points = 0;
            for (let i = 0; i < 8; i++)
            {
                for (let j = 0; j < 8; j++)
                {
                    points += board[i][j];
                }
                
            }
            return points;
        },
        EndTheGame(winSide)
        {
            this.turn = 0;
            if (winSide == 1) this.gameOver = {side: 1, title: 'You are win!'};
            else if (winSide == -1) this.gameOver = {side: -1, title: 'You are lose!'};
            else this.gameOver = {side: 0, title: ''};
        },
        CollectSideFigures(board, side)
        {
            let sideFigures = [];
            for (let i = 0; i < 8; i++)
                for (let j = 0; j < 8; j++)
                    if (board[i][j] * side > 0)
                    {
                        sideFigures.push( {i: i, j: j, type: board[i][j]} );
                    }

            return sideFigures;
        },
        // IsHandyMove(board, fi, fj, preFigure)
        // {
        //     let otherSide = (board[fi][fj] > 0) ? -1 : 1;
        //     let attackFigures = [];

        //     let otherFigures = this.CollectSideFigures(board, otherSide); // GENERATE OTHER SIDE FIGURES

        //     for (let otherFigure of otherFigures)
        //     {
        //         otherMoves = this.FindMoves(board, otherFigure.i, otherFigure.j); // GENERATE OTHER SIDE MOVES
        //         for (let otherMove of otherMoves)
        //         {
        //             if (otherMove.mi == fi && otherMove.mj == fj) attackFigures.push(board[otherMove.mi][otherMove.mj])
        //         }
        //     }

        //     if (attackFigures.length > 0)
        //     {
        //         if (board[fi][fj] + preFigure >= 0) return true;
        //         else return false;
        //     }
        //     else return true;
        // },
        // IsUnderAttack(board, fi, fj)
        // {
        //     let otherSide = (board[fi][fj] > 0) ? -1 : 1;
        //     let attackCount = 0;

        //     let otherFigures = this.CollectSideFigures(board, otherSide); // GENERATE OTHER SIDE FIGURES

        //     for (let otherFigure of otherFigures)
        //     {
        //         otherMoves = this.FindMoves(board, otherFigure.i, otherFigure.j); // GENERATE OTHER SIDE MOVES
        //         for (let otherMove of otherMoves)
        //         {
        //             if (otherMove.mi == fi && otherMove.mj == fj) attackCount++;
        //         }
        //     }

        //     return attackCount;
        // },
        CountFigurePoints(board, fi, fj)
        {
            let FigureMoves = this.FindMoves(board, fi, fj);
            let figurePoints = 0;

            for (let FigureMove of FigureMoves)
            {
                figurePoints += FigureMove.mp;
            }

            return figurePoints;
        },
        CountSidePoints(board, side)
        {
            let sideFigures = this.CollectSideFigures(board, side);
            let sidePoints = 0;
          
            for (let sideFig of sideFigures)
            {
                let moves = this.FindMoves(board, sideFig.i, sideFig.j); // GENERATE MOVES
                for (let move of moves)
                {
                    sidePoints += move.mp; // COUNT MOVE POINTS
                }
            }

            return sidePoints;
        },
        FigureMove(i_to, j_to, i_from, j_from) {
            /* BEAT */
            if(this.board[i_to][j_to] != 0)
            {
                let index = this.figures.findIndex(element => {
                    if(element.x == j_to && element.y == i_to && element.type != 0) return true;
                });
                if (this.figures[index].type > 0)
                {
                    this.beatedWhite.push(this.figures[index].type);
                    this.blackPoints += this.ConvertToPoints(this.figures[index].type);
                }
                else
                {
                    this.beatedBlack.push(this.figures[index].type);
                    this.whitePoints += this.ConvertToPoints(this.figures[index].type);
                }
                this.figures[index].type = 0;
            }
        
            /* MOVE */
            let index = this.figures.findIndex(element => {
                if(element.x == j_from && element.y == i_from && element.type != 0) return true;
            });

            this.figures[index].y = i_to;
            this.figures[index].x = j_to;

            this.board[i_to][j_to] = this.board[i_from][j_from];
            this.board[i_from][j_from] = 0;

            /* HISTORY */
            this.cellFrom = {x: j_to, y: i_to, col: YELLOW, bool: true};
            this.cellTo = {x: j_from, y: i_from, col: YELLOW, bool: true};

            /* WHITE QUEEN CHECK */
            if(this.figures[index].type == 1 && i_to == 0) 
            {
                this.figures[index].type = 9; 
                this.board[i_to][j_to] = 9;
            }

            /* BLACK QUEEN CHECK */
            else if(this.figures[index].type == -1 && i_to == 7) 
            {
                this.figures[index].type = -9; 
                this.board[i_to][j_to] = -9;
            }
        },
        ConvertToPoints(figureType)
        {
            switch (Math.abs(figureType))
            {
                case 4: return 3;
                default: return Math.abs(figureType);
            }
        },
        FindMoves(board, i, j)
        {
            let findMoves = [];
            switch (board[i][j]) {
                /* PAWN */
                case -1:
                    if (i+1 < 8 && board[i+1][j] == 0) findMoves.push({mi: i+1, mj: j, mp: 0, mc: GREEN}); // CLASSIC 
                    if (i == 1 && board[i+2][j] == 0 && board[i+1][j] == 0) findMoves.push({mi: i+2, mj: j, mp: 0, mc: GREEN}); // DOUBLE
                    if (i+1 < 8 && j-1 > -1 && board[i+1][j-1] > 0) findMoves.push({mi: i+1, mj: j-1, mp: board[i+1][j-1], mc: RED}); // BEAT
                    if (i+1 < 8 && j+1 < 8 && board[i+1][j+1] > 0) findMoves.push({mi: i+1, mj: j+1, mp: board[i+1][j+1], mc: RED}); // BEAT
                break;
                case 1:
                    if (i-1 > -1 && board[i-1][j] == 0) findMoves.push({mi: i-1, mj: j, mp: 0, mc: GREEN}); // CLASSIC 
                    if (i == 6 && board[i-2][j] == 0 && board[i-1][j] == 0) findMoves.push({mi: i-2, mj: j, mp: 0, mc: GREEN}); // DOUBLE
                    if (i-1 > -1 && j-1 > -1 && board[i-1][j-1] < 0) findMoves.push({mi: i-1, mj: j-1, mp: board[i-1][j-1], mc: RED}); // BEAT
                    if (i-1 > -1 && j+1 < 8 && board[i-1][j+1] < 0) findMoves.push({mi: i-1, mj: j+1, mp: board[i-1][j+1], mc: RED}); // BEAT
                break;
                /* BISHOP */
                case -4:
                case 4:
                    for(let k = 1; k < 8 && i+k < 8 && j+k < 8; k++)
                    {
                        if(board[i+k][j+k] == 0) findMoves.push({mi: i+k, mj: j+k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i+k][j+k] * board[i][j] < 0) findMoves.push({mi: i+k, mj: j+k, mp: board[i+k][j+k], mc: RED});
                            k = 9;
                        }
                    } // DOWN RIGHT
                    for(let k = 1; k < 8 && i+k < 8 && j-k > -1; k++)
                    {
                        if(board[i+k][j-k] == 0) findMoves.push({mi: i+k, mj: j-k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i+k][j-k] * board[i][j] < 0) findMoves.push({mi: i+k, mj: j-k, mp: board[i+k][j-k], mc: RED});
                            k = 9;
                        }
                    } // DOWN LEFT
                    for(let k = 1; k < 8 && i-k > -1 && j-k > -1; k++)
                    {
                        if(board[i-k][j-k] == 0) findMoves.push({mi: i-k, mj: j-k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i-k][j-k] * board[i][j] < 0) findMoves.push({mi: i-k, mj: j-k, mp: board[i-k][j-k], mc: RED});
                            k = 9;
                        }
                    } // UP LEFT
                    for(let k = 1; k < 8 && i-k > -1 && j+k < 8; k++)
                    {
                        if(board[i-k][j+k] == 0) findMoves.push({mi: i-k, mj: j+k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i-k][j+k] * board[i][j] < 0) findMoves.push({mi: i-k, mj: j+k, mp: board[i-k][j+k], mc: RED});
                            k = 9;
                        }
                    } // UP RIGHT
                break;
                /* ROOK */
                case -5:
                case 5:
                    for(let k = 1; k < 8 && i+k < 8; k++)
                    {
                        if(board[i+k][j] == 0) findMoves.push({mi: i+k, mj: j, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i+k][j] * board[i][j] < 0) findMoves.push({mi: i+k, mj: j, mp: board[i+k][j], mc: RED});
                            k = 9;
                        }
                    } // DOWN
                    for(let k = 1; k < 8 && i-k > -1; k++)
                    {
                        if(board[i-k][j] == 0) findMoves.push({mi: i-k, mj: j, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i-k][j] * board[i][j] < 0) findMoves.push({mi: i-k, mj: j, mp: board[i-k][j], mc: RED});
                            k = 9;
                        }
                    } // UP
                    for(let k = 1; k < 8 && j+k < 8; k++)
                    {
                        if(board[i][j+k] == 0) findMoves.push({mi: i, mj: j+k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i][j+k] * board[i][j] < 0) findMoves.push({mi: i, mj: j+k, mp: board[i][j+k], mc: RED});
                            k = 9;
                        }
                    } // RIGHT
                    for(let k = 1; k < 8 && j-k > -1; k++)
                    {
                        if(board[i][j-k] == 0) findMoves.push({mi: i, mj: j-k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i][j-k] * board[i][j] < 0) findMoves.push({mi: i, mj: j-k, mp: board[i][j-k], mc: RED});
                            k = 9;
                        }
                    } // LEFT
                break;
                /* KING */
                case -900:
                case 900:
                    for(let k = -1; k < 2; k++)
                    {
                        for(let l = -1; l < 2; l++)
                        {
                            if(i+k > -1 && i+k < 8 && j+l > -1 && j+l < 8 && board[i+k][j+l] == 0) findMoves.push({mi: i+k, mj: j+l, mp: 0, mc: GREEN});
                            if(i+k > -1 && i+k < 8 && j+l > -1 && j+l < 8 && board[i+k][j+l] * board[i][j] < 0) findMoves.push({mi: i+k, mj: j+l, mp: board[i+k][j+l], mc: RED});
                        }
                    }
                break;
                /* KNIGHT */
                case -3:
                case 3:
                    for(let k = -1; k < 2; k += 2)
                    {
                        for(let l = -2; l < 3; l += 4)
                        {
                            if(i+k > -1 && i+k < 8 && j+l > -1 && j+l < 8 && board[i+k][j+l] == 0) findMoves.push({mi: i+k, mj: j+l, mp: 0, mc: GREEN});
                            if(i+k > -1 && i+k < 8 && j+l > -1 && j+l < 8 && board[i+k][j+l] * board[i][j] < 0) findMoves.push({mi: i+k, mj: j+l, mp: board[i+k][j+l], mc: RED});
                            if(i+l > -1 && i+l < 8 && j+k > -1 && j+k < 8 && board[i+l][j+k] == 0) findMoves.push({mi: i+l, mj: j+k, mp: 0, mc: GREEN});
                            if(i+l > -1 && i+l < 8 && j+k > -1 && j+k < 8 && board[i+l][j+k] * board[i][j] < 0) findMoves.push({mi: i+l, mj: j+k, mp: board[i+l][j+k], mc: RED});
                        }
                    }
                break;
                /* QUEEN */
                case -9:
                case 9:
                    for(let k = 1; k < 8 && i+k < 8 && j+k < 8; k++)
                    {
                        if(board[i+k][j+k] == 0) findMoves.push({mi: i+k, mj: j+k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i+k][j+k] * board[i][j] < 0) findMoves.push({mi: i+k, mj: j+k, mp: board[i+k][j+k], mc: RED});
                            k = 9;
                        }
                    } // DOWN RIGHT
                    for(let k = 1; k < 8 && i+k < 8 && j-k > -1; k++)
                    {
                        if(board[i+k][j-k] == 0) findMoves.push({mi: i+k, mj: j-k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i+k][j-k] * board[i][j] < 0) findMoves.push({mi: i+k, mj: j-k, mp: board[i+k][j-k], mc: RED});
                            k = 9;
                        }
                    } // DOWN LEFT
                    for(let k = 1; k < 8 && i-k > -1 && j-k > -1; k++)
                    {
                        if(board[i-k][j-k] == 0) findMoves.push({mi: i-k, mj: j-k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i-k][j-k] * board[i][j] < 0) findMoves.push({mi: i-k, mj: j-k, mp: board[i-k][j-k], mc: RED});
                            k = 9;
                        }
                    } // UP LEFT
                    for(let k = 1; k < 8 && i-k > -1 && j+k < 8; k++)
                    {
                        if(board[i-k][j+k] == 0) findMoves.push({mi: i-k, mj: j+k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i-k][j+k] * board[i][j] < 0) findMoves.push({mi: i-k, mj: j+k, mp: board[i-k][j+k], mc: RED});
                            k = 9;
                        }
                    } // UP RIGHT
                    for(let k = 1; k < 8 && i+k < 8; k++)
                    {
                        if(board[i+k][j] == 0) findMoves.push({mi: i+k, mj: j, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i+k][j] * board[i][j] < 0) findMoves.push({mi: i+k, mj: j, mp: board[i+k][j], mc: RED});
                            k = 9;
                        }
                    } // DOWN
                    for(let k = 1; k < 8 && i-k > -1; k++)
                    {
                        if(board[i-k][j] == 0) findMoves.push({mi: i-k, mj: j, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i-k][j] * board[i][j] < 0) findMoves.push({mi: i-k, mj: j, mp: board[i-k][j], mc: RED});
                            k = 9;
                        }
                    } // UP
                    for(let k = 1; k < 8 && j+k < 8; k++)
                    {
                        if(board[i][j+k] == 0) findMoves.push({mi: i, mj: j+k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i][j+k] * board[i][j] < 0) findMoves.push({mi: i, mj: j+k, mp: board[i][j+k], mc: RED});
                            k = 9;
                        }
                    } // RIGHT
                    for(let k = 1; k < 8 && j-k > -1; k++)
                    {
                        if(board[i][j-k] == 0) findMoves.push({mi: i, mj: j-k, mp: 0, mc: GREEN});
                        else
                        {
                            if(board[i][j-k] * board[i][j] < 0) findMoves.push({mi: i, mj: j-k, mp: board[i][j-k], mc: RED});
                            k = 9;
                        }
                    } // LEFT
                break;
            }
            return findMoves;
        },
    },
});