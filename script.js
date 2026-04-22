let allEpisodes = [];
let allShows = [];
const episodesCache = {};

function formatEpisodeCode(season, episodeNumber) {
  const paddedSeason = String(season).padStart(2, "0");
  const paddedEpisodeNumber = String(episodeNumber).padStart(2, "0");
  return `S${paddedSeason}E${paddedEpisodeNumber}`;
}

function stripHtml(html) {
  return (html || "").replace(/<[^>]*>/g, "");
}

function createEpisodeCard(episode) {
  const article = document.createElement("article");
  article.className = "episode-card";

  const heading = document.createElement("h2");
  heading.className = "episode-title";
  heading.textContent = `${episode.name} - ${formatEpisodeCode(
    episode.season,
    episode.number,
  )}`;

  const image = document.createElement("img");
  image.className = "episode-image";
  image.src = episode.image ? episode.image.medium : "";
  image.alt = `${episode.name} episode image`;

  const meta = document.createElement("p");
  meta.className = "episode-meta";
  meta.textContent = `Season ${episode.season}, Episode ${episode.number}`;

  const summary = document.createElement("div");
  summary.className = "episode-summary";
  summary.innerHTML = episode.summary || "";

  const sourceLink = document.createElement("p");
  sourceLink.className = "episode-link";

  const link = document.createElement("a");
  link.href = episode.url || "#";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View this episode on TVMaze";

  sourceLink.appendChild(link);

  article.appendChild(heading);
  article.appendChild(image);
  article.appendChild(meta);
  article.appendChild(summary);
  article.appendChild(sourceLink);

  return article;
}

function createShowCard(show) {
  const article = document.createElement("article");
  article.className = "episode-card";

  const heading = document.createElement("h2");
  heading.className = "episode-title";

  const titleButton = document.createElement("button");
  titleButton.type = "button";
  titleButton.className = "show-title-button";
  titleButton.textContent = show.name;
  titleButton.addEventListener("click", () => {
    openShow(show.id);
  });

  heading.appendChild(titleButton);

  const image = document.createElement("img");
  image.className = "episode-image";
  image.src = show.image ? show.image.medium : "";
  image.alt = `${show.name} poster`;

  const summary = document.createElement("div");
  summary.className = "episode-summary";
  summary.innerHTML = show.summary || "";

  const genres = document.createElement("p");
  genres.className = "episode-meta";
  genres.textContent = `Genres: ${show.genres.join(", ")}`;

  const status = document.createElement("p");
  status.textContent = `Status: ${show.status || "Unknown"}`;

  const rating = document.createElement("p");
  rating.textContent = `Rating: ${show.rating && show.rating.average ? show.rating.average : "N/A"}`;

  const runtime = document.createElement("p");
  runtime.textContent = `Runtime: ${show.runtime || "N/A"} minutes`;

  article.appendChild(heading);
  article.appendChild(image);
  article.appendChild(genres);
  article.appendChild(status);
  article.appendChild(rating);
  article.appendChild(runtime);
  article.appendChild(summary);

  return article;
}

function displayEpisodes(episodes) {
  const rootElement = document.getElementById("root");
  rootElement.innerHTML = "";

  episodes.forEach((episode) => {
    rootElement.appendChild(createEpisodeCard(episode));
  });
}

function displayShows(shows) {
  const showsRoot = document.getElementById("showsRoot");
  showsRoot.innerHTML = "";

  shows.forEach((show) => {
    showsRoot.appendChild(createShowCard(show));
  });

  document.getElementById("showCount").textContent =
    `Displaying ${shows.length}/${allShows.length} shows.`;
}

function updateEpisodeCount(
  visibleEpisodes,
  totalEpisodes = allEpisodes.length,
) {
  const episodeCountElement = document.getElementById("episode-count");
  episodeCountElement.textContent = `Displaying ${visibleEpisodes.length}/${totalEpisodes} episodes.`;
}

