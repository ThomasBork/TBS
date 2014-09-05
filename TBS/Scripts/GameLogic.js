var jqGameArea;

var LEVEL_WIDTH = 30;
var LEVEL_HEIGHT = 30;
var GAME_AREA_WIDTH;
var GAME_AREA_HEIGHT;
var TILE_PIXEL_WIDTH = 30;
var TILE_PIXEL_HEIGHT = 30;

var currentGame;
var gameOptions = {
    goldIncome: 10
};

var nextUnitID = 0;
var tiles = [];

$(document).ready(function () {
    initUINumbers();
    initEvents();
});

var initUINumbers = function () {
    jqGameArea = $('#game-area');
    GAME_AREA_WIDTH = jqGameArea.width();
    GAME_AREA_HEIGHT = jqGameArea.height();
};

var initEvents = function () {
    $('#btn-start-game').click(function () {
        initGame();
    });
    $('#btn-end-turn').click(function () {
        _game.endTurn();
    });
};

var initGame = function () {
    _game.setUpLevel();
    var player1Name = $('#player1-name').val() != "" ? $('#player1-name').val() : "Player1";
    var player2Name = $('#player2-name').val() != "" ? $('#player2-name').val() : "Player2";
    var player1 = _player.new(player1Name, 'green');
    var player2 = _player.new(player2Name, 'white');
    currentGame = _game.new(player1, player2);

    var commander = _unitType.new(
        {
            name: "Commander",
            description: "Commander. Average hit points. Average damage. Average attack speed.",
            damage: 20,
            attackSpeed: 2,
            attackRange: 1,
            hitPoints: 100,
            energy: 4,
            vision: 7,
            attacks: 1,
            energyPerAttack: 4
        }
    );

    var footman = _unitType.new(
        {
            name: "Footman",
            description: "Footman. High hit points. Average damage. Slow attack speed.",
            damage: 20,
            attackSpeed: 1.2,
            attackRange: 1,
            hitPoints: 150,
            energy: 3,
            vision: 5,
            attacks: 1,
            energyPerAttack: 4
        }
    );

    var ranger = _unitType.new(
        {
            name: "Ranger",
            description: "Ranger. Ranged. Low hit points. High damage. Slow attack speed.",
            damage: 35,
            attackSpeed: 1,
            attackRange: 4,
            hitPoints: 60,
            energy: 3,
            vision: 7,
            attacks: 1,
            energyPerAttack: 3
        }
    );

    _unit.new(player1, commander, 3, 3);
    _unit.new(player1, footman, 3, 1);
    _unit.new(player1, footman, 1, 3);
    _unit.new(player1, ranger, 1, 1);

    _unit.new(player2, commander, 25, 27);
    _unit.new(player2, footman, 20, 23);
    _unit.new(player2, footman, 25, 20);
    _unit.new(player2, ranger, 24, 24);

    $('#in-game-control-panel').show();
    _game.start(currentGame);
};

