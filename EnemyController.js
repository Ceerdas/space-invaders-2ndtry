import Enemy from "./Enemy.js"
import movingDirection from "./MovingDirection.js";

export default class EnemyController {

    enemyMap = [
        [3, 2, 1, 1, 2, 2, 1, 1, 2, 3],
        [3, 3, 3, 1, 1, 1, 1, 3, 3, 3],
        [2, 2, 2, 3, 3, 3, 3, 2, 2, 2],
        [1, 1, 1, 2, 2, 2, 2, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
    enemyRows = [];

    currentDirection = movingDirection.right;
    xVelocity = 0;
    yVelocity = 0;
    defaultXVelocity = 1;
    defaultYVelocity = 1;
    moveDownTimerDefault = 30;
    moveDownTimer = this.moveDownTimerDefault;
    fireBulletTimerDefaultValue = 100;
    fireBulletTimer = this.fireBulletTimerDefaultValue;

    constructor(canvas, enemyBulletController, playerBulletController) {
        this.canvas = canvas;
        this.enemyBulletController = enemyBulletController;
        this.playerBulletController = playerBulletController;

        this.enemyDeathSound = new Audio('sounds/enemy-death.wav');
        this.enemyDeathSound.volume = 0.2;

        this.createEnemies();
    }

    draw(ctx) {
        this.decrementMoveDownTimer();
        this.updateVelocityAndDirection();
        this.collisionDetection();
        this.drawEnemies(ctx);
        this.resetMoveDownTimer();
        this.fireBullet();
    }

    collisionDetection() {
        this.enemyRows.forEach(enemyRow => {
            enemyRow.forEach((enemy, enemyIndex) => {
                if (this.playerBulletController.collideWith(enemy)) {
                    this.enemyDeathSound.currentTime = 0;
                    this.enemyDeathSound.play();
                    enemyRow.splice(enemyIndex, 1);
                }
            });
        });

        this.enemyRows = this.enemyRows.filter((enemyRow) => enemyRow.length > 0);
    }

    fireBullet() {
        this.fireBulletTimer--;
        if (this.fireBulletTimer <= 0) {
            this.fireBulletTimer = this.fireBulletTimerDefaultValue;
            const allEnemies = this.enemyRows.flat();
            const enemyIndex = Math.floor(Math.random() * allEnemies.length);
            const enemy = allEnemies[enemyIndex];
            this.enemyBulletController.shoot(enemy.x, enemy.y, -3);
        }
    }

    resetMoveDownTimer() {
        if (this.moveDownTimer <= 0) {
            this.moveDownTimer = this.moveDownTimerDefault
        }
    }

    decrementMoveDownTimer() {
        if (
            this.currentDirection === movingDirection.downLeft ||
            this.currentDirection === movingDirection.downRight
        ) {
            this.moveDownTimer--;
        }
    }

    updateVelocityAndDirection() {
        for (const enemyRow of this.enemyRows) {
            if (this.currentDirection == movingDirection.right) {
                this.xVelocity = this.defaultXVelocity;
                this.yVelocity = 0;
                const mostRightEnemy = enemyRow[enemyRow.length - 1];
                if (mostRightEnemy.x + mostRightEnemy.width >= this.canvas.width) {
                    this.currentDirection = movingDirection.downLeft;
                    break;
                }
            }
            else if (this.currentDirection === movingDirection.downLeft) {
                if (this.moveDown(movingDirection.left)) {
                    break;
                }
            } else if (this.currentDirection === movingDirection.left) {
                this.xVelocity = -this.defaultXVelocity;
                this.yVelocity = 0;
                const mostLeftEnemy = enemyRow[0];
                if (mostLeftEnemy.x <= 0) {
                    this.currentDirection = movingDirection.downRight;
                    break;
                }
            } else if (this.currentDirection === movingDirection.downRight) {
                if (this.moveDown(movingDirection.right)) {
                    break;
                }
            }
        }
    }

    moveDown(newDirection) {
        this.xVelocity = 0;
        this.yVelocity = this.defaultYVelocity;
        if (this.moveDownTimer <= 0) {
            this.currentDirection = newDirection;
            return true;
        }
        return false;
    }

    drawEnemies(ctx) {
        this.enemyRows.flat().forEach((enemy) => {
            enemy.move(this.xVelocity, this.yVelocity);
            enemy.draw(ctx);
        });
    }

    createEnemies() {
        this.enemyMap.forEach((row, rowIndex) => {
            this.enemyRows[rowIndex] = [];
            row.forEach((enemyNumber, enemyIndex) => {
                if (enemyNumber > 0) {
                    this.enemyRows[rowIndex].push(new Enemy(enemyIndex * 60, rowIndex * 40, enemyNumber)
                    );
                }
            });
        });
    }

    collideWith(sprite) {
        return this.enemyRows.flat().some(enemy => enemy.collideWith(sprite));
    }
}