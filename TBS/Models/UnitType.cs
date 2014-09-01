using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TBS.Models
{
    public class UnitType
    {
        public Guid ID { get; set; }

        public string Name { get; set; }

        public double Damage { get; set; }

        public double AttackSpeed { get; set; }

        public double HitPoints { get; set; }

        public int Energy { get; set; }

        public int Attacks { get; set; }

        public int EnergyPerAttack { get; set; }

        public UnitType(string name, double damage, double attackSpeed, double hitPoints, int energy, int attacks, int energyPerAttack)
        {
            this.Name = name;
            this.Damage = damage;
            this.AttackSpeed = attackSpeed;
            this.HitPoints = hitPoints;
            this.Energy = energy;
            this.Attacks = attacks;
            this.EnergyPerAttack = energyPerAttack;
        }
    }
}