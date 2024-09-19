import React from "react";

function Header({ searchQuery, setSearchQuery }) {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Pokedex</h1>
      <input
        type="text"
        placeholder="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "300px",
          padding: "10px",
          fontSize: "16px",
          fontFamily: "ariel",
          marginTop: "10px",
        }}
      />
    </div>
  );
}

export default Header;
