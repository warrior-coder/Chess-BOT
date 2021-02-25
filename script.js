const NONE = 'transparent';
const RED = 'rgba(255, 68, 0, 0.8)';
const GREEN = 'rgba(153, 205, 50, 0.8)';
const YELLOW = 'rgba(255, 255, 0, 0.9)';
const _FIGURES = [
    {type: -5, x: 0, y: 0},{type: -3, x: 1, y: 0},{type: -4, x: 2, y: 0},{type: -9, x: 3, y: 0},{type: -999, x: 4, y: 0},{type: -4, x: 5, y: 0},{type: -3, x: 6, y: 0},{type: -5, x: 7, y: 0},
    {type: -1, x: 0, y: 1},{type: -1, x: 1, y: 1},{type: -1, x: 2, y: 1},{type: -1, x: 3, y: 1},{type: -1, x: 4, y: 1},{type: -1, x: 5, y: 1},{type: -1, x: 6, y: 1},{type: -1, x: 7, y: 1},
    {type: 1, x: 0, y: 6},{type: 1, x: 1, y: 6},{type: 1, x: 2, y: 6},{type: 1, x: 3, y: 6},{type: 1, x: 4, y: 6},{type: 1, x: 5, y: 6},{type: 1, x: 6, y: 6},{type: 1, x: 7, y: 6},
    {type: 5, x: 0, y: 7},{type: 3, x: 1, y: 7},{type: 4, x: 2, y: 7},{type: 9, x: 3, y: 7},{type: 999, x: 4, y: 7},{type: 4, x: 5, y: 7},{type: 3, x: 6, y: 7},{type: 5, x: 7, y: 7},
];
var i2 = -1, j2 = -1, figureActive = false;