var _game = {
    new: function (player1, player2) {
        var newGame = {
            players: [player1, player2],
            host: player1,
            units: []
        };
        return newGame;
    },
    start: function (game) {
        game.currentTurn = 0;
        game.currentPlayer = game.players[Math.floor((Math.random() * 2))];
        _ui.updateCurrentPlayerText();
        _ui.updateGoldText();
        _game.updateVision();
    },
    setUpLevel: function () {
        jqGameArea.empty();
        _ui.createTiles();
    },
    getUnitWithID: function (id) {
        var selectedUnit;
        for (var unitIndex in currentGame.units) {
            var unit = currentGame.units[unitIndex];
            if (unit.id == id) {
                selectedUnit = unit;
            }
        }
        return selectedUnit;
    },
    getDistanceBetweenUnits: function (unit1, unit2) {
        return _game.getDistanceBetweenPoints(unit1.positionX, unit1.positionY, unit2.positionX, unit2.positionY);
    },
    getDistanceBetweenUnitAndPoint: function (unit, x, y) {
        return _game.getDistanceBetweenPoints(unit.positionX, unit.positionY, x, y);
    },
    getDistanceBetweenPoints: function (x1, y1, x2, y2) {
        return  Math.abs(x1 - x2) + Math.abs(y1 - y2);
        //return Math.abs(x1 - x2) > Math.abs(y1 - y2) ? Math.abs(x1 - x2) : Math.abs(y1 - y2);
    },
    getShortestPathsForUnit: function (unit) {
        var minY = unit.positionY - unit.currentEnergy > 0 ? unit.positionY - unit.currentEnergy : 0;
        var maxY = unit.positionY + unit.currentEnergy < LEVEL_HEIGHT ? unit.positionY + unit.currentEnergy : LEVEL_HEIGHT - 1;
        var minX = unit.positionX - unit.currentEnergy > 0 ? unit.positionX - unit.currentEnergy : 0;
        var maxX = unit.positionX + unit.currentEnergy < LEVEL_WIDTH ? unit.positionX + unit.currentEnergy : LEVEL_WIDTH - 1;
        var boundaries = {
            minY: minY,
            maxY: maxY,
            minX: minX,
            maxX: maxX
        };

        var paths = [];
        for (var x = minX; x <= maxX; x++) {
            paths[x] = [];
            for (var y = minY; y <= maxY; y++) {
                paths[x][y] = { canReach: false, path: null };
            }
        }

        _game.getShortestPaths(unit, boundaries, [], paths);
        return paths;
    },
    getShortestPaths: function (unit, boundaries, currentPath, shortestPaths) {
        var lastPoint;
        if(currentPath.length == 0){
            lastPoint = { x: unit.positionX, y: unit.positionY }; 
        } else {
            if (currentPath.length > unit.currentEnergy) {
                return;
            }
            lastPoint = currentPath[currentPath.length - 1];
            var shortestPath = shortestPaths[lastPoint.x][lastPoint.y];
            var newShortestPath = { canReach: true, path: currentPath };
            if (!shortestPath.canReach) {
                shortestPaths[lastPoint.x][lastPoint.y] = newShortestPath;
            } else {
                if (newShortestPath.path.length < shortestPath.path.length) {
                    shortestPaths[lastPoint.x][lastPoint.y] = newShortestPath;
                }
            }
        }

        var testDeltaCoordinates = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }//,
            //{ x: 1, y: 1 },
            //{ x: -1, y: -1 },
            //{ x: -1, y: 1 },
            //{ x: 1, y: -1 }
        ];
        var bestPath = { canReach: false, path: null };
        for (var index in testDeltaCoordinates) {
            var deltaCoordinates = testDeltaCoordinates[index];
            var newPoint = {
                x: lastPoint.x + deltaCoordinates.x,
                y: lastPoint.y + deltaCoordinates.y
            };
            var isInsideBoundaries = (
                newPoint.y >= boundaries.minY &&
                newPoint.y <= boundaries.maxY &&
                newPoint.x >= boundaries.minX &&
                newPoint.x <= boundaries.maxX
            );
            if (isInsideBoundaries) {
                var isVisited = false;
                for(var pointIndex in currentPath){
                    var iteratedPoint = currentPath[pointIndex];
                    if(
                        iteratedPoint.x == newPoint.x &&
                        iteratedPoint.y == newPoint.y
                    ){
                        isVisited = true;
                    }
                }
                if(!isVisited){
                    if (_game.mayUnitOccupyPosition(unit, newPoint.x, newPoint.y)) {
                        var newPath = clone(currentPath);
                        newPath.push(newPoint);
                        if (shortestPaths[newPoint.x][newPoint.y].canReach) {
                            if (newPath.length < shortestPaths[newPoint.x][newPoint.y].path.length) {
                                _game.getShortestPaths(unit, boundaries, newPath, shortestPaths);
                            }
                        } else {
                            _game.getShortestPaths(unit, boundaries, newPath, shortestPaths);
                        }
                    }
                }
            }
        }
    },
    mayUnitOccupyPosition: function (unit, x, y) {
        var mayOccupy = true;
        if (unit.positionX == x && unit.positionY == y) {
            mayOccupy = false;
        } else {
            for (var unitIndex in currentGame.units) {
                var iteratedUnit = currentGame.units[unitIndex];
                if (
                    iteratedUnit != unit &&
                    _ui.isUnitOnTile(iteratedUnit, tiles[x][y])
                ) {
                    mayOccupy = false;
                }
            }
        }
        return mayOccupy;
    },
    isPositionOccupied: function (x, y) {
        var isOccupied = false;
        for (var unitIndex in currentGame.units) {
            var unit = currentGame.units[unitIndex];
            if (
                unit.positionX == x &&
                unit.positionY == y
            ) {
                isOccupied = true;
            }
        }
        return isOccupied;
    },
    moveUnit: function (unit, x, y) {
        var shortestPath = _game.getShortestPathsForUnit(unit)[x][y];
        unit.currentEnergy -= shortestPath.path.length;

        // Move each step individually and update vision at each position.
        for (var index in shortestPath.path) {
            var point = shortestPath.path[index];
            unit.positionX = point.x;
            unit.positionY = point.y;
            _game.updateVision();
        }

        _ui.updatePositionForUnit(unit);
    },
    orderUnitToAttack: function (attackingUnit, attackedUnit) {
        var totalDamage = _unit.calculateDamage(attackingUnit);
        attackedUnit.currentHitPoints -= totalDamage;
        _ui.updateHitPointBar(attackedUnit);
        if (attackingUnit.currentAttacks > 0) {
            attackingUnit.currentAttacks--;
        } else {
            attackingUnit.currentEnergy -= attackingUnit.unitType.energyPerAttack;
        }
    },
    endTurn: function () {
        currentGame.currentTurn++;
        _player.updateCurrentPlayer();
        _player.readyUnitsForPlayer(currentGame.currentPlayer);
        _player.resolveIncomeForPlayer(currentGame.currentPlayer);
        _ui.deselectUnits();
        _ui.updateCurrentPlayerText();
        _ui.updateGoldText();
        _game.updateVision();
    },
    updateVision: function () {
        for (var playerIndex in currentGame.players) {
            // Set all visible tiles to discovered.
            var player = currentGame.players[playerIndex];
            for (var x = 0; x < LEVEL_WIDTH; x++) {
                for (var y = 0; y < LEVEL_HEIGHT; y++) {
                    if (player.vision[x][y] == VISION.VISIBLE) {
                        player.vision[x][y] = VISION.DISCOVERED;
                    };
                }
            }

            // Show vision for every unit
            for (var unitIndex in player.units) {
                var unit = player.units[unitIndex];
                _unit.giveVision(unit);
            }
        }

        // Hide hidden units and show visible units for the current player
        for (var unitIndex in currentGame.units) {
            var unit = currentGame.units[unitIndex];
            if (currentGame.currentPlayer.vision[unit.positionX][unit.positionY] == VISION.VISIBLE) {
                unit.jqElement.show();
            } else {
                unit.jqElement.hide();
            }
        }

        // Update vision blockers for the current player
        var player = currentGame.currentPlayer;
        for (var x = 0; x < LEVEL_WIDTH; x++) {
            for (var y = 0; y < LEVEL_HEIGHT; y++) {
                tiles[x][y].jqElement.removeClass('undiscovered').removeClass('discovered').removeClass('visible');
                switch (player.vision[x][y]) {
                    case VISION.UNDISCOVERED:
                        tiles[x][y].jqElement.addClass('undiscovered');
                        break;
                    case VISION.DISCOVERED:
                        tiles[x][y].jqElement.addClass('discovered');
                        break;
                    case VISION.VISIBLE:
                        tiles[x][y].jqElement.addClass('visible');
                        break;
                }
            }
        }
    }
};

