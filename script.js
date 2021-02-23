const NONE = 'transparent';
const RED = 'rgba(255, 68, 0, 0.8)';
const GREEN = 'rgba(153, 205, 50, 0.8)';
const YELLOW = 'rgba(255, 255, 0, 0.9)';
const _FIGURES = [
    {type: -4, x: 0, y: 0},{type: -2, x: 1, y: 0},{type: -3, x: 2, y: 0},{type: -9, x: 3, y: 0},{type: -999, x: 4, y: 0},{type: -3, x: 5, y: 0},{type: -2, x: 6, y: 0},{type: -4, x: 7, y: 0},
    {type: -1, x: 0, y: 1},{type: -1, x: 1, y: 1},{type: -1, x: 2, y: 1},{type: -1, x: 3, y: 1},{type: -1, x: 4, y: 1},{type: -1, x: 5, y: 1},{type: -1, x: 6, y: 1},{type: -1, x: 7, y: 1},
    {type: 1, x: 0, y: 6},{type: 1, x: 1, y: 6},{type: 1, x: 2, y: 6},{type: 1, x: 3, y: 6},{type: 1, x: 4, y: 6},{type: 1, x: 5, y: 6},{type: 1, x: 6, y: 6},{type: 1, x: 7, y: 6},
    {type: 4, x: 0, y: 7},{type: 2, x: 1, y: 7},{type: 3, x: 2, y: 7},{type: 9, x: 3, y: 7},{type: 999, x: 4, y: 7},{type: 3, x: 5, y: 7},{type: 2, x: 6, y: 7},{type: 4, x: 7, y: 7},
];
var i2 = -1, j2 = -1, figureActive = false;

