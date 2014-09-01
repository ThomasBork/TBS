using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TBS.Models
{
    public class Unit
    {
        public Guid ID { get; set; }
        public UnitType UnitType { get; set; }
        public Game Game { get; set; }
        public Player Player { get; set; }
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public double CurrentHitpoints { get; set; }
        public int CurrentEnergy { get; set; }
        public int AttacksLeft { get; set; }

        public Unit(UnitType unitType, int positionX, int positionY)
        {
            this.UnitType = unitType;
            this.CurrentHitpoints = UnitType.HitPoints;
            this.CurrentEnergy = UnitType.Energy;
            this.AttacksLeft = UnitType.Attacks;
            this.PositionX = positionX;
            this.PositionY = positionY;
        }

        public void Move(int positionX, int positionY)
        {
            SpendEnergy(positionX, positionY);
            PositionX = positionX;
            PositionY = positionY;
        }

        private void SpendEnergy(int positionX, int positionY)
        {
            var deltaX = this.PositionX - positionX;
            var deltaY = this.PositionY - positionY;
            var energySpent = Math.Abs(deltaX) + Math.Abs(deltaY);
            CurrentEnergy -= energySpent;
        }

        public bool CanAttack(Unit unit)
        {
            var canAttack = false;

            if (
                (
                    this.PositionX == unit.PositionX &&
                    (
                        this.PositionY == unit.PositionY - 1 ||
                        this.PositionY == unit.PositionY + 1
                    )
                ) ||
                (
                    this.PositionY == unit.PositionY &&
                    (
                        this.PositionX == unit.PositionX - 1 ||
                        this.PositionX == unit.PositionX + 1
                    )
                )
            )
            {
                canAttack = true;
            }

            return canAttack;
        }

        public void Attack(Unit unit)
        {
            var damage = CalculateDamage();
            unit.CurrentHitpoints -= damage;
            if (AttacksLeft > 0)
            {
                AttacksLeft--;
            }
            else
            {
                CurrentEnergy -= UnitType.EnergyPerAttack;
            }
        }

        public double CalculateDamage()
        {
            var damage = UnitType.AttackSpeed * UnitType.Damage;
            return damage;
        }

        public void ReplenishEnergy()
        {
            CurrentEnergy = UnitType.Energy;
        }

        public void ReplenishAttacks()
        {
            AttacksLeft = UnitType.Attacks;
        }
    }
}