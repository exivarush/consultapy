async function consultarGuild() {
    const guildName = document.getElementById('guildName').value.toLowerCase();
    const response = await fetch(`https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`);
    const data = await response.json();
    const membros = data.guild.members;
    const resultados = document.getElementById('resultados');
    resultados.innerHTML = '';

    membros.filter(membro => membro.status === 'online')
        .sort((a, b) => b.level - a.level)
        .forEach(membro => {
            const div = document.createElement('div');
            div.className = `${membro.vocation.replace(' ', '')} bold`;
            div.textContent = `${membro.name} - ${membro.level} - ${membro.vocation.replace('Royal Paladin', 'RP').replace('Elder Druid', 'ED').replace('Elite Knight', 'EK').replace('Master Sorcerer', 'MS')}`;
            resultados.appendChild(div);
        });
}

async function filtrarMortes() {
    const levelMin = document.getElementById('levelMin').value;
    const levelMax = document.getElementById('levelMax').value;
    const vocation = document.getElementById('vocation').value;
    const resultados = document.getElementById('resultados').children;
    const mortes = document.getElementById('mortes');
    mortes.innerHTML = '';

    for (let i = 0; i < resultados.length; i++) {
        const membro = resultados[i].textContent.split(' - ');
        const nome = membro[0];
        const level = parseInt(membro[1]);
        const vocacao = membro[2];

        if ((levelMin === '' || level >= levelMin) && (levelMax === '' || level <= levelMax) && (vocation === '' || vocacao === vocation)) {
            const response = await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(nome)}`);
            const data = await response.json();
            const mortesPersonagem = data.character.deaths.filter(morte => new Date(morte.time) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

            mortesPersonagem.forEach(morte => {
                const div = document.createElement('div');
                div.textContent = `${nome} - Level ${morte.level} - ${morte.reason}`;
                mortes.appendChild(div);
            });
        }
    }
}