var _BOARD = [
    [-4, -2, -3, -9, -999, -3, -2, -4],
    [-1, -1, -1, -1, -1, -1, -1, -1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [4, 2, 3, 9, 999, 3, 2, 4],
];
console.log(_BOARD);

/* VUE JS */
vue1 = new Vue({
    el: '#vue1',
    data: {
        board: [],
        figures: [],
        history: [],
        activeCell: false,
        turn: 1,
        i_glow2: -1,
        j_glow2: -1,
        i_glow: -1,
        j_glow: -1,
        freeMoves: [],
    },

    beforeMount() {
        this.board = _BOARD;
        this.figures = _FIGURES;
    },

    methods: {
        figureAction(i, j, fugure_k)
        {
            if (this.turn > 0 && this.figures[fugure_k].type > 0)
            {
                
                this.freeMoves = this.findMoves(this.board, i, j);
                
                // let sump = 0;
                // this.freeMoves.forEach(fm => {
                //     if(fm.mp != 0) sump += fm.mp
                // });
                // console.log(sump);

                i2 = i;
                j2 = j;
                figureActive = fugure_k;
            }
            else if (figureActive)
            {
                this.freeMoves.splice(0);
                figureActive = 0;
            }
        },
        cellAction(ci, cj, ck)
        {
            if(this.freeMoves[ck].mc == GREEN || this.freeMoves[ck].mc == RED)
            {
                if (figureActive)
                {
                    /* IF BEAT */
                    if (this.freeMoves[ck].mp != 0)
                    {
                        let index = this.figures.findIndex(element => {
                            if(element.x == cj && element.y == ci && element.type < 0) return true;
                        });
                        this.figures[index].type = 0;
                    }

                    this.figureMove(figureActive, ci, cj, i2, j2); // MAKE MOVE

                    this.freeMoves.splice(0);
                    figureActive = 0;
                    this.turn *= -1;

                    /* BOT TIME*/
                    this.botAction();
                }
            }
        },
        botAction()
        {
            let blackFigIds = [];
            for (let k = 0; k < 16; k++)
                if (this.figures[k].type < 0) blackFigIds.push(k); // COLLECT ALL BLACK FIGURES
            
            let bestBlackFigId = -1, i_best = -1, j_best = -1, bestPoints = -9999;

            blackFigIds.forEach(blackFigId =>
            {
                let botMoves = this.findMoves(this.board, this.figures[blackFigId].y, this.figures[blackFigId].x); // GENERATE BOT MOVES

                botMoves.forEach(botMove =>
                {

                    /* MAKE FAKE MOVE */
                    let tempFig = this.board[botMove.mi][botMove.mj];
                    this.board[botMove.mi][botMove.mj] = this.figures[blackFigId].type;
                    this.board[this.figures[blackFigId].y][this.figures[blackFigId].x] = 0;


                    /* PLAYER POINTS */
                    
                    let blackPoints = botMove.mp;
                    let whitePoints = this.CountSidePoints(this.board, 1);

                    if(whitePoints + blackPoints > bestPoints)
                    {
                        bestBlackFigId = blackFigId;
                        i_best = botMove.mi;
                        j_best = botMove.mj;
                        bestPoints = whitePoints + blackPoints;
                    }
                    else if(whitePoints + blackPoints == bestPoints)
                    {
                        if (blackFigId > bestBlackFigId)
                        {
                            bestBlackFigId = blackFigId;
                            i_best = botMove.mi;
                            j_best = botMove.mj;
                            bestPoints = whitePoints + blackPoints;
                        }
                    }

                    /* RETURN FAKE MOVE */
                    this.board[botMove.mi][botMove.mj] = tempFig;
                    this.board[this.figures[blackFigId].y][this.figures[blackFigId].x] = this.figures[blackFigId].type;
                });

                

            });
            console.log('FIG:', bestBlackFigId);
            console.log('BEST MOVE:', j_best, i_best);
            console.log('BEST POINTS', bestPoints);


            let bi = i_best;
            let bj = j_best;
            let bi2 = this.figures[bestBlackFigId].y;
            let bj2 = this.figures[bestBlackFigId].x;

            /* IF BEAT */
            
            for (let k = 16; k < 32; k++)
            {
                if (this.figures[k].y == i_best && this.figures[k].x == j_best && this.figures[k].type > 0)
                {
                    this.figures[k].type = 0;
                    break;
                }
            }

            this.figureMove(bestBlackFigId, bi, bj, bi2, bj2); // MAKE RANDOM MOVE


            // if(blackFigures.length == 0) // IF NO BLACK FIGURES
            // {
            //     this.turn *= -1;
            //     break;
            // }

            // let randFigure = blackFigures[Math.floor(Math.random() * (blackFigures.length-1))] // CHOOSE RANDOM BLACK FIGURE
            // console.log('TRY:', randFigure, ':', this.figures[randFigure].x, this.figures[randFigure].y);
            
            // let botMoves = this.findMoves(this.board, this.figures[randFigure].y, this.figures[randFigure].x); // GENERATE BOT MOVES
            // let nMoves = botMoves.length;

            // if(nMoves > 1) // IF HAS MOVES
            // {
            //     console.log('---MOVE---');

            //     let sump = 0;
            //     botMoves.forEach(fm => {
            //         if(fm.mp != 0) sump += fm.mp
            //     });
            //     console.log(sump);

                
            //     this.turn *= -1;
            // }

            this.turn *= -1;
        },
        CountSidePoints(board, side)
        {
            let sideFigures = [], sidePoints = 0;

            if (side == -1)
            {
                for (let k = 0; k < 16; k++)
                    if (this.figures[k].type < 0) sideFigures.push(k); // COLLECT ALL BLACK FIGURES
            }
            else 
            {
                for (let k = 16; k < 32; k++)
                    if (this.figures[k].type > 0) sideFigures.push(k); // COLLECT ALL WHITE FIGURES
            }
          
            sideFigures.forEach(FigId =>
            {
                let moves = this.findMoves(this.board, this.figures[FigId].y, this.figures[FigId].x); // GENERATE MOVES

                moves.forEach( move =>
                {
                    sidePoints += move.mp
                });

            });

            return sidePoints;
        },
        figureMove(FigureId, fi, fj, fi2, fj2) {

            /* MOVE */
            this.figures[FigureId].x = fj;
            this.figures[FigureId].y = fi;
            this.board[fi][fj] = this.board[fi2][fj2];
            this.board[fi2][fj2] = 0;

            /* HISTORY */
            this.history[0] = {hx: fj, hy: fi, hc: YELLOW};
            this.history[1] = {hx: fj2, hy: fi2, hc: YELLOW};

            /* WHITE QUEEN CHECK */
            if(this.figures[FigureId].type == 1 && fi == 0) 
            {
                this.figures[FigureId].type = 9; 
                this.board[fi][fj] = 9;
            }

            /* BLACK QUEEN CHECK */
            else if(this.figures[FigureId].type == -1 && fi == 7) 
            {
                this.figures[FigureId].type = -9; 
                this.board[fi][fj] = -9;
            }
        },
    
        findMoves(board, i, j)
        {
            let findMoves = [];
            // findMoves.push({mi: i, mj: j, mp: 0, mc: YELLOW}); // CURRENT POSITION
            
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
                case -3:
                case 3:
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
                case -4:
                case 4:
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
                case -999:
                case 999:
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
                case -2:
                case 2:
                    for(let k = -1; k < 2; k += 2)
                    {
                        for(let l = -2; l < 3; l += 4)
                        {
                            if(i+k > -1 && i+k < 7 && j+l > -1 && j+l < 8 && board[i+k][j+l] == 0) findMoves.push({mi: i+k, mj: j+l, mp: 0, mc: GREEN});
                            if(i+k > -1 && i+k < 7 && j+l > -1 && j+l < 8 && board[i+k][j+l] * board[i][j] < 0) findMoves.push({mi: i+k, mj: j+l, mp: board[i+k][j+l], mc: RED});
                            if(i+l > -1 && i+l < 7 && j+k > -1 && j+k < 8 && board[i+l][j+k] == 0) findMoves.push({mi: i+l, mj: j+k, mp: 0, mc: GREEN});
                            if(i+l > -1 && i+l < 7 && j+k > -1 && j+k < 8 && board[i+l][j+k] * board[i][j] < 0) findMoves.push({mi: i+l, mj: j+k, mp: board[i+l][j+k], mc: RED});
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

// botAction()
//         {
//             while (this.turn < 0)
//                 {
//                     let blackFigures = [];
//                     for (let k = 0; k < 16; k++)
//                         if (this.figures[k].type < 0) blackFigures.push(k); // COLLECT ALL BLACK FIGURES
                    
//                     console.log(blackFigures);
//                     if(blackFigures.length == 0) // IF NO BLACK FIGURES
//                     {
//                         this.turn *= -1;
//                         break;
//                     }

//                     let randFigure = blackFigures[Math.floor(Math.random() * (blackFigures.length-1))] // CHOOSE RANDOM BLACK FIGURE
//                     console.log('TRY:', randFigure, ':', this.figures[randFigure].x, this.figures[randFigure].y);
                    
//                     let botMoves = this.findMoves(this.board, this.figures[randFigure].y, this.figures[randFigure].x); // GENERATE BOT MOVES
//                     let nMoves = botMoves.length;

//                     if(nMoves > 1) // IF HAS MOVES
//                     {
//                         console.log('---MOVE---');

//                         let sump = 0;
//                         botMoves.forEach(fm => {
//                             if(fm.mp != 0) sump += fm.mp
//                         });
//                         console.log(sump);

//                         randMove = Math.floor(Math.random() * (nMoves-1)) + 1;
//                         let bi = botMoves[randMove].mi;
//                         let bj = botMoves[randMove].mj;
//                         let bi2 = this.figures[randFigure].y;
//                         let bj2 = this.figures[randFigure].x;

//                         /* IF BEAT */
//                         if (botMoves[randMove].mp != 0)
//                         {
//                             console.log('---BEAT---');
//                             let index = this.figures.findIndex(element => {
//                                 if(element.x == bj && element.y == bi && element.type > 0) return true;
//                             });
//                             this.figures[index].type = 0;
//                         }

//                         this.figureMove(randFigure, bi, bj, bi2, bj2); // MAKE RANDOM MOVE
//                         this.turn *= -1;
//                     }
//                 }
//         },