function populateEpisodes(episodes) {
  const episodeSelect = document.getElementById("episodeSelect");
  episodeSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All Episodes";
  episodeSelect.appendChild(defaultOption);

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = formatEpisodeCode(episode.season, episode.number);
    option.textContent = `${formatEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
}

function populateShows(shows) {
  const showSelect = document.getElementById("showSelect");
  showSelect.innerHTML = "";

  const sortedShows = [...shows].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );

  sortedShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

function renderEpisodes() {
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");
  const activeFiltersText = document.getElementById("activeFilters");
  const helperMessage = document.getElementById("helperMessage");

  const searchTerm = (searchInput.value || "").trim().toLowerCase();
  const selectedEpisode = episodeSelect.value;

  const filteredEpisodes = allEpisodes.filter((episode) => {
    const episodeCode = formatEpisodeCode(episode.season, episode.number);
    const shortEpisodeCode =
      `S${episode.season}E${episode.number}`.toLowerCase();
    const name = (episode.name || "").toLowerCase();
    const summary = stripHtml(episode.summary).toLowerCase();

    const matchesSearch =
      name.includes(searchTerm) ||
      summary.includes(searchTerm) ||
      episodeCode.toLowerCase().includes(searchTerm) ||
      shortEpisodeCode.includes(searchTerm);

    const matchesDropdown =
      selectedEpisode === "all" || episodeCode === selectedEpisode;

    return matchesSearch && matchesDropdown;
  });

  displayEpisodes(filteredEpisodes);
  updateEpisodeCount(filteredEpisodes, allEpisodes.length);

  const hasSearch = searchInput.value !== "";
  const hasDropdown = episodeSelect.value !== "all";

  if (hasSearch && hasDropdown) {
    activeFiltersText.textContent = `Filtering by: "${searchInput.value}" in ${episodeSelect.value}`;
  } else if (hasSearch) {
    activeFiltersText.textContent = `Filtering by: "${searchInput.value}"`;
  } else if (hasDropdown) {
    activeFiltersText.textContent = `Filtering by: ${episodeSelect.value}`;
  } else {
    activeFiltersText.textContent = "";
  }

  if (hasSearch || hasDropdown) {
    helperMessage.textContent =
      "Press 'Clear Filters' to reset your search and dropdown selections.";
  } else {
    helperMessage.textContent = "";
  }
}

function renderShows() {
  const showSearchInput = document.getElementById("showSearchInput");
  const searchTerm = (showSearchInput.value || "").trim().toLowerCase();

  const filteredShows = allShows.filter((show) => {
    const name = (show.name || "").toLowerCase();
    const genres = (show.genres || []).join(" ").toLowerCase();
    const summary = stripHtml(show.summary).toLowerCase();

    return (
      name.includes(searchTerm) ||
      genres.includes(searchTerm) ||
      summary.includes(searchTerm)
    );
  });

  displayShows(filteredShows);
}

async function fetchShows() {
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");

  loadingMessage.textContent = "Loading shows...";
  errorMessage.textContent = "";

  try {
    const response = await fetch("https://api.tvmaze.com/shows");

    if (!response.ok) {
      throw new Error("Failed to load shows.");
    }

    allShows = await response.json();
    populateShows(allShows);
    renderShows();

    loadingMessage.textContent = "";
  } catch (error) {
    loadingMessage.textContent = "";
    errorMessage.textContent =
      "Sorry, something went wrong while loading shows.";
  }
}

async function loadEpisodesForShow(showId) {
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");
  const activeFiltersText = document.getElementById("activeFilters");
  const helperMessage = document.getElementById("helperMessage");

  loadingMessage.textContent = "Loading episodes...";
  errorMessage.textContent = "";

  try {
    if (episodesCache[showId]) {
      allEpisodes = episodesCache[showId];
    } else {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );

      if (!response.ok) {
        throw new Error("Failed to load episodes.");
      }

      const episodes = await response.json();
      episodesCache[showId] = episodes;
      allEpisodes = episodes;
    }

    searchInput.value = "";
    populateEpisodes(allEpisodes);
    episodeSelect.value = "all";

    displayEpisodes(allEpisodes);
    updateEpisodeCount(allEpisodes, allEpisodes.length);

    activeFiltersText.textContent = "";
    helperMessage.textContent = "";
    loadingMessage.textContent = "";
  } catch (error) {
    loadingMessage.textContent = "";
    errorMessage.textContent =
      "Sorry, something went wrong while loading episodes for this show.";
  }
}

async function openShow(showId) {
  document.getElementById("showsView").hidden = true;
  document.getElementById("episodesView").hidden = false;
  document.getElementById("root").hidden = false;
  document.getElementById("backToShowsButton").hidden = false;
  document.getElementById("showSelect").value = String(showId);

  await loadEpisodesForShow(showId);
}

function showShowsView() {
  document.getElementById("showsView").hidden = false;
  document.getElementById("episodesView").hidden = true;
  document.getElementById("root").hidden = true;
  document.getElementById("backToShowsButton").hidden = true;
  document.getElementById("loadingMessage").textContent = "";
  document.getElementById("errorMessage").textContent = "";
}

function setup() {
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");
  const showSelect = document.getElementById("showSelect");
  const clearButton = document.getElementById("clearFilters");
  const showSearchInput = document.getElementById("showSearchInput");
  const backToShowsButton = document.getElementById("backToShowsButton");

  searchInput.addEventListener("input", renderEpisodes);
  episodeSelect.addEventListener("change", renderEpisodes);

  showSelect.addEventListener("change", () => {
    openShow(showSelect.value);
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    episodeSelect.value = "all";
    renderEpisodes();
  });

  showSearchInput.addEventListener("input", renderShows);
  backToShowsButton.addEventListener("click", showShowsView);

  showShowsView();
  fetchShows();
}

window.onload = setup;