var _BOARD = [
    [-5, -3, -4, -9, -999, -4, -3, -5],
    [-1, -1, -1, -1, -1, -1, -1, -1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [5, 3, 4, 9, 999, 4, 3, 5],
];
console.log(_BOARD);

/* VUE JS */
vue1 = new Vue({
    el: '#vue1',
    data: {
        board: [],
        figures: [],
        beatedWhite: [],
        blackPoints: 0,
        beatedBlack: [],
        whitePoints: 0,
        freeMoves: [],
        cellActive: {x: -1, y: -1, col: YELLOW, bool: false},
        cellFrom: {x: -1, y: -1, col: YELLOW, bool: false},
        cellTo: {x: -1, y: -1, col: YELLOW, bool: false},
        turn: 1,
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

                let len = this.freeMoves.length;
                for (let k = 0; k < len; k++)
                {
                    /* MAKE FAKE MOVE */
                    let tempFig = this.board[this.freeMoves[k].mi][this.freeMoves[k].mj];
                    this.board[this.freeMoves[k].mi][this.freeMoves[k].mj] = this.board[i][j];
                    this.board[i][j] = 0;
                    
                    /* COUNT BOT POINTS */
                    let points = this.CountSidePoints(this.board, -1);

                    /* RETURN FAKE MOVE */
                    this.board[i][j] = this.board[this.freeMoves[k].mi][this.freeMoves[k].mj];
                    this.board[this.freeMoves[k].mi][this.freeMoves[k].mj] = tempFig;

                    if(points > 500)
                    {
                        this.freeMoves.splice(k,1);
                        k--;
                        len--;
                    }
                    
                }
                this.cellActive.x = j;
                this.cellActive.y = i;
                this.cellActive.bool = true;
                i2 = i;
                j2 = j;
                figureActive = fugure_k;
            }
            else if (figureActive)
            {
                this.freeMoves.splice(0);
                this.cellActive.bool = false;
                figureActive = 0;
            }
        },
        cellAction(ci, cj)
        {
            if (figureActive)
            {

                this.figureMove(ci, cj, i2, j2); // MAKE MOVE

                this.freeMoves.splice(0);
                figureActive = 0;
                this.cellActive.bool = false;
                
                this.turn *= -1;

                /* BOT TIME*/
                this.botAction();
            }
        },
        botAction()
        {
            let bestBlackFig = -1, i_best = -1, j_best = -1, bestPoints = -9999;

            let blackFigs = this.CollectSideFigures(this.board, -1);
            
            for (let blackFig of blackFigs)
            {
                let botMoves = this.findMoves(this.board, blackFig.i, blackFig.j); // GENERATE BOT MOVES

                for (let botMove of botMoves)
                {

                    /* MAKE FAKE MOVE */
                    let tempFig = this.board[botMove.mi][botMove.mj];
                    this.board[botMove.mi][botMove.mj] = blackFig.type;
                    this.board[blackFig.i][blackFig.j] = 0;

                    /* PLAYER POINTS */
                    let points = botMove.mp + this.CountSidePoints(this.board, 1) + this.CountFigurePoints(this.board, botMove.mi, botMove.mj);

                    if(points >= bestPoints && this.isUnderAttack(this.board, botMove.mi, botMove.mj) == 0)
                    {
                        if(points > bestPoints)
                        {
                            bestBlackFig = blackFig;
                            i_best = botMove.mi;
                            j_best = botMove.mj;
                            bestPoints = points;
                        }
                        else
                        {
                            if (blackFig.type > bestBlackFig.type)
                            {
                                bestBlackFig = blackFig;
                                i_best = botMove.mi;
                                j_best = botMove.mj;
                                bestPoints = points;
                            }
                        }
                    }

                    /* RETURN FAKE MOVE */
                    this.board[blackFig.i][blackFig.j] = blackFig.type;
                    this.board[botMove.mi][botMove.mj] = tempFig;
                }
            }
            console.log('FIG:', bestBlackFig);
            console.log('BEST MOVE:', j_best, i_best);
            console.log('BEST POINTS', bestPoints);

            this.figureMove(i_best, j_best, bestBlackFig.i, bestBlackFig.j); // MAKE MOVE
            
            this.turn *= -1;
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
        isUnderAttack(board, fi, fj)
        {
            let otherSide = (board[fi][fj] > 0) ? -1 : 1;
            let attackCount = 0;

            let otherFigures = this.CollectSideFigures(board, otherSide); // GENERATE OTHER SIDE FIGURES

            for (let otherFigure of otherFigures)
            {
                otherMoves = this.findMoves(board, otherFigure.i, otherFigure.j); // GENERATE OTHER SIDE MOVES
                for (let otherMove of otherMoves)
                {
                    if (otherMove.mi == fi && otherMove.mj == fj) attackCount++;
                }
            }

            return attackCount;
        },
        CountFigurePoints(board, fi, fj)
        {
            let figureMoves = this.findMoves(board, fi, fj);
            let figurePoints = 0;

            for (let figureMove of figureMoves)
            {
                figurePoints += figureMove.mp;
            }

            return figurePoints;
        },
        CountSidePoints(board, side)
        {
            let sideFigures = this.CollectSideFigures(board, side);
            let sidePoints = 0;
          
            for (let sideFig of sideFigures)
            {
                let moves = this.findMoves(board, sideFig.i, sideFig.j); // GENERATE MOVES
                for (let move of moves)
                {
                    sidePoints += move.mp; // COUNT MOVE POINTS
                }
            }

            return sidePoints;
        },
        figureMove(i_to, j_to, i_from, j_from) {
            /* BEAT */
            if(this.board[i_to][j_to] != 0)
            {
                let index = this.figures.findIndex(element => {
                    if(element.x == j_to && element.y == i_to && element.type != 0) return true;
                });
                if (this.figures[index].type > 0)
                {
                    this.beatedWhite.push(this.figures[index].type);
                    this.blackPoints += this.convertToPoints(this.figures[index].type);
                }
                else
                {
                    this.beatedBlack.push(this.figures[index].type);
                    this.whitePoints += this.convertToPoints(this.figures[index].type);
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
        convertToPoints(figureType)
        {
            switch (Math.abs(figureType))
            {
                case 4: return 3;
                case 9: return 8;
                default: return Math.abs(figureType);
            }
        },
        findMoves(board, i, j)
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