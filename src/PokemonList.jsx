import { useState, useEffect, useRef } from "react";
import React from "react";

const PAGE_SIZE = 12;
const fetchPokemonPage = async (offset = 0) => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${offset}`
  );
  const data = await response.json();
  return data.results; // Return the actual list of pokemons
};

function PokemonList() {
  const [pokemons, setPokemons] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const endOfPageRef = useRef(); // Ref to track the end of the page
  const intersectionCallback = useRef(); // Ref for intersection callback
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsPending(true);
    fetchPokemonPage().then((firstPageOfPokemons) => {
      setPokemons(firstPageOfPokemons); // Update the state with the Pokemon data
      setFilteredPokemons(firstPageOfPokemons);
      setIsPending(false);
    });
  }, []);

  // Intersection observer to detect when the user reaches the end of the page
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      intersectionCallback.current(entries);
    });

    if (endOfPageRef.current) {
      observer.observe(endOfPageRef.current); // Attach observer to the ref
    }

    return () => {
      if (endOfPageRef.current) {
        observer.unobserve(endOfPageRef.current); // Clean up observer on unmount
      }
    };
  }, []);

  // Handle what happens when the user scrolls to the end of the page
  const handleIntersection = (entries) => {
    const endOfPage = entries[0];
    if (endOfPage.isIntersecting && !isPending) {
      setIsPending(true);
      fetchPokemonPage(pokemons.length).then((newPageOfPokemons) => {
        setPokemons((prevPokemons) => [...prevPokemons, ...newPageOfPokemons]); // Append new pokemons
        setFilteredPokemons((prevPokemons) => [
          ...prevPokemons,
          ...newPageOfPokemons,
        ]); // Append new pokemons to filteredPokemons too
        setIsPending(false);
      });
    }
  };

  useEffect(() => {
    intersectionCallback.current = handleIntersection; // Set the callback
  }, [pokemons, isPending]); // Dependencies: handle when pokemons or isPending changes

  useEffect(() => {
    searchQuery === ""
      ? setFilteredPokemons(pokemons)
      : setFilteredPokemons(
          pokemons.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
  }, [searchQuery, pokemons]);

  return (
    <div>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "250px 250px 250px 250px", // Space-separated values
          margin: "auto",
          maxWidth: "1000px",
        }}
      >
        {filteredPokemons.map((pokemon) => (
          <div
            key={pokemon.name}
            style={{
              border: "1px solid lightgray", // Style should be lowercase
              padding: "5px",
              margin: "5px",
              textAlign: "center",
            }}
          >
            <h3>
              {pokemon.name}
              <img
                src={`https://img.pokemondb.net/artwork/${pokemon.name}.jpg`}
                width="200px"
                alt={pokemon.name}
              />
            </h3>
          </div>
        ))}
      </div>
      {isPending && (
        <div style={{ textAlign: "center", margin: "10px" }}>Loading ...</div>
      )}
      <div ref={endOfPageRef}></div>{" "}
      {/* This is where the observer will track the end of the page */}
    </div>
  );
}

// Header component is defined here
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

export default PokemonList;