var _player = {
    new: function (name, color) {
        var vision = [];
        for (var x = 0; x < LEVEL_WIDTH; x++) {
            vision[x] = [];
            for (var y = 0; y < LEVEL_HEIGHT; y++) {
                vision[x][y] = VISION.UNDISCOVERED;
            }
        }
        return {
            name: name,
            color: color,
            vision: vision,
            units: [],
            gold: 0
        }
    },
    getOtherPlayer: function () {
        var player1 = currentGame.players[0];
        var player2 = currentGame.players[1];
        return currentGame.currentPlayer == player1 ? player2 : player1;
    },
    updateCurrentPlayer: function () {
        currentGame.currentPlayer = _player.getOtherPlayer();
    },
    readyUnitsForPlayer: function (player) {
        for (var unitIndex in player.units) {
            var unit = player.units[unitIndex];
            _unit.replenishEnergyForUnit(unit);
            _unit.replenishAttacksForUnit(unit);
        }
    },
    resolveIncomeForPlayer: function (player) {
        // It not the first turn of a player add income.
        if (currentGame.currentTurn >= currentGame.players.length) {
            player.gold += gameOptions.goldIncome;
        }
    }
};

var _unitType = {
    new: function (options) {
        return {
            name: options.name,
            description: options.description,
            damage: options.damage,
            attackSpeed: options.attackSpeed,
            attackRange: options.attackRange,
            hitPoints: options.hitPoints,
            energy: options.energy,
            vision: options.vision,
            attacks: options.attacks,
            energyPerAttack: options.energyPerAttack
        };
    }
};

var _object = {
    new: function (positionX, positionY) {
        return {
            positionX: positionX,
            positionY: positionY
        };
    }
};

