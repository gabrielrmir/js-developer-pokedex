
const pokeApi = {}

const statsNames = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    'speed': 'Speed',
};

async function getPokemonEvolutions(species) {
    return fetch(species.evolution_chain.url)
        .then(response => response.json())
}

async function getPokemonSpecies(pokemon) {
    return fetch(pokemon.species.url)
        .then(response => response.json())
}

function mapChain(chain) {
    const newChain = {};
    newChain.name = chain.species.name
    const url = chain.species.url.replace(/\/$/, '')
    newChain.img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${url.substring(url.lastIndexOf('/')+1)}.svg`;
    newChain.next = chain.evolves_to.map(mapChain);
    return newChain;
}

async function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon()
    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.species.name
    
    const species = await getPokemonSpecies(pokeDetail);
    pokemon.species = species.genera.find(g => g.language.name === 'en').genus.replace(' Pokémon', '');

    const evolutions = await getPokemonEvolutions(species);
    pokemon.evolutionChain = mapChain(evolutions.chain);

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
    const [type] = types

    pokemon.types = types
    pokemon.type = type

    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default
    
    pokemon.stats = pokeDetail.stats.map(statSlot => {
        return {
            name: statsNames[statSlot.stat.name] || statSlot.stat.name,
            amount: statSlot.base_stat
        }
    })
    pokemon.stats.push({
        name: 'Total',
        amount: pokemon.stats.reduce((sum, stat) => sum+stat.amount,0)
    });

    pokemon.moves = pokeDetail.moves.map(moveSlot => moveSlot.move.name.replace('-',' '));

    pokemon.height = pokeDetail.height;
    pokemon.weight = pokeDetail.weight;
    pokemon.abilities = pokeDetail.abilities.map(abilitySlot => abilitySlot.ability.name.replace('-',' '));

    return pokemon
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon)
}

pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails)
}
