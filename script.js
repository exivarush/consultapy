      const vocationShort = vocationMap[member.vocation] || member.vocation;
      const colorClass = colorMap[vocationShort] || "";

      const memberDiv = document.createElement("div");
      memberDiv.classList.add("character", colorClass, "bold");
      memberDiv.innerHTML = `${member.name} (Level: ${member.level}, ${vocationShort})`;
      membersDiv.appendChild(memberDiv);
    });
  } catch (error) {
    console.error("Erro ao buscar dados da guild:", error);
    alert("Ocorreu um erro ao buscar os dados da guild.");
  }
}

async function filterDeaths() {
  const levelFilter = parseInt(document.getElementById("levelFilter").value, 10);
  const vocationFilter = document.getElementById("vocationFilter").value;
  const membersDiv = document.getElementById("members");
  const members = [...membersDiv.children];

  const filteredMembers = members.filter(member => {
    const [name, details] = member.innerText.split(" (");
    const level = parseInt(details.match(/Level: (\d+)/)[1], 10);
    const vocation = details.match(/, (\w+)\)$/)[1];

    return (
      (!levelFilter || level >= levelFilter) &&
      (!vocationFilter || vocation === vocationFilter)
    );
  });

  const deathsDiv = document.getElementById("deaths");
  deathsDiv.innerHTML = ""; // Limpa os resultados anteriores

  for (const member of filteredMembers) {
    const name = member.innerText.split(" (")[0];

    try {
      const response = await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`);
      const data = await response.json();
      const { deaths } = extractRelevantData(data);

      if (deaths.length > 0) {
        const characterDiv = document.createElement("div");
        characterDiv.innerHTML = `<strong>${name}</strong>`;

        const deathList = document.createElement("ul");
        deaths.forEach(death => {
          const deathItem = document.createElement("li");
          deathItem.innerText = `${death.time}: ${death.reason}`;
          deathList.appendChild(deathItem);
        });

        characterDiv.appendChild(deathList);
        deathsDiv.appendChild(characterDiv);
      }
    } catch (error) {
      console.error(`Erro ao buscar dados do personagem ${name}:`, error);
    }
  }
}

function extractRelevantData(data) {
  if (!data || !data.character) {
    return { name: "", deaths: [] };
  }

  const { name } = data.character.character;
  const relevantDeaths = data.character.deaths?.map(death => ({
    time: death.time,
    reason: death.reason,
  })) || [];

  return {
    name,
    deaths: relevantDeaths,
  };
}