var _unit = {
    new: function (player, unitType, positionX, positionY) {
        var jqUnit = $('<div class="unit">');
        jqUnit.attr('unit-id', nextUnitID);
        jqUnit.addClass(player.color);
        jqUnit.attr('title', unitType.description);

        jqUnit.click(function () {
            var selectedUnit = _ui.getUnitFromJqElement($(this));
            if (selectedUnit.player == currentGame.currentPlayer) {
                _ui.selectUnit(selectedUnit);
                _ui.showMovementForSelectedUnit();
            }
        });

        jqUnit.on("contextmenu", function (event) {
            _ui.handleRightClickOnUnit(event, $(this));
            return false;
        });

        var hitPointBar = _progressBar.newHPBar(
            {
                height: '5px',
                maxValue: unitType.hitPoints,
                value: unitType.hitPoints
            }
        );

        var newUnit = {
            jqElement: jqUnit,
            hitPointBar: hitPointBar,
            id: nextUnitID,
            player: player,
            unitType: unitType,
            currentHitPoints: unitType.hitPoints,
            currentEnergy: unitType.energy,
            currentAttacks: unitType.attacks,
            alive: true
        };
        // Add object attributes to the newUnit object.
        $.extend(newUnit, _object.new(positionX, positionY));

        player.units.push(newUnit);
        currentGame.units.push(newUnit);

        _ui.updatePositionForUnit(newUnit);
        jqGameArea.append(jqUnit);

        var jqBar = hitPointBar.jqElement;
        newUnit.jqElement.append(jqBar);

        nextUnitID++;
        return newUnit;
    },
    canAttack: function (unit) {
        return (unit.currentAttacks > 0 || unit.currentEnergy >= unit.unitType.energyPerAttack);
    },
    replenishEnergyForUnit: function (unit) {
        unit.currentEnergy = unit.unitType.energy;
    },
    replenishAttacksForUnit: function (unit) {
        unit.currentAttacks = unit.unitType.attacks;
    },
    calculateDamage: function (unit) {
        var totalDamage = unit.unitType.damage * unit.unitType.attackSpeed;
        return totalDamage;
    },
    giveVision: function (unit) {
        var minY = unit.positionY - unit.unitType.vision > 0 ? unit.positionY - unit.unitType.vision : 0;
        var maxY = unit.positionY + unit.unitType.vision < LEVEL_HEIGHT ? unit.positionY + unit.unitType.vision : LEVEL_HEIGHT - 1;
        var minX = unit.positionX - unit.unitType.vision > 0 ? unit.positionX - unit.unitType.vision : 0;
        var maxX = unit.positionX + unit.unitType.vision < LEVEL_WIDTH ? unit.positionX + unit.unitType.vision : LEVEL_WIDTH - 1;
        for (var y = minY; y <= maxY; y++) {
            for (var x = minX; x <= maxX; x++) {
                if (_game.getDistanceBetweenUnitAndPoint(unit, x, y) <= unit.unitType.vision) {
                    unit.player.vision[x][y] = VISION.VISIBLE;
                }
            }
        }
    }
};

