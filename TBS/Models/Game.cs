using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TBS.Models
{
    public class Game
    {
        public Guid ID { get; set; }
        public List<Player> Players { get; set; }
        public List<Unit> Units { get; set; }
        public int CurrentTurn { get; set; }
        public Player CurrentPlayer { get; set; }
        public Player Host { get; private set; }

        public Game(Player host)
        {
            this.ID = Guid.NewGuid();
            this.Host = host;
            Players = new List<Player>();
            Units = new List<Unit>();
            AddPlayer(host);
        }

        public void Start()
        {
            this.CurrentTurn = 0;
            this.CurrentPlayer = GetRandomPlayer();

        }

        private Player GetRandomPlayer()
        {
            var random = new Random();
            var index = random.Next(Players.Count - 1);
            return Players[index];
        }

        public void AddPlayer(Player player)
        {
            this.Players.Add(player);
            player.AddGame(this);
        }

        public void AddUnit(Player player, UnitType unitType, int positionX, int positionY)
        {
            var unit = new Unit(unitType, positionX, positionY);
            player.Units.Add(unit);
            unit.Player = player;
            Units.Add(unit);
            unit.Game = this;
        }

        public void EndTurn()
        {
            CurrentTurn++;
            UpdateCurrentPlayer();
            ReadyUnitsForPlayer(CurrentPlayer);
        }

        private void UpdateCurrentPlayer()
        {
            var player1 = Players[0];
            var player2 = Players[1];
            CurrentPlayer = CurrentPlayer == player1 ? player2 : player1;
        }

        private void ReadyUnitsForPlayer(Player player)
        {
            foreach (var unit in player.Units)
            {
                unit.ReplenishEnergy();
                unit.ReplenishAttacks();
            }
        }

        public void MoveUnit(Unit unit, int positionX, int positionY)
        {
            unit.Move(positionX, positionY);
        }

        public void OrderUnitToAttack(Unit attackingUnit, Unit targetUnit)
        {
            attackingUnit.Attack(targetUnit);
        }
    }
}