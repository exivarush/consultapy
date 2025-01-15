const BASE_URL = "https://api.tibiadata.com/v4";

// Função para buscar membros online da guild
async function fetchGuildMembers(guildName) {
  const url = `${BASE_URL}/guild/${encodeURIComponent(guildName)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erro ao buscar informações da guild.");
    }
    const data = await response.json();
    const members = data.guild.members.flatMap(group => group.online_status.filter(member => member.status === "online"));
    return members;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Função para buscar mortes do personagem
async function fetchCharacterDeaths(characterName) {
  const url = `${BASE_URL}/character/${encodeURIComponent(characterName)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erro ao buscar informações do personagem.");
    }
    const data = await response.json();
    const today = new Date();
    const last30Days = new Date(today.setDate(today.getDate() - 30));

    const deaths = data.characters.deaths.filter(death => {
      const deathDate = new Date(death.time);
      return deathDate >= last30Days;
    });
    return deaths;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Atualizar lista de membros online no HTML
function updateMembersList(members) {
  const membersList = document.getElementById("membersList");
  membersList.innerHTML = "";
  const vocationColors = {
    "Royal Paladin": "vocation-rp",
    "Elder Druid": "vocation-ed",
    "Elite Knight": "vocation-ek",
    "Master Sorcerer": "vocation-ms"
  };
  members.sort((a, b) => b.level - a.level).forEach(member => {
    const li = document.createElement("li");
    li.className = vocationColors[member.vocation] || "";
    li.innerHTML = `<strong>${member.name}</strong> - Level: ${member.level} - Vocação: ${member.vocation}`;
    membersList.appendChild(li);
  });
}

// Atualizar resultados filtrados
function updateFilterResults(members) {
  const filterResults = document.getElementById("filterResults");
  filterResults.innerHTML = "";
  members.forEach(async member => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${member.name}</strong> - Level: ${member.level}`;
    const deaths = await fetchCharacterDeaths(member.name);
    if (deaths.length > 0) {
      const deathList = document.createElement("ul");
      deathList.className = "death-info";
      deaths.forEach(death => {
        const deathItem = document.createElement("li");
        deathItem.textContent = `Level: ${death.level}, Razão: ${death.reason}`;
        deathList.appendChild(deathItem);
      });
      li.appendChild(deathList);
    }
    filterResults.appendChild(li);
  });
}

// Manipular o formulário de busca da guild
document.getElementById("guildForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const guildName = document.getElementById("guildName").value.trim();
  const members = await fetchGuildMembers(guildName);
  updateMembersList(members);
});

// Manipular o formulário de filtro
document.getElementById("filterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const minLevel = parseInt(document.getElementById("minLevel").value) || 0;
  const vocation = document.getElementById("vocation").value;

  const filteredMembers = Array.from(document.getElementById("membersList").children).filter(li => {
    const level = parseInt(li.innerHTML.match(/Level: (\d+)/)[1]);
    const voc = li.innerHTML.match(/Vocação: (\w+)/)[1];
    return level >= minLevel && (vocation === "" || voc === vocation);
  });
  updateFilterResults(filteredMembers);
});
