const input = document.getElementById("search");
const autocomplete = document.getElementById("autocomplete");
const repoList = document.getElementById("repo-list");

// --- Debounce ---
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// --- Запрос к GitHub API ---
async function fetchRepos(query) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
    query
  )}&per_page=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Ошибка GitHub API:", response.status);
      return [];
    }
    const data = await response.json();
    return data.items || [];
  } catch (e) {
    console.error("Ошибка сети:", e);
    return [];
  }
}

// --- Скрытие автокомплита с анимацией ---
function hideAutocomplete() {
  if (!autocomplete.classList.contains("visible")) return;

  autocomplete.classList.add("hiding");

  setTimeout(() => {
    autocomplete.classList.remove("visible");
    autocomplete.classList.remove("hiding");
    autocomplete.innerHTML = "";
  }, 250);
}

// --- Отрисовка автокомплита ---
function renderAutocomplete(repos) {
  autocomplete.innerHTML = "";

  if (!repos.length) {
    hideAutocomplete();
    return;
  }

  repos.forEach((repo) => {
    const li = document.createElement("li");
    li.textContent = repo.full_name;

    li.addEventListener("click", () => {
      addRepo(repo);
      input.value = "";
      hideAutocomplete();
    });

    autocomplete.appendChild(li);
  });

  autocomplete.classList.add("visible");
}

// --- Добавление репозитория в список ---
function addRepo(repo) {
  const li = document.createElement("li");
  li.className = "repo-item";

  li.innerHTML = `
    <div class="repo-info">
      Name: ${repo.name}<br>
      Owner: ${repo.owner.login}<br>
      Stars: ${repo.stargazers_count}
    </div>
    <button class="delete-btn">✖</button>
  `;

  const deleteBtn = li.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    li.classList.add("removing");
    setTimeout(() => li.remove(), 250);
  });

  repoList.appendChild(li);
}

// --- Обработчик ввода с debounce ---
const handleInput = debounce(async () => {
  const query = input.value.trim();

  if (!query) {
    hideAutocomplete();
    return;
  }

  const repos = await fetchRepos(query);
  renderAutocomplete(repos);
}, 400);

input.addEventListener("input", handleInput);

// Скрывать автокомплит при клике вне блока .app
document.addEventListener("click", (event) => {
  if (!event.target.closest(".app")) {
    hideAutocomplete();
  }
});