var _ui = {
    updateCurrentPlayerText: function () {
        $('#lbl-current-turn').html('Current player: ' + currentGame.currentPlayer.name);
    },
    updateGoldText: function () {
        $('#lbl-gold').html('Gold: ' + currentGame.currentPlayer.gold);
    },
    updatePositionForUnit: function (unit) {
        unit.jqElement.css('left', _ui.ingameXToPixels(unit.positionX) + 'px');
        unit.jqElement.css('top', _ui.ingameYToPixels(unit.positionY) + 'px');
    },
    deselectUnits: function () {
        $('.unit.selected').removeClass('selected');
        $('.tile.can-be-moved-to').removeClass('can-be-moved-to');
        $('.unit.can-be-attacked').removeClass('can-be-attacked');
        _ui.hideCurrentPath();
    },
    hideCurrentPath: function () {
        $('.tile.current-path').removeClass('current-path');
        $('.tile.destination').removeClass('destination');
    },
    selectUnit: function (unit) {
        _ui.deselectUnits();
        unit.jqElement.addClass('selected');
    },
    getUnitFromJqElement: function (jqUnit) {
        var unitID = jqUnit.attr('unit-id');
        return _game.getUnitWithID(unitID);;
    },
    getSelectedUnit: function () {
        var unitID = $('.unit.selected').attr('unit-id');
        return _game.getUnitWithID(unitID);;
    },
    handleRightClickOnTile: function (event, jqTile) {
        var selectedUnit = _ui.getSelectedUnit();
        if (selectedUnit !== undefined) {
            if (jqTile.hasClass('can-be-moved-to')) {
                var x = jqTile.attr('x');
                var y = jqTile.attr('y');
                if (jqTile.hasClass('destination')) {
                    _game.moveUnit(selectedUnit, x, y);
                    _ui.hideCurrentPath();
                } else {
                    _ui.hideCurrentPath();
                    var shortestPath = _game.getShortestPathsForUnit(selectedUnit)[x][y];
                    for (var index in shortestPath.path) {
                        var point = shortestPath.path[index];
                        tiles[point.x][point.y].jqElement.addClass('current-path');
                    }
                    jqTile.addClass('destination');
                }
            } else {
                _ui.deselectUnits();
            }
            _ui.showMovementForSelectedUnit();
        }
    },
    handleRightClickOnUnit: function (event, jqUnit) {
        var selectedUnit = _ui.getSelectedUnit();
        if (selectedUnit !== undefined) {
            if (jqUnit.hasClass('can-be-attacked')) {
                var attackedUnit = _ui.getUnitFromJqElement(jqUnit);
                _game.orderUnitToAttack(selectedUnit, attackedUnit);
            } else {
                _ui.deselectUnits();
            }
            _ui.showMovementForSelectedUnit();
        }
    },
    ingameXToPixels: function (val) {
        return TILE_PIXEL_WIDTH * val;
    },
    ingameYToPixels: function (val) {
        return TILE_PIXEL_HEIGHT * val;
    },
    pixelsToIngameX: function (val) {
        return Math.floor(val / TILE_PIXEL_WIDTH);
    },
    pixelsToIngameY: function (val) {
        return Math.floor(val / TILE_PIXEL_HEIGHT);
    },
    isUnitOnTile: function (unit, tile) {
        if (
            unit.positionX == tile.positionX &&
            unit.positionY == tile.positionY
        ) {
            return true;
        } else {
            return false;
        }
    },
    createTiles: function () {
        tiles = [];
        for (var x = 0; x < LEVEL_WIDTH; x++) {
            tiles[x] = [];
        }
        for (var y = 0; y < LEVEL_HEIGHT; y++) {
            for (var x = 0; x < LEVEL_WIDTH; x++) {
                var jqTile = $('<div class="tile">');
                var positionX = x;
                var positionY = y;
                jqTile.attr('x', positionX);
                jqTile.attr('y', positionY);
                jqTile.css('left', _ui.ingameXToPixels(positionX) + 'px');
                jqTile.css('top', _ui.ingameYToPixels(positionY) + 'px');

                var jqVisionBlocker = $('<div class="vision-blocker">');
                jqTile.append(jqVisionBlocker);

                jqGameArea.append(jqTile);

                jqTile.on("contextmenu", function (event) {
                    _ui.handleRightClickOnTile(event, $(this));
                    return false;
                });

                tiles[x][y] = {
                    jqElement: jqTile,
                    positionX: x,
                    positionY: y
                };
            }
        }
    },
    showMovementForSelectedUnit: function () {
        $('.tile.can-be-moved-to').removeClass('can-be-moved-to');
        $('.unit.can-be-attacked').removeClass('can-be-attacked');
        var unit = _ui.getSelectedUnit();
        if (unit !== undefined) {
            var shortestPaths = _game.getShortestPathsForUnit(unit);
            for(var x in shortestPaths){
                for(var y in shortestPaths[x]){
                    var shortestPath = shortestPaths[x][y];
                    if (shortestPath.canReach) {
                        tiles[x][y].jqElement.addClass('can-be-moved-to');
                    }
                }
            }
            for (var unitIndex in _player.getOtherPlayer().units) {
                var playerUnit = _player.getOtherPlayer().units[unitIndex];
                if (
                    _game.getDistanceBetweenUnits(unit, playerUnit) <= unit.unitType.attackRange &&
                    _unit.canAttack(unit)
                ) {
                    playerUnit.jqElement.addClass('can-be-attacked');
                }
            }
        }
    },
    updateHitPointBar: function (unit) {
        _progressBar.setValue(unit.hitPointBar, unit.currentHitPoints);
    }
};

// UTILS:
var clone = function (object){
    var returnObject;
    if (Array.isArray(object)) {
        returnObject = [];
    } else {
        returnObject = {};
    }
    for (var property in object) {
        var value = object[property];
        if (typeof (value) == "object") {
            returnObject[property] = clone(value);
        } else {
            returnObject[property] = value;
        }
    }
    return returnObject;
}