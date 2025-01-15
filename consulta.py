import asyncio
import datetime
import aiohttp
from aiohttp import ClientSession

BASE_URL = "https://api.tibiadata.com/v4"

# Obter membros online da guild
async def fetch_guild_members(session: ClientSession, guild_name: str):
    url = f"{BASE_URL}/guild/{guild_name}"
    async with session.get(url) as response:
        if response.status != 200:
            print(f"Erro ao buscar guild: {response.status}")
            return None
        data = await response.json()
        members = data.get("guild", {}).get("members", [])
        return [m for m in members if m.get("status") == "online"]

# Obter mortes do personagem
async def fetch_character_deaths(session: ClientSession, character_name: str):
    url = f"{BASE_URL}/character/{character_name}"
    async with session.get(url) as response:
        if response.status != 200:
            print(f"Erro ao buscar personagem: {response.status}")
            return None
        data = await response.json()
        deaths = data.get("characters", {}).get("deaths", [])
        # Filtrar mortes nos últimos 30 dias
        today = datetime.datetime.now()
        last_30_days = today - datetime.timedelta(days=30)
        return [d for d in deaths if datetime.datetime.fromisoformat(d["time"]) >= last_30_days]

# Função principal
async def main():
    guild_name = input("Digite o nome da guild: ").strip().lower()
    async with aiohttp.ClientSession() as session:
        members = await fetch_guild_members(session, guild_name)
        if not members:
            print("Nenhum membro online encontrado.")
            return

        print("Membros online:")
        for member in sorted(members, key=lambda m: m["level"], reverse=True):
            vocation = member["vocation"]
            abbreviation = {"Royal Paladin": "RP", "Elder Druid": "ED", "Elite Knight": "EK", "Master Sorcerer": "MS"}.get(vocation, vocation)
            print(f"{member['name']} - Level: {member['level']} - Vocação: {abbreviation}")

        # Filtrar por level e vocação
        min_level = int(input("Digite o level mínimo para filtrar: ") or 0)
        vocation_filter = input("Digite a vocação para filtrar (RP, ED, EK, MS ou deixe em branco): ").strip().upper()
        
        filtered_members = [
            member for member in members
            if member["level"] >= min_level and (vocation_filter == "" or abbreviation == vocation_filter)
        ]
        print("\nResultados do filtro:")
        for member in filtered_members:
            print(f"{member['name']} - Level: {member['level']} - Vocação: {abbreviation}")
            deaths = await fetch_character_deaths(session, member["name"])
            if deaths:
                print("Mortes nos últimos 30 dias:")
                for death in deaths:
                    print(f" - Level: {death['level']}, Razão: {death['reason']}")
            else:
                print("Nenhuma morte registrada.")

if __name__ == "__main__":
    asyncio.run(main())
