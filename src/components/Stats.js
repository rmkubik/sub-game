import React from "react";

const Stats = ({ oxygen, crew, maxHealth, damage, points }) => {
  return (
    <div>
      <h3>Ship Stats</h3>
      <p>Oxygen - {oxygen}/10</p>
      <p>Crew Dice - {crew}</p>
      <p>
        Health - {maxHealth - damage}/{maxHealth}
      </p>
      <p>Points - {points}</p>
    </div>
  );
};

export default Stats;
