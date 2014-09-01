using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TBS.Models
{
    public class Player
    {
        public Guid ID { get; set; }
        public string Name { get; set; }
        public List<Game> Games { get; set; }
        public List<Unit> Units { get; set; }

        public Player(string name)
        {
            this.ID = Guid.NewGuid();
            this.Name = name;
            Games = new List<Game>();
            Units = new List<Unit>();
        }

        public void AddGame(Game game)
        {
            Games.Add(game);
        }
    }
}