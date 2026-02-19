const generateSeriesData = () => {
  const data = {};
  const seasons = [
    { name: "1. Sezon", folder: "01", count: 38, offset: 0 },
    { name: "2. Sezon", folder: "02", count: 42, offset: 38 },
    { name: "3. Sezon", folder: "03", count: 38, offset: 80 },
    { name: "4. Sezon", folder: "04", count: 45, offset: 118 },
    { name: "5. Sezon", folder: "05", count: 11, offset: 163 },
  ];

  seasons.forEach((s) => {
    data[s.name] = [];
    for (let i = 1; i <= s.count; i++) {
      const episodeGlobalId = (s.offset + i).toString().padStart(3, "0");
      const episodeInSeason = i.toString().padStart(2, "0");

      data[s.name].push({
        id: episodeGlobalId,
        title: `${s.offset + i}. Bölüm`,
        url: `https://filedn.eu/lUiS6kEpyRCH6HNyQxUD9xz/Yaprak_Dokumu/Season%20${s.folder}/S${s.folder}E${episodeInSeason}.mp4`,
      });
    }
  });
  return data;
};

window.seriesData = generateSeriesData();

document.addEventListener("DOMContentLoaded", () => {
  const mainRows = document.getElementById("main-rows");
  if (!mainRows) return;

  const progressData = JSON.parse(
    localStorage.getItem("yaprak_progress") || "{}",
  );
  const startedEpisodes = [];

  Object.keys(window.seriesData).forEach((season) => {
    window.seriesData[season].forEach((ep) => {
      const saved = progressData[ep.id];
      const savedTime = typeof saved === "object" ? saved.time : saved;

      if (savedTime && savedTime > 10) {
        startedEpisodes.push({ ...ep, seasonName: season, savedData: saved });
      }
    });
  });

  if (startedEpisodes.length > 0) {
    const continueRow = document.createElement("div");
    continueRow.className = "row-container continue-watching";
    continueRow.innerHTML = `
            <div class="row-header" style="color: var(--netflix-red);">İzlemeye Devam Et</div>
            <div class="slider" id="list-continue"></div>
        `;
    mainRows.appendChild(continueRow);

    const continueList = document.getElementById("list-continue");

    [...startedEpisodes].reverse().forEach((ep) => {
      const card = document.createElement("div");
      card.className = "card";
      card.tabIndex = 0;
      const coverPath = `./assets/img/covers/${ep.id}.jpg`;

      let displayPercent = 0;
      if (typeof ep.savedData === "object" && ep.savedData.percent) {
        displayPercent = ep.savedData.percent;
      } else if (typeof ep.savedData === "number") {
        displayPercent = 10;
      }

      card.innerHTML = `
        <img src="${coverPath}">
        <div class="play-overlay"><span></span></div>
        <div class="progress-container">
            <div class="progress-bar" style="width: ${displayPercent}%;"></div>
        </div>
      `;
      card.onclick = () => {
        window.location.href = `./watch.html?id=${ep.id}&url=${encodeURIComponent(ep.url)}&poster=${encodeURIComponent(coverPath)}&title=${encodeURIComponent(ep.title)}&season=${encodeURIComponent(ep.seasonName)}`;
      };
      continueList.appendChild(card);
    });
  }

  Object.keys(window.seriesData).forEach((seasonName) => {
    const row = document.createElement("div");
    row.className = "row-container";
    row.innerHTML = `<div class="row-header">${seasonName}</div><div class="slider" id="list-${seasonName.replace(/\s/g, "")}"></div>`;
    mainRows.appendChild(row);

    const list = document.getElementById(
      `list-${seasonName.replace(/\s/g, "")}`,
    );

    window.seriesData[seasonName].forEach((ep) => {
      const card = document.createElement("div");
      card.className = "card";
      card.tabIndex = 0;
      const coverPath = `./assets/img/covers/${ep.id}.jpg`;

      card.innerHTML = `
        <img src="${coverPath}" onerror="this.parentElement.style.display='none'">
        <div class="play-overlay"><span></span></div>
      `;

      card.onclick = () => {
        window.location.href = `./watch.html?id=${ep.id}&url=${encodeURIComponent(ep.url)}&poster=${encodeURIComponent(coverPath)}&title=${encodeURIComponent(ep.title)}&season=${encodeURIComponent(seasonName)}`;
      };
      list.appendChild(card);
    });
  });
});
