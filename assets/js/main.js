const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')
const modalElement = document.getElementById('modal')
const modalContentElement = document.getElementById('modal-content')

const maxRecords = 151
const limit = 10
let offset = 0;

function convertPokemonToLi(pokemon) {
    return `
        <li class="pokemon ${pokemon.type}">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>

                <img src="${pokemon.photo}"
                     alt="${pokemon.name}">
            </div>
            
            <button class="more-info-button" onclick="showModal(this.parentElement)">More Info</button>

            <div class="tab-container">
                <div class="tabs">
                    <button class="tab-button" onclick="selectModalTab(this,'about')" selected>About</button>
                    <button class="tab-button" onclick="selectModalTab(this,'stats')">Base Stats</button>
                    <button class="tab-button" onclick="selectModalTab(this,'evolution')">Evolution</button>
                    <button class="tab-button" onclick="selectModalTab(this,'moves')">Moves</button>
                </div>
                <div data-tab-id="about" selected>About</div>
                <div class="stats" data-tab-id="stats">
                ${pokemon.stats.map(stat => `
                <span class="stat-name">${stat.name}</span>
                <span class="stat-number">${stat.amount}</span>
                <div class="stat-bar-background">
                <div class="stat-bar" style="width: ${stat.amount}%;"></div>
                </div>`).join('')}
                </div>
                <div data-tab-id="evolution">Evolution</div>
                <div data-tab-id="moves">Moves</div>
            </div>

        </li>
    `
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        const newHtml = pokemons.map(convertPokemonToLi).join('')
        pokemonList.innerHTML += newHtml
    })
}

loadPokemonItens(offset, limit)

loadMoreButton.addEventListener('click', () => {
    offset += limit
    const qtdRecordsWithNexPage = offset + limit

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset
        loadPokemonItens(offset, newLimit)

        loadMoreButton.parentElement.removeChild(loadMoreButton)
    } else {
        loadPokemonItens(offset, limit)
    }
})

function showModal(e) {
    modalElement.style.display = 'flex';
    modalContentElement.innerHTML = e.innerHTML;
    modalContentElement.className = e.classList[1];
}

function selectModalTab(e,tabId) {
    const modalTabs = document.querySelectorAll(`#modal-content .tab-container [data-tab-id]`);
    
    const selectedButton = document.querySelector("#modal-content .tab-container .tabs [selected]");
    if (selectedButton) {
        selectedButton.removeAttribute('selected');
    }
    e.setAttribute('selected', true);

    modalTabs.forEach(modalTab => {
        if (modalTab.dataset.tabId === tabId) {
            modalTab.setAttribute('selected', true);
        } else {
            modalTab.removeAttribute('selected');
        }
    });
}

function closeModal() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
} 