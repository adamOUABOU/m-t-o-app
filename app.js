const formulaire = document.querySelector("#recherche");
const ville = document.querySelector("#ville");
const message = document.querySelector("#message");
const carte = document.querySelector("#meteo");
function afficher(id, texte) {
  document.getElementById(id).textContent = texte;
}

function iconeMeteo(code) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "❄️";
  if (code >= 95) return "⛈️";
  return "🌧️";
}
async function lireJson(url) {
  const reponse = await fetch(url);
  if (!reponse.ok) throw new Error("Service météo indisponible.");
  return reponse.json();
}
async function chercherMeteo(nom) {
  const recherche = new URL("https://geocoding-api.open-meteo.com/v1/search");
  recherche.search = new URLSearchParams({ name: nom, count: 1, language: "fr" });
  const { results } = await lireJson(recherche);
  if (!results?.length) throw new Error("Ville introuvable.");
  const lieu = results[0];
  const meteo = new URL("https://api.open-meteo.com/v1/forecast");
  meteo.search = new URLSearchParams({
    latitude: lieu.latitude, longitude: lieu.longitude,
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
  });
  const { current } = await lireJson(meteo);
  afficher("nom", [lieu.name, lieu.country].filter(Boolean).join(", "));
  afficher("icone", iconeMeteo(current.weather_code));
  afficher("temperature", Math.round(current.temperature_2m) + " °C");
  afficher("humidite", current.relative_humidity_2m + " %");
  afficher("vent", current.wind_speed_10m + " km/h");
  carte.hidden = false;
}
formulaire.addEventListener("submit", async (event) => {
  event.preventDefault();
  const bouton = formulaire.querySelector("button");
  if (bouton.disabled || ville.value.trim().length < 2) return;
  bouton.disabled = carte.hidden = true;
  message.textContent = "Chargement…";
  try {
    await chercherMeteo(ville.value.trim());
    message.textContent = "";
  } catch (erreur) {
    message.textContent = erreur.message;
  } finally {
    bouton.disabled = false;
  }
});
formulaire.requestSubmit();